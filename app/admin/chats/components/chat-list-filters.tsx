'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, MessageCircle, Phone, Instagram, Globe } from 'lucide-react';
import { Database } from '@/types/database.types';

type ChatStatus = Database['public']['Enums']['chat_status'];
type MessageChannel = Database['public']['Enums']['message_channel'];

interface ChatListFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    status: ChatStatus | 'all';
    channel: MessageChannel | 'all';
  }) => void;
  activeFiltersCount?: number;
}

const statusOptions: { value: ChatStatus | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'Todos os Status', color: 'default' },
  { value: 'active', label: 'Ativo', color: 'bg-green-100 text-green-800' },
  { value: 'waiting_agent', label: 'Aguardando Agente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'transferred', label: 'Transferido', color: 'bg-blue-100 text-blue-800' },
  { value: 'resolved', label: 'Resolvido', color: 'bg-gray-100 text-gray-800' },
  { value: 'archived', label: 'Arquivado', color: 'bg-slate-100 text-slate-800' }
];

const channelOptions: { 
  value: MessageChannel | 'all'; 
  label: string; 
  icon: React.ComponentType<{ className?: string }> 
}[] = [
  { value: 'all', label: 'Todos os Canais', icon: MessageCircle },
  { value: 'whatsapp_official', label: 'WhatsApp Oficial', icon: Phone },
  { value: 'whatsapp_evolution', label: 'WhatsApp Evolution', icon: Phone },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'facebook', label: 'Facebook', icon: MessageCircle },
  { value: 'webchat', label: 'Web Chat', icon: Globe }
];

export function ChatListFilters({ onFiltersChange, activeFiltersCount = 0 }: ChatListFiltersProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ChatStatus | 'all'>('all');
  const [channel, setChannel] = useState<MessageChannel | 'all'>('all');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFiltersChange({ search: value, status, channel });
  };

  const handleStatusChange = (value: ChatStatus | 'all') => {
    setStatus(value);
    onFiltersChange({ search, status: value, channel });
  };

  const handleChannelChange = (value: MessageChannel | 'all') => {
    setChannel(value);
    onFiltersChange({ search, status, channel: value });
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setChannel('all');
    onFiltersChange({ search: '', status: 'all', channel: 'all' });
    setIsPopoverOpen(false);
  };

  const hasActiveFilters = search !== '' || status !== 'all' || channel !== 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Busca */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por telefone ou mensagem..."
          className="pl-9 pr-4"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => handleSearchChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filtros Rápidos - Desktop */}
      <div className="hidden md:flex gap-2">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.value !== 'all' && (
                    <div className={`w-2 h-2 rounded-full ${option.color.split(' ')[0]}`} />
                  )}
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={channel} onValueChange={handleChannelChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            {channelOptions.map((option) => {
              const Icon = option.icon;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Filtros Mobile/Tablet - Popover */}
      <div className="flex gap-2 md:hidden">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="font-medium">Filtros</div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.value !== 'all' && (
                            <div className={`w-2 h-2 rounded-full ${option.color.split(' ')[0]}`} />
                          )}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Canal</label>
                <Select value={channel} onValueChange={handleChannelChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o canal" />
                  </SelectTrigger>
                  <SelectContent>
                    {channelOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                >
                  Limpar filtros
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsPopoverOpen(false)}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Botão Limpar Filtros - Desktop */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="hidden md:flex gap-2"
        >
          <X className="h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}