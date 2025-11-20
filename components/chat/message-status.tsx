'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck, Clock, AlertCircle, Send } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MessageStatusProps {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp?: Date | string;
  readBy?: string;
  readAt?: Date | string;
  className?: string;
  showTooltip?: boolean;
}

export function MessageStatus({ 
  status, 
  timestamp, 
  readBy, 
  readAt,
  className = '',
  showTooltip = true
}: MessageStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Clock className="w-3 h-3 text-muted-foreground" />
          </motion.div>
        );
      
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      
      case 'read':
        return (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCheck className="w-3 h-3 text-blue-500" />
          </motion.div>
        );
      
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      
      default:
        return <Send className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return 'Enviando...';
      case 'sent':
        return 'Enviado';
      case 'delivered':
        return 'Entregue';
      case 'read':
        return readBy ? `Lido por ${readBy}` : 'Lido';
      case 'failed':
        return 'Falha ao enviar';
      default:
        return 'Desconhecido';
    }
  };

  const formatTimestamp = (ts: Date | string) => {
    const date = new Date(ts);
    const now = new Date();
    
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getTooltipContent = () => {
    let content = getStatusText();
    
    if (timestamp) {
      content += ` em ${formatTimestamp(timestamp)}`;
    }
    
    if (status === 'read' && readAt) {
      content += ` às ${formatTimestamp(readAt)}`;
    }
    
    return content;
  };

  const statusIcon = getStatusIcon();

  if (!showTooltip) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {statusIcon}
        {timestamp && (
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(timestamp)}
          </span>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 cursor-help ${className}`}>
            {statusIcon}
            {timestamp && (
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(timestamp)}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface MessageStatusBadgeProps {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  className?: string;
}

export function MessageStatusBadge({ status, className = '' }: MessageStatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'sending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sent':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'delivered':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'read':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return 'Enviando';
      case 'sent':
        return 'Enviado';
      case 'delivered':
        return 'Entregue';
      case 'read':
        return 'Lido';
      case 'failed':
        return 'Falhado';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor()} ${className}`}>
      {status === 'sending' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Clock className="w-3 h-3" />
        </motion.div>
      )}
      {status === 'sent' && <Check className="w-3 h-3" />}
      {status === 'delivered' && <CheckCheck className="w-3 h-3" />}
      {status === 'read' && <CheckCheck className="w-3 h-3" />}
      {status === 'failed' && <AlertCircle className="w-3 h-3" />}
      {getStatusText()}
    </span>
  );
}

interface BulkMessageStatusProps {
  messages: Array<{
    id: string;
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  }>;
  className?: string;
}

export function BulkMessageStatus({ messages, className = '' }: BulkMessageStatusProps) {
  const statusCounts = messages.reduce((acc, msg) => {
    acc[msg.status] = (acc[msg.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalMessages = messages.length;
  const failedCount = statusCounts.failed || 0;
  const readCount = statusCounts.read || 0;
  const deliveredCount = statusCounts.delivered || 0;
  const sentCount = statusCounts.sent || 0;
  const sendingCount = statusCounts.sending || 0;

  if (totalMessages === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
      <span className="font-medium">{totalMessages} mensagens:</span>
      
      {sendingCount > 0 && (
        <div className="flex items-center gap-1">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Clock className="w-3 h-3" />
          </motion.div>
          <span>{sendingCount} enviando</span>
        </div>
      )}
      
      {failedCount > 0 && (
        <div className="flex items-center gap-1 text-red-600">
          <AlertCircle className="w-3 h-3" />
          <span>{failedCount} falharam</span>
        </div>
      )}
      
      {readCount > 0 && (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCheck className="w-3 h-3" />
          <span>{readCount} lidas</span>
        </div>
      )}
      
      {deliveredCount > 0 && (
        <div className="flex items-center gap-1 text-blue-600">
          <CheckCheck className="w-3 h-3" />
          <span>{deliveredCount} entregues</span>
        </div>
      )}
      
      {sentCount > 0 && (
        <div className="flex items-center gap-1">
          <Check className="w-3 h-3" />
          <span>{sentCount} enviadas</span>
        </div>
      )}
    </div>
  );
}