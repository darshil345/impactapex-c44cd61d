import { insights } from '@/lib/mockData';
import { Lightbulb, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InsightEngine() {
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
        <div className="flex items-center gap-1 text-xs text-primary font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          Smart Analysis
        </div>
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => (
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
      </div>
    </div>
  );
}
