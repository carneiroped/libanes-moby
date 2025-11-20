'use client';

/**
 * PÁGINA - INTEGRAÇÃO GRUPO OLX/ZAP
 *
 * Gerenciamento completo da integração com Grupo OLX (ZAP Imóveis, Viva Real)
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Settings,
  Activity,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useOlxZapIntegration, useOlxZapLeads, copyWebhookUrl } from '@/hooks/useOlxZapIntegration';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SetupWizard } from '@/components/integrations/setup-wizard';

export default function OlxZapIntegrationPage() {
  const { toast } = useToast();

  // Estados
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [clientApiKey, setClientApiKey] = useState('');
  const [filters, setFilters] = useState({
    account_id: '6200796e-5629-4669-a4e1-3d8b027830fa',
    status: undefined,
    page: 1,
    limit: 20,
  });

  // Hooks
  const {
    integration,
    stats,
    isLoading,
    updateIntegration,
    isUpdating,
    refetch,
  } = useOlxZapIntegration();

  const {
    data: leadsData,
    isLoading: isLoadingLeads,
  } = useOlxZapLeads(filters);

  // Verificar se precisa configurar
  const needsSetup = integration && !integration.is_active && integration.total_leads_received === 0;

  // Callback quando o wizard é completado
  const handleWizardComplete = async () => {
    setShowSetupWizard(false);
    // Ativar integração automaticamente
    try {
      await updateIntegration({
        is_active: true,
      });
      toast({
        title: '✅ Integração configurada!',
        description: 'Você começará a receber leads em alguns minutos.',
      });
      refetch();
    } catch (error) {
      console.error('Erro ao ativar integração:', error);
    }
  };

  // Handlers
  const handleCopyWebhookUrl = async () => {
    const success = await copyWebhookUrl();
    if (success) {
      toast({
        title: 'URL copiada!',
        description: 'A URL do webhook foi copiada para a área de transferência.',
      });
    } else {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar a URL. Copie manualmente.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async () => {
    try {
      await updateIntegration({
        is_active: !integration?.is_active,
      });

      toast({
        title: integration?.is_active ? 'Integração desativada' : 'Integração ativada',
        description: integration?.is_active
          ? 'Os webhooks não serão mais processados.'
          : 'A integração está pronta para receber leads!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a integração.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveApiKey = async () => {
    try {
      await updateIntegration({
        client_api_key: clientApiKey,
        is_active: true,
      });

      toast({
        title: 'Configuração salva!',
        description: 'Integração ativada com sucesso.',
      });

      setShowConfigModal(false);
      setShowSetupWizard(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a configuração.',
        variant: 'destructive',
      });
    }
  };

  // Exibir wizard de setup automaticamente se necessário
  useEffect(() => {
    if (needsSetup && !showSetupWizard && !showConfigModal) {
      setShowSetupWizard(true);
    }
  }, [needsSetup, showSetupWizard, showConfigModal]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando integração...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-blue-500" />
            Integração Grupo OLX/ZAP
          </h1>
          <p className="text-muted-foreground mt-1">
            Receba leads de ZAP Imóveis e Viva Real em tempo real
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSetupWizard(true)}
          >
            <Zap className="h-4 w-4 mr-2" />
            Tutorial de Setup
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfigModal(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Status da Integração */}
      <Alert className={integration?.is_active ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}>
        <Activity className="h-4 w-4" />
        <AlertTitle>
          Status: {integration?.is_active ? 'Ativa' : 'Inativa'}
        </AlertTitle>
        <AlertDescription>
          {integration?.is_active
            ? 'A integração está funcionando e recebendo leads normalmente.'
            : 'Configure a integração para começar a receber leads do Grupo OLX.'}
        </AlertDescription>
      </Alert>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_leads || 0}</div>
            <p className="text-xs text-muted-foreground">Todos os leads recebidos</p>
          </CardContent>
        </Card>

        {/* Leads Hoje */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.leads_today || 0}</div>
            <p className="text-xs text-muted-foreground">
              Esta semana: {stats?.leads_this_week || 0}
            </p>
          </CardContent>
        </Card>

        {/* Leads Processados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.by_status.processed || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pendentes: {stats?.by_status.pending || 0}
            </p>
          </CardContent>
        </Card>

        {/* Taxa de Sucesso */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_leads
                ? Math.round((stats.by_status.processed / stats.total_leads) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Erros: {stats?.by_status.error || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Temperatura */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Temperatura</CardTitle>
          <CardDescription>Qualidade dos leads recebidos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Alta</span>
                <Badge variant="destructive">{stats?.by_temperature.alta || 0}</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${stats?.total_leads ? (stats.by_temperature.alta / stats.total_leads) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Média</span>
                <Badge variant="secondary">{stats?.by_temperature.media || 0}</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${stats?.total_leads ? (stats.by_temperature.media / stats.total_leads) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Baixa</span>
                <Badge variant="outline">{stats?.by_temperature.baixa || 0}</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${stats?.total_leads ? (stats.by_temperature.baixa / stats.total_leads) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Leads Recebidos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leads Recebidos</CardTitle>
              <CardDescription>Últimos leads recebidos via webhook</CardDescription>
            </div>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value as any })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="processed">Processados</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="error">Com erro</SelectItem>
                <SelectItem value="duplicate">Duplicados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingLeads ? (
            <div className="text-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Carregando leads...</p>
            </div>
          ) : leadsData?.leads && leadsData.leads.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Temperatura</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Lead CRM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadsData.leads.map((lead: any) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.phone_number || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            lead.temperature === 'Alta'
                              ? 'destructive'
                              : lead.temperature === 'Média'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {lead.temperature || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lead.transaction_type === 'SELL' ? 'Venda' : 'Locação'}
                      </TableCell>
                      <TableCell>
                        {lead.status === 'processed' && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Processado
                          </Badge>
                        )}
                        {lead.status === 'pending' && (
                          <Badge variant="secondary">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                        {lead.status === 'error' && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Erro
                          </Badge>
                        )}
                        {lead.status === 'duplicate' && (
                          <Badge variant="outline">Duplicado</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.lead_id ? (
                          <Button variant="link" size="sm" asChild>
                            <a href={`/admin/leads?id=${lead.lead_id}`}>
                              Ver lead
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Total: {leadsData.pagination.total} leads
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page === 1}
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page >= leadsData.pagination.totalPages}
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhum lead recebido ainda.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Configuração */}
      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Configurações da Integração</DialogTitle>
            <DialogDescription>
              Configure a integração com o Grupo OLX/ZAP
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Status da Integração */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active">Integração Ativa</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar/desativar recebimento de webhooks
                </p>
              </div>
              <Switch
                id="active"
                checked={integration?.is_active}
                onCheckedChange={handleToggleActive}
                disabled={isUpdating}
              />
            </div>

            {/* URL do Webhook */}
            <div className="space-y-2">
              <Label>URL do Webhook</Label>
              <div className="flex gap-2">
                <Input
                  value={integration?.webhook_url || ''}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyWebhookUrl}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use esta URL ao configurar a integração no Canal Pro
              </p>
            </div>

            {/* API Key do Cliente (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key do Cliente (Opcional)</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Cole a API key do Canal Pro aqui..."
                value={clientApiKey}
                onChange={(e) => setClientApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Caso seja necessário para validação adicional
              </p>
            </div>

            {/* Estatísticas */}
            <div className="border rounded-lg p-4 space-y-2">
              <h4 className="font-medium">Estatísticas</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total de leads:</span>
                  <span className="ml-2 font-medium">{integration?.total_leads_received || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Último lead:</span>
                  <span className="ml-2 font-medium">
                    {integration?.last_lead_received_at
                      ? format(new Date(integration.last_lead_received_at), 'dd/MM/yyyy HH:mm', {
                          locale: ptBR,
                        })
                      : 'Nunca'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveApiKey} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Setup Wizard */}
      {integration?.webhook_url && (
        <SetupWizard
          integration="olx-zap"
          webhookUrl={integration.webhook_url}
          onComplete={handleWizardComplete}
          autoShow={showSetupWizard}
        />
      )}
    </div>
  );
}
