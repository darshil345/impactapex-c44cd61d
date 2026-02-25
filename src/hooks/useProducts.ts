import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface Product {
  id: string;
  user_id: string;
  url: string;
  name: string | null;
  brand: string | null;
  category: string | null;
  image_url: string | null;
  description: string | null;
  ai_summary: string | null;
  pros: string[];
  cons: string[];
  overall_rating: number;
  value_score: number;
  quality_score: number;
  innovation_score: number;
  sustainability_score: number;
  popularity_score: number;
  is_recommended: boolean;
  research_status: string;
  research_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function useProducts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Product[];
    },
    enabled: !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        queryClient.invalidateQueries({ queryKey: ['products', user.id] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient, user]);

  return query;
}

export function useAddProduct() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (url: string) => {
      if (!user) throw new Error('Not authenticated');

      // Insert the product
      const { data: product, error: insertError } = await supabase
        .from('products')
        .insert({ user_id: user.id, url, research_status: 'pending' })
        .select()
        .single();

      if (insertError) throw insertError;

      // Trigger AI research
      const { error: fnError } = await supabase.functions.invoke('research-product', {
        body: { productId: product.id, url },
      });

      if (fnError) {
        console.error('Research function error:', fnError);
        // Don't throw — product is saved, research will show as pending
      }

      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', user?.id] });
    },
  });
}

export function useDeleteProduct() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', user?.id] });
    },
  });
}

export function useReResearchProduct() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: { id: string; url: string }) => {
      const { error: fnError } = await supabase.functions.invoke('research-product', {
        body: { productId: product.id, url: product.url },
      });
      if (fnError) throw fnError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', user?.id] });
    },
  });
}
