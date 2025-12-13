import { useTier } from '@/contexts/TierContext';
import { tierInfo, SubscriptionTier } from '@/lib/mockData';
import { Crown, Sparkles, Zap, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const tierIcons: Record<SubscriptionTier, React.ReactNode> = {
  free: null,
  plus: <Zap className="h-3.5 w-3.5" />,
  pro: <Crown className="h-3.5 w-3.5" />,
  enterprise: <Building2 className="h-3.5 w-3.5" />,
};

interface TierBadgeProps {
  tier?: SubscriptionTier;
  showUpgrade?: boolean;
  className?: string;
}

export function TierBadge({ tier, showUpgrade = true, className }: TierBadgeProps) {
  const { currentTier, setCurrentTier } = useTier();
  const displayTier = tier || currentTier;
  const info = tierInfo[displayTier];

  const badgeStyles: Record<SubscriptionTier, string> = {
    free: 'bg-muted text-muted-foreground',
    plus: 'bg-gradient-to-r from-plus to-blue-600 text-plus-foreground',
    pro: 'bg-gradient-to-r from-pro to-purple-600 text-pro-foreground',
    enterprise: 'bg-gradient-to-r from-primary to-teal-600 text-primary-foreground',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all',
          badgeStyles[displayTier]
        )}
      >
        {tierIcons[displayTier]}
        <span>{info.name}</span>
      </div>
      {showUpgrade && displayTier !== 'pro' && displayTier !== 'enterprise' && (
        <button
          onClick={() => setCurrentTier(displayTier === 'free' ? 'plus' : 'pro')}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          <Sparkles className="h-3 w-3" />
          Upgrade
        </button>
      )}
    </div>
  );
}
