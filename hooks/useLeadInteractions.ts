'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAccount } from '@/hooks/useAccount';

export type LeadInteraction = {
  id: string;
  lead_id: string;
  interaction_type: 'call' | 'email' | 'meeting' | 'whatsapp' | 'other';
  description: string;
  created_at: string;
  created_by: string;
  outcome: string | null;
  duration_minutes: number | null;
  user_name?: string;
};

// Hook para carregar interações de um lead
export function useLeadInteractions(leadId?: string) {
  const { accountId } = useAccount();
  
  return useQuery({
    queryKey: ['leadInteractions', leadId],
    queryFn: async () => {
      if (!leadId || !accountId) return [];
      
      try {
        const response = await fetch(`/api/lead-interactions?lead_id=${leadId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch interactions');
        }
        
        const result = await response.json();
        const data = result.data || [];
        
        // Mapear activities para o formato LeadInteraction
        return data.map((activity: any) => ({
          id: activity.id,
          lead_id: leadId,
          interaction_type: (activity.metadata as any)?.interaction_type || activity.type || 'other',
          description: activity.description,
          created_at: activity.created_at,
          created_by: activity.user_id,
          outcome: (activity.metadata as any)?.outcome || null,
          duration_minutes: (activity.metadata as any)?.duration_minutes || null,
        })) as LeadInteraction[];
      } catch (error: any) {
        console.error('Erro ao carregar interações:', error);
        toast({
          title: 'Erro ao carregar interações',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: !!leadId && !!accountId,
  });
}

// Hook para adicionar uma interação a um lead
export function useAddLeadInteraction() {
  const queryClient = useQueryClient();
  const { accountId } = useAccount();
  
  return useMutation({
    mutationFn: async (data: {
      lead_id: string;
      interaction_type: 'call' | 'email' | 'meeting' | 'whatsapp' | 'other';
      description: string;
      created_by: string;
      outcome?: string;
      duration_minutes?: number;
    }) => {
      if (!accountId) throw new Error('Account ID não encontrado');
      
      try {
        const response = await fetch('/api/lead-interactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create interaction');
        }
        
        const result = await response.json();
        return result.data;
      } catch (error: any) {
        console.error('Erro ao adicionar interação:', error);
        toast({
          title: 'Erro ao adicionar interação',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Interação registrada',
        description: 'Interação registrada com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['leadInteractions', variables.lead_id] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.lead_id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

// Hook para excluir uma interação
export function useDeleteLeadInteraction() {
  const queryClient = useQueryClient();
  const { accountId } = useAccount();
  
  return useMutation({
    mutationFn: async (data: {
      id: string;
      lead_id: string;
    }) => {
      if (!accountId) throw new Error('Account ID não encontrado');
      
      try {
        const response = await fetch(`/api/lead-interactions?id=${data.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete interaction');
        }
        
        return { id: data.id, deleted: true };
      } catch (error: any) {
        console.error('Erro ao excluir interação:', error);
        toast({
          title: 'Erro ao excluir interação',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Interação excluída',
        description: 'Interação excluída com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['leadInteractions', variables.lead_id] });
    },
  });
}