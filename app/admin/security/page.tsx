'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StandardModal, StandardConfirmDialog } from '@/components/ui/ux-patterns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IPPrivacyService, IPMaskingConfig } from '@/lib/security/ip-privacy';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Eye,
  EyeOff,
  FileText,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Lock,
  Unlock,
  Filter,
  Download,
  RefreshCw,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SecurityMetrics {
  totalAuditLogs: number;
  criticalEvents: number;
  activeMFAUsers: number;
  totalUsers: number;
  complianceViolations: number;
  dataRetentionPolicies: number;
  lastSecurityScan: string | null;
  riskScore: number;
}

interface AuditLogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  changes: any;
  metadata: any;
}

interface ComplianceStatus {
  dataRetention: boolean;
  auditTrail: boolean;
  accessControl: boolean;
  encryption: boolean;
  gdprCompliance: boolean;
  lgpdCompliance: boolean;
}

export default function SecurityPage() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'agent' | 'viewer'>('viewer');
  const [hasFullAuditAccess, setHasFullAuditAccess] = useState(false);
  
  // IP Access Request Modal
  const [showIPAccessModal, setShowIPAccessModal] = useState(false);
  const [ipAccessJustification, setIpAccessJustification] = useState('');
  const [ipAccessLoading, setIpAccessLoading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    loadSecurityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSecurityData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar métricas, logs, compliance e permissões do usuário em paralelo
      const [metricsResponse, logsResponse, complianceResponse, userResponse] = await Promise.all([
        fetch('/api/security/metrics'),
        fetch('/api/security/audit-logs?limit=10'),
        fetch('/api/security/compliance'),
        fetch('/api/auth/user-permissions')
      ]);

      if (metricsResponse.ok) {
        const metricsResult = await metricsResponse.json();
        setMetrics(metricsResult.data);
      }

      if (userResponse.ok) {
        const userResult = await userResponse.json();
        setUserRole(userResult.data?.role || 'viewer');
        setHasFullAuditAccess(userResult.data?.hasFullAuditAccess || false);
      }

      if (logsResponse.ok) {
        const logsResult = await logsResponse.json();
        const logs = logsResult.data || [];
        
        // Apply IP masking based on user role
        const maskingConfig: IPMaskingConfig = {
          hasFullAuditAccess,
          dataRetentionCompliance: 'LGPD'
        };

        const maskedLogs = logs.map((log: AuditLogEntry) => log);
        
        setRecentLogs(maskedLogs);
      }

      if (complianceResponse.ok) {
        const complianceResult = await complianceResponse.json();
        setCompliance(complianceResult.data);
      }
    } catch (error) {
      console.error('Error loading security data:', error);
      toast.error('Erro ao carregar dados de segurança');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadSecurityData();
    setIsRefreshing(false);
    toast.success('Dados atualizados');
  };

  const requestFullIPAccess = async () => {
    if (ipAccessJustification.length < 20) {
      toast.error('Justificativa de segurança insuficiente. Mínimo 20 caracteres com palavras-chave válidas.');
      return;
    }

    setIpAccessLoading(true);
    try {
      const response = await fetch('/api/security/request-ip-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          justification: ipAccessJustification,
          requestType: 'FULL_IP_ACCESS'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data.approved) {
          setHasFullAuditAccess(true);
          await loadSecurityData(); // Reload with full access
          toast.success('Acesso completo a IPs concedido temporariamente');
        } else {
          toast.error('Solicitação negada. Entre em contato com o administrador do sistema.');
        }
      } else {
        toast.error('Erro ao solicitar acesso');
      }
    } catch (error) {
      console.error('Error requesting IP access:', error);
      toast.error('Erro ao solicitar acesso');
    } finally {
      setIpAccessLoading(false);
      setShowIPAccessModal(false);
      setIpAccessJustification('');
    }
  };

  const exportAuditLogs = async () => {
    try {
      const response = await fetch('/api/security/audit-logs/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Logs exportados com sucesso');
      } else {
        toast.error('Erro ao exportar logs');
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Erro ao exportar logs');
    }
  };

  const getRiskBadgeColor = (score: number) => {
    if (score <= 30) return 'default';
    if (score <= 60) return 'secondary';
    if (score <= 80) return 'destructive';
    return 'destructive';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 30) return 'Baixo';
    if (score <= 60) return 'Médio';
    if (score <= 80) return 'Alto';
    return 'Crítico';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Centro de Segurança
            </h1>
            <p className="text-muted-foreground">
              Monitoramento, auditoria e compliance de segurança
            </p>
          </div>
          <div className="flex gap-2">
            {userRole === 'admin' && !hasFullAuditAccess && (
              <Button variant="outline" onClick={() => setShowIPAccessModal(true)}>
                <Eye className="mr-2 h-4 w-4" />
                Solicitar Acesso Completo a IPs
              </Button>
            )}
            <Button variant="outline" onClick={refreshData} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="outline" onClick={exportAuditLogs}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Logs
            </Button>
          </div>
        </div>
      </div>

      {/* Métricas de Segurança */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score de Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{metrics?.riskScore || 0}</div>
              <Badge variant={getRiskBadgeColor(metrics?.riskScore || 0)}>
                {getRiskLabel(metrics?.riskScore || 0)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Logs de Auditoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{metrics?.totalAuditLogs || 0}</div>
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.criticalEvents || 0} eventos críticos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">MFA Ativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {metrics?.activeMFAUsers || 0}/{metrics?.totalUsers || 0}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.totalUsers ? Math.round((metrics.activeMFAUsers / metrics.totalUsers) * 100) : 0}% de cobertura
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {compliance ? Object.values(compliance).filter(Boolean).length : 0}/6
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Requisitos atendidos
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="mfa">MFA</TabsTrigger>
          <TabsTrigger value="policies">Políticas</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status de Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Status de Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {compliance && Object.entries(compliance).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm">
                      {key === 'dataRetention' && 'Retenção de Dados'}
                      {key === 'auditTrail' && 'Trilha de Auditoria'}
                      {key === 'accessControl' && 'Controle de Acesso'}
                      {key === 'encryption' && 'Criptografia'}
                      {key === 'gdprCompliance' && 'GDPR'}
                      {key === 'lgpdCompliance' && 'LGPD'}
                    </span>
                    {value ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/security/mfa">
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="mr-2 h-4 w-4" />
                    Configurar MFA
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/admin/security?tab=audit')}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Logs de Auditoria
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/admin/security?tab=policies')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Gerenciar Políticas
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={exportAuditLogs}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Relatório
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Logs Recentes */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
              <CardDescription>
                Últimos 10 eventos de auditoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentLogs.length > 0 ? (
                <div className="space-y-2">
                  {recentLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{log.action}</Badge>
                          <span className="text-sm">{log.entity_type}</span>
                          {log.ip_masked && (
                            <Badge variant="secondary" className="text-xs">
                              {hasFullAuditAccess ? (
                                <Eye className="h-3 w-3 mr-1" />
                              ) : (
                                <EyeOff className="h-3 w-3 mr-1" />
                              )}
                              {hasFullAuditAccess ? 'Acesso Completo' : 'LGPD'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {log.ip_address && (
                            <span className="text-xs text-muted-foreground">
                              IP: {log.ip_address}
                            </span>
                          )}
                          {log.ip_masking_reason && !hasFullAuditAccess && (
                            <span className="text-xs text-blue-600" title={log.ip_masking_reason}>
                              <Info className="h-3 w-3 inline mr-1" />
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          ID: {log.entity_id?.substring(0, 8)}...
                        </p>
                        {userRole === 'admin' && (
                          <p className="text-xs text-green-600">
                            Admin
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum log de auditoria encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outras tabs serão implementadas em componentes separados */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Auditoria</CardTitle>
              <CardDescription>
                Visualização detalhada dos logs de auditoria do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Funcionalidade em desenvolvimento. Use a API <code>/api/security/audit-logs</code> diretamente.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance LGPD/GDPR</CardTitle>
              <CardDescription>
                Monitoramento de conformidade com regulamentações de proteção de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Funcionalidade em desenvolvimento. Use a API <code>/api/security/compliance</code> diretamente.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mfa">
          <Card>
            <CardHeader>
              <CardTitle>Autenticação Multifator</CardTitle>
              <CardDescription>
                Gerenciamento de MFA para usuários da conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-semibold mb-2">Configure seu MFA</p>
                <p className="text-muted-foreground mb-4">
                  Adicione uma camada extra de segurança à sua conta
                </p>
                <Link href="/admin/security/mfa">
                  <Button>
                    <Shield className="mr-2 h-4 w-4" />
                    Configurar MFA
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Segurança</CardTitle>
              <CardDescription>
                Configuração de políticas de retenção e limpeza de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Funcionalidade em desenvolvimento. Use a API <code>/api/security/policies</code> diretamente.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* IP Access Request Modal */}
      <StandardModal
        isOpen={showIPAccessModal}
        onClose={() => setShowIPAccessModal(false)}
        title="Solicitar Acesso Completo a Endereços IP"
        description="Para visualizar endereços IP completos em logs de auditoria, é necessária justificativa de segurança válida."
        size="lg"
      >
        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Conformidade LGPD:</strong> Endereços IP são considerados dados pessoais. 
              O acesso completo deve ser justificado por motivos de segurança legítimos.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="justification">Justificativa de Segurança *</Label>
            <Textarea
              id="justification"
              placeholder="Digite a justificativa de segurança para acesso completo aos IPs. 
              
Exemplos válidos:
- Investigação de segurança de tentativa de acesso não autorizado
- Análise de ameaça de ataque coordenado
- Auditoria de compliance SOC2
- Investigação de fraude em transações
- Resposta a incidente de segurança crítico"
              value={ipAccessJustification}
              onChange={(e) => setIpAccessJustification(e.target.value)}
              className="min-h-[120px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {ipAccessJustification.length}/500 caracteres • Mínimo 20 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Palavras-chave Aceitas:</h4>
            <div className="flex flex-wrap gap-1">
              {[
                'investigação de segurança',
                'análise de ameaça', 
                'auditoria de compliance',
                'investigação de fraude',
                'resposta a incidente'
              ].map((keyword) => (
                <Badge key={keyword} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Todas as solicitações de acesso são registradas 
              nos logs de auditoria. O acesso é temporário e limitado à sessão atual.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setShowIPAccessModal(false);
              setIpAccessJustification('');
            }}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={requestFullIPAccess}
            disabled={ipAccessLoading || ipAccessJustification.length < 20}
            className="flex-1"
          >
            {ipAccessLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            Solicitar Acesso
          </Button>
        </div>
      </StandardModal>
    </div>
  );
}