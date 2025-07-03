
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { startDate, endDate } = await req.json()
    
    // Get user's Google Calendar token from your user_profiles table
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('google_calendar_token')
      .eq('id', user.id)
      .single()

    if (!profile?.google_calendar_token) {
      throw new Error('Google Calendar not connected')
    }

    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startDate}&timeMax=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${profile.google_calendar_token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const calendarData = await calendarResponse.json()

    return new Response(
      JSON.stringify({ events: calendarData.items || [] }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
