import { useTier } from '@/contexts/TierContext';
import { tierInfo, SubscriptionTier } from '@/lib/mockData';
import { Check, Crown, Zap, Sparkles, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const tierIcons: Record<SubscriptionTier, React.ReactNode> = {
  free: <Sparkles className="h-5 w-5" />,
  plus: <Zap className="h-5 w-5" />,
  pro: <Crown className="h-5 w-5" />,
  enterprise: <Building2 className="h-5 w-5" />,
};

const tierFeaturesList: Record<SubscriptionTier, string[]> = {
  free: [
    'Max 3 schools',
    '3 criteria only',
    'Basic bar charts',
    'View-only access',
  ],
  plus: [
    'Up to 10 schools',
    'All 6 criteria',
    'Global leaderboard',
    'Radar & heatmaps',
    'PDF reports',
  ],
  pro: [
    'Unlimited schools',
    'Custom indicators',
    'Evidence upload',
    'Historical trends',
    'API access',
  ],
  enterprise: [
    'District dashboards',
    'Government reporting',
    'Policy insights',
    'Dedicated support',
  ],
};

export function TierSelector() {
  const { currentTier, setCurrentTier } = useTier();
  const tiers: SubscriptionTier[] = ['free', 'plus', 'pro'];

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-5">
      <div className="mb-5">
        <h3 className="font-display font-semibold text-lg">Subscription Tier</h3>
        <p className="text-sm text-muted-foreground">Demo: Switch tiers to see feature access</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    ? 'border-pro bg-pro/5' 
                    : tier === 'plus' 
                    ? 'border-plus bg-plus/5'
                    : 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/30'
              )}
            >
              {isActive && (
                <div className="absolute top-3 right-3">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
              )}
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
                tier === 'pro' ? 'bg-pro/10 text-pro' :
                tier === 'plus' ? 'bg-plus/10 text-plus' :
                'bg-muted text-muted-foreground'
              )}>
                {tierIcons[tier]}
              </div>
              <p className="font-semibold">{info.name}</p>
              <p className="text-xs text-muted-foreground mb-2">{info.tagline}</p>
              <p className={cn(
                'text-lg font-bold',
                tier === 'pro' ? 'gradient-text-pro' :
                tier === 'plus' ? 'gradient-text-plus' :
                'text-foreground'
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
