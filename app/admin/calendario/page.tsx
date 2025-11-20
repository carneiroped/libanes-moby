'use client';

import { useState } from 'react';
import { CalendarioHeader } from '@/components/calendario-novo/CalendarioHeader';
import { CalendarioView, ViewType } from '@/components/calendario-novo/CalendarioView';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EventForm } from '@/components/calendario-novo/EventForm';
import { BulkTaskScheduler } from '@/components/calendario-novo/BulkTaskScheduler';
import { useEvents, useCreateEvent } from '@/hooks/useEvents';
import { useTasks, useUpdateTask } from '@/hooks/useTasks';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CalendarioPage() {
  const [view, setView] = useState<ViewType>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  const [showTasks, setShowTasks] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [showBulkScheduler, setShowBulkScheduler] = useState(false);

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

  // Buscar eventos e tarefas para contar
  const { data: events = [] } = useEvents({
    start_date: format(start, 'yyyy-MM-dd'),
    end_date: format(end, 'yyyy-MM-dd')
  });

  const { data: tasks = [] } = useTasks({
    from_date: format(start, 'yyyy-MM-dd'),
    to_date: format(end, 'yyyy-MM-dd')
  });

  // Get all tasks for bulk operations
  const { data: allTasks = [] } = useTasks();

  // Mutations for bulk operations
  const createEventMutation = useCreateEvent();
  const updateTaskMutation = useUpdateTask();

  // Count unscheduled tasks
  const unscheduledTasks = allTasks.filter(task => 
    !task.due_date && 
    task.status !== 'completed' && 
    task.status !== 'cancelled'
  );

  // Handle bulk task scheduling
  const handleBulkSchedule = async (taskSchedules: { task: any; date: Date; hour: number }[]) => {
    const promises = taskSchedules.map(async ({ task, date, hour }) => {
      const startDate = new Date(date);
      startDate.setHours(hour, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(hour + 1, 0, 0, 0);

      // Create event
      await createEventMutation.mutateAsync({
        type: 'task' as const,
        title: task.title,
        description: task.description || `Tarefa: ${task.title}`,
        lead_id: task.lead_id,
        start_at: startDate.toISOString(),
        end_at: endDate.toISOString(),
        all_day: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      // Update task due date
      await updateTaskMutation.mutateAsync({
        id: task.id,
        data: {
          due_date: format(date, 'yyyy-MM-dd')
        }
      });
    });

    await Promise.all(promises);
  };

  return (
    <div className="h-full flex flex-col">
      <CalendarioHeader
        view={view}
        selectedDate={selectedDate}
        onViewChange={setView}
        onDateChange={setSelectedDate}
        onNewEvent={() => setShowNewEventDialog(true)}
        showTasks={showTasks}
        onToggleTasks={setShowTasks}
        showEvents={showEvents}
        onToggleEvents={setShowEvents}
        taskCount={tasks.length}
        eventCount={events.length}
        onBulkSchedule={() => setShowBulkScheduler(true)}
        unscheduledTaskCount={unscheduledTasks.length}
      />
      
      <div className="flex-1 overflow-hidden">
        <CalendarioView
          view={view}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          showTasks={showTasks}
          showEvents={showEvents}
        />
      </div>

      {/* Dialog para novo evento */}
      <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Evento</DialogTitle>
          </DialogHeader>
          <EventForm
            defaultDate={selectedDate}
            onSuccess={() => setShowNewEventDialog(false)}
            onCancel={() => setShowNewEventDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Task Scheduler */}
      <BulkTaskScheduler
        isOpen={showBulkScheduler}
        onClose={() => setShowBulkScheduler(false)}
        tasks={allTasks}
        events={events}
        onScheduleTasks={handleBulkSchedule}
      />
    </div>
  );
}