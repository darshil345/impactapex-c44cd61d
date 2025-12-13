import { useMemo } from 'react';
import { mockSchools, criteria, School } from '@/lib/mockData';
import { useTier } from '@/contexts/TierContext';
import { LockedFeature } from '@/components/LockedFeature';
import { cn } from '@/lib/utils';

interface HeatmapProps {
  schools?: School[];
}

export function Heatmap({ schools: schoolsProp }: HeatmapProps) {
  const { canAccess } = useTier();
  const hasHeatmap = canAccess('heatmap');

  const getColor = (score: number): string => {
    if (score >= 90) return 'bg-primary/80';
    if (score >= 80) return 'bg-primary/60';
    if (score >= 70) return 'bg-primary/40';
    if (score >= 60) return 'bg-highlight/60';
    return 'bg-destructive/40';
  };

  const dataSource = schoolsProp || mockSchools;
  const schools = dataSource.slice(0, 8);

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
              {criteria.map(c => (
                <th key={c.key} className="p-2 font-medium text-muted-foreground text-center" title={c.label}>
                  {c.label.split(' ')[0].slice(0, 4)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schools.map((school, idx) => (
              <tr key={school.id} className="border-t border-border/50">
                <td className="p-2 font-medium truncate max-w-[120px]" title={school.name}>
                  {school.name.split(' ').slice(0, 2).join(' ')}
                </td>
                {criteria.map(c => {
                  const score = school[c.key as keyof typeof school] as number;
                  return (
                    <td key={c.key} className="p-1 text-center">
                      <div
                        className={cn(
                          'w-10 h-8 rounded-lg flex items-center justify-center font-semibold text-foreground transition-all hover:scale-110',
                          getColor(score)
                        )}
                        title={`${c.label}: ${score}`}
                      >
                        {score}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
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
