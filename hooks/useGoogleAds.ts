'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAccount } from './useAccount';
import type { GoogleAdsIntegration, GoogleAdsLead, GoogleAdsStats } from '@/types/google-ads';

const API_BASE = '/api/integrations/google-ads';

// ============================================================================
// INTEGRATION
// ============================================================================

/**
 * Hook para gerenciar integração Google Ads
 */
export function useGoogleAdsIntegration() {
  const { account } = useAccount();
  const queryClient = useQueryClient();

  // Buscar configuração da integração
  const { data: integration, isLoading, error } = useQuery({
    queryKey: ['googleAdsIntegration', account?.id],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (account?.id) {
        params.append('account_id', account.id);
      }

      const response = await fetch(`${API_BASE}?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Google Ads integration');
      }

      const data = await response.json();
      return data.integration as GoogleAdsIntegration | null;
    },
    enabled: !!account?.id
  });

  // Criar ou atualizar integração
  const createOrUpdate = useMutation({
    mutationFn: async (config: {
      customer_id: string;
      developer_token: string;
      client_id: string;
      client_secret: string;
      refresh_token: string;
      conversion_action_id?: string;
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
        throw new Error(error.message || 'Failed to save Google Ads integration');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['googleAdsIntegration'] });
      toast({
        title: 'Integração salva',
        description: 'Google Ads configurado com sucesso!',
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
      queryClient.invalidateQueries({ queryKey: ['googleAdsIntegration'] });
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

export interface GoogleAdsLeadsFilters {
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  campaign_id?: string;
  search?: string;
}

/**
 * Hook para listar leads do Google Ads
 */
export function useGoogleAdsLeads(filters: GoogleAdsLeadsFilters = {}) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['googleAdsLeads', account?.id, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (account?.id) params.append('account_id', account.id);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.campaign_id) params.append('campaign_id', filters.campaign_id);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`${API_BASE}/leads?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Google Ads leads');
      }

      const data = await response.json();
      return {
        leads: data.leads as GoogleAdsLead[],
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
 * Hook para estatísticas dos leads Google Ads
 */
export function useGoogleAdsStats() {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['googleAdsStats', account?.id],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (account?.id) params.append('account_id', account.id);

      const response = await fetch(`${API_BASE}/leads/stats?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Google Ads stats');
      }

      const data = await response.json();
      return data as GoogleAdsStats;
    },
    enabled: !!account?.id,
    refetchInterval: 60000 // Atualizar a cada 1 minuto
  });
}

// ============================================================================
// LEAD ACTIONS
// ============================================================================

/**
 * Hook para atualizar status de um lead Google Ads
 */
export function useUpdateGoogleAdsLeadStatus() {
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
      queryClient.invalidateQueries({ queryKey: ['googleAdsLeads'] });
      queryClient.invalidateQueries({ queryKey: ['googleAdsStats'] });
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
