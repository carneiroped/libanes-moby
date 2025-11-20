'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAccount } from '@/hooks/useAccount';

export type LeadStageHistory = {
  id: string;
  lead_id: string;
  from_stage_id: string | null;
  to_stage_id: string;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
  from_stage_name?: string | null;
  to_stage_name?: string | null;
};

// Hook para carregar histórico de mudanças de estágio
export function useLeadStageHistory(leadId?: string) {
  const { accountId } = useAccount();
  
  return useQuery({
    queryKey: ['leadStageHistory', leadId],
    queryFn: async () => {
      if (!leadId || !accountId) return [];
      
      try {
        const params = new URLSearchParams({ leadId });
        const response = await fetch(`/api/lead-stage-history?${params.toString()}`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch lead stage history');
        }
        
        return response.json() as Promise<LeadStageHistory[]>;
      } catch (error: any) {
        console.error('Erro ao carregar histórico de estágios:', error);
        toast({
          title: 'Erro ao carregar histórico',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: !!leadId && !!accountId,
  });
}

// Hook para adicionar um registro ao histórico ao mudar o estágio de um lead
export function useAddStageHistory() {
  const queryClient = useQueryClient();
  const { accountId } = useAccount();
  
  return useMutation({
    mutationFn: async (data: {
      lead_id: string;
      from_stage_id: string | null;
      to_stage_id: string;
      changed_by: string;
      notes?: string;
      from_stage_name?: string;
      to_stage_name?: string;
    }) => {
      if (!accountId) throw new Error('Account ID não encontrado');
      
      try {
        const response = await fetch('/api/lead-stage-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create stage history');
        }
        
        return response.json();
      } catch (error: any) {
        console.error('Erro ao registrar mudança de estágio:', error);
        toast({
          title: 'Erro ao registrar mudança de estágio',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Estágio atualizado',
        description: 'Mudança de estágio registrada com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['leadStageHistory', variables.lead_id] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.lead_id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}