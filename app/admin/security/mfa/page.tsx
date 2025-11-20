'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecureMFAModal } from '@/components/security/SecureMFAModal';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  QrCode,
  Key,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

interface MFAStats {
  isActive: boolean;
  lastUsed: string | null;
  setupDate: string | null;
  backupCodesCount: number;
}

interface MFASetupData {
  qrCode: string;
  backupCodes: string[];
}

export default function MFAPage() {
  const [mfaStats, setMfaStats] = useState<MFAStats | null>(null);
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [step, setStep] = useState<'initial' | 'scan' | 'verify' | 'complete'>('initial');
  
  // Secure Modal states
  const [showMFAModal, setShowMFAModal] = useState(false);
  const [modalMode, setModalMode] = useState<'setup' | 'verify' | 'disable' | 'regenerate'>('setup');
  
  // Form states
  const [verifyToken, setVerifyToken] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableToken, setDisableToken] = useState('');

  useEffect(() => {
    loadMFAStats();
  }, []);

  const loadMFAStats = async () => {
    try {
      const response = await fetch('/api/auth/mfa/setup');
      if (response.ok) {
        const result = await response.json();
        setMfaStats(result.data);
      }
    } catch (error) {
      console.error('Error loading MFA stats:', error);
      toast.error('Erro ao carregar status do MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const startMFASetup = async () => {
    setModalMode('setup');
    setShowMFAModal(true);
  };

  const confirmMFASetup = async () => {
    if (!verifyToken) {
      toast.error('Digite o código do seu aplicativo');
      return;
    }

    setIsSettingUp(true);
    try {
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyToken })
      });

      if (response.ok) {
        setStep('complete');
        toast.success('MFA ativado com sucesso!');
        await loadMFAStats();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Código inválido');
      }
    } catch (error) {
      console.error('Error confirming MFA:', error);
      toast.error('Erro ao confirmar configuração');
    } finally {
      setIsSettingUp(false);
    }
  };

  const disableMFA = async () => {
    setModalMode('disable');
    setShowMFAModal(true);
  };

  const loadBackupCodes = async () => {
    try {
      const response = await fetch('/api/auth/mfa/backup-codes');
      if (response.ok) {
        const result = await response.json();
        setBackupCodes(result.data.backupCodes);
      } else {
        toast.error('Erro ao carregar códigos de backup');
      }
    } catch (error) {
      console.error('Error loading backup codes:', error);
      toast.error('Erro ao carregar códigos de backup');
    }
  };

  const regenerateBackupCodes = async () => {
    setModalMode('regenerate');
    setShowMFAModal(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copiado para a área de transferência');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Erro ao copiar');
    }
  };

  const downloadBackupCodes = () => {
    const content = `Códigos de Backup MFA - Moby CRM
    
Gerados em: ${new Date().toLocaleString('pt-BR')}

IMPORTANTE: 
- Guarde estes códigos em local seguro
- Cada código pode ser usado apenas uma vez
- Use apenas em caso de emergência

Códigos:
${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

ATENÇÃO: Não compartilhe estes códigos com ninguém!`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moby-mfa-backup-codes-${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Autenticação Multifator (MFA)
        </h1>
        <p className="text-muted-foreground">
          Adicione uma camada extra de segurança à sua conta
        </p>
      </div>

      {/* Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mfaStats?.isActive ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-orange-600" />
            )}
            Status do MFA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={mfaStats?.isActive ? "default" : "secondary"}>
              {mfaStats?.isActive ? "Ativo" : "Inativo"}
            </Badge>
            {mfaStats?.lastUsed && (
              <span className="text-sm text-muted-foreground">
                Último uso: {new Date(mfaStats.lastUsed).toLocaleString('pt-BR')}
              </span>
            )}
            {mfaStats?.setupDate && (
              <span className="text-sm text-muted-foreground">
                Configurado em: {new Date(mfaStats.setupDate).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={mfaStats?.isActive ? "manage" : "setup"} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Configurar MFA</TabsTrigger>
          <TabsTrigger value="manage" disabled={!mfaStats?.isActive}>
            Gerenciar MFA
          </TabsTrigger>
          <TabsTrigger value="backup" disabled={!mfaStats?.isActive}>
            Códigos de Backup
          </TabsTrigger>
        </TabsList>

        {/* Setup Tab */}
        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Autenticação Multifator</CardTitle>
              <CardDescription>
                Configure o MFA usando um aplicativo como Google Authenticator ou Authy
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!mfaStats?.isActive ? (
                <>
                  {step === 'initial' && (
                    <div className="space-y-4">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Você precisará de um aplicativo autenticador instalado no seu celular
                          (Google Authenticator, Authy, Microsoft Authenticator, etc.)
                        </AlertDescription>
                      </Alert>
                      <Button 
                        onClick={startMFASetup}
                        disabled={isSettingUp}
                        className="w-full"
                      >
                        {isSettingUp ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <QrCode className="mr-2 h-4 w-4" />
                        )}
                        Iniciar Configuração
                      </Button>
                    </div>
                  )}

                  {step === 'scan' && setupData && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">
                          1. Escaneie o QR Code
                        </h3>
                        <div className="flex justify-center mb-4">
                          <Image 
                            src={setupData.qrCode} 
                            alt="QR Code para MFA"
                            width={200}
                            height={200}
                            className="border rounded-lg"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Escaneie este QR code com seu aplicativo autenticador
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          2. Digite o código gerado
                        </h3>
                        <div className="space-y-2">
                          <Label htmlFor="verify-token">
                            Código do aplicativo (6 dígitos)
                          </Label>
                          <Input
                            id="verify-token"
                            type="text"
                            maxLength={6}
                            value={verifyToken}
                            onChange={(e) => setVerifyToken(e.target.value.replace(/\D/g, ''))}
                            placeholder="123456"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setStep('initial')}
                          className="flex-1"
                        >
                          Voltar
                        </Button>
                        <Button 
                          onClick={confirmMFASetup}
                          disabled={isSettingUp || verifyToken.length !== 6}
                          className="flex-1"
                        >
                          {isSettingUp ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          )}
                          Confirmar
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === 'complete' && (
                    <div className="text-center space-y-4">
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                      <h3 className="text-lg font-semibold">MFA Configurado!</h3>
                      <p className="text-muted-foreground">
                        Sua conta agora está protegida com autenticação multifator
                      </p>
                      
                      {setupData?.backupCodes && (
                        <div className="mt-6">
                          <Alert>
                            <Key className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Importante:</strong> Guarde seus códigos de backup em local seguro.
                              Você pode acessá-los na aba &quot;Códigos de Backup&quot;.
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    MFA já está ativo para sua conta. Use a aba &quot;Gerenciar MFA&quot; para fazer alterações.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Tab */}
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Desabilitar MFA</CardTitle>
              <CardDescription>
                Remover a proteção multifator da sua conta (não recomendado)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> Desabilitar o MFA reduzirá significativamente 
                  a segurança da sua conta. Esta ação será registrada nos logs de auditoria.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="disable-password">Senha atual</Label>
                  <Input
                    id="disable-password"
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                  />
                </div>

                <div>
                  <Label htmlFor="disable-token">Código atual do MFA</Label>
                  <Input
                    id="disable-token"
                    type="text"
                    maxLength={6}
                    value={disableToken}
                    onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                  />
                </div>

                <Button 
                  variant="destructive"
                  onClick={disableMFA}
                  disabled={isDisabling}
                  className="w-full"
                >
                  {isDisabling ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldAlert className="mr-2 h-4 w-4" />
                  )}
                  Desabilitar MFA
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Codes Tab */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Códigos de Backup</CardTitle>
              <CardDescription>
                Use estes códigos para acessar sua conta se perder o acesso ao seu dispositivo MFA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={loadBackupCodes} variant="outline">
                    Visualizar Códigos
                  </Button>
                  <Button onClick={regenerateBackupCodes} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerar Códigos
                  </Button>
                </div>

                {backupCodes.length > 0 && (
                  <>
                    <Alert>
                      <Key className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Importante:</strong> Cada código pode ser usado apenas uma vez. 
                        Guarde-os em local seguro e não compartilhe com ninguém.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                      {backupCodes.map((code, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-2 bg-white rounded border"
                        >
                          <span className="font-mono">{code}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={downloadBackupCodes} variant="outline" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Códigos
                      </Button>
                      <Button 
                        onClick={() => copyToClipboard(backupCodes.join('\n'))}
                        variant="outline" 
                        className="flex-1"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar Todos
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Códigos restantes: {backupCodes.length} de 8
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Secure MFA Modal */}
      <SecureMFAModal
        isOpen={showMFAModal}
        onClose={() => setShowMFAModal(false)}
        mode={modalMode}
        onSuccess={async () => {
          await loadMFAStats();
          if (modalMode === 'regenerate') {
            await loadBackupCodes();
          }
          toast.success(
            modalMode === 'setup' ? 'MFA configurado com sucesso!' :
            modalMode === 'disable' ? 'MFA desabilitado com sucesso!' :
            modalMode === 'regenerate' ? 'Códigos regenerados com sucesso!' :
            'Operação concluída com sucesso!'
          );
        }}
      />
    </div>
  );
}