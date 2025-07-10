
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

    const { code } = await req.json()
    
    if (!code) {
      throw new Error('Authorization code is required')
    }

    const GOOGLE_OAUTH_CLIENT_ID = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')
    const GOOGLE_OAUTH_CLIENT_SECRET = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET')
    
    console.log('Google OAuth Client ID loaded:', GOOGLE_OAUTH_CLIENT_ID ? `${GOOGLE_OAUTH_CLIENT_ID.substring(0, 10)}...` : 'NOT FOUND')
    console.log('Google OAuth Client Secret loaded:', GOOGLE_OAUTH_CLIENT_SECRET ? 'YES' : 'NOT FOUND')
    
    if (!GOOGLE_OAUTH_CLIENT_ID || !GOOGLE_OAUTH_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured')
    }

    // Use consistent redirect URI - always use production URL
    const redirectUri = 'https://courtmate.lovable.app/auth/callback'
    
    console.log('Using redirect URI:', redirectUri)
    console.log('Authorization code received:', code.substring(0, 20) + '...')

    const tokenRequestBody = new URLSearchParams({
      code,
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    })

    console.log('Token request body:', tokenRequestBody.toString())

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenRequestBody,
    })

    const tokenData = await tokenResponse.json()
    
    console.log('Token response status:', tokenResponse.status)
    console.log('Token response:', tokenData)

    if (tokenData.error) {
      console.error('OAuth token error:', tokenData)
      throw new Error(`OAuth error: ${tokenData.error_description || tokenData.error}`)
    }

    if (!tokenData.access_token) {
      console.error('No access token received:', tokenData)
      throw new Error('No access token received from Google')
    }

    // Store tokens in user profile
    const { error: updateError } = await supabaseClient
      .from('user_profiles')
      .update({
        google_calendar_connected: true,
        google_calendar_token: tokenData.access_token,
        google_calendar_refresh_token: tokenData.refresh_token,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Database update error:', updateError)
      throw updateError
    }

    console.log('Successfully stored tokens for user:', user.id)

    return new Response(
      JSON.stringify({ success: true, message: 'Google Calendar connected successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
