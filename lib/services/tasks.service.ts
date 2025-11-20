/**
 * Tasks Service - Azure Functions Integration
 * Handles all task-related API operations
 */

// import { azureApi, ApiResponse } from './azure-api';
import type { Database } from '@/types/database.types';
// import { mockApi, isDemoMode } from './mock-api-service';

// Temporary placeholders until modules are available
type ApiResponse<T> = { success: boolean; data: T; error?: any };

const azureApi = {
  get: async <T>(_endpoint: string, _params?: any): Promise<ApiResponse<T>> => ({
    success: false,
    data: null as any,
    error: 'Azure API not configured'
  }),
  post: async <T>(_endpoint: string, _body?: any): Promise<ApiResponse<T>> => ({
    success: false,
    data: null as any,
    error: 'Azure API not configured'
  }),
  put: async <T>(_endpoint: string, _body?: any): Promise<ApiResponse<T>> => ({
    success: false,
    data: null as any,
    error: 'Azure API not configured'
  }),
  delete: async <T>(_endpoint: string, _params?: any): Promise<ApiResponse<T>> => ({
    success: false,
    data: null as any,
    error: 'Azure API not configured'
  })
};

const mockApi: any = {
  tasks: {
    list: async () => ({ success: false, data: [] })
  }
};

const isDemoMode = () => false;

// Types from database
export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

// Define task-related enums that aren't in the database types
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Extended types for compatibility
export type TaskWithRelations = Task & {
  lead?: {
    id: string;
    name: string;
    phone: string;
  } | null;
  owner?: {
    id: string;
    email: string;
    full_name?: string;
  } | null;
  contract?: any | null;
};

export interface TaskFilters {
  taskId?: string;
  status?: string | string[];
  priority?: TaskPriority;
  owner_id?: string;
  assigned_to?: string;
  lead_id?: string;
  contract_id?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
  overdue?: boolean;
  today?: boolean;
  upcoming?: boolean;
  type?: string;
  limit?: number;
  followUpsOnly?: boolean;
}

export interface TasksResponse {
  tasks?: TaskWithRelations[];
  data?: TaskWithRelations[];
}

/**
 * Tasks Service Class
 */
class TasksService {
  /**
   * Get all tasks with filters
   */
  async getTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
    // Use mock API in demo mode
    if (isDemoMode()) {
      const mockResponse = await mockApi.tasks.list(filters);
      if (mockResponse.success && mockResponse.data) {
        const tasks = Array.isArray(mockResponse.data) ? mockResponse.data : [];
        return { tasks: tasks as TaskWithRelations[] };
      }
      return { tasks: [] };
    }

    const params: Record<string, any> = {};

    // Add all filters as query parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params[key] = value.join(',');
        } else {
          params[key] = value;
        }
      }
    });

    const response = await azureApi.get<TaskWithRelations[]>('tasks/get-tasks', params);
    
    if (!response.success || !response.data) {
      return { tasks: [] };
    }

    // Map tasks to include relations
    const mappedTasks = response.data.map((task: any) => ({
      ...task,
      owner: undefined, // Not available from auth.users
      lead: task.lead || null,
      contract: undefined
    }));

    return { tasks: mappedTasks };
  }

  /**
   * Get a single task by ID
   */
  async getTask(taskId: string): Promise<TaskWithRelations | null> {
    const response = await azureApi.get<TaskWithRelations>('tasks/get-task', { 
      taskId 
    });
    
    if (!response.success || !response.data) {
      return null;
    }

    return {
      ...response.data,
      owner: undefined,
      lead: response.data.lead || null,
      contract: undefined
    };
  }

  /**
   * Get my tasks (tasks assigned to current user)
   */
  async getMyTasks(): Promise<TaskWithRelations[]> {
    const response = await azureApi.get<TaskWithRelations[]>('tasks/my-tasks');
    
    if (!response.success || !response.data) {
      return [];
    }

    return response.data.map((task: any) => ({
      ...task,
      owner: undefined,
      lead: task.lead || null,
      contract: undefined
    }));
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(): Promise<TaskWithRelations[]> {
    const response = await azureApi.get<TaskWithRelations[]>('tasks/overdue-tasks');

    if (!response.success || !response.data) {
      return [];
    }

    return response.data.map((task: any) => ({
      ...task,
      owner: undefined,
      lead: task.lead || null,
      contract: undefined
    }));
  }

  /**
   * Create a new task
   */
  async createTask(taskData: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    due_date?: string;
    assigned_to?: string;
    owner_id?: string;
    lead_id?: string;
    contract_id?: string;
    status?: TaskStatus;
  }): Promise<Task> {
    const response = await azureApi.post<Task>('tasks/create-task', {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || 'medium',
      due_date: taskData.due_date,
      assigned_to: taskData.assigned_to || taskData.owner_id,
      lead_id: taskData.lead_id,
      contract_id: taskData.contract_id,
      status: taskData.status || 'pending'
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create task');
    }

    return response.data;
  }

  /**
   * Update a task
   */
  async updateTask(taskId: string, updates: Partial<TaskUpdate>): Promise<Task> {
    const response = await azureApi.put<Task>('tasks/update-task', {
      id: taskId,
      ...updates
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update task');
    }

    return response.data;
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: string): Promise<Task> {
    const response = await azureApi.put<Task>('tasks/complete-task', {
      id: taskId
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to complete task');
    }

    return response.data;
  }

  /**
   * Assign a task to a user
   */
  async assignTask(taskId: string, userId: string): Promise<Task> {
    const response = await azureApi.put<Task>('tasks/assign-task', {
      id: taskId,
      assigned_to: userId
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to assign task');
    }

    return response.data;
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    const response = await azureApi.delete('tasks/delete-task', { 
      id: taskId 
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete task');
    }
  }
}

// Export singleton instance
export const tasksService = new TasksService();

// Export class for custom instances
export { TasksService };