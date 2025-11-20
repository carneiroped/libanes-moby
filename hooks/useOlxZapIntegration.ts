/**
 * HOOK CUSTOMIZADO - INTEGRAÇÃO OLX/ZAP
 *
 * Gerencia estado e operações da integração com Grupo OLX/ZAP
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  OlxZapIntegration,
  OlxZapLead,
  OlxZapStats,
  OlxZapLeadFilters,
} from '@/types/olx-zap';

const DEFAULT_ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useOlxZapIntegration(accountId: string = DEFAULT_ACCOUNT_ID) {
  const queryClient = useQueryClient();

  // Buscar configuração e estatísticas
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['olx-zap-integration', accountId],
    queryFn: async () => {
      const response = await fetch(`/api/integrations/olx-zap?account_id=${accountId}`);

      if (!response.ok) {
        throw new Error('Erro ao buscar integração');
      }

      return response.json() as Promise<{
        integration: OlxZapIntegration;
        stats: OlxZapStats;
      }>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchInterval: 1000 * 60, // Atualizar a cada 1 minuto
  });

  // Mutation: Atualizar configuração
  const updateIntegration = useMutation({
    mutationFn: async (updates: { is_active?: boolean; client_api_key?: string }) => {
      const response = await fetch('/api/integrations/olx-zap', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: accountId,
          ...updates,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar integração');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['olx-zap-integration', accountId] });
    },
  });

  // Mutation: Criar integração
  const createIntegration = useMutation({
    mutationFn: async (data: { is_active?: boolean; client_api_key?: string }) => {
      const response = await fetch('/api/integrations/olx-zap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: accountId,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar integração');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['olx-zap-integration', accountId] });
    },
  });

  return {
    integration: data?.integration,
    stats: data?.stats,
    isLoading,
    error,
    refetch,
    updateIntegration: updateIntegration.mutateAsync,
    createIntegration: createIntegration.mutateAsync,
    isUpdating: updateIntegration.isPending,
    isCreating: createIntegration.isPending,
  };
}

// =====================================================
// HOOK: LISTAR LEADS
// =====================================================

export function useOlxZapLeads(filters: OlxZapLeadFilters) {
  const {
    account_id = DEFAULT_ACCOUNT_ID,
    status,
    temperature,
    transaction_type,
    start_date,
    end_date,
    page = 1,
    limit = 50,
  } = filters;

  const queryParams = new URLSearchParams({
    account_id,
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) queryParams.set('status', status);
  if (temperature) queryParams.set('temperature', temperature);
  if (transaction_type) queryParams.set('transaction_type', transaction_type);
  if (start_date) queryParams.set('start_date', start_date);
  if (end_date) queryParams.set('end_date', end_date);

  return useQuery({
    queryKey: ['olx-zap-leads', filters],
    queryFn: async () => {
      const response = await fetch(`/api/integrations/olx-zap/leads?${queryParams}`);

      if (!response.ok) {
        throw new Error('Erro ao buscar leads');
      }

      return response.json() as Promise<{
        leads: OlxZapLead[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

/**
 * Gerar URL do webhook para configuração no Canal Pro
 */
export function getWebhookUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mobydemosummit.vercel.app';
  return `${baseUrl}/api/webhooks/olx-zap-leads`;
}

/**
 * Copiar URL do webhook para clipboard
 */
export async function copyWebhookUrl(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(getWebhookUrl());
    return true;
  } catch (error) {
    console.error('Erro ao copiar URL:', error);
    return false;
  }
}
