'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAccount } from './useAccount';
import { PIPELINE_STAGES, type LeadStage } from '@/lib/config/pipeline-stages';

/**
 * Hook para buscar leads agrupados por estágio (Kanban)
 */
export function useKanbanLeads() {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['kanban-leads', account?.id],
    enabled: !!account?.id,
    queryFn: async () => {
      try {
        const response = await fetch('/api/leads/kanban');

        if (!response.ok) {
          throw new Error('Failed to fetch kanban leads');
        }

        const result = await response.json();
        console.log('✅ Leads do Kanban carregados:', result.total || 0);
        return result;
      } catch (error: any) {
        console.error('❌ Erro ao carregar leads do Kanban:', error);
        throw error;
      }
    },
  });
}

/**
 * Hook para mover lead entre estágios (drag and drop)
 */
export function useMoveLeadStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leadId,
      newStage,
    }: {
      leadId: string;
      newStage: LeadStage;
    }) => {
      const response = await fetch(`/api/leads/${leadId}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to move lead');
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidar cache do Kanban
      queryClient.invalidateQueries({ queryKey: ['kanban-leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });

      // Feedback de sucesso
      const stageName = PIPELINE_STAGES.find(s => s.id === variables.newStage)?.name;
      toast({
        title: 'Lead movido com sucesso!',
        description: `Lead movido para "${stageName}"`,
      } as any);
    },
    onError: (error: any) => {
      console.error('Erro ao mover lead:', error);
      toast({
        title: 'Erro ao mover lead',
        description: error.message || 'Ocorreu um erro ao mover o lead.',
        variant: 'destructive',
      } as any);
    },
  });
}

/**
 * Hook para obter estágios fixos
 */
export function usePipelineStages() {
  return {
    data: PIPELINE_STAGES,
    isLoading: false,
    error: null,
  };
}
