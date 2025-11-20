'use client';

import { useState, useMemo, useCallback } from 'react';
import { useImoveis } from '@/hooks/useImoveis';
import { useLeads } from '@/hooks/useLeads';
import { useCreateEvent, useEventConflicts } from '@/hooks/useEvents';
import { useAccount } from '@/hooks/useAccount';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addHours, startOfHour, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock, MapPin, Building, User, Search, Phone, Mail, Home, AlertTriangle } from 'lucide-react';

// Enhanced UX Components
import { 
  StandardLoadingState, 
  StandardPagination, 
  StandardSearchFilter, 
  StandardModal,
  StandardConfirmDialog 
} from '@/components/ui/ux-patterns';

// Enhanced UX Hooks
import { 
  usePagination, 
  useDebounce, 
  useFeedback, 
  useRealTimeValidation 
} from '@/hooks/useUXPatterns';

export default function AgendarPage() {
  // Authentication
  const { account } = useAccount();
  
  // Form state
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [duration, setDuration] = useState('60'); // minutos
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  // Search state with debounce
  const [searchProperty, setSearchProperty] = useState('');
  const [searchLead, setSearchLead] = useState('');
  const debouncedPropertySearch = useDebounce(searchProperty, 300);
  const debouncedLeadSearch = useDebounce(searchLead, 300);

  // Conflict detection state
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [pendingEventData, setPendingEventData] = useState<any>(null);

  // Data fetching
  const { data: propertiesData, isLoading: loadingProperties } = useImoveis();
  const { data: leadsData, isLoading: loadingLeads } = useLeads();
  
  // Extrair arrays dos dados usando useMemo para evitar recriação
  const properties = useMemo(() => propertiesData?.imoveis || [], [propertiesData]);
  const leads = useMemo(() => leadsData?.leads || [], [leadsData]);
  
  // Mutations
  const createEvent = useCreateEvent();
  const eventConflicts = useEventConflicts();

  // Enhanced hooks
  const feedback = useFeedback();

  // Real-time validation
  const validation = useRealTimeValidation({
    initialValues: {
      selectedProperty,
      selectedLead,
      selectedDate: selectedDate?.toISOString(),
      selectedTime
    },
    validationRules: {
      selectedProperty: [{ type: 'required', message: 'Selecione um imóvel' }],
      selectedLead: [{ type: 'required', message: 'Selecione um cliente' }],
      selectedDate: [{ type: 'required', message: 'Selecione uma data' }],
      selectedTime: [{ type: 'required', message: 'Selecione um horário' }]
    }
  });

  // Filtrar imóveis com debounce
  const filteredProperties = useMemo(() => {
    if (!debouncedPropertySearch) return properties;
    const search = debouncedPropertySearch.toLowerCase();
    return properties.filter((p: any) => 
      p.descricao?.toLowerCase().includes(search) ||
      p.bairro?.toLowerCase().includes(search) ||
      p.cidade?.toLowerCase().includes(search)
    );
  }, [properties, debouncedPropertySearch]);

  // Filtrar leads com debounce
  const filteredLeads = useMemo(() => {
    if (!debouncedLeadSearch) return leads;
    const search = debouncedLeadSearch.toLowerCase();
    return leads.filter((l: any) => 
      l.name?.toLowerCase().includes(search) ||
      l.email?.toLowerCase().includes(search) ||
      l.phone?.toLowerCase().includes(search)
    );
  }, [leads, debouncedLeadSearch]);

  // Pagination para imóveis
  const propertyPagination = usePagination({
    initialPageSize: 10,
    total: filteredProperties.length
  });

  // Pagination para leads
  const leadPagination = usePagination({
    initialPageSize: 10,
    total: filteredLeads.length
  });

  // Paginated results
  const paginatedProperties = useMemo(() => {
    const startIndex = (propertyPagination.page - 1) * propertyPagination.limit;
    const endIndex = startIndex + propertyPagination.limit;
    return filteredProperties.slice(startIndex, endIndex);
  }, [filteredProperties, propertyPagination.page, propertyPagination.limit]);

  const paginatedLeads = useMemo(() => {
    const startIndex = (leadPagination.page - 1) * leadPagination.limit;
    const endIndex = startIndex + leadPagination.limit;
    return filteredLeads.slice(startIndex, endIndex);
  }, [filteredLeads, leadPagination.page, leadPagination.limit]);

  // Gerar horários disponíveis
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  const selectedPropertyData = properties.find((p: any) => p.id === selectedProperty);
  const selectedLeadData = leads.find((l: any) => l.id === selectedLead);

  // Check for conflicts before creating event
  const checkConflicts = useCallback(async (eventData: any) => {
    if (!account?.id) return [];

    try {
      const conflictData = await eventConflicts.mutateAsync({
        ownerId: account.id,
        startAt: eventData.start_at,
        endAt: eventData.end_at
      });
      return conflictData || [];
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return [];
    }
  }, [eventConflicts, account?.id]);

  // Create event with proper error handling
  const createEventHandler = useCallback(async (eventData: any) => {
    try {
      await createEvent.mutateAsync(eventData);
      
      // Limpar formulário
      setSelectedProperty('');
      setSelectedLead('');
      setDescription('');
      setLocation('');
      validation.resetValidation();
      
      feedback.success.appointmentBooked();
    } catch (error) {
      console.error('Erro ao agendar visita:', error);
      feedback.showError('Erro ao agendar visita. Tente novamente.');
    }
  }, [createEvent, validation, feedback]);

  const handleSubmit = useCallback(async () => {
    // Validate all fields first
    const isFormValid = await validation.validateAllFields();
    if (!isFormValid) {
      feedback.error.validation();
      return;
    }

    if (!selectedProperty || !selectedLead || !selectedDate || !selectedTime) {
      feedback.error.requiredField();
      return;
    }

    if (!account?.id) {
      feedback.error.permission();
      return;
    }

    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startDate = setMinutes(setHours(selectedDate, hours), minutes);
      const endDate = addHours(startDate, Number(duration) / 60);

      const eventLocation = location || (selectedPropertyData ? 
        `${selectedPropertyData.bairro || ''}, ${selectedPropertyData.cidade || ''}`.trim() : 
        ''
      );

      const eventData = {
        type: 'property_visit',
        title: `Visita: ${selectedPropertyData?.descricao || 'Imóvel'} - ${selectedLeadData?.name || 'Cliente'}`,
        description: description || `Visita ao imóvel ${selectedPropertyData?.descricao} com ${selectedLeadData?.name}`,
        property_id: selectedProperty,
        lead_id: selectedLead,
        start_at: startDate.toISOString(),
        end_at: endDate.toISOString(),
        location: eventLocation ? { address: eventLocation } : undefined,
        reminder_minutes: [30, 60]
      };

      // Check for conflicts
      const foundConflicts = await checkConflicts(eventData);
      
      if (foundConflicts.length > 0) {
        setConflicts(foundConflicts);
        setPendingEventData(eventData);
        setShowConflictModal(true);
        return;
      }

      // No conflicts, create event directly
      await createEventHandler(eventData);

    } catch (error) {
      console.error('Erro ao agendar visita:', error);
      feedback.error.generic();
    }
  }, [
    validation,
    selectedProperty,
    selectedLead,
    selectedDate,
    selectedTime,
    account?.id,
    duration,
    location,
    description,
    selectedPropertyData,
    selectedLeadData,
    checkConflicts,
    createEventHandler,
    feedback
  ]);

  // Handle conflict resolution
  const handleConflictResolve = useCallback(async (forceCreate: boolean) => {
    setShowConflictModal(false);
    
    if (forceCreate && pendingEventData) {
      await createEventHandler(pendingEventData);
    }
    
    setPendingEventData(null);
    setConflicts([]);
  }, [pendingEventData, createEventHandler]);

  const isLoading = loadingProperties || loadingLeads;
  const isSubmitting = createEvent.isPending || eventConflicts.isPending;

  // Show loading state if data is still loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Agendar Visita</h1>
          <p className="text-muted-foreground">Agende visitas aos imóveis com seus clientes</p>
        </div>
        <StandardLoadingState config="SPINNER" className="py-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agendar Visita</h1>
        <p className="text-muted-foreground">Agende visitas aos imóveis com seus clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seleção de Imóvel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Selecionar Imóvel
              {filteredProperties.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({filteredProperties.length} encontrados)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enhanced search */}
            <StandardSearchFilter
              searchValue={searchProperty}
              onSearchChange={setSearchProperty}
              placeholder="Buscar imóvel por título, bairro ou cidade..."
            />

            {selectedPropertyData ? (
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium">{selectedPropertyData.descricao}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedPropertyData.bairro}, {selectedPropertyData.cidade}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {selectedPropertyData.valor && (
                    <span>
                      {selectedPropertyData.purpose === 'sale' ? 'Venda' : 'Aluguel'}: {' '}
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(selectedPropertyData.valor)}
                      {selectedPropertyData.purpose === 'rent' ? '/mês' : ''}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setSelectedProperty('');
                    validation.setValue('selectedProperty', '');
                  }}
                >
                  Trocar imóvel
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {paginatedProperties.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      {debouncedPropertySearch ? 'Nenhum imóvel encontrado' : 'Nenhum imóvel disponível'}
                    </p>
                  ) : (
                    paginatedProperties.map((property: any) => (
                      <button
                        key={property.id}
                        onClick={() => {
                          setSelectedProperty(property.id);
                          validation.setValue('selectedProperty', property.id);
                        }}
                        className="w-full p-3 text-left border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{property.descricao}</h4>
                            <p className="text-sm text-muted-foreground">
                              {property.bairro}, {property.cidade}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              {property.valor && (
                                <span>
                                  {property.purpose === 'sale' ? 'Venda' : 'Aluguel'}: {' '}
                                  {new Intl.NumberFormat('pt-BR', { 
                                    style: 'currency', 
                                    currency: 'BRL' 
                                  }).format(property.valor)}
                                  {property.purpose === 'rent' ? '/mês' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <Home className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Pagination for properties */}
                {filteredProperties.length > propertyPagination.limit && (
                  <StandardPagination
                    pagination={propertyPagination}
                    onPageChange={propertyPagination.goToPage}
                    showPageSize={false}
                    showInfo={false}
                  />
                )}
              </div>
            )}

            {/* Validation error for property selection */}
            {validation.errors.selectedProperty && (
              <p className="text-sm text-destructive">{validation.errors.selectedProperty}</p>
            )}
          </CardContent>
        </Card>

        {/* Seleção de Lead */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Selecionar Cliente
              {filteredLeads.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({filteredLeads.length} encontrados)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enhanced search */}
            <StandardSearchFilter
              searchValue={searchLead}
              onSearchChange={setSearchLead}
              placeholder="Buscar cliente por nome, email ou telefone..."
            />

            {selectedLeadData ? (
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium">{selectedLeadData.name}</h4>
                <div className="space-y-1 mt-1">
                  {selectedLeadData.email && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {selectedLeadData.email}
                    </p>
                  )}
                  {selectedLeadData.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedLeadData.phone}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setSelectedLead('');
                    validation.setValue('selectedLead', '');
                  }}
                >
                  Trocar cliente
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {paginatedLeads.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      {debouncedLeadSearch ? 'Nenhum cliente encontrado' : 'Nenhum cliente disponível'}
                    </p>
                  ) : (
                    paginatedLeads.map(lead => (
                      <button
                        key={lead.id}
                        onClick={() => {
                          setSelectedLead(lead.id);
                          validation.setValue('selectedLead', lead.id);
                        }}
                        className="w-full p-3 text-left border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{lead.name}</h4>
                            <div className="space-y-1 mt-1">
                              {lead.email && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {lead.email}
                                </p>
                              )}
                              {lead.phone && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {lead.phone}
                                </p>
                              )}
                            </div>
                          </div>
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Pagination for leads */}
                {filteredLeads.length > leadPagination.limit && (
                  <StandardPagination
                    pagination={leadPagination}
                    onPageChange={leadPagination.goToPage}
                    showPageSize={false}
                    showInfo={false}
                  />
                )}
              </div>
            )}

            {/* Validation error for lead selection */}
            {validation.errors.selectedLead && (
              <p className="text-sm text-destructive">{validation.errors.selectedLead}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detalhes do Agendamento */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Agendamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data */}
            <div className="space-y-2">
              <Label>Data da Visita</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                      validation.errors.selectedDate && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      validation.setValue('selectedDate', date?.toISOString() || '');
                    }}
                    initialFocus
                    locale={ptBR}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
              {validation.errors.selectedDate && (
                <p className="text-sm text-destructive">{validation.errors.selectedDate}</p>
              )}
            </div>

            {/* Horário */}
            <div className="space-y-2">
              <Label>Horário</Label>
              <div className="flex gap-2">
                <Select 
                  value={selectedTime} 
                  onValueChange={(value) => {
                    setSelectedTime(value);
                    validation.setValue('selectedTime', value);
                  }}
                >
                  <SelectTrigger className={cn(
                    "flex-1",
                    validation.errors.selectedTime && "border-destructive"
                  )}>
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1h30</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {validation.errors.selectedTime && (
                <p className="text-sm text-destructive">{validation.errors.selectedTime}</p>
              )}
            </div>
          </div>

          {/* Local */}
          <div className="space-y-2">
            <Label>Local da Visita (opcional)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Se vazio, será usado o endereço do imóvel"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações (opcional)</Label>
            <Textarea
              placeholder="Adicione observações sobre a visita..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Botão de Agendar */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!selectedProperty || !selectedLead || !selectedDate || isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <StandardLoadingState 
                  config={{ 
                    type: 'dots', 
                    text: 'Agendando...', 
                    size: 'sm' 
                  }} 
                />
              ) : (
                'Agendar Visita'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conflict Detection Modal */}
      <StandardModal
        isOpen={showConflictModal}
        onClose={() => handleConflictResolve(false)}
        title="Conflito de Horário Detectado"
        description="Existe(m) evento(s) conflitante(s) no horário selecionado. Deseja continuar mesmo assim?"
        size="lg"
        footer={
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => handleConflictResolve(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => handleConflictResolve(true)}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <StandardLoadingState 
                  config={{ 
                    type: 'dots', 
                    text: 'Agendando...', 
                    size: 'xs' 
                  }} 
                />
              ) : (
                'Agendar Mesmo Assim'
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">
              {conflicts.length} conflito{conflicts.length > 1 ? 's' : ''} encontrado{conflicts.length > 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {conflicts.map((conflict: any, index: number) => (
              <div key={index} className="p-3 border border-amber-200 rounded-lg bg-amber-50">
                <h4 className="font-medium text-amber-800">{conflict.title}</h4>
                <p className="text-sm text-amber-700 mt-1">
                  {format(new Date(conflict.start_at), 'PPP', { locale: ptBR })} às{' '}
                  {format(new Date(conflict.start_at), 'HH:mm', { locale: ptBR })} - {' '}
                  {format(new Date(conflict.end_at), 'HH:mm', { locale: ptBR })}
                </p>
                {conflict.description && (
                  <p className="text-xs text-amber-600 mt-1">{conflict.description}</p>
                )}
              </div>
            ))}
          </div>
          
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Novo agendamento:</strong><br />
              {selectedPropertyData?.descricao} com {selectedLeadData?.name}<br />
              {selectedDate && format(selectedDate, 'PPP', { locale: ptBR })} às {selectedTime}
            </p>
          </div>
        </div>
      </StandardModal>
    </div>
  );
}