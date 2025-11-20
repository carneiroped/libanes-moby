'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAccount } from './useAccount';
import { Database } from '@/types/database.types';

// Tipos do banco V9
type WhatsAppIntegration = Database['public']['Tables']['whatsapp_integrations']['Row'];
type WhatsAppIntegrationInsert = Database['public']['Tables']['whatsapp_integrations']['Insert'];
type WhatsAppIntegrationUpdate = Database['public']['Tables']['whatsapp_integrations']['Update'];

type PortalIntegration = Database['public']['Tables']['portal_integrations']['Row'];
type PortalIntegrationInsert = Database['public']['Tables']['portal_integrations']['Insert'];
type PortalIntegrationUpdate = Database['public']['Tables']['portal_integrations']['Update'];

type Integration = Database['public']['Tables']['integrations']['Row'];
type IntegrationInsert = Database['public']['Tables']['integrations']['Insert'];
type IntegrationUpdate = Database['public']['Tables']['integrations']['Update'];

// Tipos estendidos
export type WhatsAppIntegrationWithStatus = WhatsAppIntegration & {
  connection_status?: 'connected' | 'disconnected' | 'error';
  last_message_at?: string;
  message_count?: number;
};

export type PortalIntegrationWithMetrics = PortalIntegration & {
  sync_progress?: number;
  last_sync_duration?: number;
  pending_updates?: number;
};

// Hook para listar integrações WhatsApp
export function useWhatsAppIntegrations() {
  const { account } = useAccount();
  
  return useQuery({
    queryKey: ['whatsapp-integrations', account?.id],
    queryFn: async () => {
      // Modo demo - retornar integrações mockadas
      console.log('🎭 Modo demo: retornando integrações WhatsApp mockadas');
      
      const mockIntegrations: any[] = [
        {
          id: 'whats-1',
          account_id: 'demo-account',
          type: 'official',
          name: 'WhatsApp Business Principal',
          phone_number: '+55 11 98765-4321',
          instance_id: 'instance-001',
          config: { webhook_url: 'https://api.moby.casa/webhook' },
          is_active: true,
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          connection_status: 'connected',
          last_message_at: new Date(Date.now() - 1800000).toISOString(),
          message_count: 1245
        },
        {
          id: 'whats-2',
          account_id: 'demo-account',
          type: 'evolution',
          name: 'WhatsApp Suporte',
          phone_number: '+55 11 91234-5678',
          instance_id: 'instance-002',
          config: { evolution_url: 'http://localhost:8080' },
          is_active: false,
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          connection_status: 'disconnected',
          last_message_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          message_count: 523
        }
      ];

      return mockIntegrations as WhatsAppIntegrationWithStatus[];
    },
    enabled: true // Sempre habilitado em modo demo
  });
}

// Hook para listar integrações de portais
export function usePortalIntegrations() {
  const { account } = useAccount();
  
  return useQuery({
    queryKey: ['portal-integrations', account?.id],
    queryFn: async () => {
      // Modo demo - retornar integrações mockadas
      console.log('🎭 Modo demo: retornando integrações de portais mockadas');
      
      const mockPortals: any[] = [
        {
          id: 'portal-1',
          account_id: 'demo-account',
          portal: 'zap',
          account_name: 'Imobiliária Demo - ZAP',
          credentials: {},
          api_key: 'zap_key_xxxxx',
          sync_enabled: true,
          sync_config: { interval: 'hourly', auto_publish: true },
          last_sync_at: new Date(Date.now() - 3600000).toISOString(),
          is_active: true,
          created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString(),
          sync_progress: 100,
          last_sync_duration: 45,
          pending_updates: 0
        },
        {
          id: 'portal-2',
          account_id: 'demo-account',
          portal: 'vivareal',
          account_name: 'Imobiliária Demo - VivaReal',
          credentials: {},
          api_key: 'vivareal_key_xxxxx',
          sync_enabled: true,
          sync_config: { interval: 'daily', auto_publish: false },
          last_sync_at: new Date(Date.now() - 86400000).toISOString(),
          is_active: true,
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          sync_progress: 100,
          last_sync_duration: 120,
          pending_updates: 3
        },
        {
          id: 'portal-3',
          account_id: 'demo-account',
          portal: 'olx',
          account_name: 'Imobiliária Demo - OLX',
          credentials: {},
          api_key: null,
          sync_enabled: false,
          sync_config: {},
          last_sync_at: null,
          is_active: false,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          sync_progress: 0,
          last_sync_duration: 0,
          pending_updates: 0
        }
      ];

      return mockPortals as PortalIntegrationWithMetrics[];
    },
    enabled: true // Sempre habilitado em modo demo
  });
}

// Hook para listar outras integrações
export function useOtherIntegrations() {
  const { account } = useAccount();
  
  return useQuery({
    queryKey: ['integrations', account?.id],
    queryFn: async () => {
      // Modo demo - retornar integrações mockadas
      console.log('🎭 Modo demo: retornando outras integrações mockadas');
      
      const mockIntegrations: any[] = [
        {
          id: 'int-1',
          account_id: 'demo-account',
          type: 'google_calendar',
          name: 'Google Calendar',
          config: { calendar_id: 'primary' },
          is_active: true,
          created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'int-2',
          account_id: 'demo-account',
          type: 'mailchimp',
          name: 'Mailchimp',
          config: { api_key: 'mc_xxxxx', list_id: 'list_123' },
          is_active: true,
          created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'int-3',
          account_id: 'demo-account',
          type: 'zapier',
          name: 'Zapier',
          config: { webhook_url: 'https://hooks.zapier.com/xxxxx' },
          is_active: false,
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'int-4',
          account_id: 'demo-account',
          type: 'facebook_leads',
          name: 'Facebook Lead Ads',
          config: { page_id: 'page_123', access_token: 'fb_xxxxx' },
          is_active: true,
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      return mockIntegrations as Integration[];
    },
    enabled: true // Sempre habilitado em modo demo
  });
}

// Hook para criar integração WhatsApp
export function useCreateWhatsAppIntegration() {
  const queryClient = useQueryClient();
  const { account } = useAccount();
  
  return useMutation({
    mutationFn: async (data: {
      type: 'official' | 'evolution';
      name: string;
      phone_number: string;
      instance_id?: string;
      config: any;
    }) => {
      if (!account?.id) throw new Error('Conta não encontrada');
      
      try {
        const response = await fetch('/api/integrations/whatsapp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create WhatsApp integration');
        }

        const integration = await response.json();
        return integration;
      } catch (error: any) {
        console.error('Erro ao criar integração WhatsApp:', error);
        toast({
          title: 'Erro ao criar integração',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Integração criada',
        description: 'Integração WhatsApp criada com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-integrations'] });
    },
  });
}

// Hook para atualizar integração WhatsApp
export function useUpdateWhatsAppIntegration() {
  const queryClient = useQueryClient();
  const { account } = useAccount();
  
  return useMutation({
    mutationFn: async ({ id, data }: { 
      id: string; 
      data: Partial<WhatsAppIntegrationUpdate> 
    }) => {
      if (!account?.id) throw new Error('Conta não encontrada');
      
      try {
        const response = await fetch('/api/integrations/whatsapp', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, ...data }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update WhatsApp integration');
        }

        const updated = await response.json();
        return updated;
      } catch (error: any) {
        console.error('Erro ao atualizar integração WhatsApp:', error);
        toast({
          title: 'Erro ao atualizar integração',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Integração atualizada',
        description: 'Integração WhatsApp atualizada com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-integrations'] });
    },
  });
}

// Hook para criar integração de portal
export function useCreatePortalIntegration() {
  const queryClient = useQueryClient();
  const { account } = useAccount();
  
  return useMutation({
    mutationFn: async (data: {
      portal: 'zap' | 'vivareal' | 'olx' | 'imovelweb' | 'mercadolivre';
      account_name: string;
      credentials: any;
      api_key?: string;
      sync_config?: any;
    }) => {
      if (!account?.id) throw new Error('Conta não encontrada');
      
      try {
        const response = await fetch('/api/integrations/portals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create portal integration');
        }

        const integration = await response.json();
        return integration;
      } catch (error: any) {
        console.error('Erro ao criar integração de portal:', error);
        toast({
          title: 'Erro ao criar integração',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Integração criada',
        description: 'Integração com portal criada com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['portal-integrations'] });
    },
  });
}

// Hook para atualizar integração de portal
export function useUpdatePortalIntegration() {
  const queryClient = useQueryClient();
  const { account } = useAccount();
  
  return useMutation({
    mutationFn: async ({ id, data }: { 
      id: string; 
      data: Partial<PortalIntegrationUpdate> 
    }) => {
      if (!account?.id) throw new Error('Conta não encontrada');
      
      try {
        const response = await fetch('/api/integrations/portals', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, ...data }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update portal integration');
        }

        const updated = await response.json();
        return updated;
      } catch (error: any) {
        console.error('Erro ao atualizar integração de portal:', error);
        toast({
          title: 'Erro ao atualizar integração',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Integração atualizada',
        description: 'Integração com portal atualizada com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['portal-integrations'] });
    },
  });
}

// Hook para excluir integração WhatsApp
export function useDeleteWhatsAppIntegration() {
  const queryClient = useQueryClient();
  const { account } = useAccount();
  
  return useMutation({
    mutationFn: async (integrationId: string) => {
      if (!account?.id) throw new Error('Conta não encontrada');
      
      try {
        const response = await fetch(`/api/integrations/whatsapp?id=${integrationId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete WhatsApp integration');
        }
        
        return integrationId;
      } catch (error: any) {
        console.error('Erro ao excluir integração WhatsApp:', error);
        toast({
          title: 'Erro ao excluir integração',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Integração excluída',
        description: 'Integração WhatsApp excluída com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-integrations'] });
    },
  });
}

// Hook para excluir integração de portal
export function useDeletePortalIntegration() {
  const queryClient = useQueryClient();
  const { account } = useAccount();
  
  return useMutation({
    mutationFn: async (integrationId: string) => {
      if (!account?.id) throw new Error('Conta não encontrada');
      
      try {
        const response = await fetch(`/api/integrations/portals?id=${integrationId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete portal integration');
        }
        
        return integrationId;
      } catch (error: any) {
        console.error('Erro ao excluir integração de portal:', error);
        toast({
          title: 'Erro ao excluir integração',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Integração excluída',
        description: 'Integração com portal excluída com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['portal-integrations'] });
    },
  });
}

// Hook para sincronizar portal
export function useSyncPortal() {
  const { account } = useAccount();
  
  return useMutation({
    mutationFn: async (integrationId: string) => {
      if (!account?.id) throw new Error('Conta não encontrada');
      
      try {
        const response = await fetch('/api/integrations/portals/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ integrationId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to sync portal');
        }

        const data = await response.json();
        return data;
      } catch (error: any) {
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Sincronização concluída',
        description: 'Portal sincronizado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro na sincronização',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}