/**
 * Hook: useLeadAnalytics
 * Dados REAIS do Supabase via API Routes
 *
 * REGRA: NUNCA usar mocks - melhor dar erro que mostrar dados fake
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAccount } from './useAccount';
import { ComparisonPeriod, TemporalMetrics, BenchmarkData, SparklineData } from '@/types/analytics';

// Tipos de dados
export type LeadMetrics = {
  totalLeads: number;
  activeLeads: number;
  coldLeads: number;
  newLeadsToday: number;
  newLeadsWeek: number;
  leadsByStage: Record<string, number>;
  leadsBySource: Record<string, number>;
  leadsByInterest: Record<string, number>;
  conversionRate: number;
};

export type TimeSeriesPoint = {
  date: string;
  count: number;
};

export type StageConversion = {
  stage_id: string;
  stage_name: string;
  count: number;
  percentage: number;
  conversion_rate: number;
};

export type LeadSourceData = {
  source: string;
  count: number;
  percentage: number;
};

export type PropertyTypeData = {
  type: string;
  count: number;
  percentage: number;
};

export type PropertyConversion = {
  property_id: string;
  property_name: string;
  visit_count: number;
  conversion_rate: number;
  interest_score: number;
};

export type ConversionComparisonData = {
  category: string;
  leads: number;
  agendamentos: number;
  vendas: number;
};

/**
 * Hook para métricas gerais de leads
 */
export function useLeadMetrics(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['leadMetrics', account?.id, filters],
    queryFn: async () => {
      if (!account?.id) {
        throw new Error('Account ID não encontrado');
      }

      const params = new URLSearchParams({ account_id: account.id });
      if (filters?.startDate) params.append('start_date', filters.startDate);
      if (filters?.endDate) params.append('end_date', filters.endDate);

      const response = await fetch(`/api/analytics/metrics?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao buscar métricas');
      }

      return response.json() as Promise<LeadMetrics>;
    },
    enabled: !!account?.id,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 2
  });
}

/**
 * Hook para tendências de leads ao longo do tempo
 */
export function useLeadTrends(
  period: 'week' | 'month' | 'quarter' | 'year' = 'month',
  filters?: {
    startDate?: string;
    endDate?: string;
  }
) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['leadTrends', account?.id, period, filters],
    queryFn: async () => {
      if (!account?.id) {
        throw new Error('Account ID não encontrado');
      }

      const params = new URLSearchParams({
        account_id: account.id,
        period
      });

      if (filters?.startDate) params.append('start_date', filters.startDate);
      if (filters?.endDate) params.append('end_date', filters.endDate);

      const response = await fetch(`/api/analytics/trends?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao buscar tendências');
      }

      return response.json() as Promise<TimeSeriesPoint[]>;
    },
    enabled: !!account?.id,
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para funil de conversão por estágios
 */
export function useStageConversions(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['stageConversions', account?.id, filters],
    queryFn: async () => {
      if (!account?.id) {
        throw new Error('Account ID não encontrado');
      }

      const params = new URLSearchParams({ account_id: account.id });
      if (filters?.startDate) params.append('start_date', filters.startDate);
      if (filters?.endDate) params.append('end_date', filters.endDate);

      const response = await fetch(`/api/analytics/conversions?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao buscar conversões');
      }

      return response.json() as Promise<StageConversion[]>;
    },
    enabled: !!account?.id,
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para distribuição por fonte
 * TODO: Criar API route /api/analytics/sources
 */
export function useSourceDistribution(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  const { data: metrics } = useLeadMetrics(filters);

  return useQuery({
    queryKey: ['sourceDistribution', metrics?.leadsBySource, filters],
    queryFn: async () => {
      if (!metrics?.leadsBySource) {
        return [];
      }

      const sources = Object.entries(metrics.leadsBySource);
      const total = sources.reduce((sum, [, count]) => sum + count, 0);

      const distribution: LeadSourceData[] = sources.map(([source, count]) => ({
        source,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }));

      return distribution.sort((a, b) => b.count - a.count);
    },
    enabled: !!metrics?.leadsBySource
  });
}

/**
 * Hook para preferência por tipo de imóvel
 * TODO: Criar API route /api/analytics/property-types
 */
export function usePropertyTypePreference(filters?: {
  startDate?: string;
  endDate?: string;
  propertyFilter?: 'todos' | 'vendas' | 'locacao';
}) {
  const { data: metrics } = useLeadMetrics({
    startDate: filters?.startDate,
    endDate: filters?.endDate
  });

  return useQuery({
    queryKey: ['propertyTypePreference', metrics?.leadsByInterest, filters],
    queryFn: async () => {
      if (!metrics?.leadsByInterest) {
        return [];
      }

      const types = Object.entries(metrics.leadsByInterest);
      const total = types.reduce((sum, [, count]) => sum + count, 0);

      let preferences: PropertyTypeData[] = types.map(([type, count]) => ({
        type,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }));

      // Aplicar filtro de tipo de imóvel se fornecido
      if (filters?.propertyFilter && filters.propertyFilter !== 'todos') {
        // Nota: Este filtro depende de como os dados estão estruturados
        // Por ora, retorna todos os dados
      }

      return preferences.sort((a, b) => b.count - a.count);
    },
    enabled: !!metrics?.leadsByInterest
  });
}

/**
 * Hook para conversão por imóvel
 */
export function usePropertyConversion(filters?: {
  propertyFilter?: 'todos' | 'vendas' | 'locacao';
  startDate?: string;
  endDate?: string;
}) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['propertyConversion', account?.id, filters],
    queryFn: async () => {
      if (!account?.id) {
        throw new Error('Account ID não encontrado');
      }

      const params = new URLSearchParams({ account_id: account.id });
      if (filters?.propertyFilter && filters.propertyFilter !== 'todos') {
        params.append('property_type', filters.propertyFilter);
      }
      if (filters?.startDate) params.append('start_date', filters.startDate);
      if (filters?.endDate) params.append('end_date', filters.endDate);

      const response = await fetch(`/api/analytics/property-conversions?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao buscar conversões de imóveis');
      }

      return response.json() as Promise<PropertyConversion[]>;
    },
    enabled: !!account?.id,
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para tempo até venda
 */
export function useSalesTimeData(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['salesTimeData', account?.id, filters],
    queryFn: async () => {
      if (!account?.id) {
        throw new Error('Account ID não encontrado');
      }

      const params = new URLSearchParams({ account_id: account.id });
      if (filters?.startDate) params.append('start_date', filters.startDate);
      if (filters?.endDate) params.append('end_date', filters.endDate);

      const response = await fetch(`/api/analytics/sales-time?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao buscar tempo de vendas');
      }

      return response.json() as Promise<TimeSeriesPoint[]>;
    },
    enabled: !!account?.id,
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para comparação de conversões entre períodos
 */
export function useConversionComparison(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['conversionComparison', account?.id, filters],
    queryFn: async () => {
      if (!account?.id) {
        throw new Error('Account ID não encontrado');
      }

      const params = new URLSearchParams({ account_id: account.id });
      if (filters?.startDate) params.append('start_date', filters.startDate);
      if (filters?.endDate) params.append('end_date', filters.endDate);

      const response = await fetch(`/api/analytics/conversion-comparison?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao buscar comparação de conversões');
      }

      return response.json() as Promise<ConversionComparisonData[]>;
    },
    enabled: !!account?.id,
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para insights de IA (Azure OpenAI)
 */
export function useAIInsights() {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['aiInsights', account?.id],
    queryFn: async () => {
      if (!account?.id) {
        throw new Error('Account ID não encontrado');
      }

      const params = new URLSearchParams({ account_id: account.id });
      const response = await fetch(`/api/analytics/ai-insights?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao buscar insights de IA');
      }

      const data = await response.json();
      return data.insights as string[];
    },
    enabled: !!account?.id,
    staleTime: 10 * 60 * 1000, // Cache por 10 minutos (IA é mais caro)
    retry: 1 // Retry menor para IA
  });
}

/**
 * Hook para evolução de vendas
 */
export function useSalesEvolution(filters?: {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month';
}) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['salesEvolution', account?.id, filters],
    queryFn: async () => {
      if (!account?.id) {
        throw new Error('Account ID não encontrado');
      }

      const params = new URLSearchParams({ account_id: account.id });
      if (filters?.startDate) params.append('start_date', filters.startDate);
      if (filters?.endDate) params.append('end_date', filters.endDate);
      if (filters?.period) params.append('period', filters.period);

      const response = await fetch(`/api/analytics/sales-evolution?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao buscar evolução de vendas');
      }

      return response.json() as Promise<Array<{ date: string; vendas: number; valor: number }>>;
    },
    enabled: !!account?.id,
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para métricas temporais (comparação)
 */
export function useTemporalMetrics(comparisonPeriod?: ComparisonPeriod) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['temporalMetrics', account?.id, comparisonPeriod],
    queryFn: async () => {
      if (!account?.id) {
        throw new Error('Account ID não encontrado');
      }

      const params = new URLSearchParams({ account_id: account.id });
      // ComparisonPeriod não tem .type - usar 'month' como padrão
      params.append('period_type', 'month');

      const response = await fetch(`/api/analytics/temporal-metrics?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao buscar métricas temporais');
      }

      return response.json() as Promise<TemporalMetrics>;
    },
    enabled: !!account?.id,
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para sparklines (mini-gráficos)
 */
export function useMetricSparklines(metricKeys: string[], period: 'week' | 'month' = 'week') {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['metricSparklines', account?.id, metricKeys, period],
    queryFn: async () => {
      if (!account?.id) {
        throw new Error('Account ID não encontrado');
      }

      const params = new URLSearchParams({
        account_id: account.id,
        metrics: metricKeys.join(','),
        period
      });

      const response = await fetch(`/api/analytics/sparklines?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao buscar sparklines');
      }

      return response.json() as Promise<Record<string, SparklineData>>;
    },
    enabled: !!account?.id && metricKeys.length > 0,
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para benchmarks (metas e médias da indústria)
 */
export function useBenchmarks() {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['benchmarks', account?.id],
    queryFn: async () => {
      if (!account?.id) {
        throw new Error('Account ID não encontrado');
      }

      const params = new URLSearchParams({ account_id: account.id });
      const response = await fetch(`/api/analytics/benchmarks?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao buscar benchmarks');
      }

      return response.json() as Promise<Record<string, BenchmarkData>>;
    },
    enabled: !!account?.id,
    staleTime: 15 * 60 * 1000 // Cache por 15 minutos (muda pouco)
  });
}
