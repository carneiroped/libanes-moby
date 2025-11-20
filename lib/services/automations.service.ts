'use server';

import { createClient } from '@/lib/supabase/server';

// Tipos de automação (baseados no hook useAutomations.ts)
export interface Automation {
  id: string;
  account_id: string;
  name: string;
  trigger: any;
  conditions: any;
  actions: any[];
  is_active: boolean;
  priority: number;
  execution_count: number;
  last_executed_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface AutomationExecution {
  id: string;
  automation_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  context: Record<string, any>;
  started_at: string;
  completed_at?: string;
  error?: string;
}

export interface AutomationMetrics {
  automation_id: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  average_duration_ms: number;
  last_execution_at?: string;
}

export interface AutomationFilters {
  is_active?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AutomationsResponse {
  automations: Automation[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Obter account_id do usuário logado
 */
async function getUserAccountId(): Promise<string> {
  const supabase = await createClient();
  const client = supabase as any; // Type cast para compatibilidade

  const authResult = await client.auth.getUser();
  const user = authResult.data?.user;
  const error = authResult.error;

  if (error || !user) {
    throw new Error('Usuário não autenticado');
  }

  // Buscar account_id do usuário na tabela users
  const userQuery = await client
    .from('users')
    .select('account_id')
    .eq('id', user.id)
    .single();

  if (userQuery.error || !userQuery.data) {
    throw new Error('Conta do usuário não encontrada');
  }

  return userQuery.data.account_id;
}

/**
 * Buscar automações com filtros
 */
export async function getAutomations(filters: AutomationFilters = {}): Promise<AutomationsResponse> {
  try {
    console.log('🔍 [automationsService.getAutomations] Buscando automações com filtros:', filters);

    const supabase = await createClient();
    const client = supabase as any;
    const accountId = await getUserAccountId();

    const {
      is_active,
      search,
      page = 1,
      pageSize = 20
    } = filters;

    // Query base com RLS
    let query = client
      .from('automations')
      .select('*', { count: 'exact' })
      .eq('account_id', accountId);

    // Aplicar filtros
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active);
    }

    // Busca por texto (nome)
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Ordenação por prioridade e nome
    query = query
      .order('priority', { ascending: false })
      .order('name', { ascending: true });

    // Paginação
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ [automationsService.getAutomations] Erro ao buscar automações:', error);
      throw error;
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    console.log(`✅ [automationsService.getAutomations] ${data?.length || 0} automações encontradas`);

    return {
      automations: (data || []) as Automation[],
      count: count || 0,
      page,
      pageSize,
      totalPages
    };
  } catch (error: any) {
    console.error('❌ [automationsService.getAutomations] Erro:', error);
    throw error;
  }
}

/**
 * Buscar uma automação específica por ID
 */
export async function getAutomation(automationId: string): Promise<Automation | null> {
  try {
    console.log('🔍 [automationsService.getAutomation] Buscando automação:', automationId);

    const supabase = await createClient();
    const client = supabase as any;
    const accountId = await getUserAccountId();

    const { data, error } = await client
      .from('automations')
      .select('*')
      .eq('id', automationId)
      .eq('account_id', accountId)
      .single();

    if (error) {
      console.error('❌ [automationsService.getAutomation] Erro:', error);
      throw error;
    }

    if (!data) {
      console.log('⚠️ [automationsService.getAutomation] Automação não encontrada');
      return null;
    }

    console.log('✅ [automationsService.getAutomation] Automação encontrada:', data.id);
    return data as Automation;
  } catch (error: any) {
    console.error('❌ [automationsService.getAutomation] Erro:', error);
    throw error;
  }
}

/**
 * Criar uma nova automação
 */
export async function createAutomation(automationData: Partial<Automation>): Promise<Automation> {
  try {
    console.log('🔄 [automationsService.createAutomation] Criando automação:', automationData);

    const supabase = await createClient();
    const client = supabase as any;
    const accountId = await getUserAccountId();

    // Dados da automação com account_id
    const newAutomation = {
      account_id: accountId,
      name: automationData.name || 'Nova Automação',
      trigger: automationData.trigger || {},
      conditions: automationData.conditions || {},
      actions: automationData.actions || [],
      is_active: automationData.is_active ?? false,
      priority: automationData.priority ?? 5,
      execution_count: 0,
      last_executed_at: null,
    };

    const { data, error } = await client
      .from('automations')
      .insert(newAutomation)
      .select()
      .single();

    if (error) {
      console.error('❌ [automationsService.createAutomation] Erro:', error);
      throw error;
    }

    console.log('✅ [automationsService.createAutomation] Automação criada:', data.id);
    return data as Automation;
  } catch (error: any) {
    console.error('❌ [automationsService.createAutomation] Erro:', error);
    throw error;
  }
}

/**
 * Atualizar uma automação
 */
export async function updateAutomation(automationId: string, updates: Partial<Automation>): Promise<Automation> {
  try {
    console.log('🔄 [automationsService.updateAutomation] Atualizando automação:', automationId, updates);

    const supabase = await createClient();
    const client = supabase as any;
    const accountId = await getUserAccountId();

    const { data, error } = await client
      .from('automations')
      .update(updates)
      .eq('id', automationId)
      .eq('account_id', accountId)
      .select()
      .single();

    if (error) {
      console.error('❌ [automationsService.updateAutomation] Erro:', error);
      throw error;
    }

    console.log('✅ [automationsService.updateAutomation] Automação atualizada:', data.id);
    return data as Automation;
  } catch (error: any) {
    console.error('❌ [automationsService.updateAutomation] Erro:', error);
    throw error;
  }
}

/**
 * Deletar uma automação
 */
export async function deleteAutomation(automationId: string): Promise<boolean> {
  try {
    console.log('🗑️ [automationsService.deleteAutomation] Deletando automação:', automationId);

    const supabase = await createClient();
    const client = supabase as any;
    const accountId = await getUserAccountId();

    const { error } = await client
      .from('automations')
      .delete()
      .eq('id', automationId)
      .eq('account_id', accountId);

    if (error) {
      console.error('❌ [automationsService.deleteAutomation] Erro:', error);
      throw error;
    }

    console.log('✅ [automationsService.deleteAutomation] Automação deletada');
    return true;
  } catch (error: any) {
    console.error('❌ [automationsService.deleteAutomation] Erro:', error);
    throw error;
  }
}

/**
 * Ativar/desativar uma automação
 */
export async function toggleAutomation(automationId: string, isActive: boolean): Promise<Automation> {
  try {
    console.log('🔄 [automationsService.toggleAutomation] Toggle automação:', automationId, isActive);

    return await updateAutomation(automationId, { is_active: isActive });
  } catch (error: any) {
    console.error('❌ [automationsService.toggleAutomation] Erro:', error);
    throw error;
  }
}

/**
 * Buscar execuções de uma automação
 */
export async function getExecutions(automationId?: string, limit: number = 50): Promise<AutomationExecution[]> {
  try {
    console.log('🔍 [automationsService.getExecutions] Buscando execuções:', automationId, limit);

    const supabase = await createClient();
    const client = supabase as any;
    const accountId = await getUserAccountId();

    // Query base
    let query = client
      .from('automation_executions')
      .select(`
        *,
        automations!automation_executions_automation_id_fkey (
          account_id
        )
      `)
      .order('started_at', { ascending: false })
      .limit(limit);

    // Filtrar por automação se especificado
    if (automationId) {
      query = query.eq('automation_id', automationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [automationsService.getExecutions] Erro:', error);
      throw error;
    }

    // Filtrar apenas execuções da conta do usuário (via relação com automation)
    const filteredData = (data || []).filter((execution: any) => {
      const automation = execution.automations;
      return automation && automation.account_id === accountId;
    });

    console.log(`✅ [automationsService.getExecutions] ${filteredData.length} execuções encontradas`);
    return filteredData.map((exec: any) => {
      const { automations, ...rest } = exec;
      return rest;
    }) as AutomationExecution[];
  } catch (error: any) {
    console.error('❌ [automationsService.getExecutions] Erro:', error);
    throw error;
  }
}

/**
 * Buscar uma execução específica
 */
export async function getExecution(executionId: string): Promise<AutomationExecution | null> {
  try {
    console.log('🔍 [automationsService.getExecution] Buscando execução:', executionId);

    const supabase = await createClient();
    const client = supabase as any;
    const accountId = await getUserAccountId();

    const { data, error } = await client
      .from('automation_executions')
      .select(`
        *,
        automations!automation_executions_automation_id_fkey (
          account_id
        )
      `)
      .eq('id', executionId)
      .single();

    if (error) {
      console.error('❌ [automationsService.getExecution] Erro:', error);
      throw error;
    }

    if (!data) {
      console.log('⚠️ [automationsService.getExecution] Execução não encontrada');
      return null;
    }

    // Verificar se a execução pertence à conta do usuário
    const automation = data.automations as any;
    if (!automation || automation.account_id !== accountId) {
      console.log('⚠️ [automationsService.getExecution] Execução não pertence à conta');
      return null;
    }

    const { automations, ...execution } = data;
    console.log('✅ [automationsService.getExecution] Execução encontrada:', execution.id);
    return execution as AutomationExecution;
  } catch (error: any) {
    console.error('❌ [automationsService.getExecution] Erro:', error);
    throw error;
  }
}

/**
 * Executar uma automação manualmente
 */
export async function executeAutomation(automationId: string, context: Record<string, any> = {}): Promise<AutomationExecution> {
  try {
    console.log('🔄 [automationsService.executeAutomation] Executando automação:', automationId);

    // Verificar se a automação existe e pertence à conta
    const automation = await getAutomation(automationId);
    if (!automation) {
      throw new Error('Automação não encontrada');
    }

    // Criar execução
    const execution = {
      automation_id: automationId,
      status: 'pending' as const,
      context,
      started_at: new Date().toISOString(),
    };

    const supabase = await createClient();
    const client = supabase as any;

    const { data, error } = await client
      .from('automation_executions')
      .insert(execution)
      .select()
      .single();

    if (error) {
      console.error('❌ [automationsService.executeAutomation] Erro:', error);
      throw error;
    }

    // Atualizar contadores da automação
    await client
      .from('automations')
      .update({
        execution_count: (automation.execution_count || 0) + 1,
        last_executed_at: new Date().toISOString(),
      })
      .eq('id', automationId);

    console.log('✅ [automationsService.executeAutomation] Automação executada:', data.id);
    return data as AutomationExecution;
  } catch (error: any) {
    console.error('❌ [automationsService.executeAutomation] Erro:', error);
    throw error;
  }
}

/**
 * Atualizar status de uma execução
 */
export async function updateExecutionStatus(
  executionId: string,
  status: AutomationExecution['status'],
  error?: string
): Promise<AutomationExecution> {
  try {
    console.log('🔄 [automationsService.updateExecutionStatus] Atualizando status:', executionId, status);

    const supabase = await createClient();
    const client = supabase as any;

    const updates: any = {
      status,
    };

    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      updates.completed_at = new Date().toISOString();
    }

    if (error) {
      updates.error = error;
    }

    const { data, error: updateError } = await client
      .from('automation_executions')
      .update(updates)
      .eq('id', executionId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [automationsService.updateExecutionStatus] Erro:', updateError);
      throw updateError;
    }

    console.log('✅ [automationsService.updateExecutionStatus] Status atualizado:', data.id);
    return data as AutomationExecution;
  } catch (error: any) {
    console.error('❌ [automationsService.updateExecutionStatus] Erro:', error);
    throw error;
  }
}

/**
 * Buscar métricas de uma automação
 */
export async function getMetrics(
  automationId: string,
  startDate?: string,
  endDate?: string
): Promise<AutomationMetrics> {
  try {
    console.log('🔍 [automationsService.getMetrics] Buscando métricas:', automationId);

    // Verificar se a automação existe e pertence à conta
    const automation = await getAutomation(automationId);
    if (!automation) {
      throw new Error('Automação não encontrada');
    }

    const supabase = await createClient();
    const client = supabase as any;

    // Query para buscar execuções
    let query = client
      .from('automation_executions')
      .select('*')
      .eq('automation_id', automationId);

    // Filtrar por datas se especificado
    if (startDate) {
      query = query.gte('started_at', startDate);
    }
    if (endDate) {
      query = query.lte('started_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [automationsService.getMetrics] Erro:', error);
      throw error;
    }

    const executions = data || [];

    // Calcular métricas
    const total_executions = executions.length;
    const successful_executions = executions.filter((e: any) => e.status === 'completed').length;
    const failed_executions = executions.filter((e: any) => e.status === 'failed').length;

    // Calcular duração média
    const completedExecutions = executions.filter(
      (e: any) => e.status === 'completed' && e.started_at && e.completed_at
    );
    let average_duration_ms = 0;
    if (completedExecutions.length > 0) {
      const totalDuration = completedExecutions.reduce((sum: number, exec: any) => {
        const started = new Date(exec.started_at).getTime();
        const completed = new Date(exec.completed_at!).getTime();
        return sum + (completed - started);
      }, 0);
      average_duration_ms = totalDuration / completedExecutions.length;
    }

    // Última execução
    const sortedExecutions = executions.sort(
      (a: any, b: any) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );
    const last_execution_at = sortedExecutions.length > 0 ? sortedExecutions[0].started_at : undefined;

    const metrics: AutomationMetrics = {
      automation_id: automationId,
      total_executions,
      successful_executions,
      failed_executions,
      average_duration_ms,
      last_execution_at,
    };

    console.log('✅ [automationsService.getMetrics] Métricas calculadas:', metrics);
    return metrics;
  } catch (error: any) {
    console.error('❌ [automationsService.getMetrics] Erro:', error);
    throw error;
  }
}

// Exportar o serviço como objeto padrão
export const automationsService = {
  getAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  toggleAutomation,
  getExecutions,
  getExecution,
  executeAutomation,
  updateExecutionStatus,
  getMetrics,
};

export default automationsService;
