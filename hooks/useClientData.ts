'use client';

import { useQuery } from '@tanstack/react-query';
import { azureClient } from '@/lib/azure-client';
import { usePortalAuth } from './usePortalAuth';
import { supabase } from '@/lib/supabase/client';

// Hook para buscar dados do cliente
export function useClientData() {
  const { clientData } = usePortalAuth();
  const azureApi = azureClient;

  return useQuery({
    queryKey: ['client-data', clientData?.id],
    queryFn: async () => {
      if (!clientData?.id) throw new Error('Cliente não identificado');

      // Buscar dados completos do cliente
      const { data: lead, error } = await supabase
        .from('leads')
        .select(`
          *,
          interactions:lead_interactions(count),
          notes:lead_notes(count),
          favorite_properties:lead_favorite_properties(
            property:properties(*)
          )
        `)
        .eq('id', clientData.id)
        .eq('account_id', clientData.account_id)
        .single();

      if (error) throw error;
      return lead;
    },
    enabled: !!clientData?.id
  });
}

// Hook para buscar imóveis favoritos do cliente
// NOTA: Tabela lead_favorite_properties não existe - retornando dados vazios
export function useClientFavorites() {
  const { clientData } = usePortalAuth();

  return useQuery({
    queryKey: ['client-favorites', clientData?.id],
    queryFn: async () => {
      // Tabela não existe no banco - retornando array vazio
      return [];
    },
    enabled: !!clientData?.id
  });
}

// Hook para buscar contratos do cliente
export function useClientContracts() {
  const { clientData } = usePortalAuth();

  return useQuery({
    queryKey: ['client-contracts', clientData?.id],
    queryFn: async () => {
      if (!clientData?.id) return [];

      try {
        // Use the API endpoint instead of direct Supabase access
        const response = await fetch(`/api/contracts?lead_id=${clientData.id}`, {
          headers: {
            'x-account-id': clientData.account_id
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch contracts');
        }

        const data = await response.json();
        return data || [];
      } catch (error) {
        console.error('Error fetching client contracts:', error);
        throw error;
      }
    },
    enabled: !!clientData?.id
  });
}

// Hook para buscar faturas do cliente
export function useClientInvoices() {
  const { clientData } = usePortalAuth();
  const azureApi = azureClient;

  return useQuery({
    queryKey: ['client-invoices', clientData?.id],
    queryFn: async () => {
      if (!clientData?.id) return [];

      // Primeiro, buscar faturas relacionadas aos contratos do cliente
      const { data: contracts } = await (supabase as any)
        .schema('financial')
        .from('contracts')
        .select('id')
        .eq('lead_id', clientData.id)
        .eq('account_id', clientData.account_id);

      let invoices = [];

      // Se houver contratos, buscar faturas relacionadas
      if (contracts && contracts.length > 0) {
        const contractIds = contracts.map((c: any) => c.id);

        const { data: contractInvoices, error: contractError } = await (supabase as any)
          .schema('financial')
          .from('invoices')
          .select('*')
          .in('contract_id', contractIds)
          .order('due_date', { ascending: false });

        if (contractError) throw contractError;
        invoices = contractInvoices || [];
      }

      // Também buscar faturas diretas (sem contrato) baseadas no email do cliente
      // Isso é útil para faturas avulsas ou administrativas
      const { data: directInvoices, error: directError } = await (supabase as any)
        .schema('financial')
        .from('invoices')
        .select('*')
        .eq('account_id', clientData.account_id)
        .is('contract_id', null)
        .order('due_date', { ascending: false });

      if (directError) throw directError;

      // Combinar e remover duplicatas
      const allInvoices = [...invoices, ...(directInvoices || [])];
      const uniqueInvoices = allInvoices.filter((invoice, index, self) =>
        index === self.findIndex((i) => i.id === invoice.id)
      );

      return uniqueInvoices;
    },
    enabled: !!clientData?.id
  });
}

// Hook para buscar documentos do cliente
export function useClientDocuments() {
  const { clientData } = usePortalAuth();
  const azureApi = azureClient;

  return useQuery({
    queryKey: ['client-documents', clientData?.id],
    queryFn: async () => {
      if (!clientData?.id) return [];

      // Buscar documentos relacionados ao cliente
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('metadata->>lead_id', clientData.id)
        .eq('account_id', clientData.account_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!clientData?.id
  });
}

// Hook para buscar mensagens não lidas
export function useClientUnreadMessages() {
  const { clientData } = usePortalAuth();
  const azureApi = azureClient;

  return useQuery({
    queryKey: ['client-unread-messages', clientData?.id],
    queryFn: async () => {
      if (!clientData?.id) return 0;

      // Buscar chats do cliente
      const { data: chats } = await supabase
        .from('chats')
        .select('id')
        .eq('lead_id', clientData.id)
        .eq('account_id', clientData.account_id);

      if (!chats || chats.length === 0) return 0;

      const chatIds = chats.map((c: any) => c.id);

      // Contar mensagens não lidas
      const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .in('chat_id', chatIds)
        .eq('sender_type', 'agent')
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!clientData?.id,
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });
}

// Hook para buscar histórico de interações
// NOTA: Tabela lead_interactions não existe - usando activities
export function useClientInteractions() {
  const { clientData } = usePortalAuth();

  return useQuery({
    queryKey: ['client-interactions', clientData?.id],
    queryFn: async () => {
      if (!clientData?.id) return [];

      // Usar tabela activities ao invés de lead_interactions
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          users:user_id (
            id,
            name,
            email
          )
        `)
        .eq('lead_id', clientData.id)
        .eq('account_id', clientData.account_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!clientData?.id
  });
}

// Hook para dashboard do cliente
export function useClientDashboard() {
  const { clientData } = usePortalAuth();
  const azureApi = azureClient;

  return useQuery({
    queryKey: ['client-dashboard', clientData?.id],
    queryFn: async () => {
      if (!clientData?.id) return null;

      // Buscar resumo de dados
      const [
        favoritesResult,
        { data: contracts },
        { count: unreadMessages },
        { data: recentInteractions }
      ] = await Promise.all([
        // Total de favoritos - tabela não existe, retornando 0
        Promise.resolve({ count: 0 }),

        // Contratos ativos
        fetch(`/api/contracts?lead_id=${clientData.id}`, {
          headers: { 'x-account-id': clientData.account_id }
        })
          .then(res => res.ok ? res.json() : [])
          .then(contracts => ({
            data: contracts.filter((c: any) => ['active', 'pending_signatures'].includes(c.status))
          }))
          .catch(() => ({ data: [] })),

        // Mensagens não lidas
        supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_type', 'agent')
          .eq('read', false),

        // Interações recentes - usar tabela activities
        supabase
          .from('activities')
          .select('*')
          .eq('lead_id', clientData.id)
          .eq('account_id', clientData.account_id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const { count: favoritesCount } = favoritesResult;

      // Buscar faturas pendentes dos contratos
      let pendingInvoices = 0;
      if (contracts && contracts.data && contracts.data.length > 0) {
        try {
          const contractIds = contracts.data.map((c: any) => c.id);
          const invoicesRes = await fetch(`/api/financial/invoices?status=pending`, {
            headers: { 'x-account-id': clientData.account_id }
          });
          if (invoicesRes.ok) {
            const invoicesData = await invoicesRes.json();
            const contractInvoices = invoicesData.invoices?.filter((inv: any) => 
              contractIds.includes(inv.contract_id)
            ) || [];
            pendingInvoices = contractInvoices.length;
          }
        } catch (error) {
          console.error('Error fetching pending invoices:', error);
        }
      }

      return {
        favoritesCount: favoritesCount || 0,
        activeContracts: contracts?.data?.filter((c: any) => c.status === 'active').length || 0,
        pendingSignatures: contracts?.data?.filter((c: any) => c.status === 'pending_signatures').length || 0,
        unreadMessages: unreadMessages || 0,
        pendingInvoices,
        recentInteractions: recentInteractions || []
      };
    },
    enabled: !!clientData?.id,
    refetchInterval: 60000 // Atualizar a cada minuto
  });
}