
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
    const { query, location, types } = await req.json()
    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')

    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured')
    }

    const params = new URLSearchParams({
      input: query,
      key: GOOGLE_PLACES_API_KEY,
      types: types || 'establishment',
    })

    if (location) {
      params.append('location', location)
      params.append('radius', '50000') // 50km radius
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`
    )

    const data = await response.json()

    if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
      return new Response(
        JSON.stringify({ 
          predictions: data.predictions || [],
          status: data.status 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      console.error('Google Places API error:', data)
      throw new Error(`Google Places API error: ${data.status}`)
    }
  } catch (error) {
    console.error('Error in search-places function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        predictions: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 to avoid breaking the UI
      }
    )
  }
})
