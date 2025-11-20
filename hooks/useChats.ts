'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from './useAccount';
import { Database } from '@/types/database.types';
import { toast } from '@/hooks/use-toast';

// Re-export types for compatibility
export type { ChatWithDetails, ChatMessageWithCompat } from '@/lib/services/chats.service';

// Tipos do V9
type MessageChannel = Database['public']['Enums']['message_channel'];
type ChatStatus = Database['public']['Enums']['chat_status'];

// Filters interface for API
interface ChatFilters {
  status?: ChatStatus;
  channel?: MessageChannel;
  assignee_id?: string;
  search?: string;
  lead_id?: string;
  phone?: string;
  page?: number;
  pageSize?: number;
}

// Função para formatar número de telefone
export const formatPhone = (phone: string | null) => {
  if (!phone) return '';
  
  // Remover caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Verificar o formato e aplicar máscara
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6, 10)}`;
  }
  
  // Retorna o formato internacional para outros casos
  if (phone.startsWith('+')) {
    if (cleaned.length >= 12) {
      return `+${cleaned.substring(0, 2)} (${cleaned.substring(2, 4)}) ${cleaned.substring(4, 9)}-${cleaned.substring(9, 13)}`;
    }
  }
  
  return phone;
};

export const useChats = (filters?: {
  status?: ChatStatus;
  channel?: MessageChannel;
  assignee_id?: string;
  search?: string;
}) => {
  const queryClient = useQueryClient();
  const { account } = useAccount();

  // Hook para obter todas as conversas (via API)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['chats', account?.id, filters],
    queryFn: async () => {
      try {
        console.log('🔍 [useChats] Buscando chats com filtros:', filters);

        // Build query params
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.channel) params.append('channel', filters.channel);
        if (filters?.assignee_id) params.append('assignee_id', filters.assignee_id);
        if (filters?.search) params.append('search', filters.search);
        params.append('pageSize', '100');

        const response = await fetch(`/api/chats?${params}`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch chats');
        }

        const result = await response.json();
        const chats = result.chats || [];

        console.log('✅ [useChats] Chats carregados:', chats.length);
        return chats;
      } catch (error: any) {
        console.error('❌ [useChats] Erro ao carregar chats:', error);
        return [];
      }
    },
    enabled: true // Sempre habilitado
  });

  const chats = data || [];

  // Função para obter mensagens de uma conversa específica (via API)
  const getChatMessages = async (chatId: string) => {
    try {
      console.log('🔍 [useChats.getChatMessages] Buscando mensagens do chat:', chatId);

      const response = await fetch(`/api/chats/messages?chat_id=${chatId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch messages');
      }

      const messages = await response.json();
      console.log('✅ [useChats.getChatMessages] Mensagens carregadas:', messages.length);
      return messages;
    } catch (error: any) {
      console.error(`❌ [useChats.getChatMessages] Erro ao obter mensagens do chat ${chatId}:`, error);
      throw error;
    }
  };

  // Função para obter mensagens por telefone (compatibilidade, via API)
  const getChatMessagesByPhone = async (phone: string) => {
    try {
      console.log('🔍 [useChats.getChatMessagesByPhone] Buscando mensagens do telefone:', phone);

      const response = await fetch(`/api/chats/messages?phone=${encodeURIComponent(phone)}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch messages');
      }

      const messages = await response.json();
      console.log('✅ [useChats.getChatMessagesByPhone] Mensagens carregadas:', messages.length);
      return messages;
    } catch (error: any) {
      console.error(`❌ [useChats.getChatMessagesByPhone] Erro ao obter mensagens do telefone ${phone}:`, error);
      throw error;
    }
  };
  
  // Mutation para criar nova mensagem (via API)
  const sendMessage = useMutation({
    mutationFn: async ({
      chatId,
      content,
      isFromLead = false
    }: {
      chatId: string;
      content: string;
      isFromLead?: boolean;
    }) => {
      console.log('🔄 [useChats.sendMessage] Enviando mensagem:', chatId);

      const response = await fetch('/api/chats/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_message: isFromLead ? content : null,
          bot_message: !isFromLead ? content : null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      return await response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.chatId] });
      console.log('✅ [useChats.sendMessage] Mensagem enviada com sucesso');
      toast({
        title: 'Mensagem enviada!',
        description: 'A mensagem foi enviada com sucesso.',
      });
    },
    onError: (error: any) => {
      console.error('❌ [useChats.sendMessage] Erro:', error);
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message || 'Não foi possível enviar a mensagem.',
        variant: 'destructive',
      });
    }
  });

  // Mutation para atualizar status do chat (via API)
  const updateChatStatus = useMutation({
    mutationFn: async ({
      chatId,
      status
    }: {
      chatId: string;
      status: ChatStatus;
    }) => {
      console.log('🔄 [useChats.updateChatStatus] Atualizando status:', chatId, status);

      const response = await fetch('/api/chats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: chatId, status })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      console.log('✅ [useChats.updateChatStatus] Status atualizado com sucesso');
      toast({
        title: 'Status atualizado!',
        description: 'O status do chat foi atualizado.',
      });
    },
    onError: (error: any) => {
      console.error('❌ [useChats.updateChatStatus] Erro:', error);
      toast({
        title: 'Erro ao atualizar status',
        description: error.message || 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    }
  });

  return {
    chats,
    isLoading,
    isError,
    getChatMessages,
    getChatMessagesByPhone, // Para compatibilidade
    sendMessage,
    updateChatStatus,
    formatPhone
  };
};

// Hook para mensagens de um chat específico (via API)
export const useChatMessages = (chatId?: string) => {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['chatMessages', chatId, account?.id],
    queryFn: async () => {
      if (!chatId) return [];

      try {
        console.log('🔍 [useChatMessages] Buscando mensagens do chat:', chatId);

        const response = await fetch(`/api/chats/messages?chat_id=${chatId}`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch messages');
        }

        const messages = await response.json();
        console.log('✅ [useChatMessages] Mensagens carregadas:', messages.length);
        return messages;
      } catch (error: any) {
        console.error('❌ [useChatMessages] Erro ao carregar mensagens:', error);
        return [];
      }
    },
    enabled: !!chatId
  });
};

export default useChats;