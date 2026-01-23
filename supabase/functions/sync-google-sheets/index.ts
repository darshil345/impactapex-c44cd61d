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

interface SchoolInputData {
  name: string
  country: string
  region: string
  initiatives: string[]
  activities: string[]
  programs: string[]
  achievements: string[]
  challenges: string[]
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

function parseSheetToSchoolInputs(headers: string[], rows: string[][]): SchoolInputData[] {
  console.log('Processing with headers:', headers)
  
  // Find column indices dynamically
  const schoolNameIdx = findColumnIndex(headers, ['school_name', 'schoolname', 'school', 'name', 'institution'])
  const countryIdx = findColumnIndex(headers, ['country', 'nation', 'location'])
  const regionIdx = findColumnIndex(headers, ['school_type', 'schooltype', 'type', 'region', 'category'])
  const initiativeIdx = findColumnIndex(headers, ['initiative', 'initiatives', 'project', 'projects'])
  const activityIdx = findColumnIndex(headers, ['activity', 'activities', 'action', 'actions'])
  const programIdx = findColumnIndex(headers, ['program', 'programs', 'course', 'courses'])
  const achievementIdx = findColumnIndex(headers, ['achievement', 'achievements', 'award', 'awards', 'accomplishment'])
  const challengeIdx = findColumnIndex(headers, ['challenge', 'challenges', 'problem', 'problems', 'issue', 'issues'])
  const descriptionIdx = findColumnIndex(headers, ['description', 'details', 'about', 'summary', 'info'])
  const globalIdx = findColumnIndex(headers, ['global', 'global_awareness', 'international', 'exchange', 'partnership'])
  
  console.log('Column indices:', { schoolNameIdx, countryIdx, regionIdx, initiativeIdx, activityIdx, programIdx, achievementIdx, challengeIdx, descriptionIdx, globalIdx })

  const schoolMap = new Map<string, SchoolInputData>()

  for (const values of rows) {
    if (values.length < 2) continue

    // Determine school name position
    const hasIdColumn = headers.length > 0 && headers[0].toLowerCase().includes('id') && !headers[0].toLowerCase().includes('school')
    const offset = hasIdColumn ? 1 : 0
    
    const schoolName = schoolNameIdx >= 0 ? values[schoolNameIdx] || '' : values[offset] || ''
    const country = countryIdx >= 0 ? values[countryIdx] || '' : values[offset + 1] || ''
    const region = regionIdx >= 0 ? values[regionIdx] || '' : values[offset + 2] || ''
    
    // Skip if no school name
    if (!schoolName || schoolName.trim() === '') continue

    const schoolKey = schoolName.trim().toLowerCase()

    if (!schoolMap.has(schoolKey)) {
      schoolMap.set(schoolKey, {
        name: schoolName.trim(),
        country: country.trim(),
        region: region.trim(),
        initiatives: [],
        activities: [],
        programs: [],
        achievements: [],
        challenges: [],
      })
    }

    const school = schoolMap.get(schoolKey)!

    // Collect all relevant text data from the row
    const initiative = initiativeIdx >= 0 ? values[initiativeIdx] || '' : ''
    const activity = activityIdx >= 0 ? values[activityIdx] || '' : ''
    const program = programIdx >= 0 ? values[programIdx] || '' : ''
    const achievement = achievementIdx >= 0 ? values[achievementIdx] || '' : ''
    const challenge = challengeIdx >= 0 ? values[challengeIdx] || '' : ''
    const description = descriptionIdx >= 0 ? values[descriptionIdx] || '' : ''
    const globalAwareness = globalIdx >= 0 ? values[globalIdx] || '' : ''

    // Add non-empty values
    if (initiative) school.initiatives.push(initiative)
    if (activity) school.activities.push(activity)
    if (program) school.programs.push(program)
    if (achievement) school.achievements.push(achievement)
    if (challenge) school.challenges.push(challenge)
    if (globalAwareness) school.initiatives.push(globalAwareness)
    
    // If there's a description, try to categorize it
    if (description) {
      school.initiatives.push(description)
    }

    // If we have extra columns not matching known headers, add them as initiatives
    for (let i = offset + 3; i < values.length; i++) {
      const val = values[i]?.trim()
      if (val && val.length > 5 && !val.match(/^\d+$/)) {
        // Skip if it's the same as already captured
        if (val !== initiative && val !== activity && val !== program && val !== achievement && val !== challenge && val !== description && val !== globalAwareness) {
          school.initiatives.push(val)
        }
      }
    }
  }

  return Array.from(schoolMap.values())
}

async function analyzeSchoolWithAI(school: SchoolInputData): Promise<SchoolData> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
  
  if (!LOVABLE_API_KEY) {
    console.warn('LOVABLE_API_KEY not available, using basic scoring')
    return basicScoring(school)
  }

  const allContent = [
    ...school.initiatives,
    ...school.activities,
    ...school.programs,
    ...school.achievements,
  ].filter(Boolean).join('\n- ')

  const challengesContent = school.challenges.filter(Boolean).join('\n- ')

  const prompt = `Analyze this school's SDG (Sustainable Development Goals) performance based on their initiatives and activities.

School: ${school.name}
Country: ${school.country}
Region: ${school.region}

Initiatives, Activities & Programs:
- ${allContent || 'No specific initiatives provided'}

Challenges:
- ${challengesContent || 'No specific challenges provided'}

Score this school on these 5 SDG-related categories (0-100 scale):
1. Sustainability (SDG 7, 12, 13, 14, 15 - renewable energy, responsible consumption, climate action, environmental protection)
2. Community Engagement (SDG 1, 2, 10, 11 - poverty, hunger, reduced inequalities, sustainable communities)
3. Wellbeing (SDG 3, 6 - health, wellness, clean water)
4. Innovation & Education (SDG 4, 8, 9 - quality education, decent work, industry/innovation)
5. Global Awareness (SDG 5, 16, 17 - gender equality, peace/justice, international partnerships, cultural exchange, global citizenship)

For each category, also identify one key problem/challenge and suggest a solution based on the data.

Determine the trend: "up" (improving), "down" (declining), or "stable"`

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in Sustainable Development Goals (SDGs) and school sustainability assessment. Analyze school data and provide accurate scores and insights.'
          },
          { role: 'user', content: prompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'submit_sdg_scores',
              description: 'Submit SDG scores and analysis for a school',
              parameters: {
                type: 'object',
                properties: {
                  sustainability: {
                    type: 'object',
                    properties: {
                      score: { type: 'number', description: 'Score 0-100' },
                      problem: { type: 'string', description: 'Key challenge identified' },
                      solution: { type: 'string', description: 'Suggested improvement' }
                    },
                    required: ['score', 'problem', 'solution']
                  },
                  community: {
                    type: 'object',
                    properties: {
                      score: { type: 'number', description: 'Score 0-100' },
                      problem: { type: 'string', description: 'Key challenge identified' },
                      solution: { type: 'string', description: 'Suggested improvement' }
                    },
                    required: ['score', 'problem', 'solution']
                  },
                  wellbeing: {
                    type: 'object',
                    properties: {
                      score: { type: 'number', description: 'Score 0-100' },
                      problem: { type: 'string', description: 'Key challenge identified' },
                      solution: { type: 'string', description: 'Suggested improvement' }
                    },
                    required: ['score', 'problem', 'solution']
                  },
                  innovation: {
                    type: 'object',
                    properties: {
                      score: { type: 'number', description: 'Score 0-100' },
                      problem: { type: 'string', description: 'Key challenge identified' },
                      solution: { type: 'string', description: 'Suggested improvement' }
                    },
                    required: ['score', 'problem', 'solution']
                  },
                  globalAwareness: {
                    type: 'object',
                    properties: {
                      score: { type: 'number', description: 'Score 0-100' },
                      problem: { type: 'string', description: 'Key challenge identified' },
                      solution: { type: 'string', description: 'Suggested improvement' }
                    },
                    required: ['score', 'problem', 'solution']
                  },
                  trend: { type: 'string', enum: ['up', 'down', 'stable'] }
                },
                required: ['sustainability', 'community', 'wellbeing', 'innovation', 'globalAwareness', 'trend']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'submit_sdg_scores' } }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI API error:', response.status, errorText)
      return basicScoring(school)
    }

    const data = await response.json()
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0]
    
    if (toolCall?.function?.arguments) {
      const scores = JSON.parse(toolCall.function.arguments)
      
      const sustainabilityScore = Math.min(100, Math.max(0, scores.sustainability?.score || 50))
      const communityScore = Math.min(100, Math.max(0, scores.community?.score || 50))
      const wellbeingScore = Math.min(100, Math.max(0, scores.wellbeing?.score || 50))
      const innovationScore = Math.min(100, Math.max(0, scores.innovation?.score || 50))
      const globalAwarenessScore = Math.min(100, Math.max(0, scores.globalAwareness?.score || 50))
      
      const avgScore = Math.round((sustainabilityScore + communityScore + wellbeingScore + innovationScore + globalAwarenessScore) / 5)

      return {
        name: school.name,
        country: school.country,
        countryCode: getCountryCode(school.country),
        region: school.region,
        sustainabilityScore,
        sustainabilityProblem: scores.sustainability?.problem || '',
        sustainabilitySolution: scores.sustainability?.solution || '',
        communityScore,
        communityProblem: scores.community?.problem || '',
        communitySolution: scores.community?.solution || '',
        wellbeingScore,
        wellbeingProblem: scores.wellbeing?.problem || '',
        wellbeingSolution: scores.wellbeing?.solution || '',
        innovationScore,
        innovationProblem: scores.innovation?.problem || '',
        innovationSolution: scores.innovation?.solution || '',
        globalAwarenessScore,
        globalAwarenessProblem: scores.globalAwareness?.problem || '',
        globalAwarenessSolution: scores.globalAwareness?.solution || '',
        trend: scores.trend || 'stable',
        trendValue: scores.trend === 'up' ? 2.5 : scores.trend === 'down' ? -1.5 : 0,
        avgScore,
      }
    }
    
    return basicScoring(school)
  } catch (error) {
    console.error('AI analysis error:', error)
    return basicScoring(school)
  }
}

// Basic keyword-based scoring as fallback
function basicScoring(school: SchoolInputData): SchoolData {
  const allText = [
    ...school.initiatives,
    ...school.activities,
    ...school.programs,
    ...school.achievements,
  ].join(' ').toLowerCase()

  // Keyword-based scoring
  const sustainabilityKeywords = ['solar', 'recycl', 'green', 'eco', 'carbon', 'environment', 'renewable', 'waste', 'energy', 'climate', 'sustainable', 'biodiversity', 'conservation']
  const communityKeywords = ['volunteer', 'community', 'outreach', 'service', 'donation', 'charity', 'help', 'support', 'local', 'neighborhood', 'poverty', 'hunger']
  const wellbeingKeywords = ['health', 'wellness', 'mental', 'mindful', 'yoga', 'sports', 'fitness', 'counseling', 'safety', 'nutrition', 'physical', 'wellbeing']
  const innovationKeywords = ['stem', 'steam', 'coding', 'robot', 'tech', 'innovation', 'research', 'project', 'digital', 'ai', 'science', 'lab', 'experiment']
  const globalKeywords = ['international', 'global', 'exchange', 'diversity', 'inclusion', 'cultural', 'multicultural', 'language', 'partnership', 'mun', 'united nations', 'gender', 'peace']

  const countKeywords = (text: string, keywords: string[]) => {
    return keywords.filter(k => text.includes(k)).length
  }

  const baseScore = 40
  const maxBonus = 50

  const sustainabilityScore = Math.min(100, baseScore + (countKeywords(allText, sustainabilityKeywords) / sustainabilityKeywords.length) * maxBonus + Math.random() * 10)
  const communityScore = Math.min(100, baseScore + (countKeywords(allText, communityKeywords) / communityKeywords.length) * maxBonus + Math.random() * 10)
  const wellbeingScore = Math.min(100, baseScore + (countKeywords(allText, wellbeingKeywords) / wellbeingKeywords.length) * maxBonus + Math.random() * 10)
  const innovationScore = Math.min(100, baseScore + (countKeywords(allText, innovationKeywords) / innovationKeywords.length) * maxBonus + Math.random() * 10)
  const globalAwarenessScore = Math.min(100, baseScore + (countKeywords(allText, globalKeywords) / globalKeywords.length) * maxBonus + Math.random() * 10)

  const avgScore = Math.round((sustainabilityScore + communityScore + wellbeingScore + innovationScore + globalAwarenessScore) / 5)

  return {
    name: school.name,
    country: school.country,
    countryCode: getCountryCode(school.country),
    region: school.region,
    sustainabilityScore: Math.round(sustainabilityScore),
    sustainabilityProblem: 'Limited data for detailed analysis',
    sustainabilitySolution: 'Provide more detailed information about sustainability initiatives',
    communityScore: Math.round(communityScore),
    communityProblem: 'Community engagement metrics need more detail',
    communitySolution: 'Document community outreach programs and volunteer hours',
    wellbeingScore: Math.round(wellbeingScore),
    wellbeingProblem: 'Wellbeing programs documentation limited',
    wellbeingSolution: 'Track and report on student wellness initiatives',
    innovationScore: Math.round(innovationScore),
    innovationProblem: 'Innovation metrics require more context',
    innovationSolution: 'Detail STEM/STEAM programs and student projects',
    globalAwarenessScore: Math.round(globalAwarenessScore),
    globalAwarenessProblem: 'Global engagement details needed',
    globalAwarenessSolution: 'Document international partnerships and cultural exchange programs',
    trend: 'stable',
    trendValue: 0,
    avgScore,
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting Google Sheets sync with AI analysis...')

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

    // Parse sheet into school inputs
    const schoolInputs = parseSheetToSchoolInputs(headers, rows)
    console.log(`Found ${schoolInputs.length} schools to analyze`)

    if (schoolInputs.length === 0) {
      throw new Error('No valid school data found. Please check that your sheet has school names and relevant data.')
    }

    // Log first school input for debugging
    console.log('First school input:', JSON.stringify(schoolInputs[0], null, 2))

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

    // Analyze each school with AI (process in batches to avoid rate limits)
    console.log('Analyzing schools with AI...')
    const schools: SchoolData[] = []
    
    for (let i = 0; i < schoolInputs.length; i++) {
      console.log(`Analyzing school ${i + 1}/${schoolInputs.length}: ${schoolInputs[i].name}`)
      const schoolData = await analyzeSchoolWithAI(schoolInputs[i])
      schools.push(schoolData)
      
      // Small delay between API calls to avoid rate limiting
      if (i < schoolInputs.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    console.log(`Analyzed ${schools.length} schools`)

    // Log first analyzed school for debugging
    console.log('First analyzed school:', JSON.stringify(schools[0], null, 2))

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
        message: `Successfully synced and analyzed ${insertedSchools?.length || 0} schools`,
        recordsSynced: insertedSchools?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Sync error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
