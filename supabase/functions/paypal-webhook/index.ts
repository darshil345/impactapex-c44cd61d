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
    const PAYPAL_WEBHOOK_ID = Deno.env.get('PAYPAL_WEBHOOK_ID')
    
    // In production, verify webhook signature
    // For now, we'll process the event
    const event = await req.json()
    console.log('PayPal webhook event:', event.event_type)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const subscriptionId = event.resource?.id
    
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.RENEWED': {
        console.log('Subscription activated/renewed:', subscriptionId)
        
        // Find user by subscription ID and upgrade to pro
        const { data: profile, error } = await supabase
          .from('profiles')
          .update({ subscription_tier: 'pro' })
          .eq('paypal_subscription_id', subscriptionId)
          .select()
          .single()
        
        if (error) {
          console.error('Error updating profile:', error)
        } else {
          console.log('User upgraded to pro:', profile?.id)
        }
        break
      }
      
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        console.log('Subscription ended:', subscriptionId)
        
        // Downgrade user to free
        const { error } = await supabase
          .from('profiles')
          .update({ 
            subscription_tier: 'free',
            paypal_subscription_id: null
          })
          .eq('paypal_subscription_id', subscriptionId)
        
        if (error) {
          console.error('Error downgrading profile:', error)
        }
        break
      }
      
      case 'PAYMENT.SALE.COMPLETED': {
        console.log('Payment completed for subscription')
        // Payment successful - subscription continues
        break
      }
      
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
        console.log('Payment failed for subscription:', subscriptionId)
        // You might want to send an email to the user
        break
      }
      
      default:
        console.log('Unhandled event type:', event.event_type)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})