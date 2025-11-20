'use client';

import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  getDay,
  parseISO,
  areIntervalsOverlapping,
  addHours,
  setHours,
  setMinutes
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Event, getEventTypeColor, getEventTypeLabel } from '@/hooks/useEvents';
import { TaskWithRelations, getTaskPriorityColor, getTaskPriorityLabel, isTaskOverdue } from '@/hooks/useTasks';
import { Calendar, Clock, MapPin, CheckCircle2, AlertTriangle, Users, Layers, Flag } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';

// DnD Kit imports
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  rectIntersection
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
  arrayMove
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useState, useMemo } from 'react';

interface VisualizacaoMesProps {
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
  onTaskSchedule?: (task: TaskWithRelations, date: Date, hour?: number) => void;
}

interface ConflictGroup {
  events: Event[];
  totalConflicts: number;
  severity: 'low' | 'medium' | 'high';
}

interface DraggingEvent {
  id: string;
  title: string;
  type: Event['type'];
  start_at: string;
  end_at: string;
}

interface DraggingTask {
  id: string;
  title: string;
  priority: TaskWithRelations['priority'];
  due_date: string | null;
}

export function VisualizacaoMes({ 
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
}: VisualizacaoMesProps) {
  const [activeEvent, setActiveEvent] = useState<DraggingEvent | null>(null);
  const [activeTask, setActiveTask] = useState<DraggingTask | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const [focusedEventId, setFocusedEventId] = useState<string | null>(null);
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  
  // Configurar sensores de drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  // Obter dias do mês atual para visualização
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const startDate = startOfWeek(monthStart, { locale: ptBR });
  const endDate = endOfWeek(monthEnd, { locale: ptBR });

  const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Constrói a matriz dos dias para visualização do mês
  const gerarDiasDoMes = () => {
    const diasDoMes = [];
    let dia = startDate;

    while (dia <= endDate) {
      const diasDaSemana = [];
      
      for (let i = 0; i < 7; i++) {
        diasDaSemana.push(dia);
        dia = addDays(dia, 1);
      }
      
      diasDoMes.push(diasDaSemana);
    }

    return diasDoMes;
  };

  // Filtra os eventos para um dia específico
  const getEventosDoDia = (dia: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start_at), dia)
    );
  };

  // Detecta e analisa conflitos entre eventos do dia
  const getConflictAnalysis = (day: Date, dayEvents: Event[]): ConflictGroup[] => {
    const conflictGroups: ConflictGroup[] = [];
    const processedEvents = new Set<string>();
    
    dayEvents.forEach(event => {
      if (processedEvents.has(event.id) || event.status === 'cancelled') return;
      
      const eventStart = parseISO(event.start_at);
      const eventEnd = parseISO(event.end_at);
      const conflictingEvents: Event[] = [event];
      
      dayEvents.forEach(otherEvent => {
        if (otherEvent.id === event.id || otherEvent.status === 'cancelled' || processedEvents.has(otherEvent.id)) return;
        
        const otherStart = parseISO(otherEvent.start_at);
        const otherEnd = parseISO(otherEvent.end_at);
        
        if (areIntervalsOverlapping(
          { start: eventStart, end: eventEnd },
          { start: otherStart, end: otherEnd }
        )) {
          conflictingEvents.push(otherEvent);
        }
      });
      
      if (conflictingEvents.length > 1) {
        conflictingEvents.forEach(e => processedEvents.add(e.id));
        const severity = conflictingEvents.length >= 4 ? 'high' : conflictingEvents.length >= 3 ? 'medium' : 'low';
        
        conflictGroups.push({
          events: conflictingEvents,
          totalConflicts: conflictingEvents.length,
          severity
        });
      }
    });
    
    return conflictGroups;
  };
  
  // Verifica se um evento específico tem conflito
  const hasConflict = (event: Event, allEvents: Event[]) => {
    const eventStart = parseISO(event.start_at);
    const eventEnd = parseISO(event.end_at);
    
    return allEvents.some(otherEvent => {
      if (otherEvent.id === event.id || otherEvent.status === 'cancelled') return false;
      
      const otherStart = parseISO(otherEvent.start_at);
      const otherEnd = parseISO(otherEvent.end_at);
      
      return areIntervalsOverlapping(
        { start: eventStart, end: eventEnd },
        { start: otherStart, end: otherEnd }
      );
    });
  };

  // Filtra as tarefas para um dia específico
  const getTarefasDoDia = (dia: Date) => {
    return tasks.filter(task => 
      task.due_date && isSameDay(new Date(task.due_date), dia)
    );
  };

  const isWeekend = (dia: Date) => {
    const dayOfWeek = getDay(dia);
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  // Função para lidar com o clique em um dia
  const handleDayClick = (dia: Date) => {
    const dataCorrigida = new Date(
      dia.getFullYear(),
      dia.getMonth(),
      dia.getDate(),
      12, // Usar meio-dia para evitar problemas de fuso horário
      0,
      0
    );
    
    onDateSelect?.(dataCorrigida);
    onSlotClick(dataCorrigida);
  };
  
  // Handlers de drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id.toString();
    
    // Check if it's an event
    const eventData = events.find(e => e.id === activeId);
    if (eventData) {
      setActiveEvent({
        id: eventData.id,
        title: eventData.title,
        type: eventData.type,
        start_at: eventData.start_at,
        end_at: eventData.end_at
      });
      return;
    }
    
    // Check if it's a task
    const taskData = tasks.find(t => t.id === activeId);
    if (taskData) {
      setActiveTask({
        id: taskData.id,
        title: taskData.title,
        priority: taskData.priority,
        due_date: taskData.due_date
      });
      return;
    }
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over?.id && typeof over.id === 'string' && over.id.startsWith('day-')) {
      const dateStr = over.id.replace('day-', '');
      const overDate = new Date(dateStr);
      setDragOverDate(overDate);
    } else {
      setDragOverDate(null);
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveEvent(null);
    setActiveTask(null);
    setDragOverDate(null);
    
    if (!over?.id) return;
    
    const overId = over.id.toString();
    if (!overId.startsWith('day-')) return;
    
    const dateStr = overId.replace('day-', '');
    const newDate = new Date(dateStr);
    const activeId = active.id.toString();
    
    // Handle event drag
    if (activeEvent) {
      const eventData = events.find(e => e.id === activeId);
      
      if (!eventData || !onEventUpdate) return;
      
      const originalStart = parseISO(eventData.start_at);
      const originalEnd = parseISO(eventData.end_at);
      const duration = originalEnd.getTime() - originalStart.getTime();
      
      // Manter o mesmo horário, mudar apenas a data
      const newStart = setMinutes(
        setHours(
          newDate,
          originalStart.getHours()
        ),
        originalStart.getMinutes()
      );
      
      const newEnd = new Date(newStart.getTime() + duration);
      
      // Verificar se realmente mudou de data
      if (!isSameDay(originalStart, newStart)) {
        onEventUpdate(eventData.id, newStart, newEnd);
      }
      return;
    }
    
    // Handle task drag
    if (activeTask) {
      const taskData = tasks.find(t => t.id === activeId);
      
      if (!taskData) return;
      
      // If task has due_date, update it to new date
      if (taskData.due_date && onTaskUpdate) {
        onTaskUpdate(taskData.id, newDate);
        return;
      }
      
      // If task doesn't have due_date, call schedule handler
      if (onTaskSchedule) {
        onTaskSchedule(taskData, newDate);
      }
    }
  };
  
  // Keyboard event handler
  const handleKeyDown = (event: React.KeyboardEvent, eventData: Event) => {
    if (event.key === 'Delete' && onEventDelete) {
      event.preventDefault();
      event.stopPropagation();
      onEventDelete(eventData.id);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      onEventClick(eventData);
    } else if (event.key === 'd' && (event.ctrlKey || event.metaKey) && onEventDuplicate) {
      event.preventDefault();
      event.stopPropagation();
      onEventDuplicate(eventData);
    }
  };
  
  const getConflictColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'ring-red-500 bg-red-50 dark:bg-red-950/20';
      case 'medium': return 'ring-amber-500 bg-amber-50 dark:bg-amber-950/20';
      case 'low': return 'ring-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
    }
  };
  
  const getConflictTooltipContent = (conflicts: ConflictGroup) => {
    const eventTitles = conflicts.events.map(e => e.title).join(', ');
    return (
      <div className="space-y-1">
        <p className="font-semibold text-xs">Conflito de {conflicts.totalConflicts} eventos</p>
        <p className="text-xs">{eventTitles}</p>
        <div className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" />
          <span>Horários sobrepostos</span>
        </div>
      </div>
    );
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {/* Cabeçalho com os dias da semana */}
        <div className="grid grid-cols-7 bg-muted/30">
          {diasDaSemana.map((diaSemana, index) => (
            <div 
              key={diaSemana} 
              className={cn(
                "p-3 text-center text-sm font-medium",
                index === 0 || index === 6 ? "text-emerald-600" : "text-muted-foreground"
              )}
            >
              {diaSemana}
            </div>
          ))}
        </div>
      
        {/* Dias do mês */}
        <div className="grid grid-cols-1">
          {gerarDiasDoMes().map((semana, semanaIdx) => (
            <div key={semanaIdx} className="grid grid-cols-7">
              {semana.map((dia, diaIdx) => {
                const eventosDoDia = getEventosDoDia(dia);
                const tarefasDoDia = getTarefasDoDia(dia);
                const conflictGroups = getConflictAnalysis(dia, eventosDoDia);
                const isCurrentMonth = isSameMonth(dia, selectedDate);
                const weekendDay = isWeekend(dia);
                const dayId = `day-${dia.toISOString().split('T')[0]}`;
                const isDragOver = dragOverDate && isSameDay(dragOverDate, dia);
                
                return (
                  <div 
                    key={diaIdx}
                    id={dayId}
                    className={cn(
                      "min-h-[120px] p-2 border-r border-b transition-all duration-200 hover:bg-muted/20 cursor-pointer relative",
                      !isCurrentMonth && "opacity-40 bg-muted/5",
                      isToday(dia) && "bg-emerald-50 dark:bg-emerald-950/20",
                      isSameDay(dia, selectedDate) && "bg-primary/10",
                      weekendDay && "bg-muted/10",
                      isDragOver && "bg-blue-50 dark:bg-blue-950/20 ring-2 ring-blue-300 dark:ring-blue-600",
                      conflictGroups.length > 0 && "relative"
                    )}
                    onClick={() => handleDayClick(dia)}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          {/* Indicador de conflitos */}
                          {conflictGroups.map((group, idx) => (
                            <TooltipProvider key={idx}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    variant="destructive" 
                                    className={cn(
                                      "h-4 w-4 p-0 flex items-center justify-center text-xs",
                                      group.severity === 'high' && "bg-red-600",
                                      group.severity === 'medium' && "bg-amber-600",
                                      group.severity === 'low' && "bg-yellow-600"
                                    )}
                                  >
                                    {group.totalConflicts}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  {getConflictTooltipContent(group)}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                        
                        <div className={cn(
                          "font-medium text-sm",
                          isToday(dia) && "text-emerald-600 font-bold",
                          weekendDay && !isToday(dia) && "text-muted-foreground"
                        )}>
                          {format(dia, 'd')}
                        </div>
                      </div>
                    
                      <div className="flex-1 space-y-1 overflow-y-auto">
                        {/* Eventos */}
                        {eventosDoDia.slice(0, 2).map((event) => {
                          const hasEventConflict = hasConflict(event, eventosDoDia);
                          const conflictGroup = conflictGroups.find(g => g.events.some(e => e.id === event.id));
                          const isBeingDragged = activeEvent?.id === event.id;
                          
                          return (
                            <ContextMenu key={event.id}>
                              <ContextMenuTrigger>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div 
                                        draggable
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Evento: ${event.title}`}
                                        onKeyDown={(e) => handleKeyDown(e, event)}
                                        onFocus={() => setFocusedEventId(event.id)}
                                        onBlur={() => setFocusedEventId(null)}
                                        onDragStart={(e) => {
                                          e.dataTransfer.setData('text/plain', event.id);
                                          e.dataTransfer.effectAllowed = 'move';
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEventClick(event);
                                        }}
                                        className={cn(
                                          "text-xs p-1 rounded cursor-move hover:shadow-md transition-all duration-200 relative select-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                                          getEventTypeColor(event.type),
                                          hasEventConflict && conflictGroup && getConflictColor(conflictGroup.severity),
                                          hasEventConflict && "ring-2",
                                          isBeingDragged && "opacity-50 transform scale-95",
                                          focusedEventId === event.id && "ring-2 ring-primary"
                                        )}
                                      >
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span className="font-medium truncate">
                                        {format(new Date(event.start_at), 'HH:mm')}
                                      </span>
                                      {hasEventConflict && conflictGroup && (
                                        <div className="flex items-center gap-1">
                                          {conflictGroup.severity === 'high' && <Layers className="h-3 w-3 text-red-600" />}
                                          {conflictGroup.severity === 'medium' && <AlertTriangle className="h-3 w-3 text-amber-600" />}
                                          {conflictGroup.severity === 'low' && <Users className="h-3 w-3 text-yellow-600" />}
                                          <Badge variant="outline" className="h-4 px-1 text-xs">
                                            {conflictGroup.totalConflicts}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                    <div className="truncate">{event.title}</div>
                                    
                                        {/* Indicador visual de drag */}
                                        <div className="absolute inset-0 bg-blue-500/10 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                      <div className="space-y-1">
                                        <p className="font-semibold text-sm">{event.title}</p>
                                        <p className="text-xs">{getEventTypeLabel(event.type)}</p>
                                        <p className="text-xs">
                                          {format(new Date(event.start_at), 'HH:mm')} - {format(new Date(event.end_at), 'HH:mm')}
                                        </p>
                                        {hasEventConflict && conflictGroup && (
                                          <p className="text-xs text-red-600">
                                            Conflito com {conflictGroup.totalConflicts - 1} outros eventos
                                          </p>
                                        )}
                                        <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t">
                                          <p>• Arraste para mover</p>
                                          <p>• Clique direito para opções</p>
                                          <p>• Delete para excluir</p>
                                          <p>• Ctrl+D para duplicar</p>
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </ContextMenuTrigger>
                              <ContextMenuContent>
                                <ContextMenuItem onClick={() => onEventClick(event)}>
                                  Editar evento
                                </ContextMenuItem>
                                {onEventDuplicate && (
                                  <ContextMenuItem onClick={() => onEventDuplicate(event)}>
                                    Duplicar evento
                                  </ContextMenuItem>
                                )}
                                <ContextMenuSeparator />
                                <ContextMenuItem 
                                  onClick={() => {
                                    if (event.location && typeof event.location === 'object' && 'address' in event.location) {
                                      window.open(`https://www.google.com/maps?q=${encodeURIComponent(event.location.address)}`, '_blank');
                                    }
                                  }}
                                  disabled={!event.location || typeof event.location !== 'object' || !('address' in event.location)}
                                >
                                  Ver localização
                                </ContextMenuItem>
                                {hasEventConflict && (
                                  <>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem className="text-amber-600">
                                      ⚠️ Resolver conflitos
                                    </ContextMenuItem>
                                  </>
                                )}
                                <ContextMenuSeparator />
                                {onEventDelete && (
                                  <ContextMenuItem 
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => onEventDelete(event.id)}
                                  >
                                    Excluir evento
                                  </ContextMenuItem>
                                )}
                              </ContextMenuContent>
                            </ContextMenu>
                          );
                        })}
                      
                        {/* Tarefas */}
                        {tarefasDoDia.slice(0, 2).map((task) => {
                          const isBeingDragged = activeTask?.id === task.id;
                          
                          return (
                            <TooltipProvider key={task.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div 
                                    draggable
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`Tarefa: ${task.title}`}
                                    onFocus={() => setFocusedTaskId(task.id)}
                                    onBlur={() => setFocusedTaskId(null)}
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData('text/plain', task.id);
                                      e.dataTransfer.effectAllowed = 'move';
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onTaskClick(task);
                                    }}
                                    className={cn(
                                      "text-xs p-1 rounded cursor-move hover:shadow-md transition-all duration-200 relative select-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                                      getTaskPriorityColor((task.priority as any) || 'medium'),
                                      isTaskOverdue(task) && "ring-2 ring-red-500",
                                      isBeingDragged && "opacity-50 transform scale-95",
                                      focusedTaskId === task.id && "ring-2 ring-primary",
                                      task.status === 'completed' && "opacity-60 line-through"
                                    )}
                                  >
                                    <div className="flex items-center gap-1">
                                      {task.status === 'completed' ? (
                                        <CheckCircle2 className="h-3 w-3" />
                                      ) : isTaskOverdue(task) ? (
                                        <AlertTriangle className="h-3 w-3 text-red-600" />
                                      ) : (
                                        <Calendar className="h-3 w-3" />
                                      )}
                                      <span className="truncate font-medium">{task.title}</span>
                                    </div>
                                    
                                    {/* Indicador visual de drag */}
                                    <div className="absolute inset-0 bg-purple-500/10 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <div className="space-y-1">
                                    <p className="font-semibold text-sm">{task.title}</p>
                                    <p className="text-xs">Prioridade: {getTaskPriorityLabel((task.priority as any) || 'medium')}</p>
                                    {task.due_date && (
                                      <p className="text-xs">
                                        Vencimento: {format(new Date(task.due_date), 'dd/MM/yyyy')}
                                      </p>
                                    )}
                                    {isTaskOverdue(task) && (
                                      <p className="text-xs text-red-600">Tarefa em atraso</p>
                                    )}
                                    <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t">
                                      <p>• Arraste para reagendar</p>
                                      <p>• Clique para editar</p>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      
                        {/* Contador de itens adicionais */}
                        {(eventosDoDia.length + tarefasDoDia.length) > 4 && (
                          <div className="text-xs text-muted-foreground text-center py-1">
                            <Badge variant="secondary" className="h-5 px-2 text-xs">
                              +{(eventosDoDia.length + tarefasDoDia.length) - 4} mais
                            </Badge>
                          </div>
                        )}
                        
                        {/* Indicador de zona de drop */}
                        {isDragOver && (activeEvent || activeTask) && (
                          <div className={cn(
                            "absolute inset-0 rounded-lg border-2 border-dashed flex items-center justify-center pointer-events-none",
                            activeEvent ? "bg-blue-500/20 border-blue-400" : "bg-purple-500/20 border-purple-400"
                          )}>
                            <div className={cn(
                              "text-white px-2 py-1 rounded text-xs font-medium",
                              activeEvent ? "bg-blue-600" : "bg-purple-600"
                            )}>
                              {activeEvent ? "Soltar evento aqui" : "Reagendar tarefa aqui"}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Drag Overlay */}
      <DragOverlay>
        {activeEvent && (
          <div className={cn(
            "text-xs p-2 rounded shadow-lg cursor-move opacity-90 min-w-[120px]",
            getEventTypeColor(activeEvent.type),
            "transform rotate-2"
          )}>
            <div className="flex items-center gap-1 mb-1">
              <Clock className="h-3 w-3" />
              <span className="font-medium">
                {format(new Date(activeEvent.start_at), 'HH:mm')}
              </span>
            </div>
            <div className="font-medium">{activeEvent.title}</div>
            <div className="text-xs opacity-75">{getEventTypeLabel(activeEvent.type)}</div>
          </div>
        )}
        {activeTask && (
          <div className={cn(
            "text-xs p-2 rounded shadow-lg cursor-move opacity-90 min-w-[120px]",
            getTaskPriorityColor((activeTask.priority as any) || 'medium'),
            "transform rotate-2"
          )}>
            <div className="flex items-center gap-1 mb-1">
              <Flag className="h-3 w-3" />
              <span className="font-medium">
                {getTaskPriorityLabel((activeTask.priority as any) || 'medium')}
              </span>
            </div>
            <div className="font-medium">{activeTask.title}</div>
            <div className="text-xs opacity-75">Tarefa</div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}