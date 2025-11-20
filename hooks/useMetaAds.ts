'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAccount } from './useAccount';
import type { MetaAdsIntegration, MetaAdsLead, MetaAdsStats } from '@/types/meta-ads';

const API_BASE = '/api/integrations/meta-ads';

// ============================================================================
// INTEGRATION
// ============================================================================

/**
 * Hook para gerenciar integração Meta Ads (Facebook/Instagram)
 */
export function useMetaAdsIntegration() {
  const { account } = useAccount();
  const queryClient = useQueryClient();

  // Buscar configuração da integração
  const { data: integration, isLoading, error } = useQuery({
    queryKey: ['metaAdsIntegration', account?.id],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (account?.id) {
        params.append('account_id', account.id);
      }

      const response = await fetch(`${API_BASE}?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Meta Ads integration');
      }

      const data = await response.json();
      return data.integration as MetaAdsIntegration | null;
    },
    enabled: !!account?.id
  });

  // Criar ou atualizar integração
  const createOrUpdate = useMutation({
    mutationFn: async (config: {
      app_id: string;
      app_secret: string;
      access_token: string;
      page_id: string;
      instagram_account_id?: string;
      form_id?: string;
      is_active?: boolean;
    }) => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          account_id: account?.id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save Meta Ads integration');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['metaAdsIntegration'] });
      toast({
        title: 'Integração salva',
        description: `Meta Ads configurado com sucesso! Webhook URL: ${data.webhook_url}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao salvar integração',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Ativar/desativar integração
  const toggleActive = useMutation({
    mutationFn: async (isActive: boolean) => {
      const response = await fetch(API_BASE, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: isActive,
          account_id: account?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update integration status');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['metaAdsIntegration'] });
      toast({
        title: 'Status atualizado',
        description: `Integração ${data.integration.is_active ? 'ativada' : 'desativada'} com sucesso!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    integration,
    isLoading,
    error,
    createOrUpdate,
    toggleActive,
    isConfigured: !!integration,
    isActive: integration?.is_active || false
  };
}

// ============================================================================
// LEADS
// ============================================================================

export interface MetaAdsLeadsFilters {
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  platform?: 'facebook' | 'instagram';
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  campaign_id?: string;
  search?: string;
}

/**
 * Hook para listar leads do Meta Ads
 */
export function useMetaAdsLeads(filters: MetaAdsLeadsFilters = {}) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['metaAdsLeads', account?.id, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (account?.id) params.append('account_id', account.id);
      if (filters.status) params.append('status', filters.status);
      if (filters.platform) params.append('platform', filters.platform);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.campaign_id) params.append('campaign_id', filters.campaign_id);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`${API_BASE}/leads?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Meta Ads leads');
      }

      const data = await response.json();
      return {
        leads: data.leads as MetaAdsLead[],
        total: data.total as number,
        page: data.page as number,
        limit: data.limit as number,
        total_pages: data.total_pages as number
      };
    },
    enabled: !!account?.id
  });
}

/**
 * Hook para estatísticas dos leads Meta Ads
 */
export function useMetaAdsStats() {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['metaAdsStats', account?.id],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (account?.id) params.append('account_id', account.id);

      const response = await fetch(`${API_BASE}/leads/stats?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Meta Ads stats');
      }

      const data = await response.json();
      return data as MetaAdsStats;
    },
    enabled: !!account?.id,
    refetchInterval: 60000 // Atualizar a cada 1 minuto
  });
}

// ============================================================================
// LEAD ACTIONS
// ============================================================================

/**
 * Hook para atualizar status de um lead Meta Ads
 */
export function useUpdateMetaAdsLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leadId,
      status
    }: {
      leadId: string;
      status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
    }) => {
      const response = await fetch(`${API_BASE}/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metaAdsLeads'] });
      queryClient.invalidateQueries({ queryKey: ['metaAdsStats'] });
      toast({
        title: 'Status atualizado',
        description: 'Lead atualizado com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar lead',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

/**
 * Hook combinado para estatísticas gerais das duas plataformas
 */
export function useMetaAdsCombinedStats() {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['metaAdsCombinedStats', account?.id],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (account?.id) params.append('account_id', account.id);

      const response = await fetch(`${API_BASE}/leads/stats?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch combined stats');
      }

      const data = await response.json();

      return {
        ...data,
        // Breakdown por plataforma
        by_platform: {
          facebook: {
            total: data.facebook_leads,
            conversion_rate: data.facebook_leads > 0
              ? data.converted_leads / data.facebook_leads
              : 0
          },
          instagram: {
            total: data.instagram_leads,
            conversion_rate: data.instagram_leads > 0
              ? data.converted_leads / data.instagram_leads
              : 0
          }
        }
      };
    },
    enabled: !!account?.id,
    refetchInterval: 60000
  });
}
