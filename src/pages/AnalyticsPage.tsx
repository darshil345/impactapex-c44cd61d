import { useMemo } from 'react';
import { TierProvider } from '@/contexts/TierContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useProducts } from '@/hooks/useProducts';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, Package, Star, ThumbsUp } from 'lucide-react';

const COLORS = ['hsl(160, 45%, 50%)', 'hsl(210, 80%, 55%)', 'hsl(270, 60%, 65%)', 'hsl(25, 90%, 70%)', 'hsl(200, 80%, 50%)'];

function AnalyticsContent() {
  const { data: products, isLoading } = useProducts();

  const analytics = useMemo(() => {
    const completed = (products || []).filter(p => p.research_status === 'completed');
    if (completed.length === 0) return null;

    const avgRating = completed.reduce((a, p) => a + p.overall_rating, 0) / completed.length;
    const recommended = completed.filter(p => p.is_recommended).length;

    // Category distribution
    const catMap = new Map<string, number>();
    completed.forEach(p => {
      const cat = p.category || 'Other';
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });
    const categoryDist = Array.from(catMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // Score breakdown averages
    const scoreBreakdown = [
      { name: 'Quality', value: completed.reduce((a, p) => a + p.quality_score, 0) / completed.length },
      { name: 'Value', value: completed.reduce((a, p) => a + p.value_score, 0) / completed.length },
      { name: 'Innovation', value: completed.reduce((a, p) => a + p.innovation_score, 0) / completed.length },
      { name: 'Sustainability', value: completed.reduce((a, p) => a + p.sustainability_score, 0) / completed.length },
      { name: 'Popularity', value: completed.reduce((a, p) => a + p.popularity_score, 0) / completed.length },
    ];

    // Top products
    const topProducts = [...completed].sort((a, b) => b.overall_rating - a.overall_rating).slice(0, 5);

    return { avgRating, recommended, total: completed.length, categoryDist, scoreBreakdown, topProducts };
  }, [products]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <Package className="h-8 w-8 text-muted-foreground" />
          <h2 className="text-xl font-display font-bold">No Analytics Yet</h2>
          <p className="text-muted-foreground">Add and research some products to see analytics.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold">Product Analytics</h1>
          <p className="text-muted-foreground text-sm">Insights across all your researched products</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-2xl border p-6">
            <Package className="h-5 w-5 text-primary mb-3" />
            <p className="text-2xl font-display font-bold">{analytics.total}</p>
            <p className="text-sm text-muted-foreground">Products Analyzed</p>
          </div>
          <div className="bg-card rounded-2xl border p-6">
            <Star className="h-5 w-5 text-primary mb-3" />
            <p className="text-2xl font-display font-bold">{analytics.avgRating.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>
          <div className="bg-card rounded-2xl border p-6">
            <ThumbsUp className="h-5 w-5 text-green-600 mb-3" />
            <p className="text-2xl font-display font-bold">{analytics.recommended}</p>
            <p className="text-sm text-muted-foreground">Recommended</p>
          </div>
          <div className="bg-card rounded-2xl border p-6">
            <TrendingUp className="h-5 w-5 text-primary mb-3" />
            <p className="text-2xl font-display font-bold">{analytics.categoryDist.length}</p>
            <p className="text-sm text-muted-foreground">Categories</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Breakdown */}
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="font-semibold mb-4">Average Score Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.scoreBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={90} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }}
                  formatter={(value: number) => value.toFixed(1)}
                />
                <Bar dataKey="value" fill="hsl(160, 45%, 50%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="font-semibold mb-4">Category Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={analytics.categoryDist} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.categoryDist.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div className="bg-card rounded-2xl border p-6 lg:col-span-2">
            <h3 className="font-semibold mb-4">Top Rated Products</h3>
            <div className="space-y-3">
              {analytics.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.brand} • {product.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {product.is_recommended && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Recommended</span>
                    )}
                    <span className="font-bold text-primary">{product.overall_rating}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AnalyticsPage() {
  return (
    <TierProvider>
      <AnalyticsContent />
    </TierProvider>
  );
}
