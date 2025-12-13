import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { mockSchools, criteria, freeCriteria } from '@/lib/mockData';
import { useTier } from '@/contexts/TierContext';
import { cn } from '@/lib/utils';

export function ScoreChart() {
  const { canAccess } = useTier();
  const hasAllCriteria = canAccess('allCriteria');

  const chartData = useMemo(() => {
    const activeCriteria = hasAllCriteria ? criteria : criteria.filter(c => freeCriteria.includes(c.key));
    
    return activeCriteria.map(criterion => {
      const avgScore = mockSchools.reduce((acc, school) => {
        return acc + (school[criterion.key as keyof typeof school] as number);
      }, 0) / mockSchools.length;
      
      return {
        name: criterion.label,
        score: Math.round(avgScore * 10) / 10,
        color: criterion.color,
      };
    });
  }, [hasAllCriteria]);

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-5">
      <div className="mb-5">
        <h3 className="font-display font-semibold text-lg">Global Criteria Scores</h3>
        <p className="text-sm text-muted-foreground">Average scores across all schools</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={130} 
              tick={{ fontSize: 12 }} 
              stroke="hsl(var(--muted-foreground))"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
              }}
              labelStyle={{ fontWeight: 600 }}
              formatter={(value: number) => [`${value}%`, 'Average Score']}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {!hasAllCriteria && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          🔒 Upgrade to Plus to see all 6 criteria
        </p>
      )}
    </div>
  );
}
