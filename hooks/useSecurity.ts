import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface SecurityMetrics {
  totalAuditLogs: number;
  criticalEvents: number;
  activeMFAUsers: number;
  totalUsers: number;
  complianceViolations: number;
  dataRetentionPolicies: number;
  lastSecurityScan: string | null;
  riskScore: number;
  suspiciousActivities: number;
  failedLoginAttempts: number;
  passwordStrengthScore: number;
  encryptionStatus: boolean;
}

export interface SecurityAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  action_required: boolean;
  resolved: boolean;
  created_at: string;
  resolved_at: string | null;
  metadata: any;
}

export interface MFAStatus {
  user_id: string;
  is_active: boolean;
  setup_date: string | null;
  last_used: string | null;
  backup_codes_count: number;
  recovery_codes_used: number;
}

export interface SecuritySettings {
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_symbols: boolean;
    max_age_days: number;
  };
  session_policy: {
    max_session_duration: number;
    idle_timeout: number;
    require_mfa_for_admin: boolean;
    allow_concurrent_sessions: boolean;
  };
  audit_policy: {
    retention_days: number;
    log_all_actions: boolean;
    log_failed_attempts: boolean;
    alert_on_suspicious: boolean;
  };
}

export function useSecurity() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [mfaStatus, setMfaStatus] = useState<MFAStatus[]>([]);
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSecurityMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/security/metrics');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar métricas de segurança');
      }

      const result = await response.json();
      setMetrics(result.data);
      
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error fetching security metrics:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSecurityAlerts = async (includeResolved: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (includeResolved) params.append('include_resolved', 'true');

      const response = await fetch(`/api/security/alerts?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar alertas de segurança');
      }

      const result = await response.json();
      setAlerts(result.data || []);
      
      return result.data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error fetching security alerts:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resolveAlert = async (alertId: string, resolution_note?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/security/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution_note })
      });

      if (!response.ok) {
        throw new Error('Falha ao resolver alerta');
      }

      const result = await response.json();
      
      // Atualizar lista de alertas
      await fetchSecurityAlerts();
      
      toast.success('Alerta resolvido com sucesso');
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao resolver alerta';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error resolving alert:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMFAStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/security/mfa/status');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar status do MFA');
      }

      const result = await response.json();
      setMfaStatus(result.data || []);
      
      return result.data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error fetching MFA status:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSecuritySettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/security/settings');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar configurações de segurança');
      }

      const result = await response.json();
      setSettings(result.data);
      
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error fetching security settings:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSecuritySettings = async (updates: Partial<SecuritySettings>) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/security/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar configurações');
      }

      const result = await response.json();
      setSettings(result.data);
      
      toast.success('Configurações atualizadas com sucesso');
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar configurações';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error updating security settings:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const runSecurityScan = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/security/scan', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Falha ao executar scan de segurança');
      }

      const result = await response.json();
      
      // Atualizar métricas após o scan
      await fetchSecurityMetrics();
      
      toast.success('Scan de segurança concluído');
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao executar scan';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error running security scan:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkPasswordStrength = async (password: string) => {
    try {
      const response = await fetch('/api/security/password/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        throw new Error('Falha ao verificar força da senha');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao verificar senha';
      console.error('Error checking password strength:', error);
      throw error;
    }
  };

  const generateSecurityReport = async (type: 'summary' | 'detailed' = 'summary') => {
    try {
      const response = await fetch(`/api/security/report?type=${type}`);
      
      if (!response.ok) {
        throw new Error('Falha ao gerar relatório');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${type}-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Relatório de segurança gerado');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar relatório';
      toast.error(errorMessage);
      console.error('Error generating security report:', error);
      throw error;
    }
  };

  const enableMFAForUser = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/security/mfa/users/${userId}/enable`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Falha ao habilitar MFA');
      }

      const result = await response.json();
      
      // Atualizar status do MFA
      await fetchMFAStatus();
      
      toast.success('MFA habilitado para o usuário');
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao habilitar MFA';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error enabling MFA:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disableMFAForUser = async (userId: string, reason?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/security/mfa/users/${userId}/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Falha ao desabilitar MFA');
      }

      const result = await response.json();
      
      // Atualizar status do MFA
      await fetchMFAStatus();
      
      toast.success('MFA desabilitado para o usuário');
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao desabilitar MFA';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error disabling MFA:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    metrics,
    alerts,
    mfaStatus,
    settings,
    isLoading,
    error,
    fetchSecurityMetrics,
    fetchSecurityAlerts,
    resolveAlert,
    fetchMFAStatus,
    fetchSecuritySettings,
    updateSecuritySettings,
    runSecurityScan,
    checkPasswordStrength,
    generateSecurityReport,
    enableMFAForUser,
    disableMFAForUser
  };
}