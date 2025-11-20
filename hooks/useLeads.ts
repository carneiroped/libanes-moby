'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAccount } from './useAccount';
import { leadsService, type LeadFilters, type LeadsResponse } from '@/lib/services/leads.service';
import { pipelinesService } from '@/lib/services/pipelines.service';
import { usersService } from '@/lib/services/users.service';
import type { Database } from '@/types/database.types';

// Tipos extraídos do database.types.ts
export type Lead = Database['public']['Tables']['leads']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];
export type LeadUpdate = Database['public']['Tables']['leads']['Update'];
export type PipelineStage = Database['public']['Tables']['pipeline_stages']['Row'];
export type LeadStatus = Database['public']['Enums']['lead_status'];

// Tipos para compatibilidade com componentes existentes
// Tipos estendidos para compatibilidade
export type LeadStage = PipelineStage & {
  sort_order?: number; // Para compatibilidade
  description?: string | null;
  created_at?: string;
  order?: number; // Adicionar para compatibilidade
};

export type LeadWithStage = Lead & {
  // Campos expandidos das relações para compatibilidade
  stage_name?: string | null;
  stage_color?: string | null;
  assigned_user_name?: string | null;
  // Mapeamento de campos antigos para novos
  contact_name?: string | null; // Mapeado de 'name'
  phone_number?: string | null; // Mapeado de 'phone'
  interest_level?: 'baixo' | 'médio' | 'alto' | 'muito_alto'; // Baseado em temperature
  lead_source?: string | null; // Mapeado de 'source'
  preferred_areas?: string[] | null; // Mapeado de desired_locations
  property_type?: string[] | null; // Mapeado de property_types
  bedrooms?: number | null; // Extraído de desired_features
  last_contact_date?: string | null; // Mapeado de last_contact_at
  chat_id?: string | null; // Pode vir de chats relacionados
  // Campos adicionais necessários
  stage_id?: string | null;
  last_contact_at?: string | null;
  assignee_id?: string | null;
};

export type User = {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
}

// Hook para carregar estágios de leads fixos (ENUM)
export function useLeadStages() {
  return useQuery({
    queryKey: ['leadStages'],
    queryFn: async () => {
      // Importar dinamicamente para evitar problemas de SSR
      const { PIPELINE_STAGES } = await import('@/lib/config/pipeline-stages');

      console.log('✅ [useLeadStages] Retornando estágios fixos ENUM:', PIPELINE_STAGES);

      // Mapear para formato esperado pelos componentes
      return PIPELINE_STAGES.map(stage => ({
        id: stage.id,
        name: stage.name,
        color: stage.color,
        order: stage.order,
        sort_order: stage.order, // Para compatibilidade
        description: stage.description,
        account_id: '', // Não usado com ENUM
        pipeline_id: '', // Não usado com ENUM
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })) as LeadStage[];
    },
    enabled: true,
    staleTime: Infinity, // Estágios fixos nunca ficam "stale"
  });
}

// Hook para carregar usuários da conta (via usersService)
export function useUsers() {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['users', account?.id],
    queryFn: async () => {
      try {
        console.log('🔍 [useUsers] Buscando usuários...');

        // Buscar usuários da conta
        const users = await usersService.getUsers({ active: true });

        if (!users || users.length === 0) {
          console.log('⚠️ [useUsers] Nenhum usuário encontrado, retornando lista vazia');
          return [];
        }

        // Mapear para formato esperado
        const mappedUsers = users.map(user => ({
          id: user.id,
          email: user.email,
          full_name: user.name,
          avatar_url: user.avatar || null
        })) as User[];

        console.log('✅ [useUsers] Usuários carregados:', mappedUsers.length);
        return mappedUsers;
      } catch (error: any) {
        console.error('❌ [useUsers] Erro ao carregar usuários:', error);
        return [];
      }
    },
    enabled: true,
  });
}

// Hook para carregar leads com filtros
export function useLeads(filters: LeadFilters = {}) {
  const { account } = useAccount();
  
  return useQuery({
    queryKey: ['leads', account?.id, filters],
    queryFn: async () => {
      // Em modo demo, não precisa de account
      if (!account?.id) {
        console.log('⚠️ [useLeads] Account não encontrado, mas continuando em modo demo');
      }
      
      try {
        console.log('🔍 [useLeads] Buscando leads com filtros:', filters);
        const result = await leadsService.getLeads(filters);
        console.log('✅ [useLeads] Leads recebidos:', result);
        return result;
      } catch (error: any) {
        console.error('❌ [useLeads] Erro ao carregar leads:', error);
        
        // Em caso de erro, retornar dados vazios
        return { 
          leads: [] as LeadWithStage[], 
          count: 0, 
          page: filters.page || 1, 
          pageSize: filters.pageSize || 20, 
          totalPages: 0
        };
      }
    },
    enabled: true, // Sempre habilitado em modo demo
  });
}

// Hook para carregar um lead específico
export function useLead(leadId?: string) {
  const { account } = useAccount();
  
  return useQuery({
    queryKey: ['lead', leadId, account?.id],
    queryFn: async () => {
      if (!leadId || !account?.id) {
        throw new Error('Lead ID and account context required');
      }
      
      try {
        return await leadsService.getLead(leadId);
      } catch (error: any) {
        console.error('Erro ao carregar lead:', error);
        return null;
      }
    },
    enabled: !!leadId && !!account?.id,
  });
}

// Hook para criar um novo lead
export function useCreateLead() {
  const queryClient = useQueryClient();
  const { account } = useAccount();

  return useMutation({
    mutationFn: async (leadData: Partial<LeadInsert>) => {
      if (!account?.id) {
        throw new Error('Account context required to create lead');
      }

      return await leadsService.createLead(leadData as any);
    },
    onSuccess: () => {
      // Invalidar queries para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead criado com sucesso!",
        description: "O lead foi adicionado ao sistema.",
      } as any);
    },
    onError: (error: any) => {
      console.error('Erro ao criar lead:', error);
      toast({
        title: "Erro ao criar lead",
        description: error.message || "Ocorreu um erro ao criar o lead.",
        variant: "destructive",
      });
    },
  });
}

// Hook para atualizar um lead
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<LeadUpdate>) => {
      console.log('Updating lead:', { id, updates });

      return await leadsService.updateLead(id, updates as any);
    },
    onSuccess: (data) => {
      // Invalidar queries para atualizar a lista e o lead específico
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', data.id] });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar lead:', error);
      toast({
        title: "Erro ao atualizar lead",
        description: error.message || "Ocorreu um erro ao atualizar o lead.",
        variant: "destructive",
      });
    },
  });
}

// Hook para deletar um lead
export function useDeleteLead() {
  const queryClient = useQueryClient();
  const { account } = useAccount();
  
  return useMutation({
    mutationFn: async (leadId: string) => {
      if (!account?.id) {
        throw new Error('Account context required to delete lead');
      }
      
      return await leadsService.deleteLead(leadId);
    },
    onSuccess: () => {
      // Invalidar queries para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead deletado com sucesso!",
        description: "O lead foi removido do sistema.",
      });
    },
    onError: (error: any) => {
      console.error('Erro ao deletar lead:', error);
      toast({
        title: "Erro ao deletar lead",
        description: error.message || "Ocorreu um erro ao deletar o lead.",
        variant: "destructive",
      });
    },
  });
}

// Funções auxiliares
export function formatPhone(phone: string | null): string {
  if (!phone) return '';
  
  // Remove tudo que não for número
  const cleaned = phone.replace(/\D/g, '');
  
  // Formata número brasileiro
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

export function getRelativeTime(date: string | null): string {
  if (!date) return 'Nunca';
  
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Agora';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d atrás`;
  
  return formatDate(date);
}

export function formatDate(date: string | null): string {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getInterestLevelColor(level: string): string {
  const colors: Record<string, string> = {
    'baixo': 'text-gray-600 bg-gray-100',
    'médio': 'text-blue-600 bg-blue-100',
    'alto': 'text-orange-600 bg-orange-100',
    'muito_alto': 'text-red-600 bg-red-100',
  };
  
  return colors[level] || colors['médio'];
}

export function getInterestLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    'baixo': 'Baixo',
    'médio': 'Médio',
    'alto': 'Alto',
    'muito_alto': 'Muito Alto',
  };
  
  return labels[level] || 'Médio';
}