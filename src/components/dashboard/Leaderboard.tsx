import { useMemo } from 'react';
import { mockSchools, School } from '@/lib/mockData';
import { useTier } from '@/contexts/TierContext';
import { LockedFeature } from '@/components/LockedFeature';
import { cn } from '@/lib/utils';
import { Trophy, TrendingUp, TrendingDown, Minus, Medal, ChevronRight } from 'lucide-react';

interface LeaderboardProps {
  onSchoolClick: (school: School) => void;
  selectedSchool?: School | null;
  schools?: School[];
}

export function Leaderboard({ onSchoolClick, selectedSchool, schools }: LeaderboardProps) {
  const { canAccess, features } = useTier();
  const hasLeaderboard = canAccess('leaderboard');

  const dataSource = schools || mockSchools;

  const rankedSchools = useMemo(() => {
    return [...dataSource]
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, hasLeaderboard ? 10 : features.maxSchools);
  }, [hasLeaderboard, features.maxSchools, dataSource]);

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-primary" />;
    if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const RankBadge = ({ rank }: { rank: number }) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-semibold text-muted-foreground w-5 text-center">{rank}</span>;
  };

  const content = (
    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
      <div className="p-5 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-lg">Global Leaderboard</h3>
            <p className="text-sm text-muted-foreground">Top performing schools worldwide</p>
          </div>
          <div className="p-2 rounded-xl bg-primary/10">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
      <div className="divide-y">
        {rankedSchools.map((school, index) => (
          <button
            key={school.id}
            onClick={() => onSchoolClick(school)}
            className={cn(
              'w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors',
              selectedSchool?.id === school.id && 'bg-primary/5'
            )}
          >
            <div className="w-8 flex items-center justify-center">
              <RankBadge rank={index + 1} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{school.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-base">{getFlagEmoji(school.countryCode)}</span>
                {school.country}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-semibold text-sm">{school.avgScore.toFixed(1)}</p>
                <div className="flex items-center gap-1 justify-end">
                  <TrendIcon trend={school.trend} />
                  <span className={cn(
                    'text-xs',
                    school.trend === 'up' ? 'text-primary' : 
                    school.trend === 'down' ? 'text-destructive' : 
                    'text-muted-foreground'
                  )}>
                    {school.trend === 'up' ? '+' : school.trend === 'down' ? '-' : ''}{school.trendValue}%
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if (!hasLeaderboard) {
    return (
      <LockedFeature feature="leaderboard" requiredTier="plus">
        {content}
      </LockedFeature>
    );
  }

  return content;
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
