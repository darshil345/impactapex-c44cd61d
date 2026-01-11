import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Google Sheets public CSV export URL
const SHEET_ID = '1vF9F08dNRXq-xToR3fsL0_2yFTtKMsWbLoz-2xD5tvA'
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`

interface CsvRow {
  schoolId: string
  schoolName: string
  country: string
  schoolType: string
  criteria: string
  indicator: string
  score: number
  status: string
  trend: string
  problem: string
  solution: string
}

interface SchoolData {
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

// Map country to country code
function getCountryCode(country: string): string {
  const countryMap: Record<string, string> = {
    'india': 'IN',
    'singapore': 'SG',
    'usa': 'US',
    'uk': 'GB',
    'switzerland': 'CH',
    'germany': 'DE',
    'france': 'FR',
    'japan': 'JP',
    'australia': 'AU',
    'canada': 'CA',
    'china': 'CN',
    'brazil': 'BR',
    'south africa': 'ZA',
    'uae': 'AE',
    'netherlands': 'NL',
    'spain': 'ES',
    'italy': 'IT',
    'sweden': 'SE',
    'norway': 'NO',
    'denmark': 'DK',
    'finland': 'FI',
  }
  return countryMap[country.toLowerCase()] || 'XX'
}

// Map criteria name to our category
function mapCriteria(criteria: string): string {
  const lower = criteria.toLowerCase()
  if (lower.includes('sustainab') || lower.includes('carbon') || lower.includes('recycl') || lower.includes('environment')) {
    return 'sustainability'
  }
  if (lower.includes('community') || lower.includes('volunteer') || lower.includes('engagement')) {
    return 'community'
  }
  if (lower.includes('wellbeing') || lower.includes('mental') || lower.includes('health') || lower.includes('physical')) {
    return 'wellbeing'
  }
  if (lower.includes('innovation') || lower.includes('academic') || lower.includes('steam') || lower.includes('project') || lower.includes('learning')) {
    return 'innovation'
  }
  if (lower.includes('global') || lower.includes('international') || lower.includes('exchange') || lower.includes('diversity') || lower.includes('inclusion')) {
    return 'globalAwareness'
  }
  if (lower.includes('leadership') || lower.includes('student council') || lower.includes('initiative')) {
    return 'innovation' // Map leadership to innovation
  }
  return 'globalAwareness' // Default
}

function parseCSV(csvText: string): CsvRow[] {
  const lines = csvText.split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase())
  console.log('CSV Headers:', headers)

  const rows: CsvRow[] = []

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

    // First column might be empty or School_ID - use School_Name as key
    if (values.length >= 7 && values[1]) {
      const row: CsvRow = {
        schoolId: values[0] || values[1], // Use school name as ID if first column empty
        schoolName: values[1] || '',
        country: values[2] || '',
        schoolType: values[3] || '',
        criteria: values[4] || '',
        indicator: values[5] || '',
        score: parseFloat(values[6]) || 0,
        status: values[7] || '',
        trend: values[8] || 'stable',
        problem: values[9] || '',
        solution: values[10] || '',
      }
      rows.push(row)
    }
  }

  return rows
}

function aggregateSchools(rows: CsvRow[]): SchoolData[] {
  const schoolMap = new Map<string, SchoolData>()

  for (const row of rows) {
    if (!row.schoolName) continue

    const key = row.schoolId || row.schoolName

    if (!schoolMap.has(key)) {
      schoolMap.set(key, {
        name: row.schoolName,
        country: row.country,
        countryCode: getCountryCode(row.country),
        region: row.schoolType || '',
        sustainabilityScore: 0,
        sustainabilityProblem: '',
        sustainabilitySolution: '',
        communityScore: 0,
        communityProblem: '',
        communitySolution: '',
        wellbeingScore: 0,
        wellbeingProblem: '',
        wellbeingSolution: '',
        innovationScore: 0,
        innovationProblem: '',
        innovationSolution: '',
        globalAwarenessScore: 0,
        globalAwarenessProblem: '',
        globalAwarenessSolution: '',
        trend: 'stable',
        trendValue: 0,
      })
    }

    const school = schoolMap.get(key)!
    const category = mapCriteria(row.criteria)

    // Update the score for this category (take the latest/highest)
    switch (category) {
      case 'sustainability':
        if (row.score > school.sustainabilityScore) {
          school.sustainabilityScore = row.score
          school.sustainabilityProblem = row.problem
          school.sustainabilitySolution = row.solution
        }
        break
      case 'community':
        if (row.score > school.communityScore) {
          school.communityScore = row.score
          school.communityProblem = row.problem
          school.communitySolution = row.solution
        }
        break
      case 'wellbeing':
        if (row.score > school.wellbeingScore) {
          school.wellbeingScore = row.score
          school.wellbeingProblem = row.problem
          school.wellbeingSolution = row.solution
        }
        break
      case 'innovation':
        if (row.score > school.innovationScore) {
          school.innovationScore = row.score
          school.innovationProblem = row.problem
          school.innovationSolution = row.solution
        }
        break
      case 'globalAwareness':
        if (row.score > school.globalAwarenessScore) {
          school.globalAwarenessScore = row.score
          school.globalAwarenessProblem = row.problem
          school.globalAwarenessSolution = row.solution
        }
        break
    }

    // Update trend based on latest row
    const trendLower = row.trend.toLowerCase()
    if (trendLower.includes('improv')) {
      school.trend = 'up'
      school.trendValue = Math.max(school.trendValue, 2.5)
    } else if (trendLower.includes('declin') || trendLower.includes('down')) {
      school.trend = 'down'
      school.trendValue = Math.max(school.trendValue, 1.5)
    }
  }

  return Array.from(schoolMap.values())
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

    // Check if a custom sheet ID was provided in the request body
    let customSheetId: string | null = null
    try {
      const body = await req.json()
      customSheetId = body?.sheetId || null
      console.log('Custom sheet ID provided:', customSheetId)
    } catch {
      // No body or invalid JSON, use default sheet
      console.log('No custom sheet ID, using default')
    }

    // Use custom sheet ID if provided, otherwise use default
    const sheetId = customSheetId || SHEET_ID
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`

    // Fetch data from Google Sheets
    console.log('Fetching data from Google Sheets:', sheetUrl)
    const response = await fetch(sheetUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheet: ${response.status}. Make sure the sheet is publicly accessible.`)
    }

    const csvText = await response.text()
    console.log('CSV fetched, length:', csvText.length)

    // Check if we got an HTML error page instead of CSV
    if (csvText.includes('<!DOCTYPE html>') || csvText.includes('<html')) {
      throw new Error('The Google Sheet is not publicly accessible. Please set sharing to "Anyone with the link can view".')
    }

    // Parse CSV data
    const csvRows = parseCSV(csvText)
    console.log(`Parsed ${csvRows.length} CSV rows`)

    // Aggregate rows by school
    const schools = aggregateSchools(csvRows)
    console.log(`Aggregated into ${schools.length} schools`)

    if (schools.length === 0) {
      throw new Error('No valid data found in the Google Sheet. Please check the format matches the expected columns.')
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
    const schoolsToInsert = schools.map(school => ({
      name: school.name,
      country: school.country,
      country_code: school.countryCode,
      region: school.region,
      sustainability_score: school.sustainabilityScore,
      sustainability_problem: school.sustainabilityProblem,
      sustainability_solution: school.sustainabilitySolution,
      community_score: school.communityScore,
      community_problem: school.communityProblem,
      community_solution: school.communitySolution,
      wellbeing_score: school.wellbeingScore,
      wellbeing_problem: school.wellbeingProblem,
      wellbeing_solution: school.wellbeingSolution,
      innovation_score: school.innovationScore,
      innovation_problem: school.innovationProblem,
      innovation_solution: school.innovationSolution,
      global_awareness_score: school.globalAwarenessScore,
      global_awareness_problem: school.globalAwarenessProblem,
      global_awareness_solution: school.globalAwarenessSolution,
      trend: school.trend,
      trend_value: school.trendValue,
    }))

    console.log('Schools to insert:', JSON.stringify(schoolsToInsert, null, 2))

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
        recordsSynced: insertedSchools?.length || 0,
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