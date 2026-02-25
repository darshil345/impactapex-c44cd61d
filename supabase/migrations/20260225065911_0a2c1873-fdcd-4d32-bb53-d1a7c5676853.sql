
-- Create products table for user-submitted product links
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  name TEXT,
  brand TEXT,
  category TEXT,
  image_url TEXT,
  description TEXT,
  ai_summary TEXT,
  pros JSONB DEFAULT '[]'::jsonb,
  cons JSONB DEFAULT '[]'::jsonb,
  overall_rating NUMERIC DEFAULT 0,
  value_score NUMERIC DEFAULT 0,
  quality_score NUMERIC DEFAULT 0,
  innovation_score NUMERIC DEFAULT 0,
  sustainability_score NUMERIC DEFAULT 0,
  popularity_score NUMERIC DEFAULT 0,
  is_recommended BOOLEAN DEFAULT false,
  research_status TEXT DEFAULT 'pending',
  research_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Users can view their own products
CREATE POLICY "Users can view own products" ON public.products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products" ON public.products FOR DELETE USING (auth.uid() = user_id);

-- Updated at trigger
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
