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
  sustainability_score: number | null;
  sustainability_problem: string | null;
  sustainability_solution: string | null;
  community_score: number | null;
  community_problem: string | null;
  community_solution: string | null;
  wellbeing_score: number | null;
  wellbeing_problem: string | null;
  wellbeing_solution: string | null;
  innovation_score: number | null;
  innovation_problem: string | null;
  innovation_solution: string | null;
  academic_excellence_score: number | null;
  academic_excellence_problem: string | null;
  academic_excellence_solution: string | null;
  avg_score: number | null;
  trend: string | null;
  trend_value: number | null;
  created_at: string;
  updated_at: string;
}

// Transform database school to app School type
export function transformDbSchool(dbSchool: DbSchool): School {
  const trend = dbSchool.trend as 'up' | 'down' | 'stable' | null;
  return {
    id: dbSchool.id,
    name: dbSchool.name,
    country: dbSchool.country,
    countryCode: dbSchool.country_code,
    region: dbSchool.region || '',
    type: 'K-12',
    sustainability: dbSchool.sustainability_score ?? 0,
    communityEngagement: dbSchool.community_score ?? 0,
    wellbeing: dbSchool.wellbeing_score ?? 0,
    innovation: dbSchool.innovation_score ?? 0,
    academicExcellence: dbSchool.academic_excellence_score ?? 0,
    globalAwareness: 0, // Legacy field, not used
    avgScore: dbSchool.avg_score ?? 0,
    trend: trend ?? 'stable',
    trendValue: dbSchool.trend_value ?? 0,
    problems: [
      dbSchool.sustainability_problem,
      dbSchool.community_problem,
      dbSchool.wellbeing_problem,
      dbSchool.innovation_problem,
      dbSchool.academic_excellence_problem,
    ].filter(Boolean) as string[],
    solutions: [
      dbSchool.sustainability_solution,
      dbSchool.community_solution,
      dbSchool.wellbeing_solution,
      dbSchool.innovation_solution,
      dbSchool.academic_excellence_solution,
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
