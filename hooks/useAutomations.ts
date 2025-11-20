import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from './useAccount';
import { useEffect } from 'react';
import { automationsService, type AutomationFilters } from '@/lib/services/automations.service';
import { toast } from '@/hooks/use-toast';

// Types adjusted for real database structure
interface Automation {
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
}

interface AutomationExecution {
  id: string;
  automation_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  context: Record<string, any>;
  started_at: string;
  completed_at?: string;
  error?: string;
}

interface AutomationMetrics {
  automation_id: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  average_duration_ms: number;
  last_execution_at?: string;
}

export function useAutomations() {
  const { account, accountId } = useAccount();
  const queryClient = useQueryClient();

  // Buscar automações (via automationsService)
  const workflows = useQuery({
    queryKey: ['automations', accountId],
    queryFn: async () => {
      try {
        console.log('🔍 [useAutomations] Buscando automações');

        const result = await automationsService.getAutomations({
          pageSize: 100, // Carregar todas as automações
        });

        console.log('✅ [useAutomations] Automações carregadas:', result.automations.length);
        return result.automations;
      } catch (error: any) {
        console.error('❌ [useAutomations] Erro ao carregar automações:', error);
        return [];
      }
    },
    enabled: true
  });

  // Buscar automação específica (via automationsService)
  const getAutomation = async (id: string): Promise<Automation | null> => {
    try {
      console.log('🔍 [useAutomations.getAutomation] Buscando automação:', id);
      const automation = await automationsService.getAutomation(id);
      console.log('✅ [useAutomations.getAutomation] Automação encontrada:', automation?.id);
      return automation;
    } catch (error: any) {
      console.error('❌ [useAutomations.getAutomation] Erro:', error);
      throw error;
    }
  };

  // Criar automação (via automationsService)
  const createAutomation = useMutation({
    mutationFn: async (automation: Partial<Automation>) => {
      console.log('🔄 [useAutomations.createAutomation] Criando automação:', automation);
      return await automationsService.createAutomation(automation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations', accountId] });
      console.log('✅ [useAutomations.createAutomation] Automação criada com sucesso');
      toast({
        title: 'Automação criada!',
        description: 'A automação foi criada com sucesso.',
      });
    },
    onError: (error: any) => {
      console.error('❌ [useAutomations.createAutomation] Erro:', error);
      toast({
        title: 'Erro ao criar automação',
        description: error.message || 'Não foi possível criar a automação.',
        variant: 'destructive',
      });
    }
  });

  // Atualizar automação (via automationsService)
  const updateAutomation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Automation> & { id: string }) => {
      console.log('🔄 [useAutomations.updateAutomation] Atualizando automação:', id, updates);
      return await automationsService.updateAutomation(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations', accountId] });
      console.log('✅ [useAutomations.updateAutomation] Automação atualizada com sucesso');
      toast({
        title: 'Automação atualizada!',
        description: 'A automação foi atualizada com sucesso.',
      });
    },
    onError: (error: any) => {
      console.error('❌ [useAutomations.updateAutomation] Erro:', error);
      toast({
        title: 'Erro ao atualizar automação',
        description: error.message || 'Não foi possível atualizar a automação.',
        variant: 'destructive',
      });
    }
  });

  // Deletar automação (via automationsService)
  const deleteAutomation = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ [useAutomations.deleteAutomation] Deletando automação:', id);
      return await automationsService.deleteAutomation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations', accountId] });
      console.log('✅ [useAutomations.deleteAutomation] Automação deletada com sucesso');
      toast({
        title: 'Automação deletada!',
        description: 'A automação foi removida com sucesso.',
      });
    },
    onError: (error: any) => {
      console.error('❌ [useAutomations.deleteAutomation] Erro:', error);
      toast({
        title: 'Erro ao deletar automação',
        description: error.message || 'Não foi possível deletar a automação.',
        variant: 'destructive',
      });
    }
  });

  // Ativar/desativar automação (via automationsService)
  const toggleAutomation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      console.log('🔄 [useAutomations.toggleAutomation] Toggle automação:', id, isActive);
      return await automationsService.toggleAutomation(id, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations', accountId] });
      console.log('✅ [useAutomations.toggleAutomation] Automação toggleada com sucesso');
      toast({
        title: 'Automação atualizada!',
        description: 'O status da automação foi alterado.',
      });
    },
    onError: (error: any) => {
      console.error('❌ [useAutomations.toggleAutomation] Erro:', error);
      toast({
        title: 'Erro ao atualizar automação',
        description: error.message || 'Não foi possível alterar o status da automação.',
        variant: 'destructive',
      });
    }
  });

  // Buscar execuções (via automationsService)
  const getExecutions = async (automationId?: string, limit = 50) => {
    try {
      console.log('🔍 [useAutomations.getExecutions] Buscando execuções:', automationId);
      const executions = await automationsService.getExecutions(automationId, limit);
      console.log('✅ [useAutomations.getExecutions] Execuções encontradas:', executions.length);
      return executions;
    } catch (error: any) {
      console.error('❌ [useAutomations.getExecutions] Erro:', error);
      throw error;
    }
  };

  // Buscar execução específica (via automationsService)
  const getExecution = async (id: string): Promise<AutomationExecution | null> => {
    try {
      console.log('🔍 [useAutomations.getExecution] Buscando execução:', id);
      const execution = await automationsService.getExecution(id);
      console.log('✅ [useAutomations.getExecution] Execução encontrada:', execution?.id);
      return execution;
    } catch (error: any) {
      console.error('❌ [useAutomations.getExecution] Erro:', error);
      throw error;
    }
  };

  // Executar automação manualmente (via automationsService)
  const executeAutomation = useMutation({
    mutationFn: async ({ automationId, context = {} }: { automationId: string; context?: Record<string, any> }) => {
      console.log('🔄 [useAutomations.executeAutomation] Executando automação:', automationId);
      return await automationsService.executeAutomation(automationId, context);
    },
    onSuccess: () => {
      console.log('✅ [useAutomations.executeAutomation] Automação executada com sucesso');
      toast({
        title: 'Automação executada!',
        description: 'A automação foi executada com sucesso.',
      });
    },
    onError: (error: any) => {
      console.error('❌ [useAutomations.executeAutomation] Erro:', error);
      toast({
        title: 'Erro ao executar automação',
        description: error.message || 'Não foi possível executar a automação.',
        variant: 'destructive',
      });
    }
  });

  // Pausar execução (via automationsService)
  const pauseExecution = useMutation({
    mutationFn: async (executionId: string) => {
      console.log('🔄 [useAutomations.pauseExecution] Pausando execução:', executionId);
      // Usar updateExecutionStatus para simular pausa
      return await automationsService.updateExecutionStatus(executionId, 'pending');
    },
    onSuccess: () => {
      console.log('✅ [useAutomations.pauseExecution] Execução pausada');
      toast({
        title: 'Execução pausada!',
        description: 'A execução foi pausada com sucesso.',
      });
    },
    onError: (error: any) => {
      console.error('❌ [useAutomations.pauseExecution] Erro:', error);
      toast({
        title: 'Erro ao pausar execução',
        description: error.message || 'Não foi possível pausar a execução.',
        variant: 'destructive',
      });
    }
  });

  // Retomar execução (via automationsService)
  const resumeExecution = useMutation({
    mutationFn: async (executionId: string) => {
      console.log('🔄 [useAutomations.resumeExecution] Retomando execução:', executionId);
      // Usar updateExecutionStatus para simular retomada
      return await automationsService.updateExecutionStatus(executionId, 'running');
    },
    onSuccess: () => {
      console.log('✅ [useAutomations.resumeExecution] Execução retomada');
      toast({
        title: 'Execução retomada!',
        description: 'A execução foi retomada com sucesso.',
      });
    },
    onError: (error: any) => {
      console.error('❌ [useAutomations.resumeExecution] Erro:', error);
      toast({
        title: 'Erro ao retomar execução',
        description: error.message || 'Não foi possível retomar a execução.',
        variant: 'destructive',
      });
    }
  });

  // Cancelar execução (via automationsService)
  const cancelExecution = useMutation({
    mutationFn: async (executionId: string) => {
      console.log('🔄 [useAutomations.cancelExecution] Cancelando execução:', executionId);
      return await automationsService.updateExecutionStatus(executionId, 'cancelled');
    },
    onSuccess: () => {
      console.log('✅ [useAutomations.cancelExecution] Execução cancelada');
      toast({
        title: 'Execução cancelada!',
        description: 'A execução foi cancelada com sucesso.',
      });
    },
    onError: (error: any) => {
      console.error('❌ [useAutomations.cancelExecution] Erro:', error);
      toast({
        title: 'Erro ao cancelar execução',
        description: error.message || 'Não foi possível cancelar a execução.',
        variant: 'destructive',
      });
    }
  });

  // Buscar métricas (via automationsService)
  const getMetrics = async (
    automationId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AutomationMetrics | null> => {
    try {
      console.log('🔍 [useAutomations.getMetrics] Buscando métricas:', automationId);
      const metrics = await automationsService.getMetrics(automationId, startDate, endDate);
      console.log('✅ [useAutomations.getMetrics] Métricas encontradas:', metrics);
      return metrics;
    } catch (error: any) {
      console.error('❌ [useAutomations.getMetrics] Erro:', error);
      throw error;
    }
  };

  // Buscar templates (feature futura - retornar vazio por enquanto)
  const templates = useQuery({
    queryKey: ['automation-templates', accountId],
    queryFn: async () => {
      console.log('🔍 [useAutomations.templates] Buscando templates (feature futura)');
      // TODO: Criar service de templates quando tabela existir
      return [];
    },
    enabled: !!accountId
  });

  // Criar automação a partir de template
  const createFromTemplate = useMutation({
    mutationFn: async ({ templateId, name }: { templateId: string; name: string }) => {
      const template = templates.data?.find((t: any) => t.id === templateId);
      if (!template) throw new Error('Template não encontrado');

      const automation = {
        name,
        trigger: (template as any).workflow?.trigger || {},
        conditions: {},
        actions: (template as any).workflow?.actions || [],
        is_active: false,
        priority: 5
      };

      return createAutomation.mutateAsync(automation);
    }
  });

  // Validar automação
  const validateAutomation = (automation: Partial<Automation>) => {
    // Validação básica para automação
    const errors = [];
    if (!automation.name) errors.push('Nome é obrigatório');
    if (!automation.trigger) errors.push('Trigger é obrigatório');
    if (!automation.actions || automation.actions.length === 0) errors.push('Pelo menos uma ação é obrigatória');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Real-time updates via polling (replacing Supabase)
  useEffect(() => {
    if (!accountId) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ 
        queryKey: ['automations', accountId] 
      });
    }, 30000); // Poll every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [accountId, queryClient]);

  return {
    workflows, // Para compatibilidade, mantém o nome mas retorna automations
    getWorkflow: getAutomation,
    createWorkflow: createAutomation,
    updateWorkflow: updateAutomation,
    deleteWorkflow: deleteAutomation,
    toggleWorkflow: toggleAutomation,
    getExecutions,
    getExecution,
    executeWorkflow: executeAutomation,
    pauseExecution,
    resumeExecution,
    cancelExecution,
    getMetrics,
    templates,
    createFromTemplate,
    validateWorkflow: validateAutomation
  };
}