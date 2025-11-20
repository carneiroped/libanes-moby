'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAccount } from '@/hooks/useAccount';

export type LeadNote = {
  id: string;
  lead_id: string;
  content: string;
  created_at: string;
  created_by: string;
  is_pinned: boolean;
  user_name?: string;
};

// Hook para carregar notas de um lead
export function useLeadNotes(leadId?: string) {
  const { accountId } = useAccount();
  
  return useQuery({
    queryKey: ['leadNotes', leadId],
    queryFn: async () => {
      if (!leadId || !accountId) return [];
      
      try {
        const response = await fetch(`/api/lead-notes?lead_id=${leadId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch notes');
        }
        
        const result = await response.json();
        return result.data || [];
      } catch (error: any) {
        console.error('Erro ao carregar notas:', error);
        toast({
          title: 'Erro ao carregar notas',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: !!leadId && !!accountId,
  });
}

// Hook para adicionar uma nota a um lead
export function useAddLeadNote() {
  const queryClient = useQueryClient();
  const { accountId } = useAccount();
  
  return useMutation({
    mutationFn: async (data: {
      lead_id: string;
      content: string;
      created_by: string;
      is_pinned?: boolean;
    }) => {
      if (!accountId) throw new Error('Account ID não encontrado');
      
      try {
        const response = await fetch('/api/lead-notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error('Failed to add note');
        }
        
        const result = await response.json();
        return result.data;
      } catch (error: any) {
        console.error('Erro ao adicionar nota:', error);
        toast({
          title: 'Erro ao adicionar nota',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Nota adicionada',
        description: 'Nota adicionada com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['leadNotes', variables.lead_id] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.lead_id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

// Hook para atualizar ou excluir uma nota
export function useUpdateLeadNote() {
  const queryClient = useQueryClient();
  const { accountId } = useAccount();
  
  return useMutation({
    mutationFn: async (data: {
      id: string;
      lead_id: string;
      content?: string;
      is_pinned?: boolean;
      delete?: boolean;
    }) => {
      if (!accountId) throw new Error('Account ID não encontrado');
      
      try {
        const response = await fetch('/api/lead-notes', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lead_id: data.lead_id,
            content: data.delete || data.content === '' ? null : data.content,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update note');
        }
        
        const result = await response.json();
        
        if (data.delete || data.content === '') {
          return { id: data.id, deleted: true };
        }
        
        return result.data;
      } catch (error: any) {
        console.error('Erro ao atualizar nota:', error);
        toast({
          title: 'Erro ao atualizar nota',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.delete ? 'Nota excluída' : 'Nota atualizada',
        description: variables.delete ? 'Nota excluída com sucesso' : 'Nota atualizada com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['leadNotes', variables.lead_id] });
    },
  });
}