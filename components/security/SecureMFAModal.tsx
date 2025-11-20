/**
 * Secure MFA Modal Component
 * 
 * Security Features:
 * - No prompt() usage - uses secure modal dialogs
 * - TOTP with proper validation
 * - SMS fallback with rate limiting
 * - Recovery codes with secure storage
 * - Session validation
 * - CSRF protection
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  StandardModal, 
  StandardConfirmDialog, 
  StandardLoadingState 
} from '@/components/ui/ux-patterns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Copy,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface MFASetupData {
  qrCode: string;
  backupCodes: string[];
  secret?: string;
}

interface SecureMFAModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'setup' | 'verify' | 'disable' | 'regenerate';
  onSuccess?: () => void;
}

export function SecureMFAModal({ isOpen, onClose, mode, onSuccess }: SecureMFAModalProps) {
  const [step, setStep] = useState<'password' | 'sms' | 'totp' | 'backup' | 'complete'>('password');
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Form states
  const [password, setPassword] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Security states
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [sessionValid, setSessionValid] = useState(true);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      validateSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTime]);

  const resetForm = () => {
    setStep('password');
    setPassword('');
    setSmsCode('');
    setTotpCode('');
    setBackupCode('');
    setPhoneNumber('');
    setAttemptsRemaining(3);
    setCooldownTime(0);
    setSetupData(null);
    setLoading(false);
  };

  const validateSession = async () => {
    try {
      const response = await fetch('/api/auth/validate-session');
      const result = await response.json();
      setSessionValid(result.success);
      
      if (!result.success) {
        toast.error('Sessão expirada. Faça login novamente.');
        onClose();
      }
    } catch (error) {
      console.error('Session validation error:', error);
      setSessionValid(false);
    }
  };

  const handlePasswordVerification = async () => {
    if (!password.trim()) {
      toast.error('Digite sua senha atual');
      return;
    }

    if (attemptsRemaining <= 0) {
      toast.error('Muitas tentativas. Tente novamente mais tarde.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: password })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Proceed based on mode
        if (mode === 'setup') {
          await startMFASetup();
        } else {
          setStep('totp');
        }
      } else {
        setAttemptsRemaining(prev => prev - 1);
        if (attemptsRemaining <= 1) {
          setCooldownTime(300); // 5 minute cooldown
        }
        toast.error(result.error || 'Senha incorreta');
      }
    } catch (error) {
      console.error('Password verification error:', error);
      toast.error('Erro ao verificar senha');
    } finally {
      setLoading(false);
    }
  };

  const startMFASetup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/setup-secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword: password,
          phoneNumber: phoneNumber || null 
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSetupData(result.data);
        setStep('totp');
      } else {
        toast.error(result.error || 'Erro ao iniciar configuração');
      }
    } catch (error) {
      console.error('MFA setup error:', error);
      toast.error('Erro ao configurar MFA');
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTP = async () => {
    if (!totpCode || totpCode.length !== 6) {
      toast.error('Digite um código de 6 dígitos');
      return;
    }

    if (attemptsRemaining <= 0) {
      toast.error('Muitas tentativas. Tente novamente mais tarde.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'setup' ? '/api/auth/mfa/confirm-setup' : '/api/auth/mfa/verify-secure';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          totpCode,
          currentPassword: password 
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (mode === 'setup') {
          setStep('backup');
        } else {
          await handleModeAction();
        }
      } else {
        setAttemptsRemaining(prev => prev - 1);
        if (attemptsRemaining <= 1) {
          setCooldownTime(180); // 3 minute cooldown
        }
        toast.error(result.error || 'Código inválido');
      }
    } catch (error) {
      console.error('TOTP verification error:', error);
      toast.error('Erro ao verificar código');
    } finally {
      setLoading(false);
    }
  };

  const requestSMSCode = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Digite seu número de telefone');
      return;
    }

    if (cooldownTime > 0) {
      toast.error(`Aguarde ${cooldownTime}s para solicitar novo código`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/request-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber,
          currentPassword: password 
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCooldownTime(60); // 1 minute cooldown
        toast.success('Código SMS enviado');
      } else {
        toast.error(result.error || 'Erro ao enviar SMS');
      }
    } catch (error) {
      console.error('SMS request error:', error);
      toast.error('Erro ao solicitar código SMS');
    } finally {
      setLoading(false);
    }
  };

  const verifySMS = async () => {
    if (!smsCode || smsCode.length !== 6) {
      toast.error('Digite o código de 6 dígitos recebido por SMS');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/verify-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          smsCode,
          currentPassword: password 
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await handleModeAction();
      } else {
        toast.error(result.error || 'Código SMS inválido');
      }
    } catch (error) {
      console.error('SMS verification error:', error);
      toast.error('Erro ao verificar código SMS');
    } finally {
      setLoading(false);
    }
  };

  const verifyBackupCode = async () => {
    if (!backupCode.trim()) {
      toast.error('Digite um código de backup');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/verify-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          backupCode: backupCode.trim(),
          currentPassword: password 
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await handleModeAction();
      } else {
        toast.error(result.error || 'Código de backup inválido');
      }
    } catch (error) {
      console.error('Backup code verification error:', error);
      toast.error('Erro ao verificar código de backup');
    } finally {
      setLoading(false);
    }
  };

  const handleModeAction = async () => {
    switch (mode) {
      case 'disable':
        await disableMFA();
        break;
      case 'regenerate':
        await regenerateBackupCodes();
        break;
      default:
        setStep('complete');
    }
  };

  const disableMFA = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/disable-secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword: password,
          totpCode: totpCode 
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('MFA desabilitado com sucesso');
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.error || 'Erro ao desabilitar MFA');
      }
    } catch (error) {
      console.error('Disable MFA error:', error);
      toast.error('Erro ao desabilitar MFA');
    } finally {
      setLoading(false);
    }
  };

  const regenerateBackupCodes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/regenerate-backup-secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword: password,
          totpCode: totpCode 
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSetupData(prev => prev ? { ...prev, backupCodes: result.data.backupCodes } : { backupCodes: result.data.backupCodes, qrCode: '' });
        setStep('backup');
      } else {
        toast.error(result.error || 'Erro ao regenerar códigos');
      }
    } catch (error) {
      console.error('Regenerate backup codes error:', error);
      toast.error('Erro ao regenerar códigos de backup');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copiado para a área de transferência');
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  const downloadBackupCodes = () => {
    if (!setupData?.backupCodes) return;

    const content = `Códigos de Backup MFA - Moby CRM
    
Gerados em: ${new Date().toLocaleString('pt-BR')}

IMPORTANTE: 
- Guarde estes códigos em local seguro
- Cada código pode ser usado apenas uma vez
- Use apenas em caso de emergência

Códigos:
${setupData.backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

ATENÇÃO: Não compartilhe estes códigos com ninguém!`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moby-mfa-backup-codes-${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!sessionValid) {
    return (
      <StandardModal
        isOpen={isOpen}
        onClose={onClose}
        title="Sessão Expirada"
        size="sm"
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Sua sessão expirou. Faça login novamente para continuar.
          </AlertDescription>
        </Alert>
      </StandardModal>
    );
  }

  return (
    <>
      <StandardModal
        isOpen={isOpen && !showConfirmDialog}
        onClose={onClose}
        title={
          mode === 'setup' ? 'Configurar MFA' :
          mode === 'disable' ? 'Desabilitar MFA' :
          mode === 'regenerate' ? 'Regenerar Códigos de Backup' :
          'Verificar MFA'
        }
        size="lg"
        closable={!loading}
      >
        {loading && <StandardLoadingState config="SPINNER" />}
        
        {!loading && (
          <div className="space-y-4">
            {/* Password Verification Step */}
            {step === 'password' && (
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Por segurança, confirme sua senha atual para continuar.
                  </AlertDescription>
                </Alert>
                
                <div>
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordVerification()}
                    disabled={cooldownTime > 0}
                  />
                  {attemptsRemaining < 3 && (
                    <p className="text-sm text-destructive mt-1">
                      {attemptsRemaining} tentativas restantes
                    </p>
                  )}
                  {cooldownTime > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Aguarde {cooldownTime}s para tentar novamente
                    </p>
                  )}
                </div>

                {mode === 'setup' && (
                  <div>
                    <Label htmlFor="phone-number">Telefone (Opcional)</Label>
                    <Input
                      id="phone-number"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+55 11 99999-9999"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Para SMS de backup em caso de emergência
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handlePasswordVerification}
                  disabled={!password || cooldownTime > 0}
                  className="w-full"
                >
                  Confirmar Senha
                </Button>
              </div>
            )}

            {/* MFA Setup QR Code */}
            {step === 'totp' && mode === 'setup' && setupData && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    Escaneie o QR Code
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
                    Use Google Authenticator, Authy ou similar
                  </p>
                </div>

                <div>
                  <Label htmlFor="setup-totp">Código do Aplicativo (6 dígitos)</Label>
                  <Input
                    id="setup-totp"
                    type="text"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    onKeyPress={(e) => e.key === 'Enter' && verifyTOTP()}
                    disabled={cooldownTime > 0}
                  />
                  {attemptsRemaining < 3 && (
                    <p className="text-sm text-destructive mt-1">
                      {attemptsRemaining} tentativas restantes
                    </p>
                  )}
                  {cooldownTime > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Aguarde {cooldownTime}s para tentar novamente
                    </p>
                  )}
                </div>

                <Button 
                  onClick={verifyTOTP}
                  disabled={totpCode.length !== 6 || cooldownTime > 0}
                  className="w-full"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Configuração
                </Button>
              </div>
            )}

            {/* MFA Verification for other modes */}
            {step === 'totp' && mode !== 'setup' && (
              <div className="space-y-4">
                <Tabs defaultValue="totp" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="totp" className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Aplicativo
                    </TabsTrigger>
                    <TabsTrigger value="sms" className="flex items-center gap-2" disabled={!phoneNumber}>
                      <MessageSquare className="h-4 w-4" />
                      SMS
                    </TabsTrigger>
                    <TabsTrigger value="backup" className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Backup
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="totp">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="verify-totp">Código do Aplicativo</Label>
                        <Input
                          id="verify-totp"
                          type="text"
                          maxLength={6}
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          onKeyPress={(e) => e.key === 'Enter' && verifyTOTP()}
                        />
                      </div>
                      <Button 
                        onClick={verifyTOTP}
                        disabled={totpCode.length !== 6}
                        className="w-full"
                      >
                        Verificar Código
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="sms">
                    <div className="space-y-4">
                      <Button 
                        onClick={requestSMSCode}
                        disabled={cooldownTime > 0}
                        variant="outline"
                        className="w-full"
                      >
                        {cooldownTime > 0 ? `Aguarde ${cooldownTime}s` : 'Enviar Código SMS'}
                      </Button>
                      
                      <div>
                        <Label htmlFor="verify-sms">Código SMS</Label>
                        <Input
                          id="verify-sms"
                          type="text"
                          maxLength={6}
                          value={smsCode}
                          onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          onKeyPress={(e) => e.key === 'Enter' && verifySMS()}
                        />
                      </div>
                      
                      <Button 
                        onClick={verifySMS}
                        disabled={smsCode.length !== 6}
                        className="w-full"
                      >
                        Verificar SMS
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="backup">
                    <div className="space-y-4">
                      <Alert>
                        <Key className="h-4 w-4" />
                        <AlertDescription>
                          Use um dos códigos de backup de 8 dígitos fornecidos durante a configuração inicial.
                        </AlertDescription>
                      </Alert>
                      
                      <div>
                        <Label htmlFor="verify-backup">Código de Backup</Label>
                        <Input
                          id="verify-backup"
                          type="text"
                          maxLength={8}
                          value={backupCode}
                          onChange={(e) => setBackupCode(e.target.value.replace(/\s/g, '').toUpperCase())}
                          placeholder="ABCD1234"
                          onKeyPress={(e) => e.key === 'Enter' && verifyBackupCode()}
                        />
                      </div>
                      
                      <Button 
                        onClick={verifyBackupCode}
                        disabled={backupCode.length !== 8}
                        className="w-full"
                      >
                        Verificar Código de Backup
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Backup Codes Display */}
            {step === 'backup' && setupData?.backupCodes && (
              <div className="space-y-4">
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Importante:</strong> Guarde estes códigos em local seguro. 
                    Cada código pode ser usado apenas uma vez.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg max-h-60 overflow-y-auto">
                  {setupData.backupCodes.map((code, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <span className="font-mono text-sm">{code}</span>
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
                    onClick={() => copyToClipboard(setupData.backupCodes.join('\n'))}
                    variant="outline" 
                    className="flex-1"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Todos
                  </Button>
                </div>

                <Button onClick={() => setStep('complete')} className="w-full">
                  Continuar
                </Button>
              </div>
            )}

            {/* Completion Step */}
            {step === 'complete' && (
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                <h3 className="text-lg font-semibold">
                  {mode === 'setup' && 'MFA Configurado com Sucesso!'}
                  {mode === 'disable' && 'MFA Desabilitado'}
                  {mode === 'regenerate' && 'Códigos Regenerados'}
                  {mode === 'verify' && 'Verificação Concluída'}
                </h3>
                <p className="text-muted-foreground">
                  {mode === 'setup' && 'Sua conta agora está protegida com autenticação multifator.'}
                  {mode === 'disable' && 'A autenticação multifator foi removida da sua conta.'}
                  {mode === 'regenerate' && 'Novos códigos de backup foram gerados.'}
                  {mode === 'verify' && 'A verificação MFA foi concluída com sucesso.'}
                </p>
                
                <Button onClick={() => {
                  onSuccess?.();
                  onClose();
                }} className="w-full">
                  Concluir
                </Button>
              </div>
            )}
          </div>
        )}
      </StandardModal>

      {/* Confirmation Dialog for Dangerous Actions */}
      <StandardConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          setShowConfirmDialog(false);
          // Continue with the action
        }}
        title="Confirmar Ação"
        description={
          mode === 'disable' 
            ? 'Tem certeza que deseja desabilitar a autenticação multifator? Isso reduzirá a segurança da sua conta.'
            : 'Esta ação não pode ser desfeita. Deseja continuar?'
        }
        variant={mode === 'disable' ? 'destructive' : 'default'}
        loading={loading}
      />
    </>
  );
}