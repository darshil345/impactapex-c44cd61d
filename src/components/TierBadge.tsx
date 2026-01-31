import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TierBadgeProps {
  className?: string;
}

export function TierBadge({ className }: TierBadgeProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-gradient-to-r from-primary to-teal-600 text-primary-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Free Forever</span>
      </div>
    </div>
  );
}
