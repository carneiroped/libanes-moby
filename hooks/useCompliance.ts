import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface DataConsent {
  id: string;
  lead_id: string;
  type: string;
  purpose: string;
  granted: boolean;
  terms_version: string;
  ip_address: string | null;
  user_agent: string | null;
  granted_at: string;
  revoked_at: string | null;
  expires_at: string | null;
}

export interface DataRetentionPolicy {
  id: string;
  account_id: string;
  entity_type: string;
  retention_days: number;
  action: 'delete' | 'anonymize' | 'archive';
  conditions: any;
  is_active: boolean;
  last_executed_at: string | null;
  records_affected: number | null;
  created_at: string;
}

export interface ComplianceMetrics {
  totalConsents: number;
  activeConsents: number;
  revokedConsents: number;
  expiredConsents: number;
  retentionPolicies: number;
  activeRetentionPolicies: number;
  lastCleanupRun: string | null;
  recordsProcessed: number;
  complianceScore: number;
}

export interface ComplianceStatus {
  dataRetention: boolean;
  auditTrail: boolean;
  accessControl: boolean;
  encryption: boolean;
  gdprCompliance: boolean;
  lgpdCompliance: boolean;
}

export function useCompliance() {
  const [consents, setConsents] = useState<DataConsent[]>([]);
  const [policies, setPolicies] = useState<DataRetentionPolicy[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [status, setStatus] = useState<ComplianceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConsents = async (leadId?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (leadId) params.append('lead_id', leadId);

      const response = await fetch(`/api/security/consents?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar consentimentos');
      }

      const result = await response.json();
      setConsents(result.data || []);
      
      return result.data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error fetching consents:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createConsent = async (consentData: Omit<DataConsent, 'id' | 'granted_at'>) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/security/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentData)
      });

      if (!response.ok) {
        throw new Error('Falha ao criar consentimento');
      }

      const result = await response.json();
      
      // Atualizar lista de consentimentos
      await fetchConsents();
      
      toast.success('Consentimento registrado com sucesso');
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar consentimento';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error creating consent:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const revokeConsent = async (consentId: string, reason?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/security/consents/${consentId}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Falha ao revogar consentimento');
      }

      const result = await response.json();
      
      // Atualizar lista de consentimentos
      await fetchConsents();
      
      toast.success('Consentimento revogado com sucesso');
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao revogar consentimento';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error revoking consent:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRetentionPolicies = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/security/retention-policies');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar políticas de retenção');
      }

      const result = await response.json();
      setPolicies(result.data || []);
      
      return result.data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error fetching retention policies:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createRetentionPolicy = async (policyData: Omit<DataRetentionPolicy, 'id' | 'account_id' | 'created_at'>) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/security/retention-policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policyData)
      });

      if (!response.ok) {
        throw new Error('Falha ao criar política de retenção');
      }

      const result = await response.json();
      
      // Atualizar lista de políticas
      await fetchRetentionPolicies();
      
      toast.success('Política de retenção criada com sucesso');
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar política';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error creating retention policy:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRetentionPolicy = async (policyId: string, updates: Partial<DataRetentionPolicy>) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/security/retention-policies/${policyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar política de retenção');
      }

      const result = await response.json();
      
      // Atualizar lista de políticas
      await fetchRetentionPolicies();
      
      toast.success('Política atualizada com sucesso');
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar política';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error updating retention policy:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const executeCleanup = async (policyId?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const endpoint = policyId 
        ? `/api/security/retention-policies/${policyId}/execute`
        : '/api/security/cleanup/execute';

      const response = await fetch(endpoint, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Falha ao executar limpeza de dados');
      }

      const result = await response.json();
      
      // Atualizar métricas e políticas
      await Promise.all([fetchMetrics(), fetchRetentionPolicies()]);
      
      toast.success(`Limpeza executada: ${result.recordsProcessed} registros processados`);
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao executar limpeza';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error executing cleanup:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/security/compliance/metrics');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar métricas de compliance');
      }

      const result = await response.json();
      setMetrics(result.data);
      
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error fetching compliance metrics:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComplianceStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/security/compliance/status');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar status de compliance');
      }

      const result = await response.json();
      setStatus(result.data);
      
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error fetching compliance status:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateComplianceReport = async (format: 'pdf' | 'csv' = 'pdf') => {
    try {
      const response = await fetch(`/api/security/compliance/report?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Falha ao gerar relatório');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Relatório gerado com sucesso');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar relatório';
      toast.error(errorMessage);
      console.error('Error generating report:', error);
      throw error;
    }
  };

  return {
    consents,
    policies,
    metrics,
    status,
    isLoading,
    error,
    fetchConsents,
    createConsent,
    revokeConsent,
    fetchRetentionPolicies,
    createRetentionPolicy,
    updateRetentionPolicy,
    executeCleanup,
    fetchMetrics,
    fetchComplianceStatus,
    generateComplianceReport
  };
}