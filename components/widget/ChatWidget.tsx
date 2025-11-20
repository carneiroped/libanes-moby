'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LeadForm, LeadFormData } from './LeadForm';
import { ChatMessages } from './ChatMessages';
import { OfflineMessage } from './OfflineMessage';
import { WidgetConfig, isBusinessHoursActive } from '@/lib/channels/widget/widget-config';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  config: WidgetConfig;
  sessionId: string;
}

export function ChatWidget({ config, sessionId }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState<LeadFormData | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);

  // Check business hours
  useEffect(() => {
    const checkBusinessHours = () => {
      setIsOnline(isBusinessHoursActive(config));
    };
    
    checkBusinessHours();
    const interval = setInterval(checkBusinessHours, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [config]);

  // Initialize conversation
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initializeConversation();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeConversation = async () => {
    try {
      // Check for existing conversation
      const existingConversation = localStorage.getItem(`moby_conversation_${config.accountId}`);
      
      if (existingConversation && config.persistConversation) {
        const { conversationId: id, leadData: data } = JSON.parse(existingConversation);
        
        // Load conversation history
        const response = await fetch(`/api/widget/conversation/${id}`);
        if (response.ok) {
          const { messages: history } = await response.json();
          setMessages(history.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at)
          })));
          setConversationId(id);
          setLeadData(data);
          
          // Skip lead form if we already have data
          if (data) {
            setShowLeadForm(false);
          }
          
          return;
        }
      }
      
      // Start new conversation
      startNewConversation();
    } catch (error) {
      console.error('Error initializing conversation:', error);
      startNewConversation();
    }
  };

  const startNewConversation = async () => {
    // Show welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: config.welcomeMessage || 'Olá! Como posso ajudá-lo a encontrar o imóvel ideal?',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    // Show lead form if configured and online
    if (config.showLeadForm && isOnline && !leadData) {
      setShowLeadForm(true);
    }
    
    // Create conversation in backend
    try {
      const response = await fetch('/api/widget/conversation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: config.accountId,
          sessionId,
          origin: window.location.href,
          config
        })
      });
      
      if (response.ok) {
        const { conversationId: id } = await response.json();
        setConversationId(id);
        
        // Save to localStorage
        localStorage.setItem(`moby_conversation_${config.accountId}`, JSON.stringify({
          conversationId: id,
          leadData: null
        }));
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleLeadSubmit = async (data: LeadFormData) => {
    setLeadData(data);
    setShowLeadForm(false);
    
    // Save lead data
    localStorage.setItem(`moby_conversation_${config.accountId}`, JSON.stringify({
      conversationId,
      leadData: data
    }));
    
    // Send to parent window
    window.parent.postMessage({
      type: 'moby:lead-captured',
      data
    }, '*');
    
    // Add system message
    const systemMessage: Message = {
      id: Date.now().toString(),
      role: 'system',
      content: `Obrigado ${data.name}! Como posso ajudá-lo?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, systemMessage]);
    
    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !conversationId) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send message to API
      const response = await fetch('/api/widget/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: input,
          leadData
        })
      });
      
      if (response.ok) {
        const { response: aiResponse } = await response.json();
        
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Play sound if enabled
        if (config.soundEnabled) {
          playNotificationSound();
        }
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
    
    // Track event
    window.parent.postMessage({
      type: 'moby:track',
      data: { event: 'message_sent' }
    }, '*');
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzvLKiTcIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play();
    } catch {
      // Silently fail
    }
  };

  const handleClose = () => {
    window.parent.postMessage({ type: 'moby:close' }, '*');
  };

  return (
    <Card className="h-full flex flex-col shadow-2xl border-0">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b text-white"
        style={{ backgroundColor: config.primaryColor }}
      >
        <div className="flex items-center space-x-3">
          {config.logo && (
            <Image
              src={config.logo}
              alt={config.companyName || 'Company Logo'}
              width={32}
              height={32}
              className="h-8 w-8 rounded"
            />
          )}
          <div>
            <h3 className="font-semibold">{config.companyName || 'Chat'}</h3>
            {isOnline && (
              <p className="text-xs opacity-90">Online agora</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Body */}
      {!isMinimized && (
        <>
          {showLeadForm ? (
            <LeadForm
              onSubmit={handleLeadSubmit}
              requiredFields={config.requiredFields as any}
              primaryColor={config.primaryColor}
            />
          ) : !isOnline ? (
            <OfflineMessage
              message={config.offlineMessage}
              businessHours={config.businessHours?.schedule as any}
            />
          ) : (
            <>
              <ChatMessages
                messages={messages}
                isLoading={isLoading}
                primaryColor={config.primaryColor}
                companyName={config.companyName}
              />
              
              {/* Input */}
              <div className="p-4 border-t">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex space-x-2"
                >
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={config.placeholderText}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={isLoading || !input.trim()}
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </>
      )}
    </Card>
  );
}