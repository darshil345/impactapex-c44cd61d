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
    const PAYPAL_MODE = Deno.env.get('PAYPAL_MODE') || 'sandbox' // 'sandbox' or 'live'

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      console.error('PayPal credentials not configured')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'PayPal is not configured yet. Please contact support.' 
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
    const userEmail = claimsData.user.email
    console.log('Creating PayPal subscription for user:', userId)

    // Parse request body
    const { returnUrl, cancelUrl } = await req.json()

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
      const error = await tokenResponse.text()
      console.error('PayPal token error:', error)
      throw new Error('Failed to authenticate with PayPal')
    }

    const { access_token } = await tokenResponse.json()

    // Get or create PayPal plan ID (you should have this pre-configured in PayPal dashboard)
    // For now, we'll use a placeholder - you need to create a subscription plan in PayPal
    const PLAN_ID = Deno.env.get('PAYPAL_PLAN_ID')
    
    if (!PLAN_ID) {
      console.error('PayPal Plan ID not configured')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'PayPal subscription plan not configured. Please contact support.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 }
      )
    }

    // Create subscription
    const subscriptionResponse = await fetch(`${paypalBase}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
        'PayPal-Request-Id': `sub-${userId}-${Date.now()}`
      },
      body: JSON.stringify({
        plan_id: PLAN_ID,
        subscriber: {
          email_address: userEmail,
        },
        application_context: {
          brand_name: 'ImpactApeX',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
          },
          return_url: returnUrl || `${req.headers.get('origin')}/settings?subscription=success`,
          cancel_url: cancelUrl || `${req.headers.get('origin')}/settings?subscription=cancelled`
        }
      })
    })

    if (!subscriptionResponse.ok) {
      const error = await subscriptionResponse.text()
      console.error('PayPal subscription error:', error)
      throw new Error('Failed to create PayPal subscription')
    }

    const subscription = await subscriptionResponse.json()
    console.log('PayPal subscription created:', subscription.id)

    // Find approval link
    const approvalLink = subscription.links?.find((link: any) => link.rel === 'approve')?.href

    if (!approvalLink) {
      throw new Error('No approval link returned from PayPal')
    }

    // Store pending subscription in profile
    const supabaseService = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await supabaseService
      .from('profiles')
      .update({ 
        paypal_subscription_id: subscription.id,
        // Don't update tier yet - wait for webhook confirmation
      })
      .eq('id', userId)

    return new Response(
      JSON.stringify({
        success: true,
        subscriptionId: subscription.id,
        approvalUrl: approvalLink
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Subscription error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create subscription'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})