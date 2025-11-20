'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAccount } from './useAccount';
import { Database } from '@/types/database.types';
import { TaskFilters } from '@/lib/services/tasks.service';

// Tipos do banco V9
type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

// Enums de prioridade e status
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'archived';

// Interface para filtros - Estender do service
interface TaskFilter extends TaskFilters {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority;
  assigned_to?: string;
}

// Tipo estendido com relacionamentos
export type TaskWithRelations = Task & {
  owner?: {
    id: string;
    full_name: string | null;
    email: string;
  };
  assigned_user?: {
    id: string;
    full_name: string | null;
    email: string;
  };
  lead?: {
    id: string;
    name: string;
    phone: string;
  };
  contract?: {
    id: string;
    contract_number: string;
  };
};

// Hook para listar tarefas
export function useTasks(filters: TaskFilter = {}) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['tasks', account?.id, filters],
    queryFn: async () => {
      console.log('[useTasks] Starting query with account:', {
        accountId: account?.id,
        accountName: account?.name,
        filters
      });

      if (!account?.id) {
        console.log('[useTasks] No account ID, returning empty array');
        return [];
      }

      try {
        // Build query params
        const params = new URLSearchParams();

        if (filters.status) {
          if (Array.isArray(filters.status)) {
            params.append('status', filters.status.join(','));
          } else {
            params.append('status', filters.status);
          }
        }

        if (filters.priority) params.append('priority', filters.priority);
        if (filters.assigned_to) params.append('assigned_to', filters.assigned_to);

        const response = await fetch(`/api/tasks?${params.toString()}`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch tasks');
        }

        const tasks = await response.json();

        console.log('[useTasks] API response:', {
          dataLength: tasks?.length || 0
        });

        return tasks as TaskWithRelations[];
      } catch (error: any) {
        console.error('Erro ao carregar tarefas:', {
          error,
          message: error?.message || 'Erro desconhecido',
          accountId: account?.id
        });
        return [];
      }
    },
    enabled: true,
  });
}

// Hook para buscar uma tarefa específica
export function useTask(taskId?: string) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['task', taskId, account?.id],
    queryFn: async () => {
      if (!taskId || !account?.id) return null;

      try {
        const response = await fetch(`/api/tasks?id=${taskId}`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch task');
        }

        const tasks = await response.json();
        return tasks[0] as TaskWithRelations || null;
      } catch (error: any) {
        console.error('Erro ao carregar tarefa:', error);
        return null;
      }
    },
    enabled: !!taskId && !!account?.id,
  });
}

// Hook para criar tarefa
export function useCreateTask() {
  const queryClient = useQueryClient();
  const { account } = useAccount();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      priority?: TaskPriority;
      due_date?: string;
      assigned_to: string;
      assigned_by?: string;
      lead_id?: string;
      contract_id?: string;
    }) => {
      if (!account?.id) throw new Error('Conta não encontrada');

      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: data.title,
            description: data.description,
            priority: data.priority,
            due_date: data.due_date,
            assigned_to: data.assigned_to,
            owner_id: data.assigned_by,
            lead_id: data.lead_id,
            contract_id: data.contract_id,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create task');
        }

        return await response.json();
      } catch (error: any) {
        console.error('Erro ao criar tarefa:', error);
        toast({
          title: 'Erro ao criar tarefa',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Tarefa criada',
        description: 'Tarefa criada com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Hook para atualizar tarefa
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { account } = useAccount();

  return useMutation({
    mutationFn: async ({ id, data }: {
      id: string;
      data: Partial<TaskUpdate>
    }) => {
      if (!account?.id) throw new Error('Conta não encontrada');

      try {
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, ...data }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update task');
        }

        return await response.json();
      } catch (error: any) {
        console.error('Erro ao atualizar tarefa:', error);
        toast({
          title: 'Erro ao atualizar tarefa',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Tarefa atualizada',
        description: 'Tarefa atualizada com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
    },
  });
}

// Hook para atualizar status da tarefa
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  const { account } = useAccount();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      if (!account?.id) throw new Error('Conta não encontrada');

      try {
        const updateData = status === 'completed'
          ? { status, completed_at: new Date().toISOString() }
          : { status };

        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, ...updateData }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update task status');
        }

        return await response.json();
      } catch (error: any) {
        console.error('Erro ao atualizar status:', error);
        toast({
          title: 'Erro ao atualizar status',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Status atualizado',
        description: 'Status da tarefa atualizado com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Hook para excluir tarefa
export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { account } = useAccount();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!account?.id) throw new Error('Conta não encontrada');

      try {
        const response = await fetch(`/api/tasks?id=${taskId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete task');
        }

        return taskId;
      } catch (error: any) {
        console.error('Erro ao excluir tarefa:', error);
        toast({
          title: 'Erro ao excluir tarefa',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Tarefa excluída',
        description: 'Tarefa excluída com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Funções auxiliares
export function getTaskPriorityColor(priority: TaskPriority | null): string {
  if (!priority) return 'bg-gray-100 text-gray-800';
  const colors: Record<TaskPriority, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
}

export function getTaskPriorityLabel(priority: TaskPriority | null): string {
  if (!priority) return 'Sem prioridade';
  const labels: Record<TaskPriority, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    urgent: 'Urgente'
  };
  return labels[priority] || priority;
}

export function getTaskStatusColor(status: TaskStatus | null): string {
  if (!status) return 'bg-gray-100 text-gray-800';
  const colors: Record<TaskStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    archived: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getTaskStatusLabel(status: TaskStatus | null): string {
  if (!status) return 'Sem status';
  const labels: Record<TaskStatus, string> = {
    pending: 'Pendente',
    in_progress: 'Em Progresso',
    completed: 'Concluída',
    cancelled: 'Cancelada',
    archived: 'Arquivada'
  };
  return labels[status] || status;
}

export function isTaskOverdue(task: Task): boolean {
  if (!task.due_date) return false;
  if (task.status === 'completed' || task.status === 'cancelled') return false;
  
  const dueDate = new Date(task.due_date);
  const now = new Date();
  
  return dueDate < now;
}