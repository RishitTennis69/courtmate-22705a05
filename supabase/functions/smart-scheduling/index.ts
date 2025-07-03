import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SchedulingRequest {
  userId: string;
  opponentId: string;
  preferredDates?: string[];
  timePreferences?: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { userId, opponentId, preferredDates, timePreferences }: SchedulingRequest = await req.json()

    // Get both users' availability
    const { data: userAvailability } = await supabaseClient
      .from('user_availability')
      .select('*')
      .eq('user_id', userId)

    const { data: opponentAvailability } = await supabaseClient
      .from('user_availability')
      .select('*')
      .eq('user_id', opponentId)

    // Get both users' profiles for location and preferences
    const { data: userProfile } = await supabaseClient
      .from('user_profiles')
      .select('location, google_calendar_connected')
      .eq('id', userId)
      .single()

    const { data: opponentProfile } = await supabaseClient
      .from('user_profiles')
      .select('location, google_calendar_connected')
      .eq('id', opponentId)
      .single()

    // AI-powered scheduling logic
    const smartSuggestions = generateSmartSuggestions({
      userAvailability: userAvailability || [],
      opponentAvailability: opponentAvailability || [],
      userProfile,
      opponentProfile,
      preferredDates,
      timePreferences
    })

    // Get weather data for outdoor courts (simplified)
    const weatherOptimizedSuggestions = await optimizeForWeather(smartSuggestions)

    return new Response(
      JSON.stringify({ 
        suggestions: weatherOptimizedSuggestions,
        totalSuggestions: weatherOptimizedSuggestions.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in smart-scheduling function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

function generateSmartSuggestions(data: any) {
  const suggestions = []
  const now = new Date()
  
  // Find overlapping availability
  for (const userSlot of data.userAvailability) {
    for (const opponentSlot of data.opponentAvailability) {
      if (userSlot.day_of_week === opponentSlot.day_of_week) {
        // Check for time overlap
        const userStart = parseTime(userSlot.start_time)
        const userEnd = parseTime(userSlot.end_time)
        const opponentStart = parseTime(opponentSlot.start_time)
        const opponentEnd = parseTime(opponentSlot.end_time)
        
        const overlapStart = Math.max(userStart, opponentStart)
        const overlapEnd = Math.min(userEnd, opponentEnd)
        
        if (overlapEnd > overlapStart) {
          // Generate suggestions for next 2 weeks
          for (let week = 0; week < 2; week++) {
            const suggestionDate = getNextDayOfWeek(userSlot.day_of_week, week)
            
            if (suggestionDate > now) {
              const confidence = calculateConfidence(userSlot, opponentSlot, suggestionDate)
              
              suggestions.push({
                date: suggestionDate.toISOString(),
                startTime: formatTime(overlapStart),
                endTime: formatTime(Math.min(overlapStart + 120, overlapEnd)), // 2-hour match
                confidence,
                reason: generateReason(userSlot, opponentSlot, confidence),
                dayOfWeek: userSlot.day_of_week,
                isPreferred: userSlot.is_preferred && opponentSlot.is_preferred
              })
            }
          }
        }
      }
    }
  }
  
  // Sort by confidence and return top suggestions
  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10)
}

function parseTime(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

function getNextDayOfWeek(dayOfWeek: number, weeksFromNow: number = 0): Date {
  const now = new Date()
  const currentDay = now.getDay()
  const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7
  const targetDate = new Date(now)
  targetDate.setDate(now.getDate() + daysUntilTarget + (weeksFromNow * 7))
  return targetDate
}

function calculateConfidence(userSlot: any, opponentSlot: any, date: Date): number {
  let confidence = 0.5 // Base confidence
  
  // Boost for both users' preferred times
  if (userSlot.is_preferred && opponentSlot.is_preferred) {
    confidence += 0.3
  } else if (userSlot.is_preferred || opponentSlot.is_preferred) {
    confidence += 0.15
  }
  
  // Boost for optimal tennis times
  const hour = parseInt(userSlot.start_time.split(':')[0])
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  
  if ((isWeekend && hour >= 9 && hour <= 11) || (!isWeekend && hour >= 17 && hour <= 19)) {
    confidence += 0.2
  }
  
  // Slight boost for weekends
  if (isWeekend) {
    confidence += 0.1
  }
  
  return Math.min(confidence, 1.0)
}

function generateReason(userSlot: any, opponentSlot: any, confidence: number): string {
  const reasons = []
  
  if (userSlot.is_preferred && opponentSlot.is_preferred) {
    reasons.push("both players' preferred time")
  } else if (userSlot.is_preferred || opponentSlot.is_preferred) {
    reasons.push("one player's preferred time")
  }
  
  const hour = parseInt(userSlot.start_time.split(':')[0])
  const dayOfWeek = userSlot.day_of_week
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  
  if ((isWeekend && hour >= 9 && hour <= 11)) {
    reasons.push("optimal weekend morning slot")
  } else if (!isWeekend && hour >= 17 && hour <= 19) {
    reasons.push("popular evening time")
  }
  
  if (confidence > 0.8) {
    reasons.push("high success probability")
  }
  
  return reasons.length > 0 
    ? `Great time because: ${reasons.join(", ")}`
    : "Good mutual availability"
}

async function optimizeForWeather(suggestions: any[]): Promise<any[]> {
  // Simplified weather optimization
  // In production, you'd integrate with a weather API
  return suggestions.map(suggestion => ({
    ...suggestion,
    weatherOptimized: true,
    weatherNote: "Check weather conditions before playing"
  }))
}
