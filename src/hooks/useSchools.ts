import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { School } from '@/lib/mockData';

export interface DbSchool {
  id: string;
  name: string;
  country: string;
  country_code: string;
  region: string | null;
  sustainability_score: number;
  sustainability_problem: string | null;
  sustainability_solution: string | null;
  community_score: number;
  community_problem: string | null;
  community_solution: string | null;
  wellbeing_score: number;
  wellbeing_problem: string | null;
  wellbeing_solution: string | null;
  innovation_score: number;
  innovation_problem: string | null;
  innovation_solution: string | null;
  global_awareness_score: number;
  global_awareness_problem: string | null;
  global_awareness_solution: string | null;
  avg_score: number;
  trend: string;
  trend_value: number;
  created_at: string;
  updated_at: string;
}

// Transform database school to app School type
export function transformDbSchool(dbSchool: DbSchool): School {
  return {
    id: dbSchool.id,
    name: dbSchool.name,
    country: dbSchool.country,
    countryCode: dbSchool.country_code,
    region: dbSchool.region || '',
    type: 'K-12',
    sustainability: dbSchool.sustainability_score,
    communityEngagement: dbSchool.community_score,
    wellbeing: dbSchool.wellbeing_score,
    innovation: dbSchool.innovation_score,
    globalAwareness: dbSchool.global_awareness_score,
    academicExcellence: 0, // Not in DB, default to 0
    avgScore: dbSchool.avg_score,
    trend: dbSchool.trend as 'up' | 'down' | 'stable',
    trendValue: dbSchool.trend_value,
    problems: [
      dbSchool.sustainability_problem,
      dbSchool.community_problem,
      dbSchool.wellbeing_problem,
      dbSchool.innovation_problem,
      dbSchool.global_awareness_problem,
    ].filter(Boolean) as string[],
    solutions: [
      dbSchool.sustainability_solution,
      dbSchool.community_solution,
      dbSchool.wellbeing_solution,
      dbSchool.innovation_solution,
      dbSchool.global_awareness_solution,
    ].filter(Boolean) as string[],
    lastUpdated: dbSchool.updated_at,
  };
}

export function useSchools() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('avg_score', { ascending: false });

      if (error) throw error;
      return (data as DbSchool[]).map(transformDbSchool);
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('schools-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schools',
        },
        () => {
          // Refetch schools when data changes
          queryClient.invalidateQueries({ queryKey: ['schools'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useSyncSchools() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('sync-google-sheets');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
  });
}

export function useSyncLogs() {
  return useQuery({
    queryKey: ['sync-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .order('synced_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });
}
