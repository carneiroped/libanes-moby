'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, Calendar, Plus, CalendarDays, CalendarRange, CalendarClock, Eye, EyeOff, ListTodo, Zap } from 'lucide-react';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ViewType } from './CalendarioView';

interface CalendarioHeaderProps {
  view: ViewType;
  selectedDate: Date;
  onViewChange: (view: ViewType) => void;
  onDateChange: (date: Date) => void;
  onNewEvent: () => void;
  showTasks?: boolean;
  onToggleTasks?: (show: boolean) => void;
  showEvents?: boolean;
  onToggleEvents?: (show: boolean) => void;
  taskCount?: number;
  eventCount?: number;
  onBulkSchedule?: () => void;
  unscheduledTaskCount?: number;
}

export function CalendarioHeader({
  view,
  selectedDate,
  onViewChange,
  onDateChange,
  onNewEvent,
  showTasks = true,
  onToggleTasks,
  showEvents = true,
  onToggleEvents,
  taskCount = 0,
  eventCount = 0,
  onBulkSchedule,
  unscheduledTaskCount = 0
}: CalendarioHeaderProps) {
  const handlePrevious = () => {
    switch (view) {
      case 'month':
        onDateChange(subMonths(selectedDate, 1));
        break;
      case 'week':
        onDateChange(subWeeks(selectedDate, 1));
        break;
      case 'day':
        onDateChange(subDays(selectedDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (view) {
      case 'month':
        onDateChange(addMonths(selectedDate, 1));
        break;
      case 'week':
        onDateChange(addWeeks(selectedDate, 1));
        break;
      case 'day':
        onDateChange(addDays(selectedDate, 1));
        break;
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getDateDisplay = () => {
    switch (view) {
      case 'month':
        return format(selectedDate, 'MMMM yyyy', { locale: ptBR });
      case 'week':
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${format(weekStart, 'd MMM', { locale: ptBR })} - ${format(weekEnd, 'd MMM yyyy', { locale: ptBR })}`;
      case 'day':
        return format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b bg-card">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {/* Navegação de data */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="hover:bg-primary/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="hover:bg-primary/10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Data atual */}
        <h2 className="text-lg sm:text-xl font-semibold capitalize flex-1 sm:flex-none truncate">
          {getDateDisplay()}
        </h2>

        {/* Botão Hoje - Hidden on mobile */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="hidden sm:flex"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Hoje
        </Button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
        {/* Botão Hoje - Mobile version */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="sm:hidden flex-1 sm:flex-none"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Hoje
        </Button>
        
        {/* Filtros de visualização */}
        {(onToggleTasks || onToggleEvents) && (
          <>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <div className="flex items-center gap-1">
              {onToggleEvents && (
                <Button
                  variant={showEvents ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onToggleEvents(!showEvents)}
                  className="gap-2"
                >
                  {showEvents ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span className="hidden sm:inline">Eventos</span>
                  <Badge variant="secondary" className="ml-1">
                    {eventCount}
                  </Badge>
                </Button>
              )}
              {onToggleTasks && (
                <Button
                  variant={showTasks ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onToggleTasks(!showTasks)}
                  className="gap-2"
                >
                  {showTasks ? <ListTodo className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span className="hidden sm:inline">Tarefas</span>
                  <Badge variant="secondary" className="ml-1">
                    {taskCount}
                  </Badge>
                </Button>
              )}
            </div>
          </>
        )}

        {/* Agendamento em Lote */}
        {onBulkSchedule && unscheduledTaskCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkSchedule}
            className="gap-2 text-amber-700 border-amber-200 hover:bg-amber-50"
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Agendar Lote</span>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              {unscheduledTaskCount}
            </Badge>
          </Button>
        )}

        {/* Novo Evento */}
        <Button
          onClick={onNewEvent}
          size="sm"
          className="flex-1 sm:flex-none"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Novo Evento</span>
          <span className="sm:hidden">Novo</span>
        </Button>

        {/* Seletor de visualização */}
        <Select value={view} onValueChange={(value) => onViewChange(value as ViewType)}>
          <SelectTrigger className="w-28 sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Mês
              </div>
            </SelectItem>
            <SelectItem value="week">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4" />
                Semana
              </div>
            </SelectItem>
            <SelectItem value="day">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                Dia
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}