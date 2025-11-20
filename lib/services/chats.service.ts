'use server';

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

// Tipos do banco de dados V9
type Chat = Database['public']['Tables']['chats']['Row'];
type ChatInsert = Database['public']['Tables']['chats']['Insert'];
type ChatUpdate = Database['public']['Tables']['chats']['Update'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert'];
type MessageChannel = Database['public']['Enums']['message_channel'];
type ChatStatus = Database['public']['Enums']['chat_status'];

// Tipos estendidos para compatibilidade
export type ChatWithDetails = Chat & {
  messages_count?: number;
  user_name?: string;
  lead_name?: string;
  lead_phone?: string | null; // Telefone do lead
  last_message?: string;
  last_message_preview?: string | null; // Preview da última mensagem
  channel_chat_id?: string; // ID do chat no canal (ex: WhatsApp)
  app?: string; // Mapeado de channel
};

export type ChatMessageWithCompat = ChatMessage & {
  user_name?: string | null;
  app?: string; // Mapeado de channel do chat
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'; // Status de entrega
};

// Filtros para busca de chats
export interface ChatFilters {
  status?: ChatStatus;
  channel?: MessageChannel;
  assignee_id?: string;
  search?: string;
  lead_id?: string;
  phone?: string;
  page?: number;
  pageSize?: number;
}

// Resposta paginada
export interface ChatsResponse {
  chats: ChatWithDetails[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Obter account_id do usuário logado
 */
async function getUserAccountId(): Promise<string> {
  const supabase = await createClient();
  const client = supabase as any;

  const authResult = await client.auth.getUser();
  const user = authResult.data?.user;
  const error = authResult.error;

  if (error || !user) {
    throw new Error('Usuário não autenticado');
  }

  // Buscar account_id do usuário na tabela users
  const userQuery = await client
    .from('users')
    .select('account_id')
    .eq('id', user.id)
    .single();

  if (userQuery.error || !userQuery.data) {
    throw new Error('Conta do usuário não encontrada');
  }

  return userQuery.data.account_id as string;
}

/**
 * Buscar chats com filtros
 */
export async function getChats(filters: ChatFilters = {}): Promise<ChatsResponse> {
  try {
    console.log('🔍 [chatsService.getChats] Buscando chats com filtros:', filters);

    const supabase = await createClient();
    const client = supabase as any;
    const accountId = await getUserAccountId();

    const {
      status,
      channel,
      assignee_id,
      search,
      lead_id,
      phone,
      page = 1,
      pageSize = 20
    } = filters;

    // Query base com RLS
    let query = client
      .from('chats')
      .select(`
        *,
        leads!chats_lead_id_fkey (
          name
        )
      `, { count: 'exact' })
      .eq('account_id', accountId);

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status);
    }

    if (channel) {
      query = query.eq('channel', channel);
    }

    if (assignee_id) {
      query = query.eq('assignee_id', assignee_id);
    }

    if (lead_id) {
      query = query.eq('lead_id', lead_id);
    }

    if (phone) {
      query = query.eq('phone', phone);
    }

    // Busca por texto (phone, conversation_id, notas)
    if (search) {
      query = query.or(`phone.ilike.%${search}%,conversation_id.ilike.%${search}%,notes.ilike.%${search}%`);
    }

    // Ordenação por última mensagem (mais recente primeiro)
    query = query.order('last_message_at', { ascending: false, nullsFirst: false });

    // Paginação
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ [chatsService.getChats] Erro ao buscar chats:', error);
      throw error;
    }

    // Mapear dados para incluir informações expandidas
    const chatsWithDetails: ChatWithDetails[] = (data || []).map((chat: any) => {
      // Buscar lead name
      const leadData = chat.leads as any;
      const leadName = leadData?.name || null;

      return {
        ...chat,
        lead_name: leadName,
        user_name: leadName, // Para compatibilidade
        lead_phone: chat.phone, // Telefone do lead
        last_message_preview: null, // TODO: buscar última mensagem
        channel_chat_id: chat.conversation_id, // ID do chat no canal
        app: chat.channel, // Para compatibilidade
        messages_count: 0, // TODO: calcular ou buscar do banco
      };
    });

    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    console.log(`✅ [chatsService.getChats] ${chatsWithDetails.length} chats encontrados`);

    return {
      chats: chatsWithDetails,
      count: count || 0,
      page,
      pageSize,
      totalPages
    };
  } catch (error: any) {
    console.error('❌ [chatsService.getChats] Erro:', error);
    throw error;
  }
}

/**
 * Buscar um chat específico por ID
 */
export async function getChat(chatId: string): Promise<ChatWithDetails | null> {
  try {
    console.log('🔍 [chatsService.getChat] Buscando chat:', chatId);

    const supabase = await createClient();
    const client = supabase as any;
    const accountId = await getUserAccountId();

    const { data, error } = await client
      .from('chats')
      .select(`
        *,
        leads!chats_lead_id_fkey (
          name
        )
      `)
      .eq('id', chatId)
      .eq('account_id', accountId)
      .single();

    if (error) {
      console.error('❌ [chatsService.getChat] Erro:', error);
      throw error;
    }

    if (!data) {
      console.log('⚠️ [chatsService.getChat] Chat não encontrado');
      return null;
    }

    // Mapear dados
    const leadData = data.leads as any;
    const leadName = leadData?.name || null;

    const chatWithDetails: ChatWithDetails = {
      ...data,
      lead_name: leadName,
      user_name: leadName,
      lead_phone: data.phone,
      last_message_preview: null, // TODO: buscar última mensagem
      channel_chat_id: data.conversation_id,
      app: data.channel,
      messages_count: 0, // TODO: calcular
    };

    console.log('✅ [chatsService.getChat] Chat encontrado:', chatWithDetails.id);
    return chatWithDetails;
  } catch (error: any) {
    console.error('❌ [chatsService.getChat] Erro:', error);
    throw error;
  }
}

/**
 * Criar um novo chat
 */
export async function createChat(chatData: Partial<ChatInsert>): Promise<Chat> {
  try {
    console.log('🔄 [chatsService.createChat] Criando chat:', chatData);

    const supabase = await createClient();
    const client = supabase as any;
    const accountId = await getUserAccountId();

    // Dados do chat com account_id
    const newChat: ChatInsert = {
      account_id: accountId,
      lead_id: chatData.lead_id || null,
      phone: chatData.phone || null,
      conversation_id: chatData.conversation_id || null,
      channel: chatData.channel || 'webchat',
      channel_chat_id: chatData.conversation_id || `chat_${Date.now()}`, // Obrigatório
      status: chatData.status || 'active',
      last_message_at: chatData.last_message_at || new Date().toISOString(),
      assignee_id: chatData.assignee_id || null,
      // tags, notes e metadata removidos pois não existem no schema
    };

    const { data, error } = await client
      .from('chats')
      .insert(newChat)
      .select()
      .single();

    if (error) {
      console.error('❌ [chatsService.createChat] Erro:', error);
      throw error;
    }

    console.log('✅ [chatsService.createChat] Chat criado:', data.id);
    return data;
  } catch (error: any) {
    console.error('❌ [chatsService.createChat] Erro:', error);
    throw error;
  }
}

/**
 * Atualizar um chat
 */
export async function updateChat(chatId: string, updates: Partial<ChatUpdate>): Promise<Chat> {
  try {
    console.log('🔄 [chatsService.updateChat] Atualizando chat:', chatId, updates);

    const supabase = await createClient();
    const client = supabase as any;
    const accountId = await getUserAccountId();

    const { data, error } = await client
      .from('chats')
      .update(updates)
      .eq('id', chatId)
      .eq('account_id', accountId)
      .select()
      .single();

    if (error) {
      console.error('❌ [chatsService.updateChat] Erro:', error);
      throw error;
    }

    console.log('✅ [chatsService.updateChat] Chat atualizado:', data.id);
    return data;
  } catch (error: any) {
    console.error('❌ [chatsService.updateChat] Erro:', error);
    throw error;
  }
}

/**
 * Deletar um chat
 */
export async function deleteChat(chatId: string): Promise<boolean> {
  try {
    console.log('🗑️ [chatsService.deleteChat] Deletando chat:', chatId);

    const supabase = await createClient();
    const client = supabase as any;
    const accountId = await getUserAccountId();

    const { error } = await client
      .from('chats')
      .delete()
      .eq('id', chatId)
      .eq('account_id', accountId);

    if (error) {
      console.error('❌ [chatsService.deleteChat] Erro:', error);
      throw error;
    }

    console.log('✅ [chatsService.deleteChat] Chat deletado');
    return true;
  } catch (error: any) {
    console.error('❌ [chatsService.deleteChat] Erro:', error);
    throw error;
  }
}

/**
 * Buscar mensagens de um chat
 */
export async function getChatMessages(chatId: string): Promise<ChatMessageWithCompat[]> {
  try {
    console.log('🔍 [chatsService.getChatMessages] Buscando mensagens do chat:', chatId);

    const supabase = await createClient();
    const client = supabase as any;
    const accountId = await getUserAccountId();

    // Verificar se o chat pertence à conta
    const { data: chat, error: chatError } = await client
      .from('chats')
      .select('id, channel')
      .eq('id', chatId)
      .eq('account_id', accountId)
      .single();

    if (chatError || !chat) {
      console.error('❌ [chatsService.getChatMessages] Chat não encontrado ou sem permissão');
      throw new Error('Chat não encontrado');
    }

    // Buscar mensagens
    const { data, error } = await client
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ [chatsService.getChatMessages] Erro:', error);
      throw error;
    }

    // Mapear para incluir compatibilidade
    const messages: ChatMessageWithCompat[] = (data || []).map((msg: any) => ({
      ...msg,
      app: chat.channel, // Incluir channel do chat para compatibilidade
    }));

    console.log(`✅ [chatsService.getChatMessages] ${messages.length} mensagens encontradas`);
    return messages;
  } catch (error: any) {
    console.error('❌ [chatsService.getChatMessages] Erro:', error);
    throw error;
  }
}

/**
 * Buscar mensagens por telefone (compatibilidade)
 */
export async function getChatMessagesByPhone(phone: string): Promise<ChatMessageWithCompat[]> {
  try {
    console.log('🔍 [chatsService.getChatMessagesByPhone] Buscando mensagens do telefone:', phone);

    const supabase = await createClient();
    const client = supabase as any;
    const accountId = await getUserAccountId();

    // Buscar chat pelo telefone
    const { data: chats, error: chatError } = await client
      .from('chats')
      .select('id, channel')
      .eq('phone', phone)
      .eq('account_id', accountId);

    if (chatError) {
      console.error('❌ [chatsService.getChatMessagesByPhone] Erro ao buscar chat:', chatError);
      throw chatError;
    }

    if (!chats || chats.length === 0) {
      console.log('⚠️ [chatsService.getChatMessagesByPhone] Nenhum chat encontrado para o telefone');
      return [];
    }

    // Buscar mensagens de todos os chats com esse telefone
    const chatIds = chats.map((c: any) => c.id);

    const { data, error } = await client
      .from('chat_messages')
      .select('*')
      .in('chat_id', chatIds)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ [chatsService.getChatMessagesByPhone] Erro:', error);
      throw error;
    }

    // Mapear para incluir compatibilidade
    const messages: ChatMessageWithCompat[] = (data || []).map((msg: any) => {
      const chat = chats.find((c: any) => c.id === msg.chat_id);
      return {
        ...msg,
        app: chat?.channel || 'webchat',
      };
    });

    console.log(`✅ [chatsService.getChatMessagesByPhone] ${messages.length} mensagens encontradas`);
    return messages;
  } catch (error: any) {
    console.error('❌ [chatsService.getChatMessagesByPhone] Erro:', error);
    throw error;
  }
}

/**
 * Enviar uma mensagem em um chat
 */
export async function sendMessage(
  chatId: string,
  content: string,
  isFromLead: boolean = false
): Promise<ChatMessage> {
  try {
    console.log('🔄 [chatsService.sendMessage] Enviando mensagem para chat:', chatId);

    const supabase = await createClient();
    const client = supabase as any;
    const accountId = await getUserAccountId();

    // Verificar se o chat pertence à conta
    const { data: chat, error: chatError } = await client
      .from('chats')
      .select('id')
      .eq('id', chatId)
      .eq('account_id', accountId)
      .single();

    if (chatError || !chat) {
      console.error('❌ [chatsService.sendMessage] Chat não encontrado ou sem permissão');
      throw new Error('Chat não encontrado');
    }

    // Obter usuário atual se a mensagem não for do lead
    let senderId: string | null = null;
    if (!isFromLead) {
      const authResult = await client.auth.getUser();
      senderId = authResult.data?.user?.id || null;
    }

    // Criar mensagem
    const messageData: ChatMessageInsert = {
      chat_id: chatId,
      account_id: accountId,
      content,
      is_from_lead: isFromLead,
      // created_at é gerenciado pelo banco automaticamente
    };

    const { data, error } = await client
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('❌ [chatsService.sendMessage] Erro:', error);
      throw error;
    }

    // Atualizar última mensagem do chat
    await client
      .from('chats')
      .update({
        last_message_at: new Date().toISOString(),
        // message_count é gerenciado pelo banco
      })
      .eq('id', chatId);

    console.log('✅ [chatsService.sendMessage] Mensagem enviada:', data.id);
    return data;
  } catch (error: any) {
    console.error('❌ [chatsService.sendMessage] Erro:', error);
    throw error;
  }
}

/**
 * Atualizar status de um chat
 */
export async function updateChatStatus(chatId: string, status: ChatStatus): Promise<Chat> {
  try {
    console.log('🔄 [chatsService.updateChatStatus] Atualizando status do chat:', chatId, status);

    return await updateChat(chatId, { status });
  } catch (error: any) {
    console.error('❌ [chatsService.updateChatStatus] Erro:', error);
    throw error;
  }
}

/**
 * Marcar mensagens como lidas
 */
export async function markAsRead(chatId: string): Promise<boolean> {
  try {
    console.log('🔄 [chatsService.markAsRead] Marcando chat como lido:', chatId);

    const supabase = await createClient();
    const client = supabase as any;
    const accountId = await getUserAccountId();

    // Apenas atualiza o timestamp - unread_count não existe no schema
    const { error } = await client
      .from('chats')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chatId)
      .eq('account_id', accountId);

    if (error) {
      console.error('❌ [chatsService.markAsRead] Erro:', error);
      throw error;
    }

    console.log('✅ [chatsService.markAsRead] Chat marcado como lido');
    return true;
  } catch (error: any) {
    console.error('❌ [chatsService.markAsRead] Erro:', error);
    throw error;
  }
}

// Exportar o serviço como objeto padrão
export const chatsService = {
  getChats,
  getChat,
  createChat,
  updateChat,
  deleteChat,
  getChatMessages,
  getChatMessagesByPhone,
  sendMessage,
  updateChatStatus,
  markAsRead,
};

export default chatsService;
