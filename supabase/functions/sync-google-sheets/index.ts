import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Google Sheets public CSV export URL
const SHEET_ID = '1vF9F08dNRXq-xToR3fsL0_2yFTtKMsWbLoz-2xD5tvA'
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`

interface SheetRow {
  name: string
  country: string
  countryCode: string
  region: string
  sustainabilityScore: number
  sustainabilityProblem: string
  sustainabilitySolution: string
  communityScore: number
  communityProblem: string
  communitySolution: string
  wellbeingScore: number
  wellbeingProblem: string
  wellbeingSolution: string
  innovationScore: number
  innovationProblem: string
  innovationSolution: string
  globalAwarenessScore: number
  globalAwarenessProblem: string
  globalAwarenessSolution: string
  trend: string
  trendValue: number
}

function parseCSV(csvText: string): SheetRow[] {
  const lines = csvText.split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  console.log('CSV Headers:', headers)

  const rows: SheetRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Handle CSV with potential quoted fields
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    if (values.length >= 2) {
      const row: SheetRow = {
        name: values[0] || '',
        country: values[1] || '',
        countryCode: values[2] || 'XX',
        region: values[3] || '',
        sustainabilityScore: parseFloat(values[4]) || 0,
        sustainabilityProblem: values[5] || '',
        sustainabilitySolution: values[6] || '',
        communityScore: parseFloat(values[7]) || 0,
        communityProblem: values[8] || '',
        communitySolution: values[9] || '',
        wellbeingScore: parseFloat(values[10]) || 0,
        wellbeingProblem: values[11] || '',
        wellbeingSolution: values[12] || '',
        innovationScore: parseFloat(values[13]) || 0,
        innovationProblem: values[14] || '',
        innovationSolution: values[15] || '',
        globalAwarenessScore: parseFloat(values[16]) || 0,
        globalAwarenessProblem: values[17] || '',
        globalAwarenessSolution: values[18] || '',
        trend: values[19] || 'stable',
        trendValue: parseFloat(values[20]) || 0,
      }
      rows.push(row)
    }
  }

  return rows
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting Google Sheets sync...')

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch data from Google Sheets
    console.log('Fetching data from Google Sheets...')
    const response = await fetch(SHEET_URL)

    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheet: ${response.status}`)
    }

    const csvText = await response.text()
    console.log('CSV fetched, length:', csvText.length)

    // Parse CSV data
    const rows = parseCSV(csvText)
    console.log(`Parsed ${rows.length} schools from CSV`)

    if (rows.length === 0) {
      throw new Error('No data found in Google Sheet')
    }

    // Create a sync log entry
    const { data: syncLog, error: syncLogError } = await supabase
      .from('sync_logs')
      .insert({
        status: 'pending',
        records_synced: 0,
        source: 'google_sheets'
      })
      .select()
      .single()

    if (syncLogError) {
      console.error('Error creating sync log:', syncLogError)
    }

    // Delete existing schools and insert fresh data
    console.log('Clearing existing schools...')
    const { error: deleteError } = await supabase
      .from('schools')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) {
      console.error('Error deleting schools:', deleteError)
    }

    // Insert new schools
    console.log('Inserting new schools...')
    const schoolsToInsert = rows.map(row => ({
      name: row.name,
      country: row.country,
      country_code: row.countryCode,
      region: row.region,
      sustainability_score: row.sustainabilityScore,
      sustainability_problem: row.sustainabilityProblem,
      sustainability_solution: row.sustainabilitySolution,
      community_score: row.communityScore,
      community_problem: row.communityProblem,
      community_solution: row.communitySolution,
      wellbeing_score: row.wellbeingScore,
      wellbeing_problem: row.wellbeingProblem,
      wellbeing_solution: row.wellbeingSolution,
      innovation_score: row.innovationScore,
      innovation_problem: row.innovationProblem,
      innovation_solution: row.innovationSolution,
      global_awareness_score: row.globalAwarenessScore,
      global_awareness_problem: row.globalAwarenessProblem,
      global_awareness_solution: row.globalAwarenessSolution,
      trend: row.trend.toLowerCase() === 'up' ? 'up' : row.trend.toLowerCase() === 'down' ? 'down' : 'stable',
      trend_value: row.trendValue,
    }))

    const { data: insertedSchools, error: insertError } = await supabase
      .from('schools')
      .insert(schoolsToInsert)
      .select()

    if (insertError) {
      console.error('Error inserting schools:', insertError)
      
      // Update sync log with error
      if (syncLog) {
        await supabase
          .from('sync_logs')
          .update({
            status: 'error',
            error_message: insertError.message
          })
          .eq('id', syncLog.id)
      }

      throw insertError
    }

    console.log(`Successfully inserted ${insertedSchools?.length || 0} schools`)

    // Update sync log with success
    if (syncLog) {
      await supabase
        .from('sync_logs')
        .update({
          status: 'success',
          records_synced: insertedSchools?.length || 0
        })
        .eq('id', syncLog.id)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${insertedSchools?.length || 0} schools from Google Sheets`,
        schools: insertedSchools?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Sync error:', errorMessage)
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
