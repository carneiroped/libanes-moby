'use client';

import { format, isSameDay, addHours, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Event, getEventTypeColor, getEventTypeLabel, getEventStatusLabel } from '@/hooks/useEvents';
import { TaskWithRelations, TaskPriority, getTaskPriorityColor, getTaskPriorityLabel, isTaskOverdue } from '@/hooks/useTasks';
import { Clock, MapPin, User, Building, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VisualizacaoDiaProps {
  events: Event[];
  tasks: TaskWithRelations[];
  selectedDate: Date;
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

export function VisualizacaoDia({
  events,
  tasks,
  selectedDate,
  onEventClick,
  onTaskClick,
  onSlotClick,
  onCreateTask,
  onEventUpdate,
  onEventDelete,
  onEventDuplicate,
  onTaskUpdate,
  onTaskSchedule
}: VisualizacaoDiaProps) {
  // Gerar array de horas do dia (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filtrar eventos do dia
  const dayEvents = events.filter(event => 
    isSameDay(new Date(event.start_at), selectedDate)
  );

  // Filtrar tarefas do dia
  const dayTasks = tasks.filter(task => 
    task.due_date && isSameDay(new Date(task.due_date), selectedDate)
  );

  // Organizar eventos por hora
  const getEventsForHour = (hour: number) => {
    return dayEvents.filter(event => {
      const eventHour = new Date(event.start_at).getHours();
      return eventHour === hour;
    });
  };

  // Calcular altura do evento baseado na duração
  const getEventHeight = (event: Event) => {
    const start = new Date(event.start_at);
    const end = new Date(event.end_at);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60); // duração em minutos
    const height = Math.max(duration * 1.5, 60); // mínimo de 60px
    return height;
  };

  // Calcular posição top do evento
  const getEventTop = (event: Event) => {
    const minutes = new Date(event.start_at).getMinutes();
    return (minutes / 60) * 90; // 90px por hora
  };

  return (
    <div className="flex h-full">
      {/* Coluna de tarefas */}
      <div className="w-80 border-r bg-muted/10 p-4">
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2">Tarefas do Dia</h3>
          <button
            onClick={() => onCreateTask(selectedDate)}
            className="w-full p-2 text-sm border border-dashed rounded-md hover:bg-muted/20 transition-colors"
          >
            + Adicionar Tarefa
          </button>
        </div>
        
        <ScrollArea className="h-[calc(100%-80px)]">
          <div className="space-y-2">
            {dayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma tarefa para hoje
              </p>
            ) : (
              dayTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer hover:opacity-90 transition-all",
                    getTaskPriorityColor(task.priority as TaskPriority | null)
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isTaskOverdue(task) ? (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        ) : null}
                        <span className={cn(
                          "font-medium",
                          task.status === 'completed' && "line-through opacity-60"
                        )}>
                          {task.title}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs opacity-80 line-clamp-2 mb-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs">
                        <span className="font-medium">
                          {getTaskPriorityLabel(task.priority as TaskPriority | null)}
                        </span>
                        {task.lead && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{task.lead.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Linha do tempo */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[600px]">
          {/* Cabeçalho com data */}
          <div className="sticky top-0 bg-background border-b p-4 z-10">
            <h2 className="text-xl font-semibold">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h2>
          </div>

          {/* Grid de horas */}
          <div className="relative">
            {hours.map(hour => {
              const hourEvents = getEventsForHour(hour);
              
              return (
                <div key={hour} className="flex border-b">
                  {/* Coluna de hora */}
                  <div className="w-20 p-2 text-sm text-muted-foreground text-right border-r">
                    {format(addHours(startOfDay(selectedDate), hour), 'HH:mm')}
                  </div>
                  
                  {/* Área de eventos */}
                  <div 
                    className="flex-1 relative h-[90px] hover:bg-muted/5 cursor-pointer"
                    onClick={() => onSlotClick(selectedDate, hour)}
                  >
                    {/* Eventos da hora */}
                    {hourEvents.map((event, idx) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className={cn(
                          "absolute left-2 right-2 p-2 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-all",
                          getEventTypeColor(event.type)
                        )}
                        style={{
                          top: `${getEventTop(event)}px`,
                          height: `${getEventHeight(event)}px`,
                          left: idx > 0 ? `${idx * 120 + 8}px` : '8px',
                          right: '8px',
                          maxWidth: idx > 0 ? '200px' : 'auto',
                          zIndex: idx + 1
                        }}
                      >
                        <div className="h-full overflow-hidden">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs font-medium">
                              {format(new Date(event.start_at), 'HH:mm')} - 
                              {format(new Date(event.end_at), 'HH:mm')}
                            </span>
                            <span className="text-xs px-1 py-0.5 rounded bg-black/10">
                              {getEventStatusLabel(event.status)}
                            </span>
                          </div>
                          
                          <h4 className="font-medium text-sm mb-1 line-clamp-1">
                            {event.title}
                          </h4>
                          
                          {event.location && (
                            <div className="flex items-center gap-1 text-xs mb-1">
                              <MapPin className="h-3 w-3" />
                              <span className="line-clamp-1">
                                {typeof event.location === 'string' 
                                  ? event.location 
                                  : event.location.address || 'Local'}
                              </span>
                            </div>
                          )}
                          
                          {event.lead_name && (
                            <div className="flex items-center gap-1 text-xs mb-1">
                              <User className="h-3 w-3" />
                              <span>{event.lead_name}</span>
                            </div>
                          )}
                          
                          {event.property_title && (
                            <div className="flex items-center gap-1 text-xs">
                              <Building className="h-3 w-3" />
                              <span className="line-clamp-1">{event.property_title}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}