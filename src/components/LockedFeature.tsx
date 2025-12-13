import { Lock, Sparkles } from 'lucide-react';
import { useTier } from '@/contexts/TierContext';
import { TierFeatures, tierInfo, SubscriptionTier } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface LockedFeatureProps {
  feature: keyof TierFeatures;
  requiredTier: SubscriptionTier;
  children: React.ReactNode;
  className?: string;
  showOverlay?: boolean;
}

export function LockedFeature({
  feature,
  requiredTier,
  children,
  className,
  showOverlay = true,
}: LockedFeatureProps) {
  const { canAccess, setCurrentTier } = useTier();
  const isLocked = !canAccess(feature);
  const tierName = tierInfo[requiredTier].name;

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative', className)}>
      <div className="opacity-40 blur-[2px] pointer-events-none select-none">
        {children}
      </div>
      {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="glass-strong rounded-2xl p-6 text-center max-w-xs animate-scale-in shadow-lg">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Upgrade to {tierName}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Unlock this feature and more
            </p>
            <button
              onClick={() => setCurrentTier(requiredTier)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function LockedBadge({ requiredTier }: { requiredTier: SubscriptionTier }) {
  const tierName = tierInfo[requiredTier].name;
  
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
      <Lock className="h-3 w-3" />
      <span>{tierName}</span>
    </div>
  );
}
