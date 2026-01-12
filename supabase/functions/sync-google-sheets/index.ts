import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  avgScore: number
}

// Map country to country code
function getCountryCode(country: string): string {
  const countryMap: Record<string, string> = {
    'india': 'IN',
    'singapore': 'SG',
    'usa': 'US',
    'uk': 'GB',
    'united kingdom': 'GB',
    'united states': 'US',
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
    'united arab emirates': 'AE',
    'netherlands': 'NL',
    'spain': 'ES',
    'italy': 'IT',
    'sweden': 'SE',
    'norway': 'NO',
    'denmark': 'DK',
    'finland': 'FI',
    'new zealand': 'NZ',
    'ireland': 'IE',
    'portugal': 'PT',
    'austria': 'AT',
    'belgium': 'BE',
    'poland': 'PL',
    'czech republic': 'CZ',
    'greece': 'GR',
    'turkey': 'TR',
    'mexico': 'MX',
    'argentina': 'AR',
    'chile': 'CL',
    'colombia': 'CO',
    'peru': 'PE',
    'south korea': 'KR',
    'korea': 'KR',
    'thailand': 'TH',
    'vietnam': 'VN',
    'indonesia': 'ID',
    'malaysia': 'MY',
    'philippines': 'PH',
    'taiwan': 'TW',
    'hong kong': 'HK',
    'russia': 'RU',
    'ukraine': 'UA',
    'egypt': 'EG',
    'nigeria': 'NG',
    'kenya': 'KE',
    'morocco': 'MA',
    'israel': 'IL',
    'saudi arabia': 'SA',
    'qatar': 'QA',
    'kuwait': 'KW',
    'bahrain': 'BH',
    'oman': 'OM',
  }
  return countryMap[country.toLowerCase().trim()] || 'XX'
}

// Map criteria name to our category
function mapCriteria(criteria: string): string {
  const lower = criteria.toLowerCase()
  if (lower.includes('sustainab') || lower.includes('carbon') || lower.includes('recycl') || lower.includes('environment') || lower.includes('green') || lower.includes('eco')) {
    return 'sustainability'
  }
  if (lower.includes('community') || lower.includes('volunteer') || lower.includes('engagement') || lower.includes('outreach') || lower.includes('service')) {
    return 'community'
  }
  if (lower.includes('wellbeing') || lower.includes('well-being') || lower.includes('mental') || lower.includes('health') || lower.includes('physical') || lower.includes('wellness')) {
    return 'wellbeing'
  }
  if (lower.includes('innovation') || lower.includes('academic') || lower.includes('steam') || lower.includes('stem') || lower.includes('project') || lower.includes('learning') || lower.includes('tech') || lower.includes('digital')) {
    return 'innovation'
  }
  if (lower.includes('global') || lower.includes('international') || lower.includes('exchange') || lower.includes('diversity') || lower.includes('inclusion') || lower.includes('cultural') || lower.includes('multicultural')) {
    return 'globalAwareness'
  }
  if (lower.includes('leadership') || lower.includes('student council') || lower.includes('initiative')) {
    return 'innovation' // Map leadership to innovation
  }
  return 'globalAwareness' // Default
}

// Find column index by checking header names
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase().replace(/[^a-z0-9]/g, '')
    for (const name of possibleNames) {
      const searchName = name.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (header.includes(searchName) || searchName.includes(header)) {
        return i
      }
    }
  }
  return -1
}

function parseCSV(csvText: string): { headers: string[], rows: string[][] } {
  const lines = csvText.split('\n')
  if (lines.length < 2) return { headers: [], rows: [] }

  const parseRow = (line: string): string[] => {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''))
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''))
    return values
  }

  const headers = parseRow(lines[0])
  const rows: string[][] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    rows.push(parseRow(line))
  }

  return { headers, rows }
}

function processSheetData(headers: string[], rows: string[][]): SchoolData[] {
  console.log('Processing with headers:', headers)
  
  // Find column indices dynamically
  const schoolNameIdx = findColumnIndex(headers, ['school_name', 'schoolname', 'school', 'name', 'institution'])
  const countryIdx = findColumnIndex(headers, ['country', 'nation', 'location'])
  const schoolTypeIdx = findColumnIndex(headers, ['school_type', 'schooltype', 'type', 'region', 'category'])
  const criteriaIdx = findColumnIndex(headers, ['criteria', 'criterion', 'category', 'pillar', 'area'])
  const indicatorIdx = findColumnIndex(headers, ['indicator', 'metric', 'measure', 'kpi'])
  const scoreIdx = findColumnIndex(headers, ['score', 'value', 'points', 'rating', 'result'])
  const statusIdx = findColumnIndex(headers, ['status', 'state', 'condition'])
  const trendIdx = findColumnIndex(headers, ['trend', 'direction', 'change'])
  const problemIdx = findColumnIndex(headers, ['problem', 'challenge', 'issue', 'weakness'])
  const solutionIdx = findColumnIndex(headers, ['solution', 'action', 'improvement', 'recommendation'])
  
  console.log('Column indices:', { schoolNameIdx, countryIdx, schoolTypeIdx, criteriaIdx, indicatorIdx, scoreIdx, statusIdx, trendIdx, problemIdx, solutionIdx })

  // If we can't find essential columns, try positional parsing
  const usePositional = schoolNameIdx === -1 || scoreIdx === -1

  if (usePositional) {
    console.log('Using positional parsing as fallback')
  }

  const schoolMap = new Map<string, SchoolData>()

  for (const values of rows) {
    if (values.length < 3) continue

    let schoolName: string
    let country: string
    let schoolType: string
    let criteria: string
    let indicator: string
    let score: number
    let status: string
    let trend: string
    let problem: string
    let solution: string

    if (usePositional) {
      // Assume common format: school_name, country, school_type, criteria, indicator, score, status, trend, problem, solution
      // Or without ID column: school_name is first
      const hasIdColumn = headers.length > 0 && headers[0].toLowerCase().includes('id') && !headers[0].toLowerCase().includes('school')
      const offset = hasIdColumn ? 1 : 0
      
      schoolName = values[offset] || ''
      country = values[offset + 1] || ''
      schoolType = values[offset + 2] || ''
      criteria = values[offset + 3] || ''
      indicator = values[offset + 4] || ''
      score = parseFloat(values[offset + 5]) || 0
      status = values[offset + 6] || ''
      trend = values[offset + 7] || 'stable'
      problem = values[offset + 8] || ''
      solution = values[offset + 9] || ''
    } else {
      schoolName = schoolNameIdx >= 0 ? values[schoolNameIdx] || '' : ''
      country = countryIdx >= 0 ? values[countryIdx] || '' : ''
      schoolType = schoolTypeIdx >= 0 ? values[schoolTypeIdx] || '' : ''
      criteria = criteriaIdx >= 0 ? values[criteriaIdx] || '' : ''
      indicator = indicatorIdx >= 0 ? values[indicatorIdx] || '' : ''
      score = scoreIdx >= 0 ? parseFloat(values[scoreIdx]) || 0 : 0
      status = statusIdx >= 0 ? values[statusIdx] || '' : ''
      trend = trendIdx >= 0 ? values[trendIdx] || 'stable' : 'stable'
      problem = problemIdx >= 0 ? values[problemIdx] || '' : ''
      solution = solutionIdx >= 0 ? values[solutionIdx] || '' : ''
    }

    // Skip if no school name
    if (!schoolName || schoolName.trim() === '') continue

    const schoolKey = schoolName.trim().toLowerCase()

    if (!schoolMap.has(schoolKey)) {
      schoolMap.set(schoolKey, {
        name: schoolName.trim(),
        country: country.trim(),
        countryCode: getCountryCode(country),
        region: schoolType.trim(),
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
        avgScore: 0,
      })
    }

    const school = schoolMap.get(schoolKey)!
    const category = mapCriteria(criteria || indicator || schoolType)

    // Update the score for this category (take the highest)
    switch (category) {
      case 'sustainability':
        if (score > school.sustainabilityScore) {
          school.sustainabilityScore = score
          school.sustainabilityProblem = problem
          school.sustainabilitySolution = solution
        }
        break
      case 'community':
        if (score > school.communityScore) {
          school.communityScore = score
          school.communityProblem = problem
          school.communitySolution = solution
        }
        break
      case 'wellbeing':
        if (score > school.wellbeingScore) {
          school.wellbeingScore = score
          school.wellbeingProblem = problem
          school.wellbeingSolution = solution
        }
        break
      case 'innovation':
        if (score > school.innovationScore) {
          school.innovationScore = score
          school.innovationProblem = problem
          school.innovationSolution = solution
        }
        break
      case 'globalAwareness':
        if (score > school.globalAwarenessScore) {
          school.globalAwarenessScore = score
          school.globalAwarenessProblem = problem
          school.globalAwarenessSolution = solution
        }
        break
    }

    // Update trend
    const trendLower = trend.toLowerCase()
    if (trendLower.includes('improv') || trendLower.includes('up') || trendLower.includes('increas') || trendLower.includes('grow')) {
      school.trend = 'up'
      school.trendValue = Math.max(school.trendValue, 2.5)
    } else if (trendLower.includes('declin') || trendLower.includes('down') || trendLower.includes('decreas') || trendLower.includes('drop')) {
      school.trend = 'down'
      school.trendValue = Math.max(school.trendValue, 1.5)
    }
  }

  // Calculate average scores
  const schools = Array.from(schoolMap.values())
  for (const school of schools) {
    const scores = [
      school.sustainabilityScore,
      school.communityScore,
      school.wellbeingScore,
      school.innovationScore,
      school.globalAwarenessScore,
    ].filter(s => s > 0)
    
    school.avgScore = scores.length > 0 
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0
  }

  return schools
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
      console.log('No custom sheet ID provided')
    }

    if (!customSheetId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No sheet ID provided. Please provide a Google Sheets URL.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${customSheetId}/export?format=csv&gid=0`

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
    const { headers, rows } = parseCSV(csvText)
    console.log('CSV Headers:', headers)
    console.log(`Parsed ${rows.length} CSV rows`)

    if (rows.length === 0) {
      throw new Error('No data rows found in the Google Sheet.')
    }

    // Process and aggregate data
    const schools = processSheetData(headers, rows)
    console.log(`Processed ${schools.length} schools`)

    if (schools.length === 0) {
      throw new Error('No valid school data found. Please check that your sheet has the correct column format with school names and scores.')
    }

    // Log first school for debugging
    console.log('First school:', JSON.stringify(schools[0], null, 2))

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
      .neq('id', '00000000-0000-0000-0000-000000000000')

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
      // Note: avg_score is a generated column, don't insert it
      trend: school.trend,
      trend_value: school.trendValue,
    }))

    const { data: insertedSchools, error: insertError } = await supabase
      .from('schools')
      .insert(schoolsToInsert)
      .select()

    if (insertError) {
      console.error('Error inserting schools:', insertError)
      
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