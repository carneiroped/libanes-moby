'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAccount } from '@/hooks/useAccount';
import { Lead } from './useLeads';

export type LeadFollowup = {
  id: string;
  lead_id: string;
  title: string;
  description: string | null;
  due_date: string;
  created_at: string;
  created_by: string;
  assigned_to: string | null;
  is_completed: boolean;
  completed_at: string | null;
  priority: 'baixa' | 'média' | 'alta' | 'urgente';
  lead?: Partial<Lead>;
};

// Hook para carregar follow-ups de um lead
export function useLeadFollowups(leadId?: string) {
  const { accountId } = useAccount();
  
  return useQuery({
    queryKey: ['leadFollowups', leadId],
    queryFn: async () => {
      if (!leadId || !accountId) return [];
      
      try {
        const response = await fetch(`/api/lead-followups?lead_id=${leadId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch followups');
        }
        
        const result = await response.json();
        const data = result.data || [];
        
        // Mapear tasks para o formato LeadFollowup
        return data.map((task: any) => ({
          id: task.id,
          lead_id: task.lead_id || leadId,
          title: task.title,
          description: task.description,
          due_date: task.due_date || new Date().toISOString(),
          created_at: task.created_at,
          created_by: task.assigned_by || task.assigned_to,
          assigned_to: task.assigned_to,
          is_completed: task.status === 'completed',
          completed_at: task.completed_at,
          priority: (task.priority === 'low' ? 'baixa' : 
                    task.priority === 'medium' ? 'média' : 
                    task.priority === 'high' ? 'alta' : 'urgente') as LeadFollowup['priority'],
          lead: { id: leadId }
        })) as LeadFollowup[];
      } catch (error: any) {
        console.error('Erro ao carregar follow-ups:', error);
        toast({
          title: 'Erro ao carregar follow-ups',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: !!leadId && !!accountId,
  });
}

// Hook para adicionar um follow-up
export function useAddLeadFollowup() {
  const queryClient = useQueryClient();
  const { accountId } = useAccount();
  
  return useMutation({
    mutationFn: async (data: {
      lead_id: string;
      title: string;
      description?: string;
      due_date: string;
      created_by: string;
      assigned_to?: string;
      priority?: 'baixa' | 'média' | 'alta' | 'urgente';
    }) => {
      if (!accountId) throw new Error('Account ID não encontrado');
      
      try {
        const response = await fetch('/api/lead-followups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create followup');
        }
        
        const result = await response.json();
        return result.data;
      } catch (error: any) {
        console.error('Erro ao adicionar follow-up:', error);
        toast({
          title: 'Erro ao adicionar follow-up',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Follow-up adicionado',
        description: 'Follow-up adicionado com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['leadFollowups', variables.lead_id] });
      queryClient.invalidateQueries({ queryKey: ['upcomingFollowups'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Hook para atualizar ou excluir um follow-up
export function useUpdateLeadFollowup() {
  const queryClient = useQueryClient();
  const { accountId } = useAccount();
  
  return useMutation({
    mutationFn: async (data: {
      id: string;
      lead_id: string;
      title?: string;
      description?: string;
      due_date?: string;
      assigned_to?: string;
      priority?: 'baixa' | 'média' | 'alta' | 'urgente';
      is_completed?: boolean;
      delete?: boolean;
    }) => {
      if (!accountId) throw new Error('Account ID não encontrado');
      
      try {
        if (data.delete) {
          const response = await fetch(`/api/lead-followups?id=${data.id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete followup');
          }
          
          return { id: data.id, deleted: true };
        } else {
          const response = await fetch('/api/lead-followups', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update followup');
          }
          
          const result = await response.json();
          return result.data;
        }
      } catch (error: any) {
        console.error('Erro ao atualizar follow-up:', error);
        toast({
          title: 'Erro ao atualizar follow-up',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      let title = 'Follow-up atualizado';
      let description = 'Follow-up atualizado com sucesso';
      
      if (variables.delete) {
        title = 'Follow-up excluído';
        description = 'Follow-up excluído com sucesso';
      } else if (variables.is_completed) {
        title = 'Follow-up concluído';
        description = 'Follow-up marcado como concluído';
      }
      
      toast({ title, description });
      queryClient.invalidateQueries({ queryKey: ['leadFollowups', variables.lead_id] });
      queryClient.invalidateQueries({ queryKey: ['upcomingFollowups'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Hook para buscar próximos follow-ups de um usuário
export function useUpcomingFollowups(userId?: string, daysAhead: number = 7) {
  const { accountId } = useAccount();
  
  return useQuery({
    queryKey: ['upcomingFollowups', userId, daysAhead],
    queryFn: async () => {
      if (!userId || !accountId) return [];
      
      try {
        const response = await fetch(`/api/lead-followups?user_id=${userId}&days_ahead=${daysAhead}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch upcoming followups');
        }
        
        const result = await response.json();
        const data = result.data || [];
        
        // Mapear tasks para o formato LeadFollowup
        return data.map((task: any) => ({
          id: task.id,
          lead_id: task.lead_id!,
          title: task.title,
          description: task.description,
          due_date: task.due_date || new Date().toISOString(),
          created_at: task.created_at,
          created_by: task.assigned_by || task.assigned_to,
          assigned_to: task.assigned_to,
          is_completed: task.status === 'completed',
          completed_at: task.completed_at,
          priority: (task.priority === 'low' ? 'baixa' : 
                    task.priority === 'medium' ? 'média' : 
                    task.priority === 'high' ? 'alta' : 'urgente') as LeadFollowup['priority'],
          lead: { id: task.lead_id! }
        })) as LeadFollowup[];
      } catch (error: any) {
        console.error('Erro ao carregar follow-ups:', error);
        console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
        throw error;
      }
    },
    enabled: !!userId && !!accountId,
  });
}