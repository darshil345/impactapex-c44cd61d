import { Product } from '@/hooks/useProducts';
import { 
  ArrowLeft, ThumbsUp, ThumbsDown, ExternalLink, Star, DollarSign, 
  Lightbulb, Leaf, TrendingUp, Loader2, CheckCircle, XCircle,
  Target, Shield, Globe, Users, Zap, Clock, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
}

const scoreConfig = [
  { key: 'quality_score', label: 'Quality', icon: Star, color: 'hsl(210, 80%, 55%)', desc: 'Build quality and reliability' },
  { key: 'value_score', label: 'Value for Money', icon: DollarSign, color: 'hsl(160, 45%, 50%)', desc: 'Price relative to quality' },
  { key: 'innovation_score', label: 'Innovation', icon: Lightbulb, color: 'hsl(270, 60%, 65%)', desc: 'Unique features and technology' },
  { key: 'sustainability_score', label: 'Sustainability', icon: Leaf, color: 'hsl(140, 50%, 45%)', desc: 'Environmental impact' },
  { key: 'popularity_score', label: 'Popularity', icon: TrendingUp, color: 'hsl(25, 90%, 60%)', desc: 'Market adoption and reviews' },
];

const sdgColors: Record<string, string> = {
  positive: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  negative: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  neutral: 'bg-muted text-muted-foreground border-border',
};

export function ProductDetail({ product, onClose }: ProductDetailProps) {
  if (!product) return null;

  const isResearching = product.research_status === 'pending' || product.research_status === 'researching';
  const data = product.research_data || {};
  const rawAlternatives = data.alternatives;
  const alternatives = Array.isArray(rawAlternatives) ? rawAlternatives : [];
  const alternativesText = typeof rawAlternatives === 'string' ? rawAlternatives : '';
  const sdgAlignment = Array.isArray(data.sdg_alignment) ? data.sdg_alignment : [];
  const pros = Array.isArray(product.pros) ? product.pros.map((p: any) => typeof p === 'string' ? p : JSON.stringify(p)) : [];
  const cons = Array.isArray(product.cons) ? product.cons.map((c: any) => typeof c === 'string' ? c : JSON.stringify(c)) : [];

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto animate-in fade-in duration-200">
      {/* Top Bar with Back Button */}
      <div className="sticky top-0 bg-card/80 backdrop-blur-md border-b z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={onClose} className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <a href={product.url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              View Original
            </Button>
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {product.is_recommended ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full">
                <ThumbsUp className="h-3 w-3" /> Recommended
              </span>
            ) : product.research_status === 'completed' ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2.5 py-1 rounded-full">
                <ThumbsDown className="h-3 w-3" /> Not Ideal
              </span>
            ) : null}
            {product.category && (
              <span className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">{product.category}</span>
            )}
          </div>
          <h1 className="text-3xl font-display font-bold">{product.name || 'Analyzing...'}</h1>
          {product.brand && <p className="text-lg text-muted-foreground">{product.brand}</p>}
          {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}
        </div>

        {isResearching ? (
          <div className="text-center py-20 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-lg text-muted-foreground">AI is researching this product...</p>
            <p className="text-sm text-muted-foreground">This usually takes 10-20 seconds</p>
          </div>
        ) : (
          <>
            {/* Overall Rating Hero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 text-center p-8 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl border">
                <p className="text-sm text-muted-foreground mb-2">Overall Rating</p>
                <p className="text-6xl font-display font-bold text-primary">{product.overall_rating}</p>
                <p className="text-sm text-muted-foreground mt-1">out of 100</p>
                {data.verdict && (
                  <p className="text-sm font-medium mt-4 text-foreground italic">"{data.verdict}"</p>
                )}
              </div>
              <div className="md:col-span-2 grid grid-cols-2 gap-3">
                {data.target_audience && (
                  <div className="bg-card border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold uppercase text-muted-foreground">Target Audience</span>
                    </div>
                    <p className="text-sm">{data.target_audience}</p>
                  </div>
                )}
                {data.best_use_case && (
                  <div className="bg-card border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold uppercase text-muted-foreground">Best Use Case</span>
                    </div>
                    <p className="text-sm">{data.best_use_case}</p>
                  </div>
                )}
                {data.durability_estimate && (
                  <div className="bg-card border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold uppercase text-muted-foreground">Durability</span>
                    </div>
                    <p className="text-sm">{data.durability_estimate}</p>
                  </div>
                )}
                {data.value_proposition && (
                  <div className="bg-card border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold uppercase text-muted-foreground">Value Proposition</span>
                    </div>
                    <p className="text-sm">{data.value_proposition}</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Summary */}
            {product.ai_summary && (
              <div className="bg-card border rounded-2xl p-6 space-y-2">
                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  AI Analysis
                </h2>
                <p className="text-muted-foreground leading-relaxed">{product.ai_summary}</p>
              </div>
            )}

            {/* Score Breakdown */}
            <div className="bg-card border rounded-2xl p-6 space-y-4">
              <h2 className="font-display font-bold text-lg">Score Breakdown</h2>
              <div className="space-y-4">
                {scoreConfig.map(({ key, label, icon: Icon, color, desc }) => (
                  <div key={key} className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}15` }}>
                      <Icon className="h-5 w-5" style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-sm font-semibold">{label}</span>
                          <span className="text-xs text-muted-foreground ml-2">{desc}</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color }}>{(product as any)[key]}/100</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(product as any)[key]}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border rounded-2xl p-6 space-y-3">
                <h2 className="font-display font-bold text-lg flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" /> Pros
                </h2>
                <ul className="space-y-2">
                  {(product.pros || []).map((pro, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 font-bold">✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card border rounded-2xl p-6 space-y-3">
                <h2 className="font-display font-bold text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                  <XCircle className="h-5 w-5" /> Cons
                </h2>
                <ul className="space-y-2">
                  {(product.cons || []).map((con, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 font-bold">✗</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* SDG Alignment */}
            {sdgAlignment.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  UN Sustainable Development Goals (SDG) Alignment
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sdgAlignment.map((sdg: any, i: number) => (
                    <div key={i} className={cn("border rounded-xl p-4 space-y-1", sdgColors[sdg.impact] || sdgColors.neutral)}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">SDG {sdg.sdg_number}: {sdg.sdg_name}</span>
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          sdg.impact === 'positive' && "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200",
                          sdg.impact === 'negative' && "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200",
                          sdg.impact === 'neutral' && "bg-muted-foreground/20 text-muted-foreground"
                        )}>
                          {sdg.impact === 'positive' ? '↑ Positive' : sdg.impact === 'negative' ? '↓ Negative' : '— Neutral'}
                        </span>
                      </div>
                      <p className="text-xs opacity-80">{sdg.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternatives */}
            {alternatives.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Alternatives to Consider
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-semibold">Product</th>
                        <th className="text-left py-2 pr-4 font-semibold">Price Range</th>
                        <th className="text-left py-2 pr-4 font-semibold">Est. Score</th>
                        <th className="text-left py-2 font-semibold">Why Consider</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alternatives.map((alt: any, i: number) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-medium">{alt.name}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{alt.price_range || '—'}</td>
                          <td className="py-3 pr-4">
                            <span className={cn(
                              "font-bold",
                              alt.score >= 75 ? "text-green-600 dark:text-green-400" :
                              alt.score >= 50 ? "text-orange-600 dark:text-orange-400" :
                              "text-red-600 dark:text-red-400"
                            )}>
                              {alt.score}/100
                            </span>
                          </td>
                          <td className="py-3 text-muted-foreground">{alt.why}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* View Original Link */}
            <div className="pb-8">
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2 w-full">
                  <ExternalLink className="h-4 w-4" />
                  View Original Product
                </Button>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
