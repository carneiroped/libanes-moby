import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database } from '@/types/supabase';
import { useAccountContext } from '@/providers/account-context';

type Account = Database['public']['Tables']['accounts']['Row'];

interface AccountLimits {
  maxUsers: number;
  maxProperties: number;
  maxLeadsMonth: number;
  maxAiCreditsMonth: number;
  currentUsers: number;
  currentProperties: number;
  currentLeadsMonth: number;
  aiCreditsUsedMonth: number;
}

interface UseAccountReturn {
  account: Account | null;
  accountId: string;
  limits: AccountLimits | null;
  isLoading: boolean;
  error: Error | null;
  checkLimit: (resource: keyof AccountLimits, amount?: number) => boolean;
  consumeAiCredits: (credits: number) => Promise<void>;
  refreshAccount: () => void;
}

export function useAccount(): UseAccountReturn {
  const queryClient = useQueryClient();
  
  // Obter account_id do contexto
  const { accountId, isLoading: contextLoading } = useAccountContext();
  const safeAccountId = accountId || '';

  // Buscar dados da conta via API
  const { data: account, isLoading: queryLoading, error, refetch } = useQuery({
    queryKey: ['account', safeAccountId],
    enabled: !!safeAccountId,
    queryFn: async () => {
      try {
        const response = await fetch('/api/account');

        if (!response.ok) {
          const error = await response.json();
          console.error('[useAccount] API error:', error);
          return null;
        }

        const data = await response.json();
        console.log('[useAccount] Account data fetched:', data);
        return data as Account;
      } catch (error) {
        console.error('[useAccount] Fetch error:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1, // Only retry once
  });

  const isLoading = contextLoading || queryLoading;

  // Calcular limites da conta a partir do campo limits (jsonb)
  const limits: AccountLimits | null = account ? (() => {
    const accountLimits = account.limits as Record<string, any> | null;
    const accountUsage = account.usage as Record<string, any> | null;

    return {
      maxUsers: accountLimits?.max_users || 10,
      maxProperties: accountLimits?.max_properties || 100,
      maxLeadsMonth: accountLimits?.max_leads_month || 1000,
      maxAiCreditsMonth: accountLimits?.max_ai_credits_month || 5000,
      currentUsers: accountUsage?.current_users || 0,
      currentProperties: accountUsage?.current_properties || 0,
      currentLeadsMonth: accountUsage?.current_leads_month || 0,
      aiCreditsUsedMonth: accountUsage?.ai_credits_used_month || 0,
    };
  })() : null;

  // Verificar se um recurso está dentro do limite
  const checkLimit = useCallback((resource: keyof AccountLimits, amount: number = 1): boolean => {
    if (!limits) return false;

    switch (resource) {
      case 'currentUsers':
        return (limits.currentUsers + amount) <= limits.maxUsers;
      case 'currentProperties':
        return (limits.currentProperties + amount) <= limits.maxProperties;
      case 'currentLeadsMonth':
        return (limits.currentLeadsMonth + amount) <= limits.maxLeadsMonth;
      case 'aiCreditsUsedMonth':
        return (limits.aiCreditsUsedMonth + amount) <= limits.maxAiCreditsMonth;
      default:
        return true;
    }
  }, [limits]);

  // Mutation para consumir créditos de IA via API
  const consumeAiCreditsMutation = useMutation({
    mutationFn: async (credits: number) => {
      if (!account) throw new Error('Account not loaded');

      const response = await fetch('/api/account/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credits }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[useAccount] Error consuming AI credits:', error);
        throw new Error(error.error || 'Failed to consume AI credits');
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', safeAccountId] });
    },
  });

  // Função para consumir créditos de IA
  const consumeAiCredits = async (credits: number) => {
    if (!checkLimit('aiCreditsUsedMonth', credits)) {
      throw new Error('Limite de créditos de IA excedido');
    }
    await consumeAiCreditsMutation.mutateAsync(credits);
  };

  // Função para atualizar dados da conta
  const refreshAccount = () => {
    refetch();
  };

  // Monitorar mudanças em tempo real via API
  useEffect(() => {
    if (!safeAccountId) return;
    
    // Polling para atualizações (pode ser substituído por WebSocket)
    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 segundos
    
    return () => clearInterval(interval);
  }, [safeAccountId, refetch]);

  return {
    account: account || null,
    accountId: safeAccountId,
    limits,
    isLoading,
    error: error as Error | null,
    checkLimit,
    consumeAiCredits,
    refreshAccount,
  };
}

// Hook para verificar features específicas do plano
export function useAccountFeatures() {
  const { account } = useAccount();

  const hasFeature = useCallback((feature: string): boolean => {
    if (!account?.settings) return false;
    const settings = account.settings as any;
    const features = settings.features as Record<string, boolean> | undefined;
    return features?.[feature] === true;
  }, [account]);

  const planLevel = useCallback((): number => {
    if (!account?.plan) return 0;

    const planLevels: Record<string, number> = {
      'trial': 0,
      'free': 0,
      'starter': 1,
      'professional': 2,
      'enterprise': 3,
    };

    return planLevels[account.plan as string] || 0;
  }, [account]);

  return {
    hasFeature,
    planLevel,
    isPro: planLevel() >= 2,
    isEnterprise: planLevel() >= 3,
  };
}