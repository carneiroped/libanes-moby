'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TaskWithRelations, TaskPriority, getTaskPriorityLabel, getTaskPriorityColor } from '@/hooks/useTasks';
import { Event } from '@/hooks/useEvents';
import { checkTaskSchedulingConflicts, findNextAvailableSlot } from '@/lib/calendar-utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ListTodo, 
  Zap,
  Users,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface BulkTaskSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskWithRelations[];
  events: Event[];
  onScheduleTasks: (tasks: { task: TaskWithRelations; date: Date; hour: number }[]) => Promise<void>;
}

export function BulkTaskScheduler({ 
  isOpen, 
  onClose, 
  tasks, 
  events, 
  onScheduleTasks 
}: BulkTaskSchedulerProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [schedulingStrategy, setSchedulingStrategy] = useState<'auto' | 'manual' | 'spread'>('auto');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startHour, setStartHour] = useState(9);
  const [isScheduling, setIsScheduling] = useState(false);

  // Filter unscheduled tasks
  const unscheduledTasks = tasks.filter(task => 
    !task.due_date && 
    task.status !== 'completed' && 
    task.status !== 'cancelled'
  );

  const handleTaskToggle = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const selectAllTasks = () => {
    setSelectedTasks(unscheduledTasks.map(task => task.id));
  };

  const clearSelection = () => {
    setSelectedTasks([]);
  };

  const getSchedulingPreview = () => {
    const selectedTaskObjects = unscheduledTasks.filter(task => 
      selectedTasks.includes(task.id)
    );

    if (selectedTaskObjects.length === 0) return [];

    const baseDate = new Date(startDate);
    const scheduledItems: { task: TaskWithRelations; date: Date; hour: number; conflicts: boolean }[] = [];

    selectedTaskObjects.forEach((task, index) => {
      let targetDate = new Date(baseDate);
      let targetHour = startHour;

      switch (schedulingStrategy) {
        case 'auto':
          // Find next available slot considering conflicts
          const bestSlot = findNextAvailableSlot(targetDate, events, targetHour);
          targetHour = bestSlot.hour;
          break;

        case 'spread':
          // Spread tasks across days
          targetDate.setDate(baseDate.getDate() + index);
          break;

        case 'manual':
          // Use exact time specified
          break;
      }

      const conflicts = checkTaskSchedulingConflicts(targetDate, targetHour, 1, events, tasks);

      scheduledItems.push({
        task,
        date: targetDate,
        hour: targetHour,
        conflicts: conflicts.hasConflict
      });
    });

    return scheduledItems;
  };

  const handleScheduleAll = async () => {
    const preview = getSchedulingPreview();
    
    if (preview.length === 0) {
      toast.error('Selecione pelo menos uma tarefa');
      return;
    }

    setIsScheduling(true);

    try {
      const taskSchedules = preview.map(item => ({
        task: item.task,
        date: item.date,
        hour: item.hour
      }));

      await onScheduleTasks(taskSchedules);

      toast.success(`${preview.length} tarefas agendadas com sucesso!`, {
        description: 'As tarefas foram convertidas em eventos no calendário.',
        duration: 4000
      });

      onClose();
    } catch (error) {
      console.error('Erro no agendamento em lote:', error);
      toast.error('Erro ao agendar tarefas', {
        description: 'Algumas tarefas podem não ter sido agendadas.',
        duration: 5000
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const preview = getSchedulingPreview();
  const conflictsCount = preview.filter(item => item.conflicts).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Agendamento em Lote de Tarefas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                <span className="font-medium">Tarefas Não Agendadas</span>
                <Badge variant="secondary">{unscheduledTasks.length}</Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllTasks}
                  disabled={unscheduledTasks.length === 0}
                >
                  Selecionar Todas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  disabled={selectedTasks.length === 0}
                >
                  Limpar
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {unscheduledTasks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma tarefa não agendada encontrada</p>
                </div>
              ) : (
                unscheduledTasks.map(task => (
                  <div key={task.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded">
                    <Checkbox
                      id={task.id}
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={(checked) => handleTaskToggle(task.id, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <Label 
                        htmlFor={task.id} 
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                      >
                        <span className="truncate">{task.title}</span>
                        <Badge
                          variant="secondary"
                          className={getTaskPriorityColor(task.priority as TaskPriority | null)}
                        >
                          {getTaskPriorityLabel(task.priority as TaskPriority | null)}
                        </Badge>
                      </Label>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* Scheduling Strategy */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4" />
              <span className="font-medium">Estratégia de Agendamento</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="strategy">Estratégia</Label>
                <Select value={schedulingStrategy} onValueChange={(value: any) => setSchedulingStrategy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Automático (Evitar Conflitos)
                      </div>
                    </SelectItem>
                    <SelectItem value="spread">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Distribuir (Um por Dia)
                      </div>
                    </SelectItem>
                    <SelectItem value="manual">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Manual (Horário Fixo)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="start_date">Data Inicial</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    id="start_date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md text-sm"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="start_hour">Horário Inicial</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select value={startHour.toString()} onValueChange={(value) => setStartHour(parseInt(value))}>
                    <SelectTrigger className="pl-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => 8 + i).map(hour => (
                        <SelectItem key={hour} value={hour.toString()}>
                          {hour.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Prévia do Agendamento</span>
                    <Badge variant="secondary">{preview.length} tarefas</Badge>
                  </div>
                  {conflictsCount > 0 && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {conflictsCount} conflitos
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {preview.map(item => (
                    <div 
                      key={item.task.id} 
                      className={`flex items-center justify-between p-2 rounded text-sm ${
                        item.conflicts ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800' : 
                        'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.conflicts ? (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                        <span className="font-medium">{item.task.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{format(item.date, 'dd/MM/yyyy', { locale: ptBR })}</span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>{item.hour.toString().padStart(2, '0')}:00</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleScheduleAll}
            disabled={selectedTasks.length === 0 || isScheduling}
            className="gap-2"
          >
            {isScheduling ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Agendar {selectedTasks.length} Tarefas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}