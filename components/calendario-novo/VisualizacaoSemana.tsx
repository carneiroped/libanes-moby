'use client';

import { 
  startOfWeek, 
  endOfWeek,
  addDays,
  format,
  isSameDay,
  isToday,
  addHours,
  startOfDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Event, getEventTypeColor, getEventStatusLabel } from '@/hooks/useEvents';
import { TaskWithRelations, TaskPriority, getTaskPriorityColor, isTaskOverdue } from '@/hooks/useTasks';
import { Clock, MapPin, User, Building, Calendar, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VisualizacaoSemanaProps {
  events: Event[];
  tasks: TaskWithRelations[];
  selectedDate: Date;
  onDateSelect?: (date: Date) => void;
  onEventClick: (event: Event) => void;
  onTaskClick: (task: TaskWithRelations) => void;
  onSlotClick: (date: Date, hour?: number) => void;
  onCreateTask: (date: Date) => void;
  onEventUpdate?: (eventId: string, newStartDate: Date, newEndDate?: Date) => void;
  onEventDelete?: (eventId: string) => void;
  onEventDuplicate?: (event: Event) => void;
  onTaskUpdate?: (taskId: string, newDueDate: Date) => void;
  onTaskSchedule?: (task: TaskWithRelations, date: Date, hour?: number) => Promise<void>;
}

export function VisualizacaoSemana({
  events,
  tasks,
  selectedDate,
  onDateSelect,
  onEventClick,
  onTaskClick,
  onSlotClick,
  onCreateTask,
  onEventUpdate,
  onEventDelete,
  onEventDuplicate,
  onTaskUpdate,
  onTaskSchedule
}: VisualizacaoSemanaProps) {
  // Obter dias da semana
  const weekStart = startOfWeek(selectedDate, { locale: ptBR });
  const weekEnd = endOfWeek(selectedDate, { locale: ptBR });
  
  // Gerar array de dias da semana
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Horas do dia (6h às 22h)
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  // Filtrar eventos da semana
  const weekEvents = events.filter(event => {
    const eventDate = new Date(event.start_at);
    return eventDate >= weekStart && eventDate <= weekEnd;
  });

  // Filtrar tarefas da semana
  const weekTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    const taskDate = new Date(task.due_date);
    return taskDate >= weekStart && taskDate <= weekEnd;
  });

  // Obter eventos para um dia e hora específicos
  const getEventsForDayHour = (day: Date, hour: number) => {
    return weekEvents.filter(event => {
      const eventDate = new Date(event.start_at);
      return isSameDay(eventDate, day) && eventDate.getHours() === hour;
    });
  };

  // Obter tarefas para um dia específico
  const getTasksForDay = (day: Date) => {
    return weekTasks.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(new Date(task.due_date), day);
    });
  };

  // Calcular altura do evento
  const getEventHeight = (event: Event) => {
    const start = new Date(event.start_at);
    const end = new Date(event.end_at);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60); // duração em minutos
    const height = Math.max(duration, 30); // mínimo de 30px
    return height;
  };

  // Calcular posição top do evento
  const getEventTop = (event: Event) => {
    const minutes = new Date(event.start_at).getMinutes();
    return (minutes / 60) * 60; // 60px por hora
  };

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border overflow-hidden">
      {/* Cabeçalho com dias da semana */}
      <div className="flex border-b bg-muted/10">
        <div className="w-20 p-2 border-r" /> {/* Espaço para coluna de horas */}
        {weekDays.map((day, index) => (
          <div 
            key={index} 
            className={cn(
              "flex-1 p-3 text-center border-r cursor-pointer hover:bg-muted/20",
              isToday(day) && "bg-emerald-50 dark:bg-emerald-950/20",
              isSameDay(day, selectedDate) && "bg-primary/10"
            )}
            onClick={() => onDateSelect?.(day)}
          >
            <div className="text-sm text-muted-foreground">
              {format(day, 'EEE', { locale: ptBR })}
            </div>
            <div className={cn(
              "text-lg font-semibold",
              isToday(day) && "text-emerald-600"
            )}>
              {format(day, 'd')}
            </div>
            
            {/* Mini contador de tarefas */}
            {getTasksForDay(day).length > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                {getTasksForDay(day).length} tarefa{getTasksForDay(day).length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Grid de horários */}
      <ScrollArea className="flex-1">
        <div className="relative">
          {hours.map(hour => (
            <div key={hour} className="flex border-b h-[60px]">
              {/* Coluna de hora */}
              <div className="w-20 p-2 text-sm text-muted-foreground text-right border-r">
                {format(addHours(startOfDay(selectedDate), hour), 'HH:mm')}
              </div>
              
              {/* Células para cada dia */}
              {weekDays.map((day, dayIndex) => {
                const dayHourEvents = getEventsForDayHour(day, hour);
                
                return (
                  <div 
                    key={dayIndex}
                    className="flex-1 relative border-r hover:bg-muted/5 cursor-pointer"
                    onClick={() => onSlotClick(day, hour)}
                  >
                    {/* Eventos */}
                    {dayHourEvents.map((event, idx) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className={cn(
                          "absolute left-1 right-1 p-1 rounded text-xs cursor-pointer hover:opacity-80 transition-all overflow-hidden",
                          getEventTypeColor(event.type)
                        )}
                        style={{
                          top: `${getEventTop(event)}px`,
                          height: `${getEventHeight(event)}px`,
                          minHeight: '25px',
                          zIndex: idx + 1
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="font-medium truncate">
                            {format(new Date(event.start_at), 'HH:mm')}
                          </span>
                        </div>
                        <div className="truncate text-[11px]">{event.title}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Rodapé com resumo de tarefas */}
      <div className="border-t p-4 bg-muted/10">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-sm">Tarefas da Semana</h4>
          <button
            onClick={() => onCreateTask(selectedDate)}
            className="text-sm text-primary hover:underline"
          >
            + Nova Tarefa
          </button>
        </div>
        
        <ScrollArea className="h-24">
          <div className="space-y-1">
            {weekTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma tarefa esta semana</p>
            ) : (
              weekTasks.slice(0, 5).map(task => (
                <div
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className={cn(
                    "p-2 rounded text-xs cursor-pointer hover:opacity-80 flex items-center gap-2",
                    getTaskPriorityColor(task.priority as TaskPriority | null)
                  )}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Calendar className="h-3 w-3" />
                  )}
                  <span className={cn(
                    "truncate",
                    task.status === 'completed' && "line-through opacity-60"
                  )}>
                    {task.title}
                  </span>
                  {task.due_date && (
                    <span className="text-[10px] opacity-70">
                      {format(new Date(task.due_date), 'dd/MM')}
                    </span>
                  )}
                </div>
              ))
            )}
            {weekTasks.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                +{weekTasks.length - 5} mais tarefas
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}