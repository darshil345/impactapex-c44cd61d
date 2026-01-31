import { useMemo } from 'react';
import { School, criteria } from '@/lib/mockData';
import { Globe, Users, TrendingUp, Award, BarChart3, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickStatsProps {
  schools: School[];
}

export function QuickStats({ schools }: QuickStatsProps) {
  const stats = useMemo(() => {
    if (schools.length === 0) {
      return null;
    }

    const regions = [...new Set(schools.map(s => s.region))];
    const countries = [...new Set(schools.map(s => s.country))];
    const improvingSchools = schools.filter(s => s.trend === 'up').length;
    const highPerformers = schools.filter(s => s.avgScore >= 85).length;
    const avgScore = schools.reduce((acc, s) => acc + s.avgScore, 0) / schools.length;
    
    // Find best criteria
    const criteriaAverages = criteria.map(c => ({
      name: c.label,
      avg: schools.reduce((acc, s) => acc + (s[c.key as keyof typeof s] as number), 0) / schools.length
    }));
    const bestCriteria = criteriaAverages.sort((a, b) => b.avg - a.avg)[0];

    return {
      totalSchools: schools.length,
      regions: regions.length,
      countries: countries.length,
      improvingSchools,
      highPerformers,
      avgScore: avgScore.toFixed(1),
      bestCriteria: bestCriteria?.name || 'N/A',
    };
  }, [schools]);

  if (!stats) {
    return (
      <div className="bg-card rounded-2xl border shadow-sm p-5">
        <h3 className="font-display font-semibold text-lg mb-4">Quick Stats</h3>
        <p className="text-muted-foreground text-sm">Sync data to see statistics</p>
      </div>
    );
  }

  const statItems = [
    { icon: Users, label: 'Total Schools', value: stats.totalSchools, color: 'bg-primary/10 text-primary' },
    { icon: Globe, label: 'Countries', value: stats.countries, color: 'bg-blue-500/10 text-blue-500' },
    { icon: TrendingUp, label: 'Improving', value: stats.improvingSchools, color: 'bg-green-500/10 text-green-500' },
    { icon: Award, label: 'High Performers', value: stats.highPerformers, color: 'bg-amber-500/10 text-amber-500' },
    { icon: BarChart3, label: 'Avg Score', value: stats.avgScore, color: 'bg-purple-500/10 text-purple-500' },
    { icon: Zap, label: 'Best Area', value: stats.bestCriteria.split(' ')[0], color: 'bg-pink-500/10 text-pink-500' },
  ];

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-lg">Quick Stats</h3>
          <p className="text-xs text-muted-foreground">Overview at a glance</p>
        </div>
        <div className="p-2 rounded-xl bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {statItems.map((item, index) => (
          <div
            key={index}
            className="p-3 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors"
          >
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', item.color)}>
              <item.icon className="h-4 w-4" />
            </div>
            <p className="text-lg font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
