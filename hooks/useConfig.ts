import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export interface AccountConfig {
  id: string;
  name: string;
  slug: string;
  cnpj?: string;
  creci?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address?: any;
  timezone: string;
  plan: string;
  max_users: number;
  max_properties: number;
  max_leads_month: number;
  max_ai_credits_month: number;
  current_users: number;
  current_properties: number;
  current_leads_month: number;
  ai_credits_used_month: number;
  settings: any;
  features: any;
  business_hours: any;
  customization: any;
  billing_email?: string;
  billing_cycle: string;
  is_active: boolean;
  is_verified: boolean;
  trial_ends_at?: string;
}

export function useConfig() {
  const queryClient = useQueryClient();

  const {
    data: config,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['config'],
    queryFn: async (): Promise<AccountConfig> => {
      const response = await fetch('/api/config');
      if (!response.ok) {
        throw new Error('Falha ao carregar configurações');
      }
      const result = await response.json();
      return result.data;
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ section, data }: { section: string; data: any }) => {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ section, data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao atualizar configurações');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      toast({
        title: 'Sucesso',
        description: data.message || 'Configurações atualizadas com sucesso',
        variant: 'default'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar configurações',
        variant: 'destructive'
      });
    }
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ featureKey, enabled }: { featureKey: string; enabled: boolean }) => {
      const response = await fetch('/api/config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featureKey, enabled }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao atualizar feature');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      toast({
        title: 'Sucesso',
        description: data.message || 'Feature atualizada com sucesso',
        variant: 'default'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar feature',
        variant: 'destructive'
      });
    }
  });

  return {
    config,
    isLoading,
    isError,
    error,
    updateConfig: updateConfigMutation.mutate,
    toggleFeature: toggleFeatureMutation.mutate,
    isUpdating: updateConfigMutation.isPending || toggleFeatureMutation.isPending
  };
}