'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAccount } from './useAccount';
import { Database } from '@/types/database.types';

// Tipos do banco V9
type Pipeline = Database['public']['Tables']['pipelines']['Row'];
type PipelineInsert = Database['public']['Tables']['pipelines']['Insert'];
type PipelineUpdate = Database['public']['Tables']['pipelines']['Update'];
type PipelineStage = Database['public']['Tables']['pipeline_stages']['Row'];
type PipelineStageInsert = Database['public']['Tables']['pipeline_stages']['Insert'];
type PipelineStageUpdate = Database['public']['Tables']['pipeline_stages']['Update'];

// Tipos estendidos
export type PipelineWithStages = Pipeline & {
  stages?: PipelineStage[];
  leads_count?: number;
};

// Hook para listar pipelines
export function usePipelines() {
  const { account } = useAccount();
  
  return useQuery({
    queryKey: ['pipelines', account?.id],
    enabled: true,
    queryFn: async () => {
      try {
        // Buscar pipelines REAIS via API route
        const response = await fetch('/api/pipelines');

        if (!response.ok) {
          throw new Error('Failed to fetch pipelines');
        }

        const result = await response.json();
        console.log('✅ Pipelines carregados do banco:', result.pipelines?.length || 0);
        return result.pipelines || [];
      } catch (error: any) {
        console.error('❌ Erro ao carregar pipelines:', error);
        throw error;
      }
    }
  });
}

// Hook para buscar um pipeline específico
export function usePipeline(pipelineId?: string) {
  const { account } = useAccount();
  
  return useQuery({
    queryKey: ['pipeline', pipelineId, account?.id],
    enabled: !!pipelineId,
    queryFn: async () => {
      if (!pipelineId) return null;

      try {
        // Buscar pipeline REAL via API route
        const response = await fetch(`/api/pipelines?id=${pipelineId}`);

        if (!response.ok) {
          if (response.status === 404) {
            console.log('Pipeline não encontrado:', pipelineId);
            return null;
          }
          throw new Error('Failed to fetch pipeline');
        }

        const result = await response.json();
        console.log('✅ Pipeline carregado do banco:', result.pipeline?.name);
        return result.pipeline || null;
      } catch (error: any) {
        console.error('❌ Erro ao carregar pipeline:', error);
        throw error;
      }
    },
  });
}

// Hook para criar pipeline
export function useCreatePipeline() {
  const queryClient = useQueryClient();
  const { account } = useAccount();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      is_default?: boolean;
      stages?: Array<{
        name: string;
        order: number;
        color?: string;
        probability?: number;
      }>;
    }) => {
      if (!account?.id) {
        throw new Error('Account ID is required');
      }
      
      const response = await fetch('/api/pipelines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          is_default: data.is_default,
          stages: data.stages
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create pipeline');
      }
      
      const result = await response.json();
      return result.pipeline;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      toast({
        title: "Pipeline criado com sucesso!",
        description: "O pipeline foi adicionado ao sistema.",
      } as any);
    },
    onError: (error: any) => {
      console.error('Erro ao criar pipeline:', error);
      toast({
        title: "Erro ao criar pipeline",
        description: error.message || "Ocorreu um erro ao criar o pipeline.",
        variant: "destructive",
      } as any);
    },
  });
}

// Hook para atualizar pipeline
export function useUpdatePipeline() {
  const queryClient = useQueryClient();
  const { account } = useAccount();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PipelineUpdate> }) => {
      if (!account?.id) {
        throw new Error('Account ID is required');
      }
      
      const response = await fetch(`/api/pipelines?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update pipeline');
      }
      
      const result = await response.json();
      return result.pipeline;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      toast({
        title: "Pipeline atualizado com sucesso!",
        description: "As alterações foram salvas.",
      } as any);
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar pipeline:', error);
      toast({
        title: "Erro ao atualizar pipeline",
        description: error.message || "Ocorreu um erro ao atualizar o pipeline.",
        variant: "destructive",
      } as any);
    },
  });
}

// Hook para deletar pipeline
export function useDeletePipeline() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pipelineId: string) => {
      const response = await fetch(`/api/pipelines?id=${pipelineId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete pipeline');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      toast({
        title: "Pipeline deletado com sucesso!",
        description: "O pipeline foi removido do sistema.",
      } as any);
    },
    onError: (error: any) => {
      console.error('Erro ao deletar pipeline:', error);
      toast({
        title: "Erro ao deletar pipeline",
        description: error.message || "Ocorreu um erro ao deletar o pipeline.",
        variant: "destructive",
      } as any);
    },
  });
}

// Hook para criar estágio
export function useCreatePipelineStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      pipeline_id: string;
      name: string;
      color?: string;
      probability?: number;
    }) => {
      const response = await fetch('/api/pipelines/stages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create stage');
      }
      
      const result = await response.json();
      return result.stage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      toast({
        title: "Estágio criado com sucesso!",
        description: "O estágio foi adicionado ao pipeline.",
      } as any);
    },
    onError: (error: any) => {
      console.error('Erro ao criar estágio:', error);
      toast({
        title: "Erro ao criar estágio",
        description: error.message || "Ocorreu um erro ao criar o estágio.",
        variant: "destructive",
      } as any);
    },
  });
}

// Hook para atualizar estágio
export function useUpdatePipelineStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PipelineStageUpdate> }) => {
      const response = await fetch(`/api/pipelines/stages?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update stage');
      }
      
      const result = await response.json();
      return result.stage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      toast({
        title: "Estágio atualizado com sucesso!",
        description: "As alterações foram salvas.",
      } as any);
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar estágio:', error);
      toast({
        title: "Erro ao atualizar estágio",
        description: error.message || "Ocorreu um erro ao atualizar o estágio.",
        variant: "destructive",
      } as any);
    },
  });
}

// Hook para reordenar estágios
export function useReorderPipelineStages() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ pipelineId, stages }: {
      pipelineId: string;
      stages: Array<{ id: string; order: number }>;
    }) => {
      const response = await fetch('/api/pipelines/stages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pipeline_id: pipelineId,
          stages
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reorder stages');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
    onError: (error: any) => {
      console.error('Erro ao reordenar estágios:', error);
      toast({
        title: "Erro ao reordenar estágios",
        description: error.message || "Ocorreu um erro ao reordenar os estágios.",
        variant: "destructive",
      } as any);
    },
  });
}

// Hook para deletar estágio
export function useDeletePipelineStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ stageId, pipelineId }: { stageId: string; pipelineId: string }) => {
      const response = await fetch(`/api/pipelines/stages?id=${stageId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete stage');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      toast({
        title: "Estágio deletado com sucesso!",
        description: "O estágio foi removido do pipeline.",
      } as any);
    },
    onError: (error: any) => {
      console.error('Erro ao deletar estágio:', error);
      toast({
        title: "Erro ao deletar estágio",
        description: error.message || "Ocorreu um erro ao deletar o estágio.",
        variant: "destructive",
      } as any);
    },
  });
}