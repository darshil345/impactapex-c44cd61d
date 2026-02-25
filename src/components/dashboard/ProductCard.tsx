import { Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import { 
  ThumbsUp, ThumbsDown, ExternalLink, Loader2, RefreshCw, Trash2,
  Star, Leaf, Lightbulb, TrendingUp, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onDelete: (id: string) => void;
  onReResearch: (product: { id: string; url: string }) => void;
  isDeleting?: boolean;
  isReResearching?: boolean;
}

const scoreConfig = [
  { key: 'quality_score', label: 'Quality', icon: Star, color: 'hsl(210, 80%, 55%)' },
  { key: 'value_score', label: 'Value', icon: DollarSign, color: 'hsl(160, 45%, 50%)' },
  { key: 'innovation_score', label: 'Innovation', icon: Lightbulb, color: 'hsl(270, 60%, 65%)' },
  { key: 'sustainability_score', label: 'Eco', icon: Leaf, color: 'hsl(140, 50%, 45%)' },
  { key: 'popularity_score', label: 'Popular', icon: TrendingUp, color: 'hsl(25, 90%, 60%)' },
];

export function ProductCard({ product, onClick, onDelete, onReResearch, isDeleting, isReResearching }: ProductCardProps) {
  const isResearching = product.research_status === 'pending' || product.research_status === 'researching';
  const isError = product.research_status === 'error';
  const isCompleted = product.research_status === 'completed';

  return (
    <div
      className="bg-card rounded-2xl border p-5 hover:border-primary/30 hover:shadow-md transition-all group cursor-pointer relative"
      onClick={onClick}
    >
      {/* Status Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {product.name || 'Analyzing product...'}
          </h3>
          {product.brand && (
            <p className="text-xs text-muted-foreground mt-0.5">{product.brand}</p>
          )}
        </div>
        <div className={cn(
          "flex-shrink-0 ml-2 px-2 py-1 rounded-full text-xs font-medium",
          isResearching && "bg-primary/10 text-primary",
          isError && "bg-destructive/10 text-destructive",
          isCompleted && product.is_recommended && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
          isCompleted && !product.is_recommended && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
        )}>
          {isResearching && <Loader2 className="h-3 w-3 animate-spin inline mr-1" />}
          {isResearching ? 'Researching' : isError ? 'Error' : product.is_recommended ? 'Recommended' : 'Not Ideal'}
        </div>
      </div>

      {/* Category */}
      {product.category && (
        <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
          {product.category}
        </span>
      )}

      {/* Description */}
      {product.description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
      )}

      {/* Scores */}
      {isCompleted && (
        <>
          <div className="flex items-center justify-between mt-3 mb-2">
            <span className="text-xs text-muted-foreground">Overall Rating</span>
            <span className="text-lg font-bold text-primary">{product.overall_rating}/100</span>
          </div>
          <div className="space-y-1.5">
            {scoreConfig.map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-14">{label}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(product as any)[key]}%`, backgroundColor: color }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground w-6 text-right">{(product as any)[key]}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          View Product
        </a>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onReResearch({ id: product.id, url: product.url })}
          disabled={isReResearching}
        >
          <RefreshCw className={cn("h-3 w-3", isReResearching && "animate-spin")} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          onClick={() => onDelete(product.id)}
          disabled={isDeleting}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
