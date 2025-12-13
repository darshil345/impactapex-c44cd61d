import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: 'primary' | 'plus' | 'pro' | 'highlight' | 'destructive';
  className?: string;
  delay?: number;
}

const colorStyles = {
  primary: 'from-primary/10 to-primary/5 border-primary/20',
  plus: 'from-plus/10 to-plus/5 border-plus/20',
  pro: 'from-pro/10 to-pro/5 border-pro/20',
  highlight: 'from-highlight/10 to-highlight/5 border-highlight/20',
  destructive: 'from-destructive/10 to-destructive/5 border-destructive/20',
};

const iconColorStyles = {
  primary: 'bg-primary/10 text-primary',
  plus: 'bg-plus/10 text-plus',
  pro: 'bg-pro/10 text-pro',
  highlight: 'bg-highlight/10 text-highlight-foreground',
  destructive: 'bg-destructive/10 text-destructive',
};

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  className,
  delay = 0,
}: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-primary' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
        colorStyles[color],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold font-display tracking-tight text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-2.5 rounded-xl', iconColorStyles[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && trendValue && (
        <div className={cn('flex items-center gap-1 mt-3 text-xs font-medium', trendColor)}>
          <TrendIcon className="h-3.5 w-3.5" />
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
