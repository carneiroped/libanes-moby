/**
 * HOOK - HUB DE INTEGRAÇÕES
 *
 * Gerencia dados de todas as integrações em um só lugar
 */

import { useQuery } from '@tanstack/react-query';
import { useOlxZapIntegration } from './useOlxZapIntegration';

const DEFAULT_ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

// =====================================================
// TIPOS
// =====================================================

export interface IntegrationStats {
  totalLeads: number;
  leadsToday: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  isActive: boolean;
  lastLeadAt?: string;
}

export interface AllIntegrationsStats {
  'olx-zap': IntegrationStats | null;
  'chaves-na-mao': IntegrationStats | null;
  'imoveis-sc': IntegrationStats | null;
  'google-ads': IntegrationStats | null;
  'meta-ads': IntegrationStats | null;
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useIntegrationsHub(accountId: string = DEFAULT_ACCOUNT_ID) {
  // Buscar stats do OLX/ZAP (já existe)
  const olxZapIntegration = useOlxZapIntegration(accountId);

  // Buscar stats de todas as integrações
  const { data: allStats, isLoading, error, refetch } = useQuery({
    queryKey: ['integrations-hub-stats', accountId],
    queryFn: async () => {
      const stats: AllIntegrationsStats = {
        'olx-zap': null,
        'chaves-na-mao': null,
        'imoveis-sc': null,
        'google-ads': null,
        'meta-ads': null,
      };

      // OLX/ZAP (dados reais)
      if (olxZapIntegration.integration && olxZapIntegration.stats) {
        stats['olx-zap'] = {
          totalLeads: olxZapIntegration.stats.total_leads || 0,
          leadsToday: olxZapIntegration.stats.leads_today || 0,
          leadsThisWeek: olxZapIntegration.stats.leads_this_week || 0,
          leadsThisMonth: olxZapIntegration.stats.leads_this_month || 0,
          isActive: olxZapIntegration.integration.is_active || false,
          lastLeadAt: olxZapIntegration.integration.last_lead_received_at || undefined,
        };
      }

      // Outros portais (preparado para quando estiverem prontos)
      // TODO: Buscar stats do Chaves na Mão quando API estiver pronta
      // TODO: Buscar stats do Imóveis SC quando API estiver pronta
      // TODO: Buscar stats do Google Ads quando API estiver pronta
      // TODO: Buscar stats do Meta Ads quando API estiver pronta

      return stats;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchInterval: 1000 * 60, // Atualizar a cada 1 minuto
    enabled: !olxZapIntegration.isLoading, // Só buscar depois que OLX/ZAP carregar
  });

  // Calcular totais gerais
  const totalStats = {
    totalLeads: 0,
    leadsToday: 0,
    leadsThisWeek: 0,
    leadsThisMonth: 0,
    activeIntegrations: 0,
  };

  if (allStats) {
    Object.values(allStats).forEach((stat) => {
      if (stat) {
        totalStats.totalLeads += stat.totalLeads;
        totalStats.leadsToday += stat.leadsToday;
        totalStats.leadsThisWeek += stat.leadsThisWeek;
        totalStats.leadsThisMonth += stat.leadsThisMonth;
        if (stat.isActive) {
          totalStats.activeIntegrations++;
        }
      }
    });
  }

  return {
    stats: allStats,
    totalStats,
    isLoading: isLoading || olxZapIntegration.isLoading,
    error,
    refetch: () => {
      refetch();
      olxZapIntegration.refetch();
    },
  };
}

// =====================================================
// HOOK: BUSCAR STATS DE UMA INTEGRAÇÃO ESPECÍFICA
// =====================================================

export function useIntegrationStats(
  integrationId: 'olx-zap' | 'chaves-na-mao' | 'imoveis-sc' | 'google-ads' | 'meta-ads',
  accountId: string = DEFAULT_ACCOUNT_ID
) {
  const { stats, isLoading, error, refetch } = useIntegrationsHub(accountId);

  return {
    stats: stats?.[integrationId] || null,
    isLoading,
    error,
    refetch,
  };
}
