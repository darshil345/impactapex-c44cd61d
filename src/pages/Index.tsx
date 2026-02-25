import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProductCard } from '@/components/dashboard/ProductCard';
import { ProductDetail } from '@/components/dashboard/ProductDetail';
import { TierProvider } from '@/contexts/TierContext';
import { useProducts, useDeleteProduct, useReResearchProduct, Product } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Search, TrendingUp, Star, ThumbsUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Dashboard() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  const reResearch = useReResearchProduct();
  const navigate = useNavigate();
  const { toast } = useToast();

  const completedProducts = products?.filter(p => p.research_status === 'completed') || [];
  const avgRating = completedProducts.length > 0
    ? (completedProducts.reduce((acc, p) => acc + p.overall_rating, 0) / completedProducts.length).toFixed(0)
    : '—';
  const recommendedCount = completedProducts.filter(p => p.is_recommended).length;
  const categories = [...new Set(completedProducts.map(p => p.category).filter(Boolean))];

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast({ title: 'Product deleted' });
      if (selectedProduct?.id === id) setSelectedProduct(null);
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleReResearch = async (product: { id: string; url: string }) => {
    try {
      await reResearch.mutateAsync(product);
      toast({ title: 'Re-researching product...', description: 'Results will update shortly.' });
    } catch {
      toast({ title: 'Failed to re-research', variant: 'destructive' });
    }
  };

  if (!isLoading && (!products || products.length === 0)) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-display font-bold">No Products Yet</h2>
          <p className="text-muted-foreground max-w-md">
            Add your first product link and let our AI research it for you. Get detailed insights, ratings, and recommendations.
          </p>
          <Button onClick={() => navigate('/add-product')} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Product
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Product Research Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              {isLoading ? 'Loading...' : `${products?.length || 0} products analyzed • AI-powered insights`}
            </p>
          </div>
          <Button onClick={() => navigate('/add-product')} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-2xl border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-primary/10"><Package className="h-4 w-4 text-primary" /></div>
            </div>
            <p className="text-2xl font-display font-bold">{products?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Products Tracked</p>
          </div>
          <div className="bg-card rounded-2xl border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-primary/10"><Star className="h-4 w-4 text-primary" /></div>
            </div>
            <p className="text-2xl font-display font-bold">{avgRating}</p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </div>
          <div className="bg-card rounded-2xl border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-green-500/10"><ThumbsUp className="h-4 w-4 text-green-600" /></div>
            </div>
            <p className="text-2xl font-display font-bold">{recommendedCount}</p>
            <p className="text-xs text-muted-foreground">Recommended</p>
          </div>
          <div className="bg-card rounded-2xl border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-primary/10"><TrendingUp className="h-4 w-4 text-primary" /></div>
            </div>
            <p className="text-2xl font-display font-bold">{categories.length}</p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products?.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
                onDelete={handleDelete}
                onReResearch={handleReResearch}
                isDeleting={deleteProduct.isPending}
                isReResearching={reResearch.isPending}
              />
            ))}
          </div>
        )}
      </div>

      <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </DashboardLayout>
  );
}

export default function Index() {
  return (
    <TierProvider>
      <Dashboard />
    </TierProvider>
  );
}
