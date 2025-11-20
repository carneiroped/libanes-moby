'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAccount } from './useAccount';
import { useLeads, useUpdateLead } from './useLeads';
import { usePipeline as useBasePipeline } from './usePipelines';
import { leadsService } from '@/lib/services/leads.service';
import { pipelinesService } from '@/lib/services/pipelines.service';

// Enhanced pipeline hooks with performance optimizations

// Types for progressive loading
interface PipelineLeadsFilters {
  stage_id?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'created_at' | 'updated_at' | 'budget_max';
  sortOrder?: 'asc' | 'desc';
  temperature?: 'hot' | 'warm' | 'cold';
  stale_threshold_days?: number;
}

interface PipelineLeadsResponse {
  leads: any[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  metrics: {
    totalValue: number;
    avgTimeInStage: number;
    recentActivity: number;
  };
}

// Enhanced pipeline hook with better caching and error handling
export function usePipelineOptimized(pipelineId?: string) {
  const basePipeline = useBasePipeline(pipelineId);
  
  // Extended pipeline data with computed metrics
  const enhancedPipeline = useMemo(() => {
    if (!basePipeline.data) return null;
    
    return {
      ...basePipeline.data,
      // Add computed properties for better performance
      stageCount: basePipeline.data.stages?.length || 0,
      hasStages: (basePipeline.data.stages?.length || 0) > 0,
      sortedStages: basePipeline.data.stages?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)) || [],
    };
  }, [basePipeline.data]);
  
  return {
    ...basePipeline,
    data: enhancedPipeline,
    // Add convenience methods
    getStageById: useCallback((stageId: string) => {
      return enhancedPipeline?.stages?.find((stage: any) => stage.id === stageId);
    }, [enhancedPipeline?.stages]),
    
    getNextStage: useCallback((currentStageId: string) => {
      if (!enhancedPipeline?.sortedStages) return null;
      const currentIndex = enhancedPipeline.sortedStages.findIndex((s: any) => s.id === currentStageId);
      return currentIndex >= 0 && currentIndex < enhancedPipeline.sortedStages.length - 1
        ? enhancedPipeline.sortedStages[currentIndex + 1]
        : null;
    }, [enhancedPipeline?.sortedStages]),

    getPreviousStage: useCallback((currentStageId: string) => {
      if (!enhancedPipeline?.sortedStages) return null;
      const currentIndex = enhancedPipeline.sortedStages.findIndex((s: any) => s.id === currentStageId);
      return currentIndex > 0 ? enhancedPipeline.sortedStages[currentIndex - 1] : null;
    }, [enhancedPipeline?.sortedStages]),
  };
}

// Progressive loading for pipeline leads with infinite scrolling support
export function usePipelineLeadsInfinite(
  pipelineId?: string, 
  filters: PipelineLeadsFilters = {},
  options: {
    pageSize?: number;
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  const { account } = useAccount();
  const {
    pageSize = 20,
    enabled = true,
    staleTime = 30000, // 30 seconds
  } = options;
  
  return useInfiniteQuery({
    queryKey: ['pipeline-leads-infinite', pipelineId, account?.id, filters],
    enabled: !!pipelineId && enabled,
    staleTime,
    queryFn: async ({ pageParam = 1 }) => {
      if (!pipelineId) {
        throw new Error('Pipeline ID required');
      }

      try {
        console.log('🔍 [usePipelineLeadsInfinite] Buscando leads do pipeline, página:', pageParam);

        // Buscar pipeline para verificar se existe
        const pipeline = await pipelinesService.getPipelineById(pipelineId);
        if (!pipeline) {
          throw new Error('Pipeline not found');
        }

        // Buscar leads do pipeline via leadsService
        const result = await leadsService.getLeads({
          pipeline_id: pipelineId,
          stage_id: filters.stage_id,
          search: filters.search,
          page: pageParam,
          pageSize: pageSize,
        });

        return {
          leads: result.leads || [],
          pagination: {
            page: pageParam,
            pageSize,
            total: result.count || 0,
            totalPages: result.totalPages || 0,
            hasMore: pageParam < result.totalPages,
          },
          metrics: {
            totalValue: result.leads?.reduce((sum: number, lead: any) =>
              sum + (Number(lead.budget_max) || 0), 0) || 0,
            avgTimeInStage: 0, // TODO: Calculate from lead data
            recentActivity: 0, // TODO: Calculate from lead data
          },
        } as PipelineLeadsResponse;
      } catch (error: any) {
        console.error('❌ [usePipelineLeadsInfinite] Erro:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

// Optimized pipeline leads hook with better caching strategy
export function usePipelineLeads(
  pipelineId?: string,
  filters: PipelineLeadsFilters = {},
  options: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
    select?: (data: any) => any;
  } = {}
) {
  const { account } = useAccount();
  const {
    enabled = true,
    refetchInterval = 0,
    staleTime = 30000, // 30 seconds
    select,
  } = options;
  
  return useQuery({
    queryKey: ['pipeline-leads', pipelineId, account?.id, filters],
    enabled: !!pipelineId && enabled,
    staleTime,
    refetchInterval,
    select,
    queryFn: async () => {
      if (!pipelineId) {
        throw new Error('Pipeline ID required');
      }

      try {
        console.log('🔍 [usePipelineLeads] Buscando leads do pipeline:', pipelineId);

        // Buscar leads do pipeline via leadsService
        const result = await leadsService.getLeads({
          pipeline_id: pipelineId,
          stage_id: filters.stage_id,
          search: filters.search,
          page: filters.page || 1,
          pageSize: filters.pageSize || 1000, // Get all leads for now
        });

        // Aplicar filtros adicionais localmente se necessário
        let leads = result.leads || [];

        if (filters.temperature) {
          leads = leads.filter(lead => {
            // Mapear interest_level para temperature
            const interestLevel = lead.interest_level;

            // Mapear valores válidos
            const temperatureMap: Record<string, string> = {
              'muito_alto': 'hot',
              'alto': 'warm',
              'médio': 'warm',
              'baixo': 'cold'
            };

            const mappedTemp = interestLevel ? temperatureMap[interestLevel] : 'cold';
            return mappedTemp === filters.temperature;
          });
        }

        console.log('✅ [usePipelineLeads] Leads carregados:', leads.length);
        return leads;
      } catch (error: any) {
        console.error('❌ [usePipelineLeads] Erro:', error);
        return [];
      }
    },
  });
}

// Optimized lead movement with optimistic updates (via pipelinesService)
export function useOptimizedLeadMove(pipelineId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, targetStageId }: { leadId: string; targetStageId: string }) => {
      console.log('🔄 [useOptimizedLeadMove] Movendo lead:', leadId, 'para stage:', targetStageId);

      // Usar pipelinesService.moveCard para mover o lead
      const success = await pipelinesService.moveCard(leadId, targetStageId);

      if (!success) {
        throw new Error('Failed to move lead');
      }

      console.log('✅ [useOptimizedLeadMove] Lead movido com sucesso');
      return { leadId, targetStageId };
    },

    onMutate: async ({ leadId, targetStageId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['pipeline-leads', pipelineId] });

      // Snapshot the previous value
      const previousLeads = queryClient.getQueryData(['pipeline-leads', pipelineId]);

      // Optimistically update the cache
      queryClient.setQueryData(['pipeline-leads', pipelineId], (old: any[]) => {
        if (!old) return old;

        return old.map(lead =>
          lead.id === leadId
            ? { ...lead, stage_id: targetStageId, pipeline_stage_id: targetStageId, updated_at: new Date().toISOString() }
            : lead
        );
      });

      return { previousLeads };
    },

    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousLeads) {
        queryClient.setQueryData(['pipeline-leads', pipelineId], context.previousLeads);
      }

      console.error('❌ [useOptimizedLeadMove] Erro:', error);
      toast({
        title: 'Erro ao mover lead',
        description: 'Não foi possível mover o lead. Tente novamente.',
        variant: 'destructive',
      });
    },

    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['pipeline-leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: 'Lead movido!',
        description: 'O lead foi movido para o novo estágio.',
      });
    },
  });
}

// Stage metrics calculation hook
export function useStageMetrics(pipelineId?: string, stageId?: string) {
  const { data: leads } = usePipelineLeads(pipelineId, { stage_id: stageId });
  
  return useMemo(() => {
    if (!leads || leads.length === 0) {
      return {
        totalLeads: 0,
        totalValue: 0,
        avgValue: 0,
        avgTimeInStage: 0,
        recentActivity: 0,
        staleLeads: 0,
        bottleneckRisk: 'low' as const,
      };
    }
    
    const now = new Date();
    const totalLeads = leads.length;
    const totalValue = leads.reduce((sum: number, lead: any) => sum + (Number(lead.budget_max) || 0), 0);
    const avgValue = totalValue / totalLeads;

    // Calculate time in stage
    const timeInStageData = leads.map((lead: any) => {
      const updatedAt = new Date(lead.updated_at || lead.created_at || now);
      return Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    });

    const avgTimeInStage = timeInStageData.reduce((sum: number, days: number) => sum + days, 0) / timeInStageData.length;

    // Recent activity (last 7 days)
    const recentActivity = leads.filter((lead: any) => {
      const updatedAt = new Date(lead.updated_at || lead.created_at || now);
      return (now.getTime() - updatedAt.getTime()) < (7 * 24 * 60 * 60 * 1000);
    }).length;

    // Stale leads (no activity for > 14 days)
    const staleLeads = leads.filter((lead: any) => {
      const lastActivity = new Date(lead.last_contact_at || lead.updated_at || lead.created_at || now);
      return (now.getTime() - lastActivity.getTime()) > (14 * 24 * 60 * 60 * 1000);
    }).length;
    
    // Bottleneck risk assessment
    let bottleneckRisk: 'low' | 'medium' | 'high' = 'low';
    if (avgTimeInStage > 21 || staleLeads / totalLeads > 0.5) {
      bottleneckRisk = 'high';
    } else if (avgTimeInStage > 14 || staleLeads / totalLeads > 0.3) {
      bottleneckRisk = 'medium';
    }
    
    return {
      totalLeads,
      totalValue,
      avgValue,
      avgTimeInStage,
      recentActivity,
      staleLeads,
      bottleneckRisk,
    };
  }, [leads]);
}

// Pipeline performance analytics
export function usePipelineAnalytics(pipelineId?: string) {
  const { data: pipeline } = usePipelineOptimized(pipelineId);
  const { data: leads } = usePipelineLeads(pipelineId);
  
  return useMemo(() => {
    if (!pipeline || !leads) {
      return {
        conversionRates: {},
        stageVelocity: {},
        bottlenecks: [],
        opportunities: [],
        healthScore: 0,
      };
    }
    
    // Group leads by stage
    const leadsByStage = leads.reduce((acc: any, lead: any) => {
      const stageId = lead.stage_id;
      if (!acc[stageId]) acc[stageId] = [];
      acc[stageId].push(lead);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate conversion rates between stages
    const conversionRates: Record<string, number> = {};
    pipeline.sortedStages.forEach((stage: any, index: number) => {
      if (index === 0) return; // Skip first stage

      const prevStageId = pipeline.sortedStages[index - 1].id;
      const currentStageLeads = leadsByStage[stage.id]?.length || 0;
      const prevStageLeads = leadsByStage[prevStageId]?.length || 0;

      conversionRates[stage.id] = prevStageLeads > 0 ? (currentStageLeads / prevStageLeads) * 100 : 0;
    });

    // Calculate stage velocity (leads moving through per day)
    const stageVelocity: Record<string, number> = {};
    pipeline.sortedStages.forEach((stage: any) => {
      const stageLeads = leadsByStage[stage.id] || [];
      const now = new Date();
      const recentMoves = stageLeads.filter((lead: any) => {
        const updatedAt = new Date(lead.updated_at || lead.created_at || now);
        return (now.getTime() - updatedAt.getTime()) < (7 * 24 * 60 * 60 * 1000);
      }).length;

      stageVelocity[stage.id] = recentMoves / 7; // Per day
    });

    // Identify bottlenecks (low conversion rates)
    const bottlenecks = pipeline.sortedStages
      .filter((stage: any) => conversionRates[stage.id] < 50 && conversionRates[stage.id] > 0)
      .map((stage: any) => ({
        stageId: stage.id,
        stageName: stage.name,
        conversionRate: conversionRates[stage.id],
        issue: 'Low conversion rate',
      }));

    // Identify opportunities (high-value stages with low activity)
    const opportunities = pipeline.sortedStages
      .map((stage: any) => {
        const stageLeads = leadsByStage[stage.id] || [];
        const avgValue = stageLeads.reduce((sum: number, lead: any) => sum + (Number(lead.budget_max) || 0), 0) / stageLeads.length;
        const velocity = stageVelocity[stage.id] || 0;

        return {
          stageId: stage.id,
          stageName: stage.name,
          avgValue,
          velocity,
          opportunity: avgValue > 100000 && velocity < 0.5 ? 'High-value, low activity' : null,
        };
      })
      .filter((stage: any) => stage.opportunity);
    
    // Calculate overall health score
    const avgConversion = Object.values(conversionRates).reduce((sum, rate) => sum + rate, 0) / Object.keys(conversionRates).length;
    const avgVelocity = Object.values(stageVelocity).reduce((sum, vel) => sum + vel, 0) / Object.keys(stageVelocity).length;
    const healthScore = Math.round((avgConversion + avgVelocity * 10) / 2); // Simplified scoring
    
    return {
      conversionRates,
      stageVelocity,
      bottlenecks,
      opportunities,
      healthScore: Math.max(0, Math.min(100, healthScore)),
    };
  }, [pipeline, leads]);
}