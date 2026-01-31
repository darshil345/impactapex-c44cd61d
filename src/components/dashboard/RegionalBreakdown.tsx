import { useMemo } from 'react';
import { School } from '@/lib/mockData';
import { Globe, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegionalBreakdownProps {
  schools: School[];
}

export function RegionalBreakdown({ schools }: RegionalBreakdownProps) {
  const regionData = useMemo(() => {
    if (schools.length === 0) return [];

    const regionMap = new Map<string, { schools: School[]; totalScore: number }>();

    schools.forEach(school => {
      const region = school.region;
      if (!regionMap.has(region)) {
        regionMap.set(region, { schools: [], totalScore: 0 });
      }
      const data = regionMap.get(region)!;
      data.schools.push(school);
      data.totalScore += school.avgScore;
    });

    return Array.from(regionMap.entries())
      .map(([region, data]) => ({
        region,
        schoolCount: data.schools.length,
        avgScore: data.totalScore / data.schools.length,
        topSchool: data.schools.sort((a, b) => b.avgScore - a.avgScore)[0],
        improvingCount: data.schools.filter(s => s.trend === 'up').length,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }, [schools]);

  if (regionData.length === 0) {
    return (
      <div className="bg-card rounded-2xl border shadow-sm p-5">
        <h3 className="font-display font-semibold text-lg mb-4">Regional Breakdown</h3>
        <p className="text-muted-foreground text-sm">Sync data to see regional statistics</p>
      </div>
    );
  }

  const maxScore = Math.max(...regionData.map(r => r.avgScore));

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-lg">Regional Breakdown</h3>
          <p className="text-xs text-muted-foreground">Performance by geographic region</p>
        </div>
        <div className="p-2 rounded-xl bg-primary/10">
          <Globe className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="space-y-3">
        {regionData.map((region, index) => (
          <div
            key={region.region}
            className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {getRegionEmoji(region.region)}
                </span>
                <span className="font-medium text-sm">{region.region}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {region.schoolCount} school{region.schoolCount > 1 ? 's' : ''}
                </span>
                <span className="font-bold text-primary">{region.avgScore.toFixed(1)}</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(region.avgScore / maxScore) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Top: {region.topSchool.name.split(' ').slice(0, 2).join(' ')}</span>
              {region.improvingCount > 0 && (
                <span className="flex items-center gap-1 text-primary">
                  <TrendingUp className="h-3 w-3" />
                  {region.improvingCount} improving
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getRegionEmoji(region: string): string {
  const regionEmojis: Record<string, string> = {
    'Asia Pacific': '🌏',
    'Europe': '🌍',
    'North America': '🌎',
    'South America': '🌎',
    'Africa': '🌍',
    'Middle East': '🌍',
    'Oceania': '🌏',
  };
  return regionEmojis[region] || '🌐';
}
