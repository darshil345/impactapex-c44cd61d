import { School, criteria } from '@/lib/mockData';
import { useTier } from '@/contexts/TierContext';
import { X, MapPin, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, FileText, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SchoolProfileProps {
  school: School;
  onClose: () => void;
}

export function SchoolProfile({ school, onClose }: SchoolProfileProps) {
  const { currentTier } = useTier();
  const isPro = currentTier === 'pro' || currentTier === 'enterprise';

  const TrendIcon = school.trend === 'up' ? TrendingUp : school.trend === 'down' ? TrendingDown : Minus;
  const trendColor = school.trend === 'up' ? 'text-primary' : school.trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-2xl border shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="relative p-6 border-b bg-gradient-to-br from-primary/5 to-transparent">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
              {getFlagEmoji(school.countryCode)}
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">{school.name}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                <span>{school.country} • {school.region}</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-2xl font-bold text-primary">{school.avgScore.toFixed(1)}</span>
                <div className={cn('flex items-center gap-1', trendColor)}>
                  <TrendIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {school.trend === 'up' ? '+' : school.trend === 'down' ? '-' : ''}{school.trendValue}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* Scores Grid */}
          <div>
            <h3 className="font-semibold mb-3">Performance Scores</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {criteria.map(criterion => {
                const score = school[criterion.key as keyof typeof school] as number;
                return (
                  <div
                    key={criterion.key}
                    className="p-3 rounded-xl bg-muted/50"
                  >
                    <p className="text-xs text-muted-foreground mb-1">{criterion.label}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${score}%`, backgroundColor: criterion.color }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{score}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Problems */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-highlight-foreground" />
              Key Challenges
            </h3>
            <div className="space-y-2">
              {school.problems.map((problem, index) => (
                <div key={index} className="p-3 rounded-xl bg-highlight/10 border border-highlight/20 text-sm">
                  {problem}
                </div>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Solutions Implemented
            </h3>
            <div className="space-y-2">
              {school.solutions.map((solution, index) => (
                <div key={index} className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm">
                  {solution}
                </div>
              ))}
            </div>
          </div>

          {/* Evidence (Pro only) */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-pro" />
              Evidence & Documents
              {!isPro && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            </h3>
            {isPro ? (
              <div className="p-4 rounded-xl border-2 border-dashed border-muted-foreground/20 text-center text-sm text-muted-foreground">
                No evidence uploaded yet
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-muted/50 text-center">
                <Lock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Upgrade to Pro to view and upload evidence
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
