'use client';

import { useEffect, useRef } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
  primaryColor?: string;
  companyName?: string;
}

export function ChatMessages({ 
  messages, 
  isLoading = false, 
  primaryColor = '#00A86B',
  companyName = 'Moby'
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`flex max-w-[80%] ${
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {message.role === 'assistant' && (
              <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                <div 
                  className="flex items-center justify-center h-full w-full rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {companyName.charAt(0).toUpperCase()}
                </div>
              </Avatar>
            )}
            
            <div className="flex flex-col">
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-2'
                    : message.role === 'system'
                    ? 'bg-gray-100 text-gray-600 italic'
                    : 'bg-gray-100'
                }`}
                style={
                  message.role === 'user' 
                    ? { backgroundColor: primaryColor } 
                    : undefined
                }
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              
              <p
                className={`text-xs text-gray-500 mt-1 ${
                  message.role === 'user' ? 'text-right mr-2' : 'ml-2'
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="flex max-w-[80%]">
            <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
              <div 
                className="flex items-center justify-center h-full w-full rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {companyName.charAt(0).toUpperCase()}
              </div>
            </Avatar>
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex space-x-2">
                <div 
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ 
                    backgroundColor: primaryColor,
                    animationDelay: '0ms' 
                  }} 
                />
                <div 
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ 
                    backgroundColor: primaryColor,
                    animationDelay: '150ms' 
                  }} 
                />
                <div 
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ 
                    backgroundColor: primaryColor,
                    animationDelay: '300ms' 
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}