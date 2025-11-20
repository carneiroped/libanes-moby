'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2, Webhook } from 'lucide-react';

export default function ConfigureWebhookPage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  const checkWebhook = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/configure-seehaus-webhook');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({ error: 'Erro ao verificar webhook' });
    } finally {
      setChecking(false);
    }
  };

  const configureWebhook = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/configure-seehaus-webhook', {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);

      // Verificar novamente após configurar
      if (data.success) {
        setTimeout(checkWebhook, 1000);
      }
    } catch (error) {
      setResult({ error: 'Erro ao configurar webhook' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurar Webhook - Seehaus</h1>
        <p className="text-muted-foreground mt-2">
          Configure o webhook para receber mensagens do WhatsApp
        </p>
      </div>

      <div className="grid gap-6">
        {/* Verificar Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Status do Webhook
            </CardTitle>
            <CardDescription>
              Verifique se o webhook está configurado corretamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={checkWebhook} disabled={checking}>
              {checking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verificar Webhook
            </Button>

            {status && (
              <div className="mt-4">
                {status.error ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{status.error}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    <Alert className={status.isConfigured ? 'border-green-500' : 'border-yellow-500'}>
                      {status.isConfigured ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>
                        <strong>Status:</strong> {status.isConfigured ? 'Configurado' : 'Não configurado'}
                      </AlertDescription>
                    </Alert>
                    <div className="text-sm space-y-1">
                      <p><strong>Instância:</strong> {status.instance}</p>
                      <p><strong>URL Esperada:</strong> {status.expectedUrl}</p>
                      <p><strong>URL Atual:</strong> {status.currentWebhook?.url || 'Nenhuma'}</p>
                      <p><strong>Webhook Ativo:</strong> {status.currentWebhook?.enabled ? 'Sim' : 'Não'}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configurar Webhook */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar Webhook</CardTitle>
            <CardDescription>
              Configure o webhook para receber mensagens em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={configureWebhook} 
              disabled={loading}
              className="w-full"
              variant={status?.isConfigured ? 'secondary' : 'default'}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {status?.isConfigured ? 'Reconfigurar Webhook' : 'Configurar Webhook'}
            </Button>

            {result && (
              <Alert className={result.success ? 'border-green-500' : 'border-red-500'} style={{ marginTop: '1rem' }}>
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {result.success ? result.message : result.error}
                  {result.details && (
                    <pre className="mt-2 text-xs overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Informações */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">O que é o Webhook?</h3>
              <p className="text-sm text-muted-foreground">
                O webhook é o endereço que a Evolution API usa para enviar as mensagens recebidas 
                para o Moby CRM. Sem ele configurado, as mensagens não aparecem no sistema.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">URL do Webhook</h3>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                https://seehaus.moby.casa/api/webhooks/evolution
              </code>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Após Configurar</h3>
              <p className="text-sm text-muted-foreground">
                1. Envie uma mensagem para <strong>+55 16 99769-2355</strong><br/>
                2. Acesse <Link href="/admin/chats" className="text-primary underline">Chats</Link> para ver a mensagem<br/>
                3. Verifique se foi criado um novo lead em <Link href="/admin/leads" className="text-primary underline">Leads</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}