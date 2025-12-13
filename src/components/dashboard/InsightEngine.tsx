import { insights } from '@/lib/mockData';
import { useTier } from '@/contexts/TierContext';
import { Lightbulb, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InsightEngine() {
  const { currentTier } = useTier();
  const isPro = currentTier === 'pro' || currentTier === 'enterprise';
  
  const visibleInsights = isPro ? insights : insights.slice(0, 2);

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-highlight/10">
            <Lightbulb className="h-5 w-5 text-highlight-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">AI Insights</h3>
            <p className="text-xs text-muted-foreground">Auto-generated analysis</p>
          </div>
        </div>
        {isPro && (
          <div className="flex items-center gap-1 text-xs text-pro font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Pro Insights
          </div>
        )}
      </div>
      <div className="space-y-3">
        {visibleInsights.map((insight, index) => (
          <div
            key={index}
            className={cn(
              'p-3 rounded-xl text-sm transition-all',
              index === 0 
                ? 'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20' 
                : 'bg-muted/50'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <p className="text-foreground leading-relaxed">{insight}</p>
          </div>
        ))}
        {!isPro && (
          <div className="p-3 rounded-xl bg-muted/30 border border-dashed border-muted-foreground/20 text-center">
            <p className="text-xs text-muted-foreground">
              🔒 Upgrade to Pro for {insights.length - visibleInsights.length} more deep insights
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
