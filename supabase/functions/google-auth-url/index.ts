import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GOOGLE_OAUTH_CLIENT_ID = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')
    
    console.log('Google OAuth Client ID loaded:', GOOGLE_OAUTH_CLIENT_ID ? `${GOOGLE_OAUTH_CLIENT_ID.substring(0, 10)}...` : 'NOT FOUND')
    
    if (!GOOGLE_OAUTH_CLIENT_ID) {
      throw new Error('GOOGLE_OAUTH_CLIENT_ID not configured')
    }

    // Use consistent redirect URI - always use production URL
    const redirectUri = 'http://localhost:8080/auth/callback'
    
    console.log('Using redirect URI:', redirectUri)
    
    const params = new URLSearchParams({
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events',
      access_type: 'offline',
      prompt: 'consent'
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    
    console.log('Generated auth URL:', authUrl)

    return new Response(
      JSON.stringify({ authUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in google-auth-url:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
