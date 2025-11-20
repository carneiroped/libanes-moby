'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { RealtimeConnectionManager } from './connection-manager';
import {
  RealtimeContextValue,
  ConnectionState,
  RealtimeEvent,
  TypingIndicator,
  PresenceStatus,
  MessageDeliveryStatus,
  RealtimeConfig,
  TypingDebounceState
} from './types';

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

interface RealtimeProviderProps {
  children: React.ReactNode;
  config?: Partial<RealtimeConfig>;
}

export function RealtimeProvider({ children, config: userConfig }: RealtimeProviderProps) {
  const currentUser = useCurrentUser();
  const user = currentUser?.userId ? { token: 'demo-token' } : null;
  
  // Configuration
  const config: RealtimeConfig = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7071',
    authToken: '', // Will be set when user is available
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000,
    typingDebounceMs: 1000,
    presenceUpdateInterval: 60000, // Update presence every minute
    ...userConfig
  };

  // State
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    reconnectAttempts: 0,
    lastError: null,
    connectionId: null
  });

  // Real-time data state
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator[]>>(new Map());
  const [userPresence, setUserPresence] = useState<Map<string, PresenceStatus>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Map<string, number>>(new Map());

  // Refs
  const connectionManagerRef = useRef<RealtimeConnectionManager | null>(null);
  const eventHandlersRef = useRef<{
    message: ((event: RealtimeEvent) => void)[];
    typing: ((indicator: TypingIndicator) => void)[];
    presence: ((presence: PresenceStatus) => void)[];
    readReceipt: ((receipt: MessageDeliveryStatus) => void)[];
    messageStatus: ((status: MessageDeliveryStatus) => void)[];
  }>({
    message: [],
    typing: [],
    presence: [],
    readReceipt: [],
    messageStatus: []
  });
  
  const typingTimeoutsRef = useRef<Map<string, TypingDebounceState>>(new Map());
  const presenceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize connection manager when user is available
  useEffect(() => {
    if (!user?.token) {
      return;
    }

    const configWithAuth = { ...config, authToken: user.token };

    const connectionManager = new RealtimeConnectionManager(configWithAuth, {
      onConnected: () => {
        setConnectionState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          isReconnecting: false,
          reconnectAttempts: 0,
          lastError: null
        }));
      },

      onDisconnected: () => {
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false
        }));
      },

      onReconnecting: (attempt) => {
        setConnectionState(prev => ({
          ...prev,
          isConnecting: false,
          isReconnecting: true,
          reconnectAttempts: attempt
        }));
      },

      onError: (error) => {
        setConnectionState(prev => ({
          ...prev,
          lastError: error
        }));
      },

      onMessage: (event) => {
        eventHandlersRef.current.message.forEach(handler => handler(event));
      },

      onTyping: (indicator) => {
        // Update typing state
        setTypingUsers(prev => {
          const chatTyping = prev.get(indicator.chatId) || [];
          const updated = new Map(prev);
          
          if (indicator.isTyping) {
            // Add or update typing indicator
            const filtered = chatTyping.filter(t => t.userId !== indicator.userId);
            updated.set(indicator.chatId, [...filtered, indicator]);
          } else {
            // Remove typing indicator
            const filtered = chatTyping.filter(t => t.userId !== indicator.userId);
            updated.set(indicator.chatId, filtered);
          }
          
          return updated;
        });

        eventHandlersRef.current.typing.forEach(handler => handler(indicator));
      },

      onPresence: (presence) => {
        // Update presence state
        setUserPresence(prev => {
          const updated = new Map(prev);
          updated.set(presence.userId, presence);
          return updated;
        });

        // Update online count if provided
        if (presence.data && typeof presence.data === 'object' && 'count' in presence.data && 'chatId' in presence.data) {
          setOnlineUsers(prev => {
            const updated = new Map(prev);
            const data = presence.data as { chatId: string; count: number };
            updated.set(data.chatId, data.count);
            return updated;
          });
        }

        eventHandlersRef.current.presence.forEach(handler => handler(presence));
      },

      onReadReceipt: (receipt) => {
        eventHandlersRef.current.readReceipt.forEach(handler => handler(receipt));
      },

      onMessageStatus: (status) => {
        eventHandlersRef.current.messageStatus.forEach(handler => handler(status));
      }
    });

    connectionManagerRef.current = connectionManager;

    // Auto-update presence status
    const updatePresence = () => {
      connectionManager.updatePresence('online');
    };

    // Update presence immediately and then every minute
    updatePresence();
    presenceIntervalRef.current = setInterval(updatePresence, config.presenceUpdateInterval);

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        connectionManager.updatePresence('away');
      } else {
        connectionManager.updatePresence('online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle beforeunload (user leaving)
    const handleBeforeUnload = () => {
      connectionManager.updatePresence('offline');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      connectionManager.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  // Connection management functions
  const connect = useCallback(async (chatId?: string): Promise<void> => {
    if (!connectionManagerRef.current) {
      throw new Error('Connection manager not initialized');
    }

    setConnectionState(prev => ({ ...prev, isConnecting: true }));
    await connectionManagerRef.current.connect(chatId);
  }, []);

  const disconnect = useCallback((): void => {
    if (connectionManagerRef.current) {
      connectionManagerRef.current.disconnect();
    }
  }, []);

  const isConnected = useCallback((): boolean => {
    return connectionManagerRef.current?.isConnectionActive() || false;
  }, []);

  // Typing management with debouncing
  const startTyping = useCallback(async (chatId: string, phone: string, userName?: string): Promise<void> => {
    if (!connectionManagerRef.current) return;

    const key = `${chatId}:${phone}`;
    const now = Date.now();
    
    // Get or create typing state
    let typingState = typingTimeoutsRef.current.get(key);
    if (!typingState) {
      typingState = { timeout: null, isTyping: false, lastTypingTime: 0 };
      typingTimeoutsRef.current.set(key, typingState);
    }

    // Clear existing timeout
    if (typingState.timeout) {
      clearTimeout(typingState.timeout);
    }

    // Send typing indicator if not already typing or if it's been a while
    if (!typingState.isTyping || (now - typingState.lastTypingTime > config.typingDebounceMs)) {
      await connectionManagerRef.current.startTyping(chatId, phone, userName);
      typingState.isTyping = true;
      typingState.lastTypingTime = now;
    }

    // Set timeout to stop typing
    typingState.timeout = setTimeout(async () => {
      if (connectionManagerRef.current) {
        await connectionManagerRef.current.stopTyping(chatId, phone);
        typingState.isTyping = false;
      }
    }, config.typingDebounceMs);
  }, [config.typingDebounceMs]);

  const stopTyping = useCallback(async (chatId: string, phone: string): Promise<void> => {
    if (!connectionManagerRef.current) return;

    const key = `${chatId}:${phone}`;
    const typingState = typingTimeoutsRef.current.get(key);

    if (typingState) {
      if (typingState.timeout) {
        clearTimeout(typingState.timeout);
      }
      typingState.isTyping = false;
    }

    await connectionManagerRef.current.stopTyping(chatId, phone);
  }, []);

  const getTypingUsers = useCallback((chatId: string): TypingIndicator[] => {
    return typingUsers.get(chatId) || [];
  }, [typingUsers]);

  // Presence management
  const updatePresence = useCallback(async (status: 'online' | 'offline' | 'away'): Promise<void> => {
    if (connectionManagerRef.current) {
      await connectionManagerRef.current.updatePresence(status);
    }
  }, []);

  const getUserPresence = useCallback((userId: string): PresenceStatus | null => {
    return userPresence.get(userId) || null;
  }, [userPresence]);

  const getOnlineCount = useCallback((chatId: string): number => {
    return onlineUsers.get(chatId) || 0;
  }, [onlineUsers]);

  // Message management
  const markMessagesAsRead = useCallback(async (chatId: string, messageIds: string[]): Promise<void> => {
    if (connectionManagerRef.current) {
      await connectionManagerRef.current.markMessagesAsRead(chatId, messageIds);
    }
  }, []);

  // Event handler management
  const onMessage = useCallback((handler: (event: RealtimeEvent) => void) => {
    eventHandlersRef.current.message.push(handler);
    return () => {
      const index = eventHandlersRef.current.message.indexOf(handler);
      if (index > -1) {
        eventHandlersRef.current.message.splice(index, 1);
      }
    };
  }, []);

  const onTyping = useCallback((handler: (indicator: TypingIndicator) => void) => {
    eventHandlersRef.current.typing.push(handler);
    return () => {
      const index = eventHandlersRef.current.typing.indexOf(handler);
      if (index > -1) {
        eventHandlersRef.current.typing.splice(index, 1);
      }
    };
  }, []);

  const onPresence = useCallback((handler: (presence: PresenceStatus) => void) => {
    eventHandlersRef.current.presence.push(handler);
    return () => {
      const index = eventHandlersRef.current.presence.indexOf(handler);
      if (index > -1) {
        eventHandlersRef.current.presence.splice(index, 1);
      }
    };
  }, []);

  const onReadReceipt = useCallback((handler: (receipt: MessageDeliveryStatus) => void) => {
    eventHandlersRef.current.readReceipt.push(handler);
    return () => {
      const index = eventHandlersRef.current.readReceipt.indexOf(handler);
      if (index > -1) {
        eventHandlersRef.current.readReceipt.splice(index, 1);
      }
    };
  }, []);

  const onMessageStatus = useCallback((handler: (status: MessageDeliveryStatus) => void) => {
    eventHandlersRef.current.messageStatus.push(handler);
    return () => {
      const index = eventHandlersRef.current.messageStatus.indexOf(handler);
      if (index > -1) {
        eventHandlersRef.current.messageStatus.splice(index, 1);
      }
    };
  }, []);

  const contextValue: RealtimeContextValue = {
    connectionState,
    connect,
    disconnect,
    isConnected,
    startTyping,
    stopTyping,
    getTypingUsers,
    updatePresence,
    getUserPresence,
    getOnlineCount,
    markMessagesAsRead,
    onMessage,
    onTyping,
    onPresence,
    onReadReceipt,
    onMessageStatus
  };

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}