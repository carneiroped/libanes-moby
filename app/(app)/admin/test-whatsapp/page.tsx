'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2, Phone, MessageSquare, Wifi } from 'lucide-react';

export default function TestWhatsAppPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('Olá! Esta é uma mensagem de teste do Moby CRM para o Seehaus. 🏠');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/test-whatsapp');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({ error: 'Erro ao verificar status' });
    } finally {
      setChecking(false);
    }
  };

  const sendTestMessage = async () => {
    if (!phoneNumber || !message) {
      setResult({ error: 'Por favor, preencha todos os campos' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          message,
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setPhoneNumber('');
        setMessage('Olá! Esta é uma mensagem de teste do Moby CRM para o Seehaus. 🏠');
      }
    } catch (error) {
      setResult({ error: 'Erro ao enviar mensagem' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Teste de WhatsApp - Seehaus</h1>
        <p className="text-muted-foreground mt-2">
          Teste a integração do WhatsApp do Seehaus Home Resort
        </p>
      </div>

      <div className="grid gap-6">
        {/* Status da Conexão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Status da Conexão
            </CardTitle>
            <CardDescription>
              Verifique se o WhatsApp está conectado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={checkStatus} disabled={checking}>
              {checking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verificar Status
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
                    <Alert className={status.isConnected ? 'border-green-500' : 'border-red-500'}>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Status:</strong> {status.isConnected ? 'Conectado' : 'Desconectado'}
                      </AlertDescription>
                    </Alert>
                    <div className="text-sm space-y-1">
                      <p><strong>Instância:</strong> {status.integration?.instanceName}</p>
                      <p><strong>Número:</strong> {status.integration?.phoneNumber}</p>
                      <p><strong>WhatsApp ID:</strong> {status.integration?.whatsappId}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enviar Mensagem de Teste */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Enviar Mensagem de Teste
            </CardTitle>
            <CardDescription>
              Envie uma mensagem para testar a integração
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="inline h-4 w-4 mr-1" />
                Número do WhatsApp (com DDD)
              </Label>
              <Input
                id="phone"
                placeholder="47999998888"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Digite apenas números, sem espaços ou caracteres especiais
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Digite sua mensagem de teste..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={sendTestMessage} disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Mensagem de Teste
            </Button>

            {result && (
              <Alert className={result.success ? 'border-green-500' : 'border-red-500'}>
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

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Como Testar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Verificar Status</h3>
              <p className="text-sm text-muted-foreground">
                Clique em &quot;Verificar Status&quot; para confirmar que o WhatsApp está conectado.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">2. Enviar Mensagem</h3>
              <p className="text-sm text-muted-foreground">
                Digite um número de WhatsApp válido e uma mensagem de teste. 
                A mensagem será enviada através da Evolution API.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Receber Mensagens</h3>
              <p className="text-sm text-muted-foreground">
                Envie uma mensagem para <strong>+55 47 92839914</strong> (WhatsApp do Seehaus).
                A mensagem deve aparecer automaticamente na seção de Chats do CRM.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Verificar no CRM</h3>
              <p className="text-sm text-muted-foreground">
                Acesse a página de <Link href="/admin/chats" className="text-primary underline">Chats</Link> para
                ver as conversas recebidas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}