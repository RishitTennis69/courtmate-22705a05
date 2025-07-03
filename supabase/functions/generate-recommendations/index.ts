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

    // Calculate compatibility scores
    const recommendations = otherUsers.map(user => {
      let score = 0
      let factorsMatched = []

      // Location matching (30% weight)
      if (currentUser.location && user.location) {
        const locationSimilarity = currentUser.location.toLowerCase().includes(user.location.toLowerCase()) ||
                                 user.location.toLowerCase().includes(currentUser.location.toLowerCase())
        if (locationSimilarity) {
          score += 0.3
          factorsMatched.push('location')
        }
      }

      // Age similarity (20% weight)
      if (currentUser.age && user.age) {
        const ageDiff = Math.abs(currentUser.age - user.age)
        if (ageDiff <= 5) {
          score += 0.2
          factorsMatched.push('age')
        } else if (ageDiff <= 10) {
          score += 0.1
          factorsMatched.push('age')
        }
      }

      // Skill level similarity (30% weight)
      if (currentUser.current_rating && user.current_rating) {
        const ratingDiff = Math.abs(currentUser.current_rating - user.current_rating)
        if (ratingDiff <= 0.5) {
          score += 0.3
          factorsMatched.push('skill_level')
        } else if (ratingDiff <= 1.0) {
          score += 0.2
          factorsMatched.push('skill_level')
        } else if (ratingDiff <= 1.5) {
          score += 0.1
          factorsMatched.push('skill_level')
        }
      }

      // Playing style compatibility (20% weight)
      if (currentUser.playing_style && user.playing_style) {
        if (currentUser.playing_style === user.playing_style) {
          score += 0.2
          factorsMatched.push('playing_style')
        } else if (
          (currentUser.playing_style === 'aggressive' && user.playing_style === 'defensive') ||
          (currentUser.playing_style === 'defensive' && user.playing_style === 'aggressive')
        ) {
          score += 0.15
          factorsMatched.push('playing_style')
        }
      }

      // Generate reasoning
      let reasoning = `${user.full_name} is a great match because `
      const reasons = []
      
      if (factorsMatched.includes('location')) {
        reasons.push('you\'re in the same area')
      }
      if (factorsMatched.includes('age')) {
        reasons.push('you\'re similar in age')
      }
      if (factorsMatched.includes('skill_level')) {
        reasons.push('you have similar skill levels')
      }
      if (factorsMatched.includes('playing_style')) {
        reasons.push('your playing styles complement each other')
      }

      reasoning += reasons.join(', ') + '.'

      return {
        user_id: userId,
        recommended_player_id: user.id,
        recommendation_score: Math.min(score, 1.0),
        reasoning,
        factors_matched: factorsMatched,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    })

    // Filter recommendations with score > 0.3 and sort by score
    const goodRecommendations = recommendations
      .filter(rec => rec.recommendation_score > 0.3)
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, 10) // Limit to top 10

    // Clear existing recommendations for this user
    await supabaseClient
      .from('player_recommendations')
      .delete()
      .eq('user_id', userId)

    // Insert new recommendations
    if (goodRecommendations.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('player_recommendations')
        .insert(goodRecommendations)

      if (insertError) throw insertError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendationsCount: goodRecommendations.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating recommendations:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
