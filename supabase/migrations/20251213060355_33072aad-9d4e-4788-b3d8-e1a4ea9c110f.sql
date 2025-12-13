-- Create schools table to store school impact data
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT NOT NULL,
  region TEXT,
  sustainability_score NUMERIC(4,1) DEFAULT 0,
  sustainability_problem TEXT,
  sustainability_solution TEXT,
  community_score NUMERIC(4,1) DEFAULT 0,
  community_problem TEXT,
  community_solution TEXT,
  wellbeing_score NUMERIC(4,1) DEFAULT 0,
  wellbeing_problem TEXT,
  wellbeing_solution TEXT,
  innovation_score NUMERIC(4,1) DEFAULT 0,
  innovation_problem TEXT,
  innovation_solution TEXT,
  global_awareness_score NUMERIC(4,1) DEFAULT 0,
  global_awareness_problem TEXT,
  global_awareness_solution TEXT,
  avg_score NUMERIC(4,1) GENERATED ALWAYS AS (
    (COALESCE(sustainability_score, 0) + COALESCE(community_score, 0) + COALESCE(wellbeing_score, 0) + COALESCE(innovation_score, 0) + COALESCE(global_awareness_score, 0)) / 5
  ) STORED,
  trend TEXT DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
  trend_value NUMERIC(4,1) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sync_logs table to track data synchronization
CREATE TABLE public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  records_synced INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'pending')),
  error_message TEXT,
  source TEXT DEFAULT 'google_sheets'
);

-- Enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for schools (dashboard is public)
CREATE POLICY "Anyone can view schools"
ON public.schools
FOR SELECT
USING (true);

-- Public read access for sync logs
CREATE POLICY "Anyone can view sync logs"
ON public.sync_logs
FOR SELECT
USING (true);

-- Service role can insert/update schools (for edge function)
CREATE POLICY "Service role can manage schools"
ON public.schools
FOR ALL
USING (true)
WITH CHECK (true);

-- Service role can manage sync logs
CREATE POLICY "Service role can manage sync logs"
ON public.sync_logs
FOR ALL
USING (true)
WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
CREATE TRIGGER update_schools_updated_at
BEFORE UPDATE ON public.schools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for schools table
ALTER PUBLICATION supabase_realtime ADD TABLE public.schools;