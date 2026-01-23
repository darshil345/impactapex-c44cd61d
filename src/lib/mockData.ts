export interface School {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  type: 'Primary' | 'Secondary' | 'K-12';
  sustainability: number;
  communityEngagement: number;
  wellbeing: number;
  globalAwareness: number;
  innovation: number;
  academicExcellence: number;
  avgScore: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  problems: string[];
  solutions: string[];
  lastUpdated: string;
}

export const mockSchools: School[] = [
  {
    id: '1',
    name: 'Green Valley International',
    country: 'Singapore',
    countryCode: 'SG',
    region: 'Asia Pacific',
    type: 'K-12',
    sustainability: 92,
    communityEngagement: 88,
    wellbeing: 85,
    globalAwareness: 90,
    innovation: 87,
    academicExcellence: 91,
    avgScore: 88.8,
    trend: 'up',
    trendValue: 3.2,
    problems: ['Student mental health support', 'Carbon footprint reduction'],
    solutions: ['Implemented mindfulness programs', 'Solar panel installation'],
    lastUpdated: '2024-01-15'
  },
  {
    id: '2',
    name: 'Nordic Academy',
    country: 'Finland',
    countryCode: 'FI',
    region: 'Europe',
    type: 'Secondary',
    sustainability: 95,
    communityEngagement: 82,
    wellbeing: 94,
    globalAwareness: 85,
    innovation: 89,
    academicExcellence: 88,
    avgScore: 88.5,
    trend: 'up',
    trendValue: 1.8,
    problems: ['Digital literacy gaps', 'Outdoor learning space'],
    solutions: ['1:1 device program', 'Forest school curriculum'],
    lastUpdated: '2024-01-14'
  },
  {
    id: '3',
    name: 'Maple Leaf School',
    country: 'Canada',
    countryCode: 'CA',
    region: 'North America',
    type: 'K-12',
    sustainability: 88,
    communityEngagement: 91,
    wellbeing: 86,
    globalAwareness: 83,
    innovation: 85,
    academicExcellence: 87,
    avgScore: 86.7,
    trend: 'stable',
    trendValue: 0.3,
    problems: ['Indigenous curriculum integration', 'Parent engagement'],
    solutions: ['Partnership with First Nations communities', 'Digital parent portal'],
    lastUpdated: '2024-01-13'
  },
  {
    id: '4',
    name: 'Tokyo International School',
    country: 'Japan',
    countryCode: 'JP',
    region: 'Asia Pacific',
    type: 'K-12',
    sustainability: 86,
    communityEngagement: 79,
    wellbeing: 81,
    globalAwareness: 92,
    innovation: 94,
    academicExcellence: 93,
    avgScore: 87.5,
    trend: 'up',
    trendValue: 2.5,
    problems: ['Work-life balance for students', 'Environmental initiatives'],
    solutions: ['Reduced homework policy', 'Zero-waste cafeteria program'],
    lastUpdated: '2024-01-15'
  },
  {
    id: '5',
    name: 'Cape Town Academy',
    country: 'South Africa',
    countryCode: 'ZA',
    region: 'Africa',
    type: 'Secondary',
    sustainability: 78,
    communityEngagement: 94,
    wellbeing: 76,
    globalAwareness: 80,
    innovation: 75,
    academicExcellence: 82,
    avgScore: 80.8,
    trend: 'up',
    trendValue: 4.1,
    problems: ['Resource accessibility', 'Community safety'],
    solutions: ['Community learning centers', 'Safe routes to school program'],
    lastUpdated: '2024-01-12'
  },
  {
    id: '6',
    name: 'British International Dubai',
    country: 'UAE',
    countryCode: 'AE',
    region: 'Middle East',
    type: 'K-12',
    sustainability: 82,
    communityEngagement: 85,
    wellbeing: 88,
    globalAwareness: 91,
    innovation: 90,
    academicExcellence: 89,
    avgScore: 87.5,
    trend: 'stable',
    trendValue: 0.8,
    problems: ['Cultural diversity inclusion', 'Sustainability in desert climate'],
    solutions: ['Cultural celebration week', 'Water recycling system'],
    lastUpdated: '2024-01-14'
  },
  {
    id: '7',
    name: 'São Paulo Global School',
    country: 'Brazil',
    countryCode: 'BR',
    region: 'South America',
    type: 'K-12',
    sustainability: 84,
    communityEngagement: 89,
    wellbeing: 79,
    globalAwareness: 82,
    innovation: 78,
    academicExcellence: 83,
    avgScore: 82.5,
    trend: 'up',
    trendValue: 2.9,
    problems: ['Social inequality awareness', 'Technology access'],
    solutions: ['Scholarship programs', 'Device lending library'],
    lastUpdated: '2024-01-11'
  },
  {
    id: '8',
    name: 'Munich European School',
    country: 'Germany',
    countryCode: 'DE',
    region: 'Europe',
    type: 'Secondary',
    sustainability: 91,
    communityEngagement: 83,
    wellbeing: 87,
    globalAwareness: 88,
    innovation: 86,
    academicExcellence: 90,
    avgScore: 87.5,
    trend: 'stable',
    trendValue: 0.5,
    problems: ['Inclusive education', 'Climate action engagement'],
    solutions: ['Universal design for learning', 'Student-led climate committee'],
    lastUpdated: '2024-01-15'
  },
  {
    id: '9',
    name: 'Sydney Progressive',
    country: 'Australia',
    countryCode: 'AU',
    region: 'Oceania',
    type: 'Primary',
    sustainability: 89,
    communityEngagement: 86,
    wellbeing: 91,
    globalAwareness: 84,
    innovation: 83,
    academicExcellence: 85,
    avgScore: 86.3,
    trend: 'up',
    trendValue: 1.5,
    problems: ['Screen time balance', 'Outdoor learning'],
    solutions: ['Tech-free Tuesdays', 'Bush classroom program'],
    lastUpdated: '2024-01-13'
  },
  {
    id: '10',
    name: 'New York Innovation Hub',
    country: 'USA',
    countryCode: 'US',
    region: 'North America',
    type: 'K-12',
    sustainability: 80,
    communityEngagement: 87,
    wellbeing: 78,
    globalAwareness: 86,
    innovation: 95,
    academicExcellence: 88,
    avgScore: 85.7,
    trend: 'up',
    trendValue: 2.1,
    problems: ['Mental health crisis', 'Equity in tech access'],
    solutions: ['On-site counseling expansion', 'Free broadband program'],
    lastUpdated: '2024-01-14'
  },
  {
    id: '11',
    name: 'Copenhagen Green School',
    country: 'Denmark',
    countryCode: 'DK',
    region: 'Europe',
    type: 'K-12',
    sustainability: 97,
    communityEngagement: 84,
    wellbeing: 92,
    globalAwareness: 86,
    innovation: 88,
    academicExcellence: 85,
    avgScore: 88.7,
    trend: 'up',
    trendValue: 1.2,
    problems: ['Energy consumption', 'Student voice'],
    solutions: ['Net-zero campus', 'Student parliament'],
    lastUpdated: '2024-01-15'
  },
  {
    id: '12',
    name: 'Mumbai Future Leaders',
    country: 'India',
    countryCode: 'IN',
    region: 'Asia Pacific',
    type: 'Secondary',
    sustainability: 75,
    communityEngagement: 92,
    wellbeing: 74,
    globalAwareness: 81,
    innovation: 82,
    academicExcellence: 86,
    avgScore: 81.7,
    trend: 'up',
    trendValue: 3.8,
    problems: ['Air quality', 'Access to clean water'],
    solutions: ['Air purification systems', 'Rainwater harvesting'],
    lastUpdated: '2024-01-12'
  }
];

export const criteria = [
  { key: 'sustainability', label: 'Sustainability', color: 'hsl(160 45% 50%)' },
  { key: 'communityEngagement', label: 'Community Engagement', color: 'hsl(210 80% 55%)' },
  { key: 'wellbeing', label: 'Wellbeing', color: 'hsl(270 60% 65%)' },
  { key: 'academicExcellence', label: 'Academic Excellence', color: 'hsl(25 90% 60%)' },
  { key: 'innovation', label: 'Innovation', color: 'hsl(340 70% 60%)' },
  { key: 'academicExcellence', label: 'Academic Excellence', color: 'hsl(45 90% 55%)' },
] as const;

export const freeCriteria = ['sustainability', 'communityEngagement', 'wellbeing'];

export type SubscriptionTier = 'free' | 'plus' | 'pro' | 'enterprise';

export interface TierFeatures {
  maxSchools: number;
  allCriteria: boolean;
  leaderboard: boolean;
  comparison: boolean;
  radarChart: boolean;
  heatmap: boolean;
  trendAnalysis: boolean;
  pdfExport: boolean;
  customIndicators: boolean;
  evidenceUpload: boolean;
  publicProfile: boolean;
  whiteLabelBranding: boolean;
  historicalComparison: boolean;
  apiAccess: boolean;
}

export const tierFeatures: Record<SubscriptionTier, TierFeatures> = {
  free: {
    maxSchools: 3,
    allCriteria: false,
    leaderboard: false,
    comparison: false,
    radarChart: false,
    heatmap: false,
    trendAnalysis: false,
    pdfExport: false,
    customIndicators: false,
    evidenceUpload: false,
    publicProfile: false,
    whiteLabelBranding: false,
    historicalComparison: false,
    apiAccess: false,
  },
  plus: {
    maxSchools: 10,
    allCriteria: true,
    leaderboard: true,
    comparison: true,
    radarChart: true,
    heatmap: true,
    trendAnalysis: true,
    pdfExport: true,
    customIndicators: false,
    evidenceUpload: false,
    publicProfile: false,
    whiteLabelBranding: false,
    historicalComparison: false,
    apiAccess: false,
  },
  pro: {
    maxSchools: Infinity,
    allCriteria: true,
    leaderboard: true,
    comparison: true,
    radarChart: true,
    heatmap: true,
    trendAnalysis: true,
    pdfExport: true,
    customIndicators: true,
    evidenceUpload: true,
    publicProfile: true,
    whiteLabelBranding: true,
    historicalComparison: true,
    apiAccess: true,
  },
  enterprise: {
    maxSchools: Infinity,
    allCriteria: true,
    leaderboard: true,
    comparison: true,
    radarChart: true,
    heatmap: true,
    trendAnalysis: true,
    pdfExport: true,
    customIndicators: true,
    evidenceUpload: true,
    publicProfile: true,
    whiteLabelBranding: true,
    historicalComparison: true,
    apiAccess: true,
  },
};

export const tierInfo: Record<SubscriptionTier, { name: string; tagline: string; price: string; color: string }> = {
  free: { name: 'Explore', tagline: 'Discover impact tracking', price: 'Free', color: 'hsl(var(--muted-foreground))' },
  plus: { name: 'Compete', tagline: 'Join the league', price: '$29/mo', color: 'hsl(var(--plus))' },
  pro: { name: 'Lead', tagline: 'Premium insights', price: '$99/mo', color: 'hsl(var(--pro))' },
  enterprise: { name: 'Enterprise', tagline: 'District-wide', price: 'Custom', color: 'hsl(var(--primary))' },
};

export const insights = [
  "Mental wellbeing is a shared challenge across 67% of schools globally.",
  "Schools with sustainability scores above 90 show 23% higher community engagement.",
  "Exchange programs drive the fastest global awareness growth (+4.2% avg).",
  "Nordic region leads in wellbeing scores with an average of 91.5.",
  "Innovation scores correlate strongly with academic excellence (r=0.78).",
];
