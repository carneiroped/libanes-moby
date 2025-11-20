'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  MessageSquare,
  Bot,
  User,
  Clock,
  AlertCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import useChats, { formatPhone, ChatMessageWithCompat } from '@/hooks/useChats';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { use } from 'react';

// Ajusta a data para o fuso horário brasileiro (UTC-3)
const adjustToBrazilianTimezone = (iso: string) => {
  const date = new Date(iso);
  // Adiciona o offset para o horário brasileiro (UTC-3)
  return new Date(date.getTime() - (3 * 60 * 60 * 1000));
};

// Formata hora em pt‑BR
const formatTime = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  }).format(new Date(iso));

// Formata data em pt‑BR
const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  }).format(new Date(iso));

export default function ChatDetailsPage({ 
  params, 
  searchParams 
}: {
  params: Promise<{ phone: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = use(params);
  const phoneNumber = decodeURIComponent(resolvedParams.phone);
  const router = useRouter();
  const { getChatMessagesByPhone, isLoading: loadingChats } = useChats();

  // Busca dados da conversa
  const {
    data: currentChat,
    isLoading: loadingChat,
    isError: errorChat,
  } = useQuery({
    queryKey: ['chat', phoneNumber],
    queryFn: async () => {
      const response = await fetch(`/api/chats?phone=${encodeURIComponent(phoneNumber)}&limit=1`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch chat');
      }
      
      const result = await response.json();

      // Handle both array and paginated response formats
      const chats = Array.isArray(result) ? result : (result.chats || []);
      
      if (chats.length === 0) {
        throw new Error('Chat not found');
      }
      
      return chats[0];
    }
  });

  // Busca mensagens
  const {
    data: messages = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['chat-messages', phoneNumber],
    queryFn: () => getChatMessagesByPhone(phoneNumber)
  });

  // Organiza mensagens por ciclo de interação (usuário seguido de bot) e agrupa por data
  const groupedMessages = Object.entries(
    messages.reduce((acc: Record<string, any[]>, msg: any, index: number) => {
      // Usa a data com fuso horário brasileiro para agrupar
      const localDate = new Date(msg.created_at || new Date());
      localDate.setHours(localDate.getHours() - 3); // Ajuste para horário brasileiro
      const date = localDate.toISOString().split('T')[0];

      acc[date] = acc[date] || [];

      // Adiciona a mensagem atual
      acc[date].push(msg);

      return acc;
    }, {})
  ).map(([date, msgs]) => ({
    date,
    // Ordena as mensagens por data de criação
    messages: (msgs as any).sort((a: any, b: any) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }));

  // Informações do cliente com ajuste de fuso horário brasileiro
  const clientInfo = (() => {
    const first = messages[0];
    const last = messages[messages.length - 1];
    const nameMsg = messages.find((m: any) => m.user_name);
    return {
      phone: formatPhone(phoneNumber),
      name: nameMsg?.user_name || 'Cliente',
      firstMessage: first?.created_at || null,
      lastMessage: last?.created_at || null,
      totalMessages: messages.length,
    };
  })();

  if (isLoading || loadingChat || loadingChats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando conversa...</p>
      </div>
    );
  }

  if (isError || errorChat) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados da conversa. Tente novamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para conversas
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mensagens */}
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversa com {clientInfo.name}
                </div>
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {clientInfo.phone}
              </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto overflow-x-hidden max-h-[60vh]">
              {groupedMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 h-full">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    Nenhuma mensagem registrada
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Esta conversa não possui mensagens.
                  </p>
                </div>
              ) : (
                groupedMessages.map((group, i) => (
                  <div key={i} className="space-y-4 mb-6">
                    {/* Data posicionada à esquerda */}
                    <div className="text-left mb-2">
                      <div className="text-xs inline-block bg-muted px-2 py-1 rounded-md text-muted-foreground font-medium">
                        {formatDate(group.date)}
                      </div>
                    </div>
                    
                    {/* Mensagens agrupadas por ciclo (usuário -> bot) */}
                    {group.messages.map((msg: any, j: number) => (
                      <div key={j} className="w-full">
                        {/* Mensagem do usuário (esquerda para direita) */}
                        {msg.user_message && (
                          <div className="flex justify-start mb-2 w-full">
                            <div className="flex items-start gap-2 max-w-[80%]">
                              <Avatar className="bg-secondary/80">
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <div className="rounded-lg p-3 bg-muted break-words">
                                  <div className="text-sm">{msg.user_message}</div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(msg.created_at)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Mensagem do bot (direita para esquerda) */}
                        {msg.bot_message && (
                          <div className="flex justify-end mb-2 w-full">
                            <div className="flex items-start gap-2 max-w-[80%] flex-row-reverse">
                              <Avatar className="bg-primary/10">
                                <AvatarFallback>
                                  <Bot className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <div className={`rounded-lg p-3 break-words ${
                                  msg.message_type === 'system'
                                  ? 'bg-muted/50 text-muted-foreground italic'
                                  : 'bg-primary text-primary-foreground'
                                }`}>
                                  <div className="text-sm">{msg.bot_message}</div>
                                </div>
                                <div className="flex items-center justify-end gap-1 text-xs text-primary-foreground/70">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(msg.created_at)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalhes e Ações */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Detalhes do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Nome</h3>
                <p className="text-sm">{clientInfo.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Telefone</h3>
                <p className="text-sm">{clientInfo.phone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">
                  Conversa iniciada em
                </h3>
                <p className="text-sm">
                  {clientInfo.firstMessage
                    ? formatDate(clientInfo.firstMessage)
                    : 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">
                  Última interação
                </h3>
                <p className="text-sm">
                  {clientInfo.lastMessage
                    ? formatDate(clientInfo.lastMessage)
                    : 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">
                  Total de mensagens
                </h3>
                <p className="text-sm">{clientInfo.totalMessages}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Status</h3>
                <p className="text-sm">
                  <span className="text-green-500">{currentChat?.status === 'active' ? 'Ativa' : currentChat?.status || 'Ativa'}</span>
                </p>
              </div>
            </CardContent>
            <Separator />
            <CardHeader className="pb-3 pt-6">
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={`https://wa.me/${phoneNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button
                  className="w-full"
                  variant="default"
                  size="lg"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Abrir no WhatsApp
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}