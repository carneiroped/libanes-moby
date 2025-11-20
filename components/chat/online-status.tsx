'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Circle } from 'lucide-react';
import { useRealtime } from '@/lib/realtime/realtime-context';
import { PresenceStatus } from '@/lib/realtime/types';

interface OnlineStatusProps {
  userId?: string;
  chatId?: string;
  showCount?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function OnlineStatus({ 
  userId, 
  chatId, 
  showCount = false, 
  className = '',
  size = 'md'
}: OnlineStatusProps) {
  const { getUserPresence, getOnlineCount } = useRealtime();

  if (showCount && chatId) {
    const onlineCount = getOnlineCount(chatId);
    
    if (onlineCount === 0) {
      return null;
    }

    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="relative">
          <Circle className={`${getSizeClass(size)} text-green-500 fill-current`} />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 ${getSizeClass(size)} text-green-500/30 fill-current`}
          />
        </div>
        <span className={`text-green-600 font-medium ${getTextSizeClass(size)}`}>
          {onlineCount} online
        </span>
      </div>
    );
  }

  if (userId) {
    const presence = getUserPresence(userId);
    
    if (!presence) {
      return (
        <div className={`flex items-center gap-1 ${className}`}>
          <Circle className={`${getSizeClass(size)} text-gray-400 fill-current`} />
          <span className={`text-gray-500 ${getTextSizeClass(size)}`}>
            Offline
          </span>
        </div>
      );
    }

    return (
      <PresenceIndicator 
        presence={presence} 
        className={className}
        size={size}
      />
    );
  }

  return null;
}

interface PresenceIndicatorProps {
  presence: PresenceStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function PresenceIndicator({ 
  presence, 
  className = '',
  size = 'md',
  showText = true
}: PresenceIndicatorProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'away':
        return 'text-yellow-500';
      case 'offline':
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Ausente';
      case 'offline':
      default:
        return 'Offline';
    }
  };

  const formatLastSeen = (lastSeen: Date | string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) {
      return 'agora há pouco';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} min atrás`;
    } else if (diffMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} h atrás`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return `${days} dias atrás`;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Circle className={`${getSizeClass(size)} ${getStatusColor(presence.status)} fill-current`} />
        {presence.status === 'online' && (
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 ${getSizeClass(size)} ${getStatusColor(presence.status)} fill-current`}
          />
        )}
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`${getStatusColor(presence.status)} font-medium ${getTextSizeClass(size)}`}>
            {getStatusText(presence.status)}
          </span>
          {presence.status !== 'online' && (
            <span className={`text-muted-foreground ${getSmallTextSizeClass(size)}`}>
              Visto {formatLastSeen(presence.lastSeen)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface ConnectionStatusProps {
  connectionState: {
    isConnected: boolean;
    isConnecting: boolean;
    isReconnecting: boolean;
    reconnectAttempts: number;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ConnectionStatus({ 
  connectionState, 
  className = '',
  size = 'sm'
}: ConnectionStatusProps) {
  const { isConnected, isConnecting, isReconnecting, reconnectAttempts } = connectionState;

  if (isConnected) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="relative">
          <Circle className={`${getSizeClass(size)} text-green-500 fill-current`} />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 ${getSizeClass(size)} text-green-500/30 fill-current`}
          />
        </div>
        <span className={`text-green-600 ${getTextSizeClass(size)}`}>
          Conectado
        </span>
      </div>
    );
  }

  if (isReconnecting) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Circle className={`${getSizeClass(size)} text-yellow-500 fill-current`} />
        </motion.div>
        <span className={`text-yellow-600 ${getTextSizeClass(size)}`}>
          Reconectando... (tentativa {reconnectAttempts})
        </span>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Circle className={`${getSizeClass(size)} text-blue-500 fill-current`} />
        </motion.div>
        <span className={`text-blue-600 ${getTextSizeClass(size)}`}>
          Conectando...
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Circle className={`${getSizeClass(size)} text-red-500 fill-current`} />
      <span className={`text-red-600 ${getTextSizeClass(size)}`}>
        Desconectado
      </span>
    </div>
  );
}

// Helper functions for sizing
function getSizeClass(size: 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'sm':
      return 'w-2 h-2';
    case 'md':
      return 'w-3 h-3';
    case 'lg':
      return 'w-4 h-4';
    default:
      return 'w-3 h-3';
  }
}

function getTextSizeClass(size: 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'sm':
      return 'text-xs';
    case 'md':
      return 'text-sm';
    case 'lg':
      return 'text-base';
    default:
      return 'text-sm';
  }
}

function getSmallTextSizeClass(size: 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'sm':
      return 'text-xs';
    case 'md':
      return 'text-xs';
    case 'lg':
      return 'text-sm';
    default:
      return 'text-xs';
  }
}