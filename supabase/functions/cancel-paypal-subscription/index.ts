import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')
    const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET')
    const PAYPAL_MODE = Deno.env.get('PAYPAL_MODE') || 'sandbox'

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'PayPal is not configured yet.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 }
      )
    }

    // Get user from auth header
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token)
    
    if (claimsError || !claimsData.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const userId = claimsData.user.id
    console.log('Cancelling subscription for user:', userId)

    // Get user's subscription ID from profile
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey)
    const { data: profile, error: profileError } = await supabaseService
      .from('profiles')
      .select('paypal_subscription_id, subscription_tier')
      .eq('id', userId)
      .single()

    if (profileError || !profile?.paypal_subscription_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'No active subscription found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const subscriptionId = profile.paypal_subscription_id

    // PayPal API base URL
    const paypalBase = PAYPAL_MODE === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com'

    // Get access token
    const tokenResponse = await fetch(`${paypalBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`
      },
      body: 'grant_type=client_credentials'
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to authenticate with PayPal')
    }

    const { access_token } = await tokenResponse.json()

    // Cancel subscription
    const cancelResponse = await fetch(
      `${paypalBase}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({
          reason: 'User requested cancellation'
        })
      }
    )

    if (!cancelResponse.ok && cancelResponse.status !== 204) {
      const error = await cancelResponse.text()
      console.error('PayPal cancel error:', error)
      throw new Error('Failed to cancel PayPal subscription')
    }

    console.log('PayPal subscription cancelled:', subscriptionId)

    // Update profile to free tier
    await supabaseService
      .from('profiles')
      .update({ 
        subscription_tier: 'free',
        paypal_subscription_id: null
      })
      .eq('id', userId)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription cancelled successfully. You will have access until the end of your billing period.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Cancel subscription error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel subscription'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})