import { useQuery, useQueryClient } from '@tanstack/react-query';
import { azureClient } from '@/lib/azure-client';
import { AutomationLog } from '@/lib/automation/types';
import { useEffect } from 'react';
import { useAccount } from './useAccount';
import { supabase } from '@/lib/supabase/client';

interface UseAutomationLogsProps {
  executionId?: string;
  workflowId?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  startDate?: string;
  endDate?: string;
  limit?: number;
  realtime?: boolean;
}

export function useAutomationLogs({
  executionId,
  workflowId,
  type,
  startDate,
  endDate,
  limit = 100,
  realtime = false
}: UseAutomationLogsProps = {}) {
  const azureApi = azureClient;
  const queryClient = useQueryClient();
  const { accountId } = useAccount();

  const queryKey = ['automation-logs', accountId, { executionId, workflowId, type, startDate, endDate, limit }];

  // Buscar logs via API
  const { data: apiResponse, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!accountId) throw new Error('No account ID');

      const params = new URLSearchParams();
      if (executionId) params.append('executionId', executionId);
      if (workflowId) params.append('workflowId', workflowId);
      if (type) params.append('type', type);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`/api/automation-logs?${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch automation logs');
      }

      const result = await response.json();
      return result;
    },
    refetchInterval: realtime ? 1000 : false, // Polling se realtime ativo
    enabled: !!accountId
  });

  const logs = apiResponse?.data as AutomationLog[] | undefined;
  const executionSummaryData = apiResponse?.summary;

  // Real-time subscription
  useEffect(() => {
    if (!realtime || !accountId) return;

    let channel: any;

    const setupSubscription = () => {
      // Construir filtro baseado nos parâmetros
      let filters = [`account_id=eq.${accountId}`];
      
      if (executionId) {
        filters.push(`execution_id=eq.${executionId}`);
      } else if (workflowId) {
        filters.push(`workflow_id=eq.${workflowId}`);
      }
      
      const filter = filters.join(',');

      channel = supabase
        .channel('automation-logs-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'automation_logs',
            filter
          },
          (payload: any) => {
            // Adicionar novo log ao cache
            queryClient.setQueryData(queryKey, (old: any) => {
              const newLog = payload.new as AutomationLog;
              
              // Verificar se o log atende aos filtros
              if (type && newLog.type !== type) return old;
              if (startDate && new Date(newLog.created_at) < new Date(startDate)) return old;
              if (endDate && new Date(newLog.created_at) > new Date(endDate)) return old;
              
              // Atualizar tanto data quanto summary
              const currentLogs = old?.data || [];
              const newLogs = [newLog, ...currentLogs].slice(0, limit);
              
              return {
                ...old,
                data: newLogs,
                // Recalcular summary se necessário
                summary: executionId ? calculateSummary(newLogs) : old?.summary
              };
            });
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [realtime, executionId, workflowId, type, startDate, endDate, limit, queryClient, queryKey, supabase, accountId]);

  // Helper function to calculate summary
  const calculateSummary = (logs: AutomationLog[]) => {
    if (!logs || logs.length === 0) {
      return {
        totalLogs: 0,
        errors: 0,
        warnings: 0,
        nodes: {},
        duration: 0
      };
    }

    const summary = {
      totalLogs: logs.length,
      errors: logs.filter(l => l.type === 'error').length,
      warnings: logs.filter(l => l.type === 'warning').length,
      nodes: {} as Record<string, any>,
      duration: 0
    };

    // Calculate duration
    const timestamps = logs.map(l => new Date(l.created_at).getTime());
    if (timestamps.length > 1) {
      summary.duration = Math.max(...timestamps) - Math.min(...timestamps);
    }

    // Group by node
    logs.forEach(log => {
      const nodeId = log.node_id || 'unknown';
      if (!summary.nodes[nodeId]) {
        summary.nodes[nodeId] = {
          logs: 0,
          errors: 0,
          warnings: 0,
          lastLog: null
        };
      }

      summary.nodes[nodeId].logs++;
      if (log.type === 'error') summary.nodes[nodeId].errors++;
      if (log.type === 'warning') summary.nodes[nodeId].warnings++;
      summary.nodes[nodeId].lastLog = log;
    });

    return summary;
  };

  // Funções auxiliares
  const getLogsByNode = (nodeId: string) => {
    return logs?.filter(log => log.node_id === nodeId) || [];
  };

  const getErrorLogs = () => {
    return logs?.filter(log => log.type === 'error') || [];
  };

  const getWarningLogs = () => {
    return logs?.filter(log => log.type === 'warning') || [];
  };

  const getLogTimeline = () => {
    if (!logs || logs.length === 0) return [];

    // Agrupar logs por minuto
    const timeline = new Map<string, {
      timestamp: string;
      total: number;
      errors: number;
      warnings: number;
    }>();

    logs.forEach(log => {
      const date = new Date(log.created_at);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
      
      if (!timeline.has(key)) {
        timeline.set(key, {
          timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()).toISOString(),
          total: 0,
          errors: 0,
          warnings: 0
        });
      }

      const entry = timeline.get(key)!;
      entry.total++;
      if (log.type === 'error') entry.errors++;
      if (log.type === 'warning') entry.warnings++;
    });

    return Array.from(timeline.values()).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  // Exportar logs
  const exportLogs = () => {
    if (!logs || logs.length === 0) return null;

    const csv = [
      ['Timestamp', 'Node ID', 'Type', 'Message', 'Details'].join(','),
      ...logs.map(log => [
        log.created_at,
        log.node_id || '',
        log.type || '',
        `"${(log.message || '').replace(/"/g, '""')}"`,
        log.details ? `"${JSON.stringify(log.details).replace(/"/g, '""')}"` : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automation-logs-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    logs,
    isLoading,
    error,
    executionSummary: executionSummaryData,
    getLogsByNode,
    getErrorLogs,
    getWarningLogs,
    getLogTimeline,
    exportLogs
  };
}