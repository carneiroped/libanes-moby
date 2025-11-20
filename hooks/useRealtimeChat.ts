'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/lib/realtime/realtime-context';
import { RealtimeEvent, TypingIndicator, MessageDeliveryStatus } from '@/lib/realtime/types';
import { ChatMessageWithCompat } from '@/hooks/useChats';

interface UseRealtimeChatOptions {
  chatId?: string;
  phone?: string;
  userName?: string;
  autoMarkAsRead?: boolean;
  typingDebounceMs?: number;
}

interface RealtimeChatState {
  isConnected: boolean;
  typingUsers: TypingIndicator[];
  onlineCount: number;
  isTyping: boolean;
  connectionError: Error | null;
}

export function useRealtimeChat({
  chatId,
  phone,
  userName = 'Usuário',
  autoMarkAsRead = true,
  typingDebounceMs = 1000
}: UseRealtimeChatOptions = {}) {
  const queryClient = useQueryClient();
  const realtime = useRealtime();
  
  // State
  const [state, setState] = useState<RealtimeChatState>({
    isConnected: false,
    typingUsers: [],
    onlineCount: 0,
    isTyping: false,
    connectionError: null
  });

  // Refs for managing typing state
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const lastTypingTimeRef = useRef(0);

  // Connect to real-time when chatId is available
  useEffect(() => {
    if (chatId) {
      realtime.connect(chatId);
      
      // Update presence to online
      realtime.updatePresence('online');
    }

    return () => {
      if (chatId && phone) {
        // Stop typing if user was typing
        if (isTypingRef.current) {
          realtime.stopTyping(chatId, phone);
        }
      }
    };
  }, [chatId, phone, realtime]);

  // Update connection state
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isConnected: realtime.connectionState.isConnected,
      connectionError: realtime.connectionState.lastError
    }));
  }, [realtime.connectionState]);

  // Update typing users and online count
  useEffect(() => {
    if (chatId) {
      const typingUsers = realtime.getTypingUsers(chatId);
      const onlineCount = realtime.getOnlineCount(chatId);
      
      setState(prev => ({
        ...prev,
        typingUsers: typingUsers.filter(user => user.isTyping),
        onlineCount
      }));
    }
  }, [chatId, realtime]);

  // Handle real-time message events with optimistic updates
  useEffect(() => {
    const unsubscribeMessage = realtime.onMessage((event: RealtimeEvent) => {
      if (event.type === 'message' && event.chatId === chatId) {
        // Optimistic update: Add message to cache immediately
        queryClient.setQueryData(['chat-messages', chatId], (oldData: ChatMessageWithCompat[] | undefined) => {
          if (!oldData) return oldData;
          
          // Check if message already exists (avoid duplicates)
          const messageExists = oldData.some(msg => msg.id === event.data.messageId);
          if (messageExists) return oldData;
          
          // Create new message object
          const newMessage = {
            id: event.data.messageId || '',
            chat_id: chatId || '',
            user_id: event.userId !== 'system' ? (event.userId || null) : null,
            bot_message: event.data.direction === 'outbound' ? event.data.content : null,
            user_message: event.data.direction === 'inbound' ? event.data.content : null,
            user_name: event.data.direction === 'inbound' ? 'Cliente' : null,
            conversation_id: chatId || null,
            message_type: event.data.type || 'text',
            status: event.data.status || 'sent',
            active: true,
            created_at: new Date(event.data.timestamp).toISOString(),
            updated_at: new Date(event.data.timestamp).toISOString(),
            delivered_at: null,
            read_at: null,
            app: 'whatsapp'
          } as ChatMessageWithCompat;
          
          return [...oldData, newMessage].sort((a: any, b: any) =>
            new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
          );
        });

        // Also invalidate to ensure server sync
        queryClient.invalidateQueries({ 
          queryKey: ['chat-messages', chatId] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['chats'] 
        });

        // Auto-mark as read if enabled and message is inbound
        if (autoMarkAsRead && event.data.direction === 'inbound' && event.data.messageId && chatId) {
          setTimeout(() => {
            realtime.markMessagesAsRead(chatId, [event.data.messageId]);
          }, 1000); // Delay to simulate reading time
        }
      }
    });

    return unsubscribeMessage;
  }, [chatId, autoMarkAsRead, realtime, queryClient]);

  // Handle typing indicators
  useEffect(() => {
    const unsubscribeTyping = realtime.onTyping((indicator: TypingIndicator) => {
      if (indicator.chatId === chatId) {
        setState(prev => {
          const filteredUsers = prev.typingUsers.filter(user => user.userId !== indicator.userId);
          
          if (indicator.isTyping) {
            return {
              ...prev,
              typingUsers: [...filteredUsers, indicator]
            };
          } else {
            return {
              ...prev,
              typingUsers: filteredUsers
            };
          }
        });
      }
    });

    return unsubscribeTyping;
  }, [chatId, realtime]);

  // Handle presence updates
  useEffect(() => {
    const unsubscribePresence = realtime.onPresence((presence: any) => {
      // Update online count if this presence update includes count data
      if (presence?.data && 'count' in presence.data && presence.data.chatId === chatId) {
        setState(prev => ({
          ...prev,
          onlineCount: presence.data.count
        }));
      }
    });

    return unsubscribePresence;
  }, [chatId, realtime]);

  // Handle read receipts
  useEffect(() => {
    const unsubscribeReadReceipt = realtime.onReadReceipt((receipt: MessageDeliveryStatus) => {
      if (receipt.chatId === chatId) {
        // Update message status in the cache
        queryClient.setQueryData(['chat-messages', chatId], (oldData: ChatMessageWithCompat[] | undefined) => {
          if (!oldData) return oldData;
          
          return oldData.map(message => {
            if (message.id === receipt.messageId) {
              return {
                ...message,
                status: 'read',
                read_at: receipt.readAt ? new Date(receipt.readAt).toISOString() : new Date().toISOString(),
                read_by: receipt.readBy
              };
            }
            return message;
          });
        });
      }
    });

    return unsubscribeReadReceipt;
  }, [chatId, realtime, queryClient]);

  // Handle message status updates
  useEffect(() => {
    const unsubscribeMessageStatus = realtime.onMessageStatus((status: MessageDeliveryStatus) => {
      if (status.chatId === chatId) {
        // Update message status in the cache
        queryClient.setQueryData(['chat-messages', chatId], (oldData: ChatMessageWithCompat[] | undefined) => {
          if (!oldData) return oldData;
          
          return oldData.map(message => {
            if (message.id === status.messageId) {
              const updates: Partial<ChatMessageWithCompat> = {
                status: status.status
              };

              if (status.status === 'delivered') {
                updates.delivered_at = new Date(status.timestamp).toISOString();
              } else if (status.status === 'read') {
                updates.read_at = new Date(status.timestamp).toISOString();
              }

              return { ...message, ...updates };
            }
            return message;
          });
        });
      }
    });

    return unsubscribeMessageStatus;
  }, [chatId, realtime, queryClient]);

  // Typing functions with debouncing
  const startTyping = useCallback(() => {
    if (!chatId || !phone) return;

    const now = Date.now();
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator if not already typing or if it's been a while
    if (!isTypingRef.current || (now - lastTypingTimeRef.current > typingDebounceMs)) {
      realtime.startTyping(chatId, phone, userName);
      isTypingRef.current = true;
      lastTypingTimeRef.current = now;
      
      setState(prev => ({ ...prev, isTyping: true }));
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, typingDebounceMs);
  }, [chatId, phone, userName, typingDebounceMs, realtime]);

  const stopTyping = useCallback(() => {
    if (!chatId || !phone) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isTypingRef.current) {
      realtime.stopTyping(chatId, phone);
      isTypingRef.current = false;
      
      setState(prev => ({ ...prev, isTyping: false }));
    }
  }, [chatId, phone, realtime]);

  // Mark messages as read
  const markAsRead = useCallback((messageIds: string[]) => {
    if (!chatId || messageIds.length === 0) return;
    
    realtime.markMessagesAsRead(chatId, messageIds);
  }, [chatId, realtime]);

  // Update presence status
  const updatePresence = useCallback((status: 'online' | 'offline' | 'away') => {
    realtime.updatePresence(status);
  }, [realtime]);

  // Get typing indicator text
  const getTypingText = useCallback(() => {
    const typingUsers = state.typingUsers;
    
    if (typingUsers.length === 0) {
      return '';
    } else if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} está digitando...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} e ${typingUsers[1].userName} estão digitando...`;
    } else {
      return `${typingUsers[0].userName} e mais ${typingUsers.length - 1} pessoas estão digitando...`;
    }
  }, [state.typingUsers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    isConnected: state.isConnected,
    typingUsers: state.typingUsers,
    onlineCount: state.onlineCount,
    isUserTyping: state.isTyping,
    connectionError: state.connectionError,
    
    // Functions
    startTyping,
    stopTyping,
    markAsRead,
    updatePresence,
    getTypingText,
    
    // Connection management
    connect: (newChatId?: string) => realtime.connect(newChatId || chatId),
    disconnect: realtime.disconnect,
    isConnectionActive: realtime.isConnected
  };
}