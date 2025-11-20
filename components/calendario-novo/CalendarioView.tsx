'use client';

import { useEffect, useState } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  format,
  startOfDay,
  endOfDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useEvents, Event, useUpdateEvent, useDeleteEvent, useCreateEvent } from '@/hooks/useEvents';
import { useTasks, TaskWithRelations, useUpdateTask } from '@/hooks/useTasks';
import { VisualizacaoDia } from './VisualizacaoDia';
import { VisualizacaoSemana } from './VisualizacaoSemana';
import { VisualizacaoMes } from './VisualizacaoMes';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EventForm } from './EventForm';
import { TaskForm } from './TaskForm';
import { checkTaskSchedulingConflicts, findNextAvailableSlot, generateSchedulingSuggestions } from '@/lib/calendar-utils';
import { toast } from 'sonner';

export type ViewType = 'month' | 'week' | 'day';

interface CalendarioViewProps {
  view: ViewType;
  selectedDate: Date;
  onDateSelect?: (date: Date) => void;
  showTasks?: boolean;
  showEvents?: boolean;
}

export function CalendarioView({ view, selectedDate, onDateSelect, showTasks = true, showEvents = true }: CalendarioViewProps) {
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; hour?: number } | null>(null);

  // Calcular intervalo de datas baseado na view
  const getDateRange = () => {
    switch (view) {
      case 'day':
        return {
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate)
        };
      case 'week':
        return {
          start: startOfWeek(selectedDate, { locale: ptBR }),
          end: endOfWeek(selectedDate, { locale: ptBR })
        };
      case 'month':
        return {
          start: startOfWeek(startOfMonth(selectedDate), { locale: ptBR }),
          end: endOfWeek(endOfMonth(selectedDate), { locale: ptBR })
        };
    }
  };

  const { start, end } = getDateRange();

  // Buscar eventos
  const { data: events = [], isLoading: eventsLoading } = useEvents({
    start_date: format(start, 'yyyy-MM-dd'),
    end_date: format(end, 'yyyy-MM-dd')
  });

  // Buscar tarefas
  const { data: tasks = [], isLoading: tasksLoading } = useTasks({
    from_date: format(start, 'yyyy-MM-dd'),
    to_date: format(end, 'yyyy-MM-dd')
  });

  // Hooks para gerenciar eventos e tarefas
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();
  const createEventMutation = useCreateEvent();
  const updateTaskMutation = useUpdateTask();

  const isLoading = eventsLoading || tasksLoading;

  // Handlers
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const handleTaskClick = (task: TaskWithRelations) => {
    setSelectedTask(task);
    setShowTaskDialog(true);
  };

  const handleSlotClick = (date: Date, hour?: number) => {
    setSelectedSlot({ date, hour });
    setShowEventDialog(true);
  };

  const handleCreateTask = (date: Date, hour?: number) => {
    setSelectedSlot({ date, hour });
    setShowTaskDialog(true);
  };

  // Handler para atualização de eventos via drag-and-drop
  const handleEventUpdate = async (eventId: string, newStartDate: Date, newEndDate?: Date) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    try {
      await updateEventMutation.mutateAsync({
        id: eventId,
        start_at: newStartDate.toISOString(),
        end_at: newEndDate ? newEndDate.toISOString() : undefined,
      });
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
    }
  };

  // Handler para excluir eventos
  const handleEventDelete = async (eventId: string) => {
    try {
      await deleteEventMutation.mutateAsync(eventId);
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
    }
  };

  // Handler para duplicar eventos
  const handleEventDuplicate = async (event: Event) => {
    try {
      const newStartDate = new Date(event.start_at);
      newStartDate.setDate(newStartDate.getDate() + 1); // Duplicar para o próximo dia
      
      const newEndDate = new Date(event.end_at);
      newEndDate.setDate(newEndDate.getDate() + 1);

      await createEventMutation.mutateAsync({
        type: event.type,
        title: `${event.title} (Cópia)`,
        description: event.description,
        lead_id: event.lead_id,
        property_id: event.property_id,
        contract_id: event.contract_id,
        start_at: newStartDate.toISOString(),
        end_at: newEndDate.toISOString(),
        all_day: event.all_day,
        timezone: event.timezone,
        location: event.location,
        meeting_url: event.meeting_url,
        reminder_minutes: event.reminder_minutes,
      });
    } catch (error) {
      console.error('Erro ao duplicar evento:', error);
    }
  };

  // Handler para atualizar tarefas
  const handleTaskUpdate = async (taskId: string, newDueDate: Date) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        data: {
          due_date: format(newDueDate, 'yyyy-MM-dd')
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  // Handler para agendar tarefa (converter para evento)
  const handleTaskSchedule = async (task: TaskWithRelations, date: Date, hour?: number) => {
    try {
      // Check for conflicts and get suggestions
      const startHour = hour || 9;
      const conflicts = checkTaskSchedulingConflicts(date, startHour, 1, events, tasks);
      const suggestions = generateSchedulingSuggestions(task, date, events, tasks);

      // Show conflict warnings
      if (conflicts.hasConflict) {
        if (conflicts.severity === 'high') {
          toast.warning(conflicts.message, {
            description: 'Considere escolher outro horário ou data.',
            duration: 5000
          });
        } else if (conflicts.severity === 'medium') {
          toast.warning(conflicts.message, {
            description: 'Verifique se há conflitos importantes.',
            duration: 4000
          });
        } else {
          toast.info(conflicts.message, {
            duration: 3000
          });
        }
      }

      // Use recommended slot if available and no specific hour provided
      if (!hour && !suggestions.recommended) {
        const bestSlot = findNextAvailableSlot(date, events, startHour);
        if (bestSlot.hour !== startHour) {
          toast.info(`Reagendado para ${bestSlot.hour}h para evitar conflitos`, {
            duration: 4000
          });
          hour = bestSlot.hour;
        }
      }

      const finalHour = hour || startHour;
      const startDate = new Date(date);
      startDate.setHours(finalHour, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(finalHour + 1, 0, 0, 0); // Duração de 1 hora

      await createEventMutation.mutateAsync({
        type: 'task' as const,
        title: task.title,
        description: task.description || `Tarefa: ${task.title}`,
        lead_id: task.lead_id ?? undefined,
        start_at: startDate.toISOString(),
        end_at: endDate.toISOString(),
        all_day: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      // Atualizar a tarefa com a nova data de vencimento
      await updateTaskMutation.mutateAsync({
        id: task.id,
        data: {
          due_date: format(date, 'yyyy-MM-dd')
        }
      });

      toast.success('Tarefa agendada com sucesso!', {
        description: `${task.title} foi agendada para ${format(date, 'dd/MM/yyyy')} às ${finalHour}h`,
        duration: 3000
      });
    } catch (error) {
      console.error('Erro ao agendar tarefa:', error);
      toast.error('Erro ao agendar tarefa', {
        description: 'Tente novamente ou contate o suporte.',
        duration: 4000
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-full">
        <Skeleton className="w-full h-[600px] rounded-lg" />
      </div>
    );
  }

  return (
    <>
      <div className="h-full">
        {view === 'month' && (
          <VisualizacaoMes 
            events={showEvents ? events : []}
            tasks={showTasks ? tasks : []}
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            onEventClick={handleEventClick}
            onTaskClick={handleTaskClick}
            onSlotClick={handleSlotClick}
            onCreateTask={handleCreateTask}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
            onEventDuplicate={handleEventDuplicate}
            onTaskUpdate={handleTaskUpdate}
            onTaskSchedule={handleTaskSchedule}
          />
        )}
        {view === 'week' && (
          <VisualizacaoSemana
            events={showEvents ? events : []}
            tasks={showTasks ? tasks : []}
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            onEventClick={handleEventClick}
            onTaskClick={handleTaskClick}
            onSlotClick={handleSlotClick}
            onCreateTask={handleCreateTask}
            onEventUpdate={handleEventUpdate as any}
            onEventDelete={handleEventDelete}
            onEventDuplicate={handleEventDuplicate as any}
            onTaskUpdate={handleTaskUpdate as any}
            onTaskSchedule={handleTaskSchedule}
          />
        )}
        {view === 'day' && (
          <VisualizacaoDia
            events={showEvents ? events : []}
            tasks={showTasks ? tasks : []}
            selectedDate={selectedDate}
            onEventClick={handleEventClick}
            onTaskClick={handleTaskClick}
            onSlotClick={handleSlotClick}
            onCreateTask={handleCreateTask}
            onEventUpdate={handleEventUpdate as any}
            onEventDelete={handleEventDelete}
            onEventDuplicate={handleEventDuplicate as any}
            onTaskUpdate={handleTaskUpdate as any}
            onTaskSchedule={handleTaskSchedule}
          />
        )}
      </div>
      
      {/* Dialog para evento */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? 'Editar Evento' : 'Novo Evento'}
            </DialogTitle>
          </DialogHeader>
          <EventForm
            event={selectedEvent}
            defaultDate={selectedSlot?.date}
            defaultHour={selectedSlot?.hour}
            onSuccess={() => {
              setShowEventDialog(false);
              setSelectedEvent(null);
              setSelectedSlot(null);
            }}
            onCancel={() => {
              setShowEventDialog(false);
              setSelectedEvent(null);
              setSelectedSlot(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para tarefa */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            task={selectedTask}
            defaultDate={selectedSlot?.date}
            defaultHour={selectedSlot?.hour}
            showSchedulingOptions={!!selectedSlot?.hour}
            onSuccess={() => {
              setShowTaskDialog(false);
              setSelectedTask(null);
              setSelectedSlot(null);
            }}
            onCancel={() => {
              setShowTaskDialog(false);
              setSelectedTask(null);
              setSelectedSlot(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}