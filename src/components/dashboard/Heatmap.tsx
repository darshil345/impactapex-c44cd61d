import { School } from '@/lib/mockData';
import { useTier } from '@/contexts/TierContext';
import { LockedFeature } from '@/components/LockedFeature';
import { cn } from '@/lib/utils';

interface HeatmapProps {
  schools?: School[];
}

// Criteria that match the Google Sheets template
const heatmapCriteria = [
  { key: 'sustainability', label: 'Sustainability', shortLabel: 'Sust' },
  { key: 'communityEngagement', label: 'Community', shortLabel: 'Comm' },
  { key: 'wellbeing', label: 'Wellbeing', shortLabel: 'Well' },
  { key: 'innovation', label: 'Innovation', shortLabel: 'Inno' },
  { key: 'globalAwareness', label: 'Global Awareness', shortLabel: 'Glob' },
] as const;

export function Heatmap({ schools: schoolsProp }: HeatmapProps) {
  // Safe access to tier context - provide default if not in provider
  let hasHeatmap = true;
  try {
    const { canAccess } = useTier();
    hasHeatmap = canAccess('heatmap');
  } catch {
    // If useTier fails (e.g., during hot reload), default to showing content
    hasHeatmap = true;
  }

  const getColor = (score: number): string => {
    if (score === 0) return 'bg-muted/50';
    if (score >= 90) return 'bg-primary/80';
    if (score >= 80) return 'bg-primary/60';
    if (score >= 70) return 'bg-primary/40';
    if (score >= 60) return 'bg-highlight/60';
    return 'bg-destructive/40';
  };

  // Filter out schools with no data and take first 8
  const schools = (schoolsProp || [])
    .filter(s => s.avgScore > 0)
    .slice(0, 8);

  // Show empty state if no real data
  if (schools.length === 0) {
    return (
      <div className="bg-card rounded-2xl border shadow-sm p-5">
        <div className="mb-5">
          <h3 className="font-display font-semibold text-lg">Performance Heatmap</h3>
          <p className="text-sm text-muted-foreground">Score distribution across criteria</p>
        </div>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <p>No school data available. Sync your Google Sheet to see the heatmap.</p>
        </div>
      </div>
    );
  }

  const content = (
    <div className="bg-card rounded-2xl border shadow-sm p-5">
      <div className="mb-5">
        <h3 className="font-display font-semibold text-lg">Performance Heatmap</h3>
        <p className="text-sm text-muted-foreground">Score distribution across criteria</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left p-2 font-medium text-muted-foreground">School</th>
              {heatmapCriteria.map(c => (
                <th key={c.key} className="p-2 font-medium text-muted-foreground text-center" title={c.label}>
                  {c.shortLabel}
                </th>
              ))}
              <th className="p-2 font-medium text-muted-foreground text-center" title="Average Score">
                Avg
              </th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school.id} className="border-t border-border/50">
                <td className="p-2 font-medium truncate max-w-[120px]" title={school.name}>
                  {school.name.length > 20 ? school.name.slice(0, 18) + '...' : school.name}
                </td>
                {heatmapCriteria.map(c => {
                  const score = school[c.key as keyof typeof school] as number;
                  return (
                    <td key={c.key} className="p-1 text-center">
                      <div
                        className={cn(
                          'w-10 h-8 rounded-lg flex items-center justify-center font-semibold transition-all hover:scale-110',
                          getColor(score),
                          score === 0 ? 'text-muted-foreground' : 'text-foreground'
                        )}
                        title={`${c.label}: ${score || 'N/A'}`}
                      >
                        {score || '-'}
                      </div>
                    </td>
                  );
                })}
                <td className="p-1 text-center">
                  <div
                    className={cn(
                      'w-10 h-8 rounded-lg flex items-center justify-center font-bold transition-all hover:scale-110 bg-foreground/10'
                    )}
                    title={`Average: ${school.avgScore}`}
                  >
                    {Math.round(school.avgScore)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-primary/80" />
          <span>90+</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-primary/60" />
          <span>80-89</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-primary/40" />
          <span>70-79</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-highlight/60" />
          <span>60-69</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-destructive/40" />
          <span>&lt;60</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-muted/50" />
          <span>N/A</span>
        </div>
      </div>
    </div>
  );

  if (!hasHeatmap) {
    return (
      <LockedFeature feature="heatmap" requiredTier="plus">
        {content}
      </LockedFeature>
    );
  }

  return content;
}