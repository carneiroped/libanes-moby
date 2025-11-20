'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Event, EventType, useCreateEvent, useUpdateEvent, useDeleteEvent, getEventTypeLabel, useEventConflicts } from '@/hooks/useEvents';
import { useLeads } from '@/hooks/useLeads';
import { useImoveis } from '@/hooks/useImoveis';
import { Calendar, Clock, MapPin, Video, Bell, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface EventFormProps {
  event?: Event | null;
  defaultDate?: Date;
  defaultHour?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EventForm({ event, defaultDate, defaultHour, onSuccess, onCancel }: EventFormProps) {
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const checkConflicts = useEventConflicts();
  const { data: leadsData } = useLeads();
  const leads = leadsData?.leads || [];
  const { data } = useImoveis();
  const properties = data?.properties || [];

  const isEditing = !!event;
  const [conflicts, setConflicts] = useState<Event[]>([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Obter userId do localStorage
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setCurrentUserId(userId);
  }, []);

  // Estados do formulário
  const [formData, setFormData] = useState({
    type: (event?.type || 'meeting') as EventType,
    title: event?.title || '',
    description: event?.description || '',
    lead_id: event?.lead_id || '',
    property_id: event?.property_id || '',
    start_date: event ? format(new Date(event.start_at), 'yyyy-MM-dd') : (defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')),
    start_time: event ? format(new Date(event.start_at), 'HH:mm') : (defaultHour ? `${String(defaultHour).padStart(2, '0')}:00` : '09:00'),
    end_date: event ? format(new Date(event.end_at), 'yyyy-MM-dd') : (defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')),
    end_time: event ? format(new Date(event.end_at), 'HH:mm') : (defaultHour ? `${String(defaultHour + 1).padStart(2, '0')}:00` : '10:00'),
    all_day: event?.all_day || false,
    location: event?.location || '',
    meeting_url: event?.meeting_url || '',
    reminder_minutes: event?.reminder_minutes || [15]
  });

  // Tipos de evento
  const eventTypes: EventType[] = ['property_visit', 'meeting', 'contract_signing', 'call', 'task', 'follow_up'];

  // Opções de lembrete
  const reminderOptions = [
    { value: 0, label: 'No momento' },
    { value: 5, label: '5 minutos antes' },
    { value: 15, label: '15 minutos antes' },
    { value: 30, label: '30 minutos antes' },
    { value: 60, label: '1 hora antes' },
    { value: 120, label: '2 horas antes' },
    { value: 1440, label: '1 dia antes' }
  ];

  // Verificar conflitos quando datas/horários mudam
  useEffect(() => {
    const checkForConflicts = async () => {
      if (!formData.start_date || !formData.start_time || !formData.end_date || !formData.end_time) {
        setConflicts([]);
        return;
      }

      setCheckingConflicts(true);
      try {
        const result = await checkConflicts.mutateAsync({
          ownerId: event?.organizer_id || currentUserId || '', // Usar organizer_id do evento ou userId atual
          startAt: `${formData.start_date}T${formData.start_time}:00`,
          endAt: `${formData.end_date}T${formData.end_time}:00`,
          excludeEventId: event?.id
        });
        
        setConflicts(result || []);
      } catch (error) {
        console.error('Erro ao verificar conflitos:', error);
        setConflicts([]);
      } finally {
        setCheckingConflicts(false);
      }
    };

    const timer = setTimeout(checkForConflicts, 500); // Debounce
    return () => clearTimeout(timer);
  }, [formData.start_date, formData.start_time, formData.end_date, formData.end_time, event?.id, event?.organizer_id, currentUserId, checkConflicts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      const eventData = {
        type: formData.type,
        title: formData.title,
        description: formData.description || undefined,
        lead_id: formData.lead_id && formData.lead_id !== 'none' ? formData.lead_id : undefined,
        property_id: formData.property_id && formData.property_id !== 'none' ? formData.property_id : undefined,
        start_at: `${formData.start_date}T${formData.start_time}:00`,
        end_at: `${formData.end_date}T${formData.end_time}:00`,
        all_day: formData.all_day,
        location: formData.location || undefined,
        meeting_url: formData.meeting_url || undefined,
        reminder_minutes: formData.reminder_minutes
      };

      if (isEditing) {
        await updateEvent.mutateAsync({ id: event.id, ...eventData });
      } else {
        await createEvent.mutateAsync(eventData);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    }
  };

  const handleDelete = async () => {
    if (!event || !confirm('Tem certeza que deseja excluir este evento?')) return;

    try {
      await deleteEvent.mutateAsync(event.id);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tipo de evento */}
      <div>
        <Label htmlFor="type">Tipo de Evento</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value as EventType })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map(type => (
              <SelectItem key={type} value={type}>
                {getEventTypeLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Título */}
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Digite o título do evento"
          required
        />
      </div>

      {/* Descrição */}
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Digite uma descrição opcional"
          rows={3}
        />
      </div>

      {/* Data e hora */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Data de Início</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="pl-10"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="start_time">Hora de Início</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="start_time"
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="pl-10"
              disabled={formData.all_day}
              required
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="end_date">Data de Término</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="pl-10"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="end_time">Hora de Término</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="end_time"
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="pl-10"
              disabled={formData.all_day}
              required
            />
          </div>
        </div>
      </div>

      {/* Dia inteiro */}
      <div className="flex items-center justify-between">
        <Label htmlFor="all_day">Evento de dia inteiro</Label>
        <Switch
          id="all_day"
          checked={formData.all_day}
          onCheckedChange={(checked) => setFormData({ ...formData, all_day: checked })}
        />
      </div>

      {/* Lead */}
      {formData.type !== 'task' && (
        <div>
          <Label htmlFor="lead_id">Lead Relacionado</Label>
          <Select
            value={formData.lead_id}
            onValueChange={(value) => setFormData({ ...formData, lead_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um lead (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {leads.map(lead => (
                <SelectItem key={lead.id} value={lead.id}>
                  {lead.name} - {lead.phone || (lead as any).whatsapp || 'Sem telefone'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Imóvel */}
      {formData.type === 'property_visit' && (
        <div>
          <Label htmlFor="property_id">Imóvel</Label>
          <Select
            value={formData.property_id}
            onValueChange={(value) => setFormData({ ...formData, property_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um imóvel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {properties.map(property => (
                <SelectItem key={property.id} value={String(property.id)}>
                  {property.title} - {(property as any).address?.bairro || (property as any).address?.cidade || 'Sem endereço'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Local */}
      <div>
        <Label htmlFor="location">Local</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Digite o endereço ou local"
            className="pl-10"
          />
        </div>
      </div>

      {/* URL de reunião */}
      {(formData.type === 'meeting' || formData.type === 'call') && (
        <div>
          <Label htmlFor="meeting_url">Link da Reunião</Label>
          <div className="relative">
            <Video className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="meeting_url"
              value={formData.meeting_url}
              onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
              placeholder="https://meet.google.com/..."
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Lembrete */}
      <div>
        <Label htmlFor="reminder">Lembrete</Label>
        <Select
          value={String(formData.reminder_minutes[0] || 15)}
          onValueChange={(value) => setFormData({ ...formData, reminder_minutes: [parseInt(value)] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {reminderOptions.map(option => (
              <SelectItem key={option.value} value={String(option.value)}>
                <div className="flex items-center gap-2">
                  <Bell className="h-3 w-3" />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Alerta de conflitos */}
      {conflicts.length > 0 && !checkingConflicts && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Conflito de horário detectado!</strong>
            <div className="mt-2 space-y-1">
              {conflicts.slice(0, 3).map((conflict, idx) => (
                <div key={idx} className="text-sm">
                  • {conflict.title} ({format(new Date(conflict.start_at), 'HH:mm')} - {format(new Date(conflict.end_at), 'HH:mm')})
                </div>
              ))}
              {conflicts.length > 3 && (
                <div className="text-sm text-muted-foreground">
                  e mais {conflicts.length - 3} evento(s)...
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Ações */}
      <div className="flex justify-between pt-4">
        <div>
          {isEditing && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteEvent.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createEvent.isPending || updateEvent.isPending}
          >
            {isEditing ? 'Atualizar' : 'Criar'} Evento
          </Button>
        </div>
      </div>
    </form>
  );
}