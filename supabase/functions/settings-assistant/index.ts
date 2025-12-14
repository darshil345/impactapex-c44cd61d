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
    const { action, data } = await req.json()
    console.log('Settings assistant action:', action, data)

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured')
    }

    let systemPrompt = ''
    let userPrompt = ''

    switch (action) {
      case 'export_data':
        systemPrompt = 'You are a helpful data export assistant. Generate a brief, friendly confirmation message about exporting school impact data.'
        userPrompt = `The user wants to export their school data. There are ${data?.schoolCount || 0} schools in the database. Generate a brief confirmation message (2-3 sentences) explaining what will be exported and that the download will start shortly.`
        break
      
      case 'change_email':
        systemPrompt = 'You are a security-focused account assistant. Provide clear, helpful guidance about changing email addresses.'
        userPrompt = 'The user wants to change their email address. Provide a brief, helpful response (3-4 sentences) explaining the process: they need to verify their current email, enter the new email, and confirm via a verification link. Mention security best practices.'
        break
      
      case 'change_password':
        systemPrompt = 'You are a security-focused account assistant. Provide clear guidance about password security.'
        userPrompt = 'The user wants to change their password. Provide a brief response (3-4 sentences) about password best practices: use at least 12 characters, mix of letters/numbers/symbols, avoid common phrases. Encourage using a password manager.'
        break
      
      case 'enable_2fa':
        systemPrompt = 'You are a security assistant explaining two-factor authentication benefits.'
        userPrompt = 'The user wants to enable 2FA. Provide a brief, encouraging response (3-4 sentences) explaining what 2FA is, why it\'s important for protecting their school data, and that they can use an authenticator app like Google Authenticator or Authy.'
        break
      
      case 'view_sessions':
        systemPrompt = 'You are a security assistant helping users understand their active sessions.'
        userPrompt = `The user wants to view their active sessions. Generate a brief response (2-3 sentences) explaining that session management helps them see where they're logged in and allows them to sign out of suspicious sessions.`
        break
      
      case 'delete_data':
        systemPrompt = 'You are a cautious data management assistant. Warn users about data deletion.'
        userPrompt = `The user wants to delete all their school data (${data?.schoolCount || 0} schools). Generate a serious but helpful warning (3-4 sentences) explaining this action is irreversible, they should export their data first, and ask them to confirm by typing "DELETE" to proceed.`
        break
      
      case 'delete_account':
        systemPrompt = 'You are a cautious account management assistant. Seriously warn users about account deletion.'
        userPrompt = 'The user wants to delete their account. Generate a serious warning (4-5 sentences) explaining this will permanently delete their account, all data, and is irreversible. Suggest alternatives like exporting data first or just taking a break. Ask them to confirm by typing their email address.'
        break
      
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const errorText = await response.text()
      console.error('AI gateway error:', response.status, errorText)
      throw new Error('AI gateway error')
    }

    const aiResponse = await response.json()
    const message = aiResponse.choices?.[0]?.message?.content || 'Unable to generate response.'

    return new Response(
      JSON.stringify({ success: true, message, action }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Settings assistant error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})