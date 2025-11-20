'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEvents, getEventTypeLabel, getEventTypeColor } from '@/hooks/useEvents';
import { useTasks, getTaskPriorityColor, isTaskOverdue } from '@/hooks/useTasks';
import { format, startOfDay, endOfDay, addDays, parseISO, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  User,
  Building,
  ChevronRight,
  CalendarDays
} from 'lucide-react';

export function AgendaWidget() {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);

  // Buscar eventos dos próximos 7 dias
  const { data: events = [], isLoading: eventsLoading } = useEvents({
    start_date: format(today, 'yyyy-MM-dd'),
    end_date: format(nextWeek, 'yyyy-MM-dd'),
    status: 'scheduled'
  });

  // Buscar tarefas pendentes
  const { data: tasks = [], isLoading: tasksLoading } = useTasks({
    status: 'pending'
  });

  const isLoading = eventsLoading || tasksLoading;

  // Ensure events and tasks are arrays
  const eventsArray = Array.isArray(events) ? events : [];
  const tasksArray = Array.isArray(tasks) ? tasks : [];

  // Filtrar e ordenar eventos de hoje
  const todayEvents = eventsArray
    .filter(event => {
      const dateField = event.start_at || event.start_at;
      return dateField && isToday(parseISO(dateField));
    })
    .sort((a, b) => {
      const aDate = a.start_at || a.start_at;
      const bDate = b.start_at || b.start_at;
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    })
    .slice(0, 3);

  // Filtrar e ordenar eventos de amanhã
  const tomorrowEvents = eventsArray
    .filter(event => {
      const dateField = event.start_at || event.start_at;
      return dateField && isTomorrow(parseISO(dateField));
    })
    .sort((a, b) => {
      const aDate = a.start_at || a.start_at;
      const bDate = b.start_at || b.start_at;
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    })
    .slice(0, 2);

  // Filtrar tarefas atrasadas e urgentes
  const overdueTasks = tasksArray
    .filter(task => isTaskOverdue(task))
    .slice(0, 3);

  const urgentTasks = tasksArray
    .filter(task => !isTaskOverdue(task) && task.priority === 'urgent')
    .slice(0, 2);

  // Estatísticas rápidas
  const stats = {
    todayCount: eventsArray.filter(e => {
      const dateField = e.start_at || e.start_at;
      return dateField && isToday(parseISO(dateField));
    }).length,
    weekCount: eventsArray.length,
    overdueTasksCount: tasksArray.filter(t => isTaskOverdue(t)).length,
    pendingTasksCount: tasksArray.filter(t => t.status === 'pending').length
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agenda
          </CardTitle>
          <Link href="/admin/calendario">
            <Button variant="ghost" size="sm">
              Ver tudo
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Hoje
            </div>
            <div className="text-2xl font-bold">{stats.todayCount}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Atrasadas
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.overdueTasksCount}</div>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {/* Tarefas atrasadas */}
            {overdueTasks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Tarefas Atrasadas
                </h4>
                <div className="space-y-2">
                  {overdueTasks.map(task => (
                    <Link 
                      key={task.id} 
                      href="/admin/tarefas"
                      className="block"
                    >
                      <div className={cn(
                        "p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer",
                        "border-red-200 dark:border-red-900"
                      )}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Venceu em {format(parseISO(task.due_date || new Date().toISOString()), 'dd/MM', { locale: ptBR })}
                            </p>
                          </div>
                          <Badge className={cn("text-xs", getTaskPriorityColor((task.priority as any) || 'medium'))}>
                            {task.priority === 'urgent' ? 'Urgente' : task.priority === 'high' ? 'Alta' : 'Normal'}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Eventos de hoje */}
            {todayEvents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Hoje</h4>
                <div className="space-y-2">
                  {todayEvents.map(event => (
                    <Link 
                      key={event.id} 
                      href="/admin/calendario"
                      className="block"
                    >
                      <div className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {format(parseISO(event.start_at || event.start_at), 'HH:mm')}
                              </span>
                            </div>
                            <p className="text-sm truncate mt-1">{event.title}</p>
                            {event.lead_name && (
                              <div className="flex items-center gap-1 mt-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground truncate">
                                  {event.lead_name}
                                </span>
                              </div>
                            )}
                            {event.property_title && (
                              <div className="flex items-center gap-1 mt-1">
                                <Building className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground truncate">
                                  {event.property_title}
                                </span>
                              </div>
                            )}
                          </div>
                          <Badge className={cn("text-xs", getEventTypeColor(event.type))}>
                            {getEventTypeLabel(event.type)}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Eventos de amanhã */}
            {tomorrowEvents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Amanhã</h4>
                <div className="space-y-2">
                  {tomorrowEvents.map(event => (
                    <Link 
                      key={event.id} 
                      href="/admin/calendario"
                      className="block"
                    >
                      <div className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {format(parseISO(event.start_at || event.start_at), 'HH:mm')}
                              </span>
                            </div>
                            <p className="text-sm truncate mt-1">{event.title}</p>
                          </div>
                          <Badge className={cn("text-xs", getEventTypeColor(event.type))}>
                            {getEventTypeLabel(event.type)}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tarefas urgentes */}
            {urgentTasks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Tarefas Urgentes</h4>
                <div className="space-y-2">
                  {urgentTasks.map(task => (
                    <Link 
                      key={task.id} 
                      href="/admin/tarefas"
                      className="block"
                    >
                      <div className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Vence em {format(parseISO(task.due_date || new Date().toISOString()), 'dd/MM', { locale: ptBR })}
                            </p>
                          </div>
                          <Badge className={cn("text-xs", getTaskPriorityColor((task.priority as any) || 'urgent'))}>
                            Urgente
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mensagem quando não há nada */}
            {todayEvents.length === 0 && 
             tomorrowEvents.length === 0 && 
             overdueTasks.length === 0 && 
             urgentTasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">Agenda limpa!</p>
                <p className="text-xs mt-1">Sem eventos próximos ou tarefas pendentes</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Ações rápidas */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
          <Link href="/admin/calendario">
            <Button variant="outline" size="sm" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Calendário
            </Button>
          </Link>
          <Link href="/admin/tarefas">
            <Button variant="outline" size="sm" className="w-full">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Tarefas
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}