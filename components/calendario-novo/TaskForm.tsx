'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TaskWithRelations, 
  TaskPriority, 
  useCreateTask, 
  useUpdateTask, 
  useDeleteTask,
  getTaskPriorityLabel 
} from '@/hooks/useTasks';
import { useLeads } from '@/hooks/useLeads';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useUsers } from '@/hooks/useUsers';
import { Calendar, Flag, User, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface TaskFormProps {
  task?: TaskWithRelations | null;
  defaultDate?: Date;
  defaultHour?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  showSchedulingOptions?: boolean;
}

export function TaskForm({ task, defaultDate, defaultHour, onSuccess, onCancel, showSchedulingOptions = false }: TaskFormProps) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: leadsData } = useLeads();
  const leads = leadsData?.leads || [];
  const { userId: currentUserId } = useCurrentUser();
  const { users } = useUsers();

  const isEditing = !!task;

  // Estados do formulário
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: (task?.priority || 'medium') as TaskPriority,
    due_date: task?.due_date
      ? format(new Date(task.due_date), 'yyyy-MM-dd')
      : (defaultDate ? format(defaultDate, 'yyyy-MM-dd') : ''),
    lead_id: task?.lead_id || '',
    assigned_to: task?.owner_id || currentUserId || '',
    schedule_time: defaultHour ? `${defaultHour.toString().padStart(2, '0')}:00` : '',
    create_event: showSchedulingOptions && !!defaultHour
  });

  // Opções de prioridade
  const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      const taskData = {
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
        due_date: formData.due_date || undefined,
        lead_id: formData.lead_id && formData.lead_id !== 'none' ? formData.lead_id : undefined,
        assigned_to: formData.assigned_to || currentUserId || '550e8400-0001-41d4-a716-446655440000', // Usar ID selecionado ou atual com fallback
        assigned_by: currentUserId || '550e8400-0001-41d4-a716-446655440000'
      };

      if (isEditing) {
        await updateTask.mutateAsync({ 
          id: task.id, 
          data: taskData 
        });
      } else {
        await createTask.mutateAsync(taskData);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    try {
      await deleteTask.mutateAsync(task.id);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Título */}
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Digite o título da tarefa"
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

      {/* Prioridade e Data */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">Prioridade</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map(priority => (
                <SelectItem key={priority} value={priority}>
                  <div className="flex items-center gap-2">
                    <Flag className={`h-3 w-3 ${
                      priority === 'urgent' ? 'text-red-500' :
                      priority === 'high' ? 'text-orange-500' :
                      priority === 'medium' ? 'text-blue-500' :
                      'text-gray-500'
                    }`} />
                    {getTaskPriorityLabel(priority)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="due_date">Data de Vencimento</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Lead e Responsável */}
      <div className="grid grid-cols-2 gap-4">
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
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    {lead.name} - {lead.phone}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="assigned_to">Responsável</Label>
          <Select
            value={formData.assigned_to}
            onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o responsável" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    {user.name || user.email} - {user.role === 'admin' ? 'Administrador' : user.role === 'manager' ? 'Gerente' : 'Corretor'}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Opções de agendamento */}
      {showSchedulingOptions && (
        <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Clock className="h-4 w-4" />
            <span className="font-medium text-sm">Opções de Agendamento</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="create_event"
              checked={formData.create_event}
              onChange={(e) => setFormData({ ...formData, create_event: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="create_event" className="text-sm">
              Criar evento no calendário ao salvar tarefa
            </Label>
          </div>

          {formData.create_event && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="schedule_time" className="text-sm">Horário</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    id="schedule_time"
                    type="time"
                    value={formData.schedule_time}
                    onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md text-sm"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Evento de 1 hora será criado</span>
                </div>
              </div>
            </div>
          )}

          {defaultDate && (
            <p className="text-xs text-muted-foreground">
              Data: {format(defaultDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          )}
        </div>
      )}

      {/* Status (apenas em edição) */}
      {isEditing && task.status && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Status atual: <span className="font-medium">{
              task.status === 'pending' ? 'Pendente' :
              task.status === 'in_progress' ? 'Em Progresso' :
              task.status === 'completed' ? 'Concluída' :
              task.status === 'cancelled' ? 'Cancelada' :
              'Arquivada'
            }</span>
          </p>
        </div>
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
              disabled={deleteTask.isPending}
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
            disabled={createTask.isPending || updateTask.isPending}
          >
            {isEditing ? 'Atualizar' : 'Criar'} Tarefa
          </Button>
        </div>
      </div>
    </form>
  );
}