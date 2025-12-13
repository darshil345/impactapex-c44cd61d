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
import { Trophy, TrendingUp, Target, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { useSchools, useSyncSchools } from '@/hooks/useSchools';
import { useToast } from '@/hooks/use-toast';

function Dashboard() {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [comparisonSchools, setComparisonSchools] = useState<School[]>([]);
  const { toast } = useToast();
  
  // Fetch schools from database
  const { data: dbSchools, isLoading, error } = useSchools();
  const syncMutation = useSyncSchools();
  
  // Use database schools if available, otherwise fall back to mock data
  const schools = dbSchools && dbSchools.length > 0 ? dbSchools : mockSchools;

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

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync();
      toast({
        title: 'Sync Complete',
        description: 'School data has been updated from Google Sheets',
      });
    } catch (err) {
      toast({
        title: 'Sync Failed',
        description: 'Could not sync data from Google Sheets',
        variant: 'destructive',
      });
    }
  };

  const kpiData = useMemo(() => {
    const sorted = [...schools].sort((a, b) => b.avgScore - a.avgScore);
    const topSchool = sorted[0];
    const mostImproved = [...schools].sort((a, b) => b.trendValue - a.trendValue)[0];
    
    const criteriaAverages = {
      sustainability: schools.reduce((acc, s) => acc + s.sustainability, 0) / schools.length,
      communityEngagement: schools.reduce((acc, s) => acc + s.communityEngagement, 0) / schools.length,
      wellbeing: schools.reduce((acc, s) => acc + s.wellbeing, 0) / schools.length,
      globalAwareness: schools.reduce((acc, s) => acc + s.globalAwareness, 0) / schools.length,
      innovation: schools.reduce((acc, s) => acc + s.innovation, 0) / schools.length,
      academicExcellence: schools.reduce((acc, s) => acc + s.academicExcellence, 0) / schools.length,
    };
    
    const strongestCriteria = Object.entries(criteriaAverages).sort((a, b) => b[1] - a[1])[0];
    const weakestCriteria = Object.entries(criteriaAverages).sort((a, b) => a[1] - b[1])[0];
    
    return { topSchool, mostImproved, strongestCriteria, weakestCriteria };
  }, [schools]);

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
              {isLoading ? 'Loading...' : `${schools.length} schools tracked • Real-time updates enabled`}
            </p>
          </div>
          <button 
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {syncMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {syncMutation.isPending ? 'Syncing...' : 'Sync Data'}
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Highest Ranked"
            value={kpiData.topSchool?.name.split(' ').slice(0, 2).join(' ') || '-'}
            subtitle={`Score: ${kpiData.topSchool?.avgScore.toFixed(1) || '-'}`}
            icon={Trophy}
            color="primary"
            delay={0}
          />
          <KPICard
            title="Most Improved"
            value={kpiData.mostImproved?.name.split(' ').slice(0, 2).join(' ') || '-'}
            subtitle={`+${kpiData.mostImproved?.trendValue || 0}% this quarter`}
            icon={TrendingUp}
            trend="up"
            trendValue={`+${kpiData.mostImproved?.trendValue || 0}%`}
            color="plus"
            delay={100}
          />
          <KPICard
            title="Strongest Criteria"
            value={formatCriteriaName(kpiData.strongestCriteria?.[0] || '')}
            subtitle={`Avg: ${kpiData.strongestCriteria?.[1]?.toFixed(1) || 0}%`}
            icon={Target}
            color="pro"
            delay={200}
          />
          <KPICard
            title="Focus Area"
            value={formatCriteriaName(kpiData.weakestCriteria?.[0] || '')}
            subtitle={`Avg: ${kpiData.weakestCriteria?.[1]?.toFixed(1) || 0}%`}
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
              schools={schools}
            />
          </div>

          {/* Right Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ScoreChart schools={schools} />
              <RadarComparison schools={comparisonSchools} />
            </div>
            <Heatmap schools={schools} />
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
