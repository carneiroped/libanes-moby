import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface AuditLogEntry {
  id: string;
  account_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  changes: any;
  metadata: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogFilters {
  action?: string;
  entity_type?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogStats {
  totalLogs: number;
  logsByDay: Array<{ date: string; count: number }>;
  topActions: Array<{ action: string; count: number }>;
  topUsers: Array<{ userId: string; count: number }>;
  criticalEvents: number;
}

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async (filters?: AuditLogFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.action) params.append('action', filters.action);
      if (filters?.entity_type) params.append('entity_type', filters.entity_type);
      if (filters?.user_id) params.append('user_id', filters.user_id);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/security/audit-logs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar logs de auditoria');
      }

      const result = await response.json();
      setLogs(result.data || []);
      
      return {
        logs: result.data || [],
        total: result.total || 0,
        hasMore: result.hasMore || false
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error fetching audit logs:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async (days: number = 30) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/security/audit-logs/stats?days=${days}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar estatísticas de auditoria');
      }

      const result = await response.json();
      setStats(result.data);
      
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error fetching audit stats:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const searchLogs = async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/security/audit-logs/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Falha ao pesquisar logs');
      }

      const result = await response.json();
      setLogs(result.data || []);
      
      return result.data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error searching logs:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const exportLogs = async (filters?: AuditLogFilters) => {
    try {
      const params = new URLSearchParams();
      if (filters?.action) params.append('action', filters.action);
      if (filters?.entity_type) params.append('entity_type', filters.entity_type);
      if (filters?.user_id) params.append('user_id', filters.user_id);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);

      const response = await fetch(`/api/security/audit-logs/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Falha ao exportar logs');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Logs exportados com sucesso');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao exportar logs';
      toast.error(errorMessage);
      console.error('Error exporting logs:', error);
      throw error;
    }
  };

  const verifyIntegrity = async (logId: string) => {
    try {
      const response = await fetch(`/api/security/audit-logs/${logId}/verify`);
      
      if (!response.ok) {
        throw new Error('Falha ao verificar integridade');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao verificar integridade';
      toast.error(errorMessage);
      console.error('Error verifying integrity:', error);
      throw error;
    }
  };

  const getSuspiciousActivity = async (hours: number = 24) => {
    try {
      const response = await fetch(`/api/security/audit-logs/suspicious?hours=${hours}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar atividades suspeitas');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar atividades suspeitas';
      toast.error(errorMessage);
      console.error('Error getting suspicious activity:', error);
      throw error;
    }
  };

  const getUserActivity = async (userId: string, days: number = 30) => {
    try {
      const response = await fetch(`/api/security/audit-logs/user/${userId}?days=${days}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar atividade do usuário');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar atividade do usuário';
      toast.error(errorMessage);
      console.error('Error getting user activity:', error);
      throw error;
    }
  };

  return {
    logs,
    stats,
    isLoading,
    error,
    fetchLogs,
    fetchStats,
    searchLogs,
    exportLogs,
    verifyIntegrity,
    getSuspiciousActivity,
    getUserActivity
  };
}