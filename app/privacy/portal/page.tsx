'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

interface PrivacyRequest {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: string;
  processedAt?: string;
  expiresAt?: string;
  downloadUrl?: string;
  justification?: string;
}

export default function PrivacyPortalPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [document, setDocument] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState<PrivacyRequest[]>([]);
  const [consents, setConsents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('export');

  const handleExportRequest = async () => {
    if (!email || !fullName) {
      toast.error('Email e nome completo são obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/privacy/export-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName, document })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        setEmail('');
        setFullName('');
        setDocument('');
        loadRequests();
      } else {
        toast.error(result.error || 'Erro ao solicitar exportação');
      }
    } catch (error) {
      console.error('Error requesting export:', error);
      toast.error('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletionRequest = async () => {
    if (!email || !fullName || !reason) {
      toast.error('Todos os campos são obrigatórios para solicitação de exclusão');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/privacy/request-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName, document, reason })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        setEmail('');
        setFullName('');
        setDocument('');
        setReason('');
        loadRequests();
      } else {
        toast.error(result.error || 'Erro ao solicitar exclusão');
      }
    } catch (error) {
      console.error('Error requesting deletion:', error);
      toast.error('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRequests = async () => {
    if (!email) return;

    try {
      const response = await fetch(`/api/privacy/export-data?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const result = await response.json();
        setRequests(result.data || []);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const loadConsents = async () => {
    if (!email) return;

    try {
      const response = await fetch(`/api/privacy/consent?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const result = await response.json();
        setConsents(result.data?.consents || []);
      }
    } catch (error) {
      console.error('Error loading consents:', error);
    }
  };

  const handleConsentUpdate = async (consentType: string, granted: boolean) => {
    try {
      const response = await fetch('/api/privacy/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          consents: { [consentType]: granted } 
        })
      });

      if (response.ok) {
        toast.success('Consentimento atualizado');
        loadConsents();
      } else {
        toast.error('Erro ao atualizar consentimento');
      }
    } catch (error) {
      console.error('Error updating consent:', error);
      toast.error('Erro de conexão');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processing':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Aguardando processamento';
      case 'processing':
        return 'Em processamento';
      case 'completed':
        return 'Concluída';
      case 'rejected':
        return 'Rejeitada';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Portal de Privacidade
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Gerencie seus dados pessoais e exerça seus direitos conforme a LGPD. 
            Você pode solicitar a exportação, correção ou exclusão dos seus dados.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="export">
              <Download className="w-4 h-4 mr-2" />
              Exportar Dados
            </TabsTrigger>
            <TabsTrigger value="delete">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Dados
            </TabsTrigger>
            <TabsTrigger value="consents">
              <Edit className="w-4 h-4 mr-2" />
              Consentimentos
            </TabsTrigger>
            <TabsTrigger value="status">
              <FileText className="w-4 h-4 mr-2" />
              Status
            </TabsTrigger>
          </TabsList>

          {/* Exportar Dados */}
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Solicitar Exportação de Dados
                </CardTitle>
                <CardDescription>
                  Solicite uma cópia de todos os seus dados pessoais que temos armazenados.
                  Você receberá um arquivo JSON com todas as informações em até 48 horas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="export-email">Email *</Label>
                    <Input
                      id="export-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="export-name">Nome Completo *</Label>
                    <Input
                      id="export-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="export-document">CPF/CNPJ (opcional)</Label>
                  <Input
                    id="export-document"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Importante:</strong> Você receberá um email com o link para download 
                    quando os dados estiverem prontos. O link expira em 30 dias.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleExportRequest} 
                  disabled={isLoading || !email || !fullName}
                  className="w-full"
                >
                  {isLoading ? 'Processando...' : 'Solicitar Exportação'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Excluir Dados */}
          <TabsContent value="delete">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Solicitar Exclusão de Dados
                </CardTitle>
                <CardDescription>
                  Solicite a exclusão permanente dos seus dados pessoais. 
                  Esta ação é irreversível e pode levar até 72 horas para ser processada.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="delete-email">Email *</Label>
                    <Input
                      id="delete-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="delete-name">Nome Completo *</Label>
                    <Input
                      id="delete-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="delete-document">CPF/CNPJ (opcional)</Label>
                  <Input
                    id="delete-document"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <Label htmlFor="delete-reason">Motivo da Exclusão *</Label>
                  <Textarea
                    id="delete-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Descreva o motivo para a exclusão dos seus dados..."
                    rows={3}
                  />
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Atenção:</strong> A exclusão de dados é permanente e irreversível. 
                    Alguns dados podem ser mantidos por obrigações legais ou contratuais.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleDeletionRequest} 
                  disabled={isLoading || !email || !fullName || !reason}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading ? 'Processando...' : 'Solicitar Exclusão'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consentimentos */}
          <TabsContent value="consents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Gerenciar Consentimentos
                </CardTitle>
                <CardDescription>
                  Gerencie suas preferências de consentimento para o uso dos seus dados.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="consent-email">Email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="consent-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                    />
                    <Button onClick={loadConsents} disabled={!email}>
                      <Eye className="w-4 h-4 mr-2" />
                      Buscar
                    </Button>
                  </div>
                </div>

                {consents.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Seus Consentimentos:</h3>
                    {consents.map((consent) => (
                      <div key={consent.type} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{consent.type}</div>
                          <div className="text-sm text-slate-600">{consent.purpose}</div>
                          <div className="text-xs text-slate-500">
                            Base legal: {consent.legalBasis} | 
                            Retenção: {consent.retentionPeriod}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${consent.granted ? 'text-green-600' : 'text-red-600'}`}>
                            {consent.granted ? 'Concedido' : 'Não concedido'}
                          </span>
                          {consent.legalBasis === 'consent' && (
                            <Button
                              size="sm"
                              variant={consent.granted ? "destructive" : "default"}
                              onClick={() => handleConsentUpdate(consent.type, !consent.granted)}
                            >
                              {consent.granted ? 'Revogar' : 'Conceder'}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Status das Solicitações */}
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Status das Solicitações
                </CardTitle>
                <CardDescription>
                  Acompanhe o andamento das suas solicitações de privacidade.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status-email">Email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="status-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                    />
                    <Button onClick={loadRequests} disabled={!email}>
                      <Eye className="w-4 h-4 mr-2" />
                      Buscar
                    </Button>
                  </div>
                </div>

                {requests.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Suas Solicitações:</h3>
                    {requests.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <span className="font-medium">
                              Solicitação #{request.id.slice(-8)}
                            </span>
                          </div>
                          <span className="text-sm text-slate-600">
                            {getStatusText(request.status)}
                          </span>
                        </div>
                        
                        <div className="text-sm text-slate-600 space-y-1">
                          <div>Criada em: {new Date(request.createdAt).toLocaleString('pt-BR')}</div>
                          {request.processedAt && (
                            <div>Processada em: {new Date(request.processedAt).toLocaleString('pt-BR')}</div>
                          )}
                          {request.expiresAt && (
                            <div>Expira em: {new Date(request.expiresAt).toLocaleString('pt-BR')}</div>
                          )}
                        </div>

                        {request.status === 'completed' && request.downloadUrl && (
                          <div className="mt-3">
                            <Button size="sm" asChild>
                              <a href={request.downloadUrl} download>
                                <Download className="w-4 h-4 mr-2" />
                                Baixar Dados
                              </a>
                            </Button>
                          </div>
                        )}

                        {request.status === 'rejected' && request.justification && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-800">
                              <strong>Motivo da rejeição:</strong> {request.justification}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {email && requests.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma solicitação encontrada para este email.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            Este portal está em conformidade com a Lei Geral de Proteção de Dados (LGPD).
            Para dúvidas, entre em contato conosco.
          </p>
        </div>
      </div>
    </div>
  );
}