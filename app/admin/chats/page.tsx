'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Bot, Search, Filter, User, Phone, CalendarClock, Loader2, Calendar, ExternalLink } from 'lucide-react';
import useChats, { formatPhone } from '@/hooks/useChats';
import { toast } from 'sonner';
import { ChatMetricsCards } from './components/chat-metrics-cards';
import { ChatListFilters } from './components/chat-list-filters';
import { ChatStatusBadge } from '@/components/chat/chat-status-badge';
import { ChatChannelIcon } from '@/components/chat/chat-channel-icon';
import { Database } from '@/types/database.types';

type ChatStatus = Database['public']['Enums']['chat_status'];
type MessageChannel = Database['public']['Enums']['message_channel'];

// Função para formatar data
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

// Tipos de período
type PeriodType = 'all' | 'today' | 'week';

export default function ChatsPage() {
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<PeriodType>('all');
  const [statusFilter, setStatusFilter] = useState<ChatStatus | 'all'>('all');
  const [channelFilter, setChannelFilter] = useState<MessageChannel | 'all'>('all');
  
  const { chats, isLoading, isError } = useChats();

  // Handler para mudança de filtros
  const handleFiltersChange = (filters: {
    search: string;
    status: ChatStatus | 'all';
    channel: MessageChannel | 'all';
  }) => {
    setSearchTerm(filters.search);
    setStatusFilter(filters.status);
    setChannelFilter(filters.channel);
  };

  // Calcular número de filtros ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter !== 'all') count++;
    if (channelFilter !== 'all') count++;
    return count;
  }, [searchTerm, statusFilter, channelFilter]);

  // Filtrar os chats com base nos critérios de pesquisa
  const filterChats = () => {
    let filtered = [...chats];
    
    // Filtrar por termo de busca (busca no telefone e preview da mensagem)
    if (searchTerm) {
      filtered = filtered.filter(chat => 
        (chat.phone && chat.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (chat.last_message_preview && chat.last_message_preview.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(chat => chat.status === statusFilter);
    }

    // Filtrar por canal
    if (channelFilter !== 'all') {
      filtered = filtered.filter(chat => chat.channel === channelFilter);
    }
    
    // Filtrar por período
    if (selectedTab !== 'all') {
      const now = new Date();
      let compareDate = new Date();
      
      if (selectedTab === 'today') {
        compareDate.setHours(0, 0, 0, 0);
      } else if (selectedTab === 'week') {
        compareDate.setDate(compareDate.getDate() - 7);
      }
      
      filtered = filtered.filter(chat => {
        if (!chat.updated_at) return false;
        const chatDate = new Date(chat.updated_at);
        return chatDate >= compareDate;
      });
    }
    
    // Ordenar por data de atualização (mais recentes primeiro)
    filtered.sort((a, b) => {
      const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return dateB - dateA;
    });
    
    return filtered;
  };
  
  const filteredChats = filterChats();
  
  // Limpar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedTab('all');
    setStatusFilter('all');
    setChannelFilter('all');
  };
  
  // Handler para mudança de tab
  const handleTabChange = (value: string) => {
    setSelectedTab(value as PeriodType);
  };
  
  // Renderiza o conteúdo baseado no estado atual
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando conversas...</span>
        </div>
      );
    }
    
    if (isError) {
      return (
        <div className="text-center p-12 text-red-500">
          Ocorreu um erro ao carregar as conversas. Por favor, tente novamente.
        </div>
      );
    }
    
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Canal</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Última Mensagem</TableHead>
                <TableHead className="hidden lg:table-cell">Atualizado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <TableRow key={chat.id} className="group">
                    <TableCell>
                      <ChatChannelIcon channel={chat.channel} size="sm" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {formatPhone(chat.lead_phone || chat.phone || chat.channel_chat_id?.replace('@s.whatsapp.net', '') || '')}
                          </span>
                        </div>
                        {chat.lead_name && (
                          <p className="text-sm text-muted-foreground">
                            {chat.lead_name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ChatStatusBadge status={chat.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[300px]">
                      {chat.last_message_preview ? (
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.last_message_preview}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Sem mensagens
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-sm text-muted-foreground">
                        {formatDate(chat.updated_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/chats/${encodeURIComponent(chat.lead_phone || chat.phone || chat.channel_chat_id?.replace('@s.whatsapp.net', '') || '')}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma conversa encontrada com os filtros aplicados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Mostrando <strong>{filteredChats.length}</strong> de <strong>{chats.length}</strong> conversas
          </div>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conversas</h1>
        <p className="text-muted-foreground">
          Gerencie todas as conversas com seus leads e clientes
        </p>
      </div>

      {/* Métricas */}
      <ChatMetricsCards chats={chats} isLoading={isLoading} />

      {/* Tabs e Filtros */}
      <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="space-y-4">
          {/* Tabs de Período */}
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">
              <MessageSquare className="h-4 w-4 mr-2" />
              Todas
            </TabsTrigger>
            <TabsTrigger value="today">
              <Calendar className="h-4 w-4 mr-2" />
              Hoje
            </TabsTrigger>
            <TabsTrigger value="week">
              <CalendarClock className="h-4 w-4 mr-2" />
              Última Semana
            </TabsTrigger>
          </TabsList>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <ChatListFilters 
              onFiltersChange={handleFiltersChange}
              activeFiltersCount={activeFiltersCount}
            />
          </div>
        </div>
        
        {/* Conteúdo das Tabs */}
        <TabsContent value="all" className="space-y-4 mt-6">
          {renderContent()}
        </TabsContent>
        
        <TabsContent value="today" className="space-y-4 mt-6">
          {renderContent()}
        </TabsContent>
        
        <TabsContent value="week" className="space-y-4 mt-6">
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}