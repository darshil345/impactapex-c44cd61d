import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link2, CheckCircle, AlertCircle, Loader2, Search, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AddProductPage() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const addProduct = useAddProduct();

  const isValidUrl = (str: string): boolean => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError('Please enter a product URL');
      return;
    }
    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (e.g. https://amazon.com/product/...)');
      return;
    }

    setError(null);
    try {
      await addProduct.mutateAsync(url);
      setSuccess(true);
      toast({
        title: 'Product submitted!',
        description: 'AI is now researching your product. Results will appear on your dashboard.',
      });
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to add product');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl border-2">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
            <Search className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">Add a Product to Research</CardTitle>
          <CardDescription className="text-base">
            Paste any product link from any website. Our AI will analyze it and provide detailed insights, ratings, and recommendations.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {success ? (
            <div className="text-center py-10 space-y-4">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
                Product Submitted!
              </h3>
              <p className="text-muted-foreground">
                AI is researching your product. Redirecting to dashboard...
              </p>
              <p className="text-sm text-muted-foreground animate-pulse">
                Results will appear shortly.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <Label htmlFor="product-url" className="text-sm font-medium">
                  Product URL
                </Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="product-url"
                    type="url"
                    placeholder="https://www.amazon.com/product/..."
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(null); }}
                    className="pl-10 h-12 text-base"
                    disabled={addProduct.isPending}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                  {addProduct.isPending && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                {addProduct.isPending && (
                  <p className="text-sm text-primary animate-pulse flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Submitting and starting AI research...
                  </p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Supported Sites */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Works with any product link
                </h4>
                <p className="text-sm text-muted-foreground">
                  Paste links from Amazon, eBay, Walmart, Apple, Nike, or any online store. Our AI will identify the product and provide comprehensive research.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Amazon', 'eBay', 'Walmart', 'Apple', 'Nike', 'Best Buy', 'Target', 'Any Store'].map(site => (
                    <span key={site} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                      {site}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                <p className="text-xs text-primary font-medium">
                  🤖 AI-Powered Research: Our AI analyzes the product for quality, value, sustainability, innovation, and popularity — then gives you an honest recommendation on whether it's worth buying.
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!url.trim() || addProduct.isPending}
                className="w-full h-12 text-base gap-2"
              >
                {addProduct.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Research This Product
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
