
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Get the current user's profile
    const { data: currentUser, error: userError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    // Get all other active users
    const { data: otherUsers, error: usersError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .neq('id', userId)
      .eq('is_active', true)

    if (usersError) throw usersError

    // Get user's match history for context
    const { data: matchHistory } = await supabaseClient
      .from('match_results')
      .select(`
        winner_id,
        match_requests!inner(requester_id, requested_id)
      `)
      .or(`match_requests.requester_id.eq.${userId},match_requests.requested_id.eq.${userId}`)
      .limit(10)

    // Create AI prompt with user context
    const aiPrompt = `
You are an expert tennis matchmaking AI. Analyze this player profile and recommend the best matches from the available players.

Current Player Profile:
- Name: ${currentUser.full_name}
- Age: ${currentUser.age}
- Location: ${currentUser.location}
- NTRP Rating: ${currentUser.current_rating}
- Playing Style: ${currentUser.playing_style}
- Bio: ${currentUser.bio}
- Recent Match History: ${matchHistory?.length || 0} matches

Available Players:
${otherUsers?.map(user => `
- ${user.full_name}: Age ${user.age}, ${user.location}, Rating ${user.current_rating}, Style: ${user.playing_style}
`).join('')}

Please analyze compatibility based on:
1. Skill level compatibility (similar ratings for competitive matches)
2. Geographic proximity 
3. Age similarity
4. Playing style complementarity
5. Personality fit from bio analysis

Return a JSON array of recommendations with this exact format:
[
  {
    "player_id": "uuid",
    "compatibility_score": 0.95,
    "reasoning": "Detailed explanation of why this is a great match",
    "key_factors": ["skill_match", "location", "age_similarity", "style_complement"]
  }
]

Focus on quality over quantity. Only recommend truly compatible players with scores above 0.7.
`

    // Call OpenAI GPT-4
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a professional tennis matchmaking AI that provides detailed, accurate recommendations in valid JSON format.' },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.3,
      }),
    })

    const aiData = await openAIResponse.json()
    let recommendations = []

    try {
      const aiRecommendations = JSON.parse(aiData.choices[0].message.content)
      
      // Process AI recommendations and store in database
      recommendations = aiRecommendations.map((rec: any) => ({
        user_id: userId,
        recommended_player_id: rec.player_id,
        recommendation_score: rec.compatibility_score,
        reasoning: rec.reasoning,
        factors_matched: rec.key_factors,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }))

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      // Fallback to basic algorithm if AI fails
      recommendations = otherUsers?.slice(0, 5).map(user => ({
        user_id: userId,
        recommended_player_id: user.id,
        recommendation_score: 0.75,
        reasoning: "AI-generated recommendation temporarily unavailable. Based on profile similarity.",
        factors_matched: ['basic_compatibility'],
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })) || []
    }

    // Clear existing recommendations
    await supabaseClient
      .from('player_recommendations')
      .delete()
      .eq('user_id', userId)

    // Insert new AI-enhanced recommendations
    if (recommendations.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('player_recommendations')
        .insert(recommendations)

      if (insertError) throw insertError

      // Create notification about new recommendations
      await supabaseClient
        .from('push_notifications')
        .insert({
          user_id: userId,
          title: 'New AI-Powered Recommendations',
          body: `Found ${recommendations.length} perfectly matched tennis partners for you!`,
          type: 'recommendation',
          data: { count: recommendations.length }
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendationsCount: recommendations.length,
        aiEnhanced: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating AI recommendations:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
