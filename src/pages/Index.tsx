import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import { ScoreChart } from '@/components/dashboard/ScoreChart';
import { RadarComparison } from '@/components/dashboard/RadarComparison';
import { InsightEngine } from '@/components/dashboard/InsightEngine';
import { SchoolProfile } from '@/components/dashboard/SchoolProfile';
import { TierSelector } from '@/components/dashboard/TierSelector';
import { Heatmap } from '@/components/dashboard/Heatmap';
import { mockSchools, School } from '@/lib/mockData';
import { TierProvider } from '@/contexts/TierContext';
import { Trophy, TrendingUp, Target, AlertTriangle, RefreshCw } from 'lucide-react';

function Dashboard() {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [comparisonSchools, setComparisonSchools] = useState<School[]>([]);

  const handleSchoolClick = (school: School) => {
    if (comparisonSchools.find(s => s.id === school.id)) {
      setComparisonSchools(comparisonSchools.filter(s => s.id !== school.id));
    } else if (comparisonSchools.length < 3) {
      setComparisonSchools([...comparisonSchools, school]);
    }
  };

  const handleViewProfile = (school: School) => {
    setSelectedSchool(school);
  };

  const kpiData = useMemo(() => {
    const sorted = [...mockSchools].sort((a, b) => b.avgScore - a.avgScore);
    const topSchool = sorted[0];
    const mostImproved = [...mockSchools].sort((a, b) => b.trendValue - a.trendValue)[0];
    
    const criteriaAverages = {
      sustainability: mockSchools.reduce((acc, s) => acc + s.sustainability, 0) / mockSchools.length,
      communityEngagement: mockSchools.reduce((acc, s) => acc + s.communityEngagement, 0) / mockSchools.length,
      wellbeing: mockSchools.reduce((acc, s) => acc + s.wellbeing, 0) / mockSchools.length,
      globalAwareness: mockSchools.reduce((acc, s) => acc + s.globalAwareness, 0) / mockSchools.length,
      innovation: mockSchools.reduce((acc, s) => acc + s.innovation, 0) / mockSchools.length,
      academicExcellence: mockSchools.reduce((acc, s) => acc + s.academicExcellence, 0) / mockSchools.length,
    };
    
    const strongestCriteria = Object.entries(criteriaAverages).sort((a, b) => b[1] - a[1])[0];
    const weakestCriteria = Object.entries(criteriaAverages).sort((a, b) => a[1] - b[1])[0];
    
    return { topSchool, mostImproved, strongestCriteria, weakestCriteria };
  }, []);

  const formatCriteriaName = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Impact Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Real-time global school performance metrics
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-medium transition-colors">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Highest Ranked"
            value={kpiData.topSchool.name.split(' ').slice(0, 2).join(' ')}
            subtitle={`Score: ${kpiData.topSchool.avgScore.toFixed(1)}`}
            icon={Trophy}
            color="primary"
            delay={0}
          />
          <KPICard
            title="Most Improved"
            value={kpiData.mostImproved.name.split(' ').slice(0, 2).join(' ')}
            subtitle={`+${kpiData.mostImproved.trendValue}% this quarter`}
            icon={TrendingUp}
            trend="up"
            trendValue={`+${kpiData.mostImproved.trendValue}%`}
            color="plus"
            delay={100}
          />
          <KPICard
            title="Strongest Criteria"
            value={formatCriteriaName(kpiData.strongestCriteria[0])}
            subtitle={`Avg: ${kpiData.strongestCriteria[1].toFixed(1)}%`}
            icon={Target}
            color="pro"
            delay={200}
          />
          <KPICard
            title="Focus Area"
            value={formatCriteriaName(kpiData.weakestCriteria[0])}
            subtitle={`Avg: ${kpiData.weakestCriteria[1].toFixed(1)}%`}
            icon={AlertTriangle}
            color="highlight"
            delay={300}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Leaderboard */}
          <div className="lg:col-span-1">
            <Leaderboard 
              onSchoolClick={handleSchoolClick} 
              selectedSchool={selectedSchool}
            />
          </div>

          {/* Right Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ScoreChart />
              <RadarComparison schools={comparisonSchools} />
            </div>
            <Heatmap />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InsightEngine />
          <TierSelector />
        </div>
      </div>

      {/* School Profile Modal */}
      {selectedSchool && (
        <SchoolProfile 
          school={selectedSchool} 
          onClose={() => setSelectedSchool(null)} 
        />
      )}
    </DashboardLayout>
  );
}

export default function Index() {
  return (
    <TierProvider>
      <Dashboard />
    </TierProvider>
  );
}
