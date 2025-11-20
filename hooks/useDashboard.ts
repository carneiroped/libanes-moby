/**
 * Hook: useDashboard
 * Dados REAIS do Supabase via API Route
 *
 * REGRA: NUNCA usar mocks - melhor dar erro que mostrar dados fake
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useAccount } from './useAccount';

export type DashboardMetrics = {
  // Métricas principais
  totalLeads: number;
  totalImoveis: number;
  totalChats: number;
  chatsAtivos: number;

  // Breakdown de leads
  leadsNovos: number;
  leadsAtivos: number;
  leadsConvertidos: number;

  // Comparações
  previousPeriod: {
    totalLeads: number;
    totalImoveis: number;
    totalChats: number;
  };

  // Trends (percentuais)
  trends: {
    totalLeads: number;
    totalImoveis: number;
    totalChats: number;
  };

  // Taxa de conversão
  conversionRate: number;

  // Timestamp
  lastUpdated: string;
};

/**
 * Hook para métricas do dashboard
 */
export function useDashboardMetrics() {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['dashboardMetrics', account?.id],
    queryFn: async () => {
      if (!account?.id) {
        throw new Error('Account ID não encontrado');
      }

      const params = new URLSearchParams({ account_id: account.id });
      const response = await fetch(`/api/dashboard/metrics?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao buscar métricas do dashboard');
      }

      return response.json() as Promise<DashboardMetrics>;
    },
    enabled: !!account?.id,
    staleTime: 2 * 60 * 1000, // Cache por 2 minutos (atualiza mais rápido que analytics)
    retry: 2,
    refetchOnWindowFocus: true, // Atualiza ao voltar para a aba
  });
}
