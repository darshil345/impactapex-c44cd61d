import { useTier } from '@/contexts/TierContext';
import { tierInfo, proFeaturesList, SubscriptionTier } from '@/lib/mockData';
import { Check, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const tierIcons: Record<SubscriptionTier, React.ReactNode> = {
  free: <Sparkles className="h-5 w-5" />,
  pro: <Crown className="h-5 w-5" />,
};

const tierFeaturesList: Record<SubscriptionTier, string[]> = {
  free: [
    'Up to 5 schools',
    '3 SDG criteria only',
    'Basic bar charts',
    'View-only access',
  ],
  pro: [
    'Unlimited schools',
    'All 5 SDG criteria',
    'Global leaderboard',
    'Radar charts & heatmaps',
    'PDF reports & exports',
    'AI-powered insights',
    'Priority support',
  ],
};

export function TierSelector() {
  const { currentTier, setCurrentTier } = useTier();
  const tiers: SubscriptionTier[] = ['free', 'pro'];

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-5">
      <div className="mb-5">
        <h3 className="font-display font-semibold text-lg">Your Plan</h3>
        <p className="text-sm text-muted-foreground">Compare plans and upgrade</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tiers.map(tier => {
          const info = tierInfo[tier];
          const isActive = currentTier === tier;
          
          return (
            <button
              key={tier}
              onClick={() => setCurrentTier(tier)}
              className={cn(
                'relative p-4 rounded-xl border-2 text-left transition-all',
                isActive 
                  ? tier === 'pro' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/30 bg-muted/20'
                  : 'border-border hover:border-muted-foreground/30'
              )}
            >
              {tier === 'pro' && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Popular
                </div>
              )}
              {isActive && (
                <div className="absolute top-3 right-3">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
              )}
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
                tier === 'pro' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                {tierIcons[tier]}
              </div>
              <p className="font-semibold">{info.name}</p>
              <p className="text-xs text-muted-foreground mb-2">{info.tagline}</p>
              <p className={cn(
                'text-lg font-bold',
                tier === 'pro' ? 'text-primary' : 'text-foreground'
              )}>{info.price}</p>
              <ul className="mt-3 space-y-1.5">
                {tierFeaturesList[tier].map((feature, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}