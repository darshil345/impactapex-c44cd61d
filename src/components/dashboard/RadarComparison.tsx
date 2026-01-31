import { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { School, criteria } from '@/lib/mockData';

interface RadarComparisonProps {
  schools: School[];
}

const COLORS = ['hsl(160 45% 50%)', 'hsl(210 80% 55%)', 'hsl(270 60% 65%)'];

export function RadarComparison({ schools }: RadarComparisonProps) {
  const chartData = useMemo(() => {
    return criteria.map(criterion => {
      const dataPoint: Record<string, string | number> = {
        subject: criterion.label.split(' ')[0], // Shortened label
        fullName: criterion.label,
      };
      
      schools.forEach((school, index) => {
        dataPoint[`school${index}`] = school[criterion.key as keyof typeof school] as number;
        dataPoint[`name${index}`] = school.name;
      });
      
      return dataPoint;
    });
  }, [schools]);

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-5">
      <div className="mb-5">
        <h3 className="font-display font-semibold text-lg">School Comparison</h3>
        <p className="text-sm text-muted-foreground">
          {schools.length > 0 
            ? `Comparing ${schools.map(s => s.name).join(' vs ')}`
            : 'Select schools to compare'
          }
        </p>
      </div>
      <div className="h-[320px]">
        {schools.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--border))"
              />
              {schools.map((school, index) => (
                <Radar
                  key={school.id}
                  name={school.name}
                  dataKey={`school${index}`}
                  stroke={COLORS[index]}
                  fill={COLORS[index]}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              ))}
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) => <span className="text-foreground">{value}</span>}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                }}
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Click on schools in the leaderboard to compare them
          </div>
        )}
      </div>
    </div>
  );
}
