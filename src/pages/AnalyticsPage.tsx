import { useState, useMemo } from 'react';
import { TierProvider } from '@/contexts/TierContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSchools } from '@/hooks/useSchools';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Globe, Target, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(160, 45%, 50%)', 'hsl(210, 80%, 55%)', 'hsl(270, 60%, 65%)', 'hsl(25, 90%, 70%)', 'hsl(200, 80%, 50%)'];

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color?: string;
}

function StatCard({ title, value, change, icon: Icon, color = 'primary' }: StatCardProps) {
  const isPositive = change && change > 0;
  
  return (
    <div className="bg-card rounded-2xl border p-6">
      <div className="flex items-start justify-between">
        <div className={cn("p-2.5 rounded-xl", `bg-${color}/10`)}>
          <Icon className={cn("h-5 w-5", `text-${color}`)} />
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            isPositive ? "text-primary" : "text-destructive"
          )}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-display font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  );
}

function AnalyticsContent() {
  const { data: schools, isLoading } = useSchools();

  const analytics = useMemo(() => {
    if (!schools || schools.length === 0) {
      return {
        totalSchools: 0,
        avgScore: 0,
        topCountries: [],
        criteriaBreakdown: [],
        trendData: [],
        regionDistribution: []
      };
    }

    // Total and average
    const totalSchools = schools.length;
    const avgScore = schools.reduce((acc, s) => acc + s.avgScore, 0) / totalSchools;

    // Top countries
    const countryMap = new Map<string, { count: number; avgScore: number; total: number }>();
    schools.forEach(s => {
      const existing = countryMap.get(s.country) || { count: 0, avgScore: 0, total: 0 };
      countryMap.set(s.country, {
        count: existing.count + 1,
        total: existing.total + s.avgScore,
        avgScore: (existing.total + s.avgScore) / (existing.count + 1)
      });
    });
    const topCountries = Array.from(countryMap.entries())
      .map(([country, data]) => ({ country, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Criteria breakdown
    const criteriaBreakdown = [
      { name: 'Sustainability', value: schools.reduce((acc, s) => acc + s.sustainability, 0) / totalSchools },
      { name: 'Community', value: schools.reduce((acc, s) => acc + s.communityEngagement, 0) / totalSchools },
      { name: 'Wellbeing', value: schools.reduce((acc, s) => acc + s.wellbeing, 0) / totalSchools },
      { name: 'Innovation', value: schools.reduce((acc, s) => acc + s.innovation, 0) / totalSchools },
      { name: 'Global', value: schools.reduce((acc, s) => acc + s.globalAwareness, 0) / totalSchools },
    ];

    // Trend data (simulated for visualization)
    const trendData = [
      { month: 'Jan', score: avgScore - 5 },
      { month: 'Feb', score: avgScore - 3 },
      { month: 'Mar', score: avgScore - 2 },
      { month: 'Apr', score: avgScore - 1 },
      { month: 'May', score: avgScore + 1 },
      { month: 'Jun', score: avgScore },
    ];

    // Region distribution
    const regionMap = new Map<string, number>();
    schools.forEach(s => {
      const region = s.region || 'Unknown';
      regionMap.set(region, (regionMap.get(region) || 0) + 1);
    });
    const regionDistribution = Array.from(regionMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalSchools,
      avgScore,
      topCountries,
      criteriaBreakdown,
      trendData,
      regionDistribution
    };
  }, [schools]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Comprehensive insights into school performance metrics
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Schools"
            value={analytics.totalSchools}
            icon={Users}
            change={12}
          />
          <StatCard
            title="Average Score"
            value={analytics.avgScore.toFixed(1)}
            icon={Target}
            change={5}
          />
          <StatCard
            title="Countries"
            value={analytics.topCountries.length}
            icon={Globe}
          />
          <StatCard
            title="Top Performer Score"
            value={schools && schools.length > 0 ? Math.max(...schools.map(s => s.avgScore)).toFixed(1) : '0'}
            icon={Award}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trend */}
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="font-semibold mb-4">Performance Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analytics.trendData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 45%, 50%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(160, 45%, 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(160, 45%, 50%)" 
                  fill="url(#scoreGradient)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Criteria Breakdown */}
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="font-semibold mb-4">Criteria Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.criteriaBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }} 
                  formatter={(value: number) => value.toFixed(1)}
                />
                <Bar dataKey="value" fill="hsl(160, 45%, 50%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Region Distribution */}
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="font-semibold mb-4">Region Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.regionDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.regionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Countries */}
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="font-semibold mb-4">Top Countries</h3>
            <div className="space-y-3">
              {analytics.topCountries.map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <span className="font-medium">{country.country}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {country.count} schools
                    </span>
                    <span className="font-semibold text-primary">
                      {country.avgScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AnalyticsPage() {
  return (
    <TierProvider>
      <AnalyticsContent />
    </TierProvider>
  );
}
