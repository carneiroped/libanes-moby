'use client';

import { useState, useMemo } from 'react';
import { useEvents, EventType, EventStatus, getEventTypeLabel, getEventTypeColor, getEventStatusLabel, getEventStatusColor, useCheckInEvent, useCheckOutEvent, useDeleteEvent } from '@/hooks/useEvents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { format, isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  CalendarIcon, 
  PlusIcon, 
  FilterIcon, 
  MapPinIcon, 
  ClockIcon, 
  UserIcon, 
  BuildingIcon, 
  CheckCircleIcon, 
  TrashIcon,
  PhoneIcon,
  VideoIcon,
  LogInIcon,
  LogOutIcon,
  SearchIcon,
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
  MoreHorizontal,
  Edit2Icon
} from 'lucide-react';
import { EventForm } from '@/components/calendario-novo/EventForm';
import { StandardLoadingState, StandardEmptyState, StandardConfirmDialog, StandardModal, StandardPagination } from '@/components/ui/ux-patterns';
import { useFeedback, usePagination } from '@/hooks/useUXPatterns';

export default function EventosPage() {
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | 'all'>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(),
    to: new Date()
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false);
  const [checkOutNotes, setCheckOutNotes] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // New states for improved UX
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [bulkAction, setBulkAction] = useState<'delete' | 'complete' | 'cancel' | null>(null);
  
  // Initialize feedback and pagination
  const feedback = useFeedback();
  const pagination = usePagination({ initialPageSize: 12 });

  // Filtros para a query
  const filters = useMemo(() => {
    const baseFilters: any = {};
    
    if (selectedType !== 'all') {
      baseFilters.type = selectedType;
    }
    
    if (selectedStatus !== 'all') {
      baseFilters.status = selectedStatus;
    }
    
    if (selectedDateRange.from) {
      baseFilters.start_date = startOfDay(selectedDateRange.from).toISOString();
    }
    
    if (selectedDateRange.to) {
      baseFilters.end_date = endOfDay(selectedDateRange.to).toISOString();
    }
    
    return baseFilters;
  }, [selectedType, selectedStatus, selectedDateRange]);

  // Hooks
  const { data: events = [], isLoading } = useEvents(filters);
  const checkInMutation = useCheckInEvent();
  const checkOutMutation = useCheckOutEvent();
  const deleteMutation = useDeleteEvent();

  // Filtrar eventos por termo de busca
  const filteredEvents = useMemo(() => {
    if (!searchTerm) return events;
    
    const term = searchTerm.toLowerCase();
    return events.filter(event => 
      event.title.toLowerCase().includes(term) ||
      event.description?.toLowerCase().includes(term) ||
      event.lead_name?.toLowerCase().includes(term) ||
      event.property_title?.toLowerCase().includes(term)
    );
  }, [events, searchTerm]);

  // Agrupar eventos por data e paginar
  const groupedEvents = useMemo(() => {
    const groups: Record<string, typeof events> = {};
    
    filteredEvents.forEach(event => {
      // Verificar se start_at existe antes de processar
      if (!event.start_at) {
        console.warn('Evento sem start_at:', event);
        return;
      }
      
      const date = format(parseISO(event.start_at), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
    });
    
    // Ordenar por data
    const sortedDates = Object.keys(groups).sort();
    const sortedGroups: Record<string, typeof events> = {};
    
    sortedDates.forEach(date => {
      sortedGroups[date] = groups[date].sort((a, b) => {
        // Garantir que ambos eventos têm start_at
        if (!a.start_at || !b.start_at) return 0;
        return new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
      });
    });
    
    return sortedGroups;
  }, [filteredEvents]);

  // Paginated events
  const paginatedGroupedEvents = useMemo(() => {
    const allDateGroups = Object.entries(groupedEvents);
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    
    // For simplicity, we paginate by date groups, not individual events
    const paginatedGroups = allDateGroups.slice(startIndex, endIndex);
    return Object.fromEntries(paginatedGroups);
  }, [groupedEvents, pagination.page, pagination.limit]);

  // Update pagination when total changes
  const totalDateGroups = Object.keys(groupedEvents).length;

  const handleCheckIn = async (event: any) => {
    try {
      feedback.info.processing();
      // Obter localização atual se disponível
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await checkInMutation.mutateAsync({
              id: event.id,
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            });
            feedback.showSuccess('Check-in realizado com sucesso!');
          },
          async () => {
            // Se não conseguir localização, fazer check-in sem ela
            await checkInMutation.mutateAsync({ id: event.id });
            feedback.showSuccess('Check-in realizado com sucesso!');
          }
        );
      } else {
        await checkInMutation.mutateAsync({ id: event.id });
        feedback.showSuccess('Check-in realizado com sucesso!');
      }
    } catch (error) {
      feedback.showError('Erro ao fazer check-in. Tente novamente.');
      console.error('Erro ao fazer check-in:', error);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedEvent) return;
    
    try {
      await checkOutMutation.mutateAsync({
        id: selectedEvent.id,
        notes: checkOutNotes
      });
      setShowCheckOutDialog(false);
      setCheckOutNotes('');
      setSelectedEvent(null);
      feedback.showSuccess('Check-out realizado com sucesso!');
    } catch (error) {
      feedback.showError('Erro ao fazer check-out. Tente novamente.');
      console.error('Erro ao fazer check-out:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    
    try {
      await deleteMutation.mutateAsync(selectedEvent.id);
      setShowDeleteDialog(false);
      setSelectedEvent(null);
      feedback.success.delete();
    } catch (error) {
      feedback.showError('Erro ao excluir evento. Tente novamente.');
      console.error('Erro ao excluir evento:', error);
    }
  };

  // New handlers for improved UX
  const handleSelectEvent = (eventId: string, checked: boolean) => {
    if (checked) {
      setSelectedEvents(prev => [...prev, eventId]);
    } else {
      setSelectedEvents(prev => prev.filter(id => id !== eventId));
    }
  };

  const handleSelectAllEvents = (checked: boolean) => {
    if (checked) {
      setSelectedEvents(filteredEvents.map(event => event.id));
    } else {
      setSelectedEvents([]);
    }
  };

  const handleBulkAction = (action: 'delete' | 'complete' | 'cancel') => {
    if (selectedEvents.length === 0) {
      feedback.showWarning('Selecione pelo menos um evento para continuar.');
      return;
    }
    
    setBulkAction(action);
    if (action === 'delete') {
      setShowBulkDeleteDialog(true);
    }
    // TODO: Implement other bulk actions
  };

  const handleBulkDelete = async () => {
    try {
      // TODO: Implement bulk delete API call
      feedback.info.processing();
      
      // Simulate API calls
      for (const eventId of selectedEvents) {
        await deleteMutation.mutateAsync(eventId);
      }
      
      setShowBulkDeleteDialog(false);
      setSelectedEvents([]);
      setBulkAction(null);
      feedback.showSuccess(`${selectedEvents.length} evento(s) excluído(s) com sucesso!`);
    } catch (error) {
      feedback.showError('Erro ao excluir eventos. Tente novamente.');
      console.error('Erro ao excluir eventos:', error);
    }
  };

  const handlePasswordSubmit = () => {
    if (!passwordValue.trim()) {
      setPasswordError('Senha é obrigatória');
      return;
    }
    
    // TODO: Implement password validation logic
    if (passwordValue === 'admin123') {
      setShowPasswordModal(false);
      setPasswordValue('');
      setPasswordError('');
      feedback.showSuccess('Acesso autorizado!');
    } else {
      setPasswordError('Senha incorreta');
    }
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'property_visit':
        return BuildingIcon;
      case 'meeting':
        return UserIcon;
      case 'call':
        return PhoneIcon;
      case 'contract_signing':
        return CheckCircleIcon;
      default:
        return CalendarIcon;
    }
  };

  const canCheckIn = (event: any) => {
    if (event.status !== 'scheduled') return false;
    const now = new Date();
    const startTime = parseISO(event.start_at);
    const diffMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);
    return diffMinutes <= 30; // Permitir check-in 30 minutos antes
  };

  const canCheckOut = (event: any) => {
    return event.status === 'in_progress' && event.check_in_at;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Eventos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os eventos e compromissos
            {selectedEvents.length > 0 && (
              <span className="ml-2 text-primary font-medium">
                ({selectedEvents.length} selecionado{selectedEvents.length > 1 ? 's' : ''})
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedEvents.length > 0 && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('complete')}
                disabled={checkInMutation.isPending}
              >
                <CheckCircleIcon className="mr-2 h-4 w-4" />
                Marcar Concluído
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('cancel')}
                disabled={checkInMutation.isPending}
              >
                Cancelar Eventos
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleBulkAction('delete')}
                disabled={deleteMutation.isPending}
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Excluir ({selectedEvents.length})
              </Button>
            </>
          )}
          
          <Button onClick={() => setShowNewEventDialog(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
          
          {/* Password Access Button - Example of where password modal might be used */}
          <Button 
            variant="outline"
            onClick={() => setShowPasswordModal(true)}
          >
            Acesso Admin
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4" />
              Filtros
            </div>
            {filteredEvents.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedEvents.length === filteredEvents.length}
                  onCheckedChange={handleSelectAllEvents}
                />
                <label htmlFor="select-all" className="text-sm font-normal cursor-pointer">
                  Selecionar todos ({filteredEvents.length})
                </label>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Tipo */}
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as EventType | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="property_visit">Visita ao Imóvel</SelectItem>
                <SelectItem value="meeting">Reunião</SelectItem>
                <SelectItem value="call">Ligação</SelectItem>
                <SelectItem value="contract_signing">Assinatura de Contrato</SelectItem>
                <SelectItem value="task">Tarefa</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
              </SelectContent>
            </Select>

            {/* Status */}
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as EventStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="no_show">Não Compareceu</SelectItem>
              </SelectContent>
            </Select>

            {/* Data */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !selectedDateRange.from && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDateRange.from ? (
                    selectedDateRange.to ? (
                      <>
                        {format(selectedDateRange.from, "dd/MM", { locale: ptBR })} - {format(selectedDateRange.to, "dd/MM", { locale: ptBR })}
                      </>
                    ) : (
                      format(selectedDateRange.from, "dd/MM/yyyy", { locale: ptBR })
                    )
                  ) : (
                    <span>Selecione o período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={selectedDateRange.from}
                  selected={selectedDateRange}
                  onSelect={(range: any) => setSelectedDateRange(range || { from: undefined, to: undefined })}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Eventos */}
      {isLoading ? (
        <StandardLoadingState 
          config={{
            type: 'skeleton',
            text: 'Carregando eventos...',
            size: 'lg'
          }}
        />
      ) : Object.keys(groupedEvents).length === 0 ? (
        <StandardEmptyState 
          config={{
            title: 'Nenhum evento encontrado',
            message: 'Ajuste os filtros ou crie um novo evento para começar.',
            icon: 'Search',
            searchable: true,
            filterable: true,
            actions: [
              {
                label: 'Novo Evento',
                variant: 'contained',
                icon: '+',
                action: () => setShowNewEventDialog(true),
              }
            ]
          }}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(paginatedGroupedEvents).map(([date, dayEvents]) => (
            <div key={date} className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(parseISO(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                <Badge variant="secondary">{dayEvents.length} evento{dayEvents.length > 1 ? 's' : ''}</Badge>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dayEvents.map((event) => {
                  const Icon = getEventIcon(event.type);
                  const isOverdue = event.status === 'scheduled' && isBefore(parseISO(event.start_at), new Date());
                  
                  return (
                    <Card key={event.id} className={cn(
                      "hover:shadow-lg transition-shadow",
                      isOverdue && "border-red-500",
                      selectedEvents.includes(event.id) && "ring-2 ring-primary"
                    )}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox
                              checked={selectedEvents.includes(event.id)}
                              onCheckedChange={(checked) => handleSelectEvent(event.id, checked as boolean)}
                              className="mt-1"
                            />
                            <div className="space-y-1 flex-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {event.title}
                              </CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={cn("text-xs", getEventTypeColor(event.type))}>
                                {getEventTypeLabel(event.type)}
                              </Badge>
                              <Badge className={cn("text-xs", getEventStatusColor(event.status))}>
                                {getEventStatusLabel(event.status)}
                              </Badge>
                              {isOverdue && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircleIcon className="mr-1 h-3 w-3" />
                                  Atrasado
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Horário */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ClockIcon className="h-4 w-4" />
                          <span>
                            {format(parseISO(event.start_at), 'HH:mm')} - {format(parseISO(event.end_at), 'HH:mm')}
                            {event.all_day && ' (Dia todo)'}
                          </span>
                        </div>

                        {/* Lead */}
                        {event.lead_name && (
                          <div className="flex items-center gap-2 text-sm">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{event.lead_name}</span>
                          </div>
                        )}

                        {/* Imóvel */}
                        {event.property_title && (
                          <div className="flex items-center gap-2 text-sm">
                            <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{event.property_title}</span>
                          </div>
                        )}

                        {/* Local ou Link */}
                        {event.location?.address && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{event.location.address}</span>
                          </div>
                        )}
                        
                        {event.meeting_url && (
                          <div className="flex items-center gap-2 text-sm">
                            <VideoIcon className="h-4 w-4 text-muted-foreground" />
                            <a 
                              href={event.meeting_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Link da reunião
                            </a>
                          </div>
                        )}

                        {/* Check-in/Check-out Info */}
                        {event.check_in_at && (
                          <div className="pt-2 border-t space-y-1">
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <LogInIcon className="h-4 w-4" />
                              <span>Check-in: {format(parseISO(event.check_in_at), 'HH:mm')}</span>
                            </div>
                            {event.check_out_at && (
                              <div className="flex items-center gap-2 text-sm text-blue-600">
                                <LogOutIcon className="h-4 w-4" />
                                <span>Check-out: {format(parseISO(event.check_out_at), 'HH:mm')}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Ações */}
                        <div className="flex gap-2 pt-3 border-t">
                          {canCheckIn(event) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCheckIn(event);
                              }}
                              disabled={checkInMutation.isPending}
                            >
                              {checkInMutation.isPending ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1" />
                              ) : (
                                <LogInIcon className="mr-1 h-3 w-3" />
                              )}
                              Check-in
                            </Button>
                          )}
                          
                          {canCheckOut(event) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                                setShowCheckOutDialog(true);
                              }}
                              disabled={checkOutMutation.isPending}
                            >
                              <LogOutIcon className="mr-1 h-3 w-3" />
                              Check-out
                            </Button>
                          )}

                          {event.status === 'scheduled' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Implementar edição
                                  feedback.showInfo('Edição em desenvolvimento');
                                }}
                              >
                                <Edit2Icon className="mr-1 h-3 w-3" />
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEvent(event);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <TrashIcon className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* Pagination */}
          {totalDateGroups > pagination.limit && (
            <div className="flex justify-center pt-6">
              <StandardPagination
                pagination={{
                  page: pagination.page,
                  limit: pagination.limit,
                  total: totalDateGroups,
                  totalPages: Math.ceil(totalDateGroups / pagination.limit),
                  hasNext: pagination.hasNext,
                  hasPrev: pagination.hasPrev
                }}
                onPageChange={pagination.goToPage}
                onPageSizeChange={pagination.changePageSize}
                showPageSize={true}
                showInfo={true}
              />
            </div>
          )}
        </div>
      )}

      {/* Dialog para novo evento */}
      <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Evento</DialogTitle>
          </DialogHeader>
          <EventForm
            onSuccess={() => setShowNewEventDialog(false)}
            onCancel={() => setShowNewEventDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para check-out */}
      <StandardModal
        isOpen={showCheckOutDialog}
        onClose={() => setShowCheckOutDialog(false)}
        title="Fazer Check-out"
        description={`Finalizando o evento "${selectedEvent?.title}". Adicione notas sobre o evento antes de finalizar.`}
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCheckOutDialog(false);
                setCheckOutNotes('');
              }}
              disabled={checkOutMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCheckOut}
              disabled={checkOutMutation.isPending}
            >
              {checkOutMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Salvando...
                </>
              ) : (
                'Confirmar Check-out'
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="checkout-notes" className="text-sm font-medium">
              Notas do Check-out (opcional)
            </label>
            <Textarea
              id="checkout-notes"
              placeholder="Descreva como foi o evento, resultados, observações importantes..."
              value={checkOutNotes}
              onChange={(e) => setCheckOutNotes(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {checkOutNotes.length}/500 caracteres
            </div>
          </div>
          
          {selectedEvent && (
            <div className="bg-muted/50 p-3 rounded-md text-sm space-y-1">
              <p><strong>Evento:</strong> {selectedEvent.title}</p>
              <p><strong>Data/Hora:</strong> {format(parseISO(selectedEvent.start_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
              {selectedEvent.lead_name && (
                <p><strong>Cliente:</strong> {selectedEvent.lead_name}</p>
              )}
            </div>
          )}
        </div>
      </StandardModal>

      {/* Standard Confirm Dialog for single delete */}
      <StandardConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Excluir Evento"
        description={`Tem certeza que deseja excluir o evento "${selectedEvent?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="destructive"
        loading={deleteMutation.isPending}
      />

      {/* Standard Confirm Dialog for bulk delete */}
      <StandardConfirmDialog
        isOpen={showBulkDeleteDialog}
        onClose={() => setShowBulkDeleteDialog(false)}
        onConfirm={handleBulkDelete}
        title="Excluir Eventos"
        description={`Tem certeza que deseja excluir ${selectedEvents.length} evento${selectedEvents.length > 1 ? 's' : ''}? Esta ação não pode ser desfeita e afetará todos os eventos selecionados.`}
        confirmText={`Excluir ${selectedEvents.length} evento${selectedEvents.length > 1 ? 's' : ''}`}
        variant="destructive"
        loading={deleteMutation.isPending}
      />

      {/* Password Modal */}
      <StandardModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordValue('');
          setPasswordError('');
        }}
        title="Acesso Administrativo"
        description="Digite a senha para acessar as funcionalidades administrativas avançadas"
        size="sm"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordValue('');
                setPasswordError('');
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handlePasswordSubmit}
              disabled={!passwordValue.trim()}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="admin-password" className="text-sm font-medium">
              Senha Administrativa
            </label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={passwordValue}
                onChange={(e) => {
                  setPasswordValue(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="Digite sua senha..."
                className={passwordError ? "border-red-500" : ""}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit();
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            {passwordError && (
              <p className="text-sm text-red-600">{passwordError}</p>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            <p>Funcionalidades disponíveis após autenticação:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Exportação de dados completos</li>
              <li>Relatórios avançados</li>
              <li>Configurações de sistema</li>
              <li>Logs de auditoria</li>
            </ul>
          </div>
        </div>
      </StandardModal>
    </div>
  );
}