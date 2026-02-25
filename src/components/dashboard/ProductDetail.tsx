import { Product } from '@/hooks/useProducts';
import { 
  X, ThumbsUp, ThumbsDown, ExternalLink, Star, DollarSign, 
  Lightbulb, Leaf, TrendingUp, Loader2, CheckCircle, XCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

export function ProductDetail({ product, onClose }: ProductDetailProps) {
  if (!product) return null;

  const isResearching = product.research_status === 'pending' || product.research_status === 'researching';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-card rounded-2xl border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b p-5 flex items-start justify-between rounded-t-2xl z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {product.is_recommended ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                  <ThumbsUp className="h-3 w-3" /> Recommended
                </span>
              ) : product.research_status === 'completed' ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full">
                  <ThumbsDown className="h-3 w-3" /> Not Ideal
                </span>
              ) : null}
              {product.category && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{product.category}</span>
              )}
            </div>
            <h2 className="text-xl font-display font-bold">{product.name || 'Analyzing...'}</h2>
            {product.brand && <p className="text-sm text-muted-foreground">{product.brand}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {isResearching ? (
            <div className="text-center py-12 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">AI is researching this product...</p>
              <p className="text-xs text-muted-foreground">This usually takes 10-20 seconds</p>
            </div>
          ) : (
            <>
              {/* Overall Rating */}
              <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Overall Rating</p>
                <p className="text-5xl font-display font-bold text-primary">{product.overall_rating}</p>
                <p className="text-sm text-muted-foreground mt-1">out of 100</p>
                {product.research_data?.verdict && (
                  <p className="text-sm font-medium mt-3 text-foreground">"{product.research_data.verdict}"</p>
                )}
              </div>

              {/* AI Summary */}
              {product.ai_summary && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">AI Analysis</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.ai_summary}</p>
                </div>
              )}

              {/* Score Breakdown */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Score Breakdown</h3>
                {scoreConfig.map(({ key, label, icon: Icon, color, desc }) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-sm font-bold" style={{ color }}>{(product as any)[key]}/100</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(product as any)[key]}%`, backgroundColor: color }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" /> Pros
                  </h3>
                  <ul className="space-y-1.5">
                    {(product.pros || []).map((pro, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircle className="h-4 w-4" /> Cons
                  </h3>
                  <ul className="space-y-1.5">
                    {(product.cons || []).map((con, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Alternatives */}
              {product.research_data?.alternatives && (
                <div className="bg-muted/50 rounded-xl p-4">
                  <h3 className="font-semibold text-sm mb-1">Alternatives to Consider</h3>
                  <p className="text-sm text-muted-foreground">{product.research_data.alternatives}</p>
                </div>
              )}

              {/* Link */}
              <div className="pt-2">
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
    </div>
  );
}
