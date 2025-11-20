'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2, TestTube, MessageSquare, Database } from 'lucide-react';

export default function TestSeehausWebhookPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [dbData, setDbData] = useState<any>(null);

  const sendTestWebhook = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-seehaus-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      setResult(data);

      // Verificar dados no banco após 2 segundos
      if (data.success) {
        setTimeout(checkDatabase, 2000);
      }
    } catch (error) {
      setResult({ error: 'Erro ao enviar webhook de teste' });
    } finally {
      setLoading(false);
    }
  };

  const checkDatabase = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/test-webhook-receive');
      const data = await response.json();
      setDbData(data);
    } catch (error) {
      setDbData({ error: 'Erro ao verificar banco de dados' });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Teste de Webhook - Seehaus</h1>
        <p className="text-muted-foreground mt-2">
          Simule o recebimento de uma mensagem WhatsApp para testar a integração
        </p>
      </div>

      <div className="grid gap-6">
        {/* Enviar Webhook de Teste */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Simular Mensagem WhatsApp
            </CardTitle>
            <CardDescription>
              Envia um webhook simulado como se fosse uma mensagem recebida
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  <strong>Mensagem simulada:</strong><br/>
                  De: +55 47 99999-8888<br/>
                  Texto: &quot;Olá, esta é uma mensagem de teste manual!&quot;
                </AlertDescription>
              </Alert>

              <Button 
                onClick={sendTestWebhook} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Webhook de Teste
              </Button>

              {result && (
                <Alert className={result.success ? 'border-green-500' : 'border-red-500'}>
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {result.success ? 'Webhook enviado com sucesso!' : result.error}
                    {result.webhookResponse && (
                      <div className="mt-2">
                        <strong>Resposta:</strong>
                        <pre className="text-xs overflow-auto mt-1">
                          {JSON.stringify(result.webhookResponse, null, 2)}
                        </pre>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Verificar Banco de Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Dados no Banco
            </CardTitle>
            <CardDescription>
              Verifica se as mensagens foram salvas no banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={checkDatabase} 
              disabled={checking}
              variant="outline"
              className="w-full"
            >
              {checking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verificar Banco de Dados
            </Button>

            {dbData && (
              <div className="mt-4 space-y-2">
                {dbData.error ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{dbData.error}</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <Alert>
                      <AlertDescription>
                        <strong>Total de mensagens:</strong> {dbData.stats?.totalMessages || 0}<br/>
                        <strong>Última mensagem:</strong> {dbData.stats?.lastMessageAt || 'Nenhuma'}
                      </AlertDescription>
                    </Alert>
                    
                    {dbData.recentMessages && dbData.recentMessages.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Mensagens Recentes:</h4>
                        <div className="space-y-2">
                          {dbData.recentMessages.map((msg: any, index: number) => (
                            <div key={index} className="text-sm border rounded p-2">
                              <div><strong>ID:</strong> {msg.id}</div>
                              <div><strong>Conteúdo:</strong> {msg.content}</div>
                              <div><strong>De Lead:</strong> {msg.is_from_lead ? 'Sim' : 'Não'}</div>
                              <div><strong>Criado em:</strong> {new Date(msg.created_at).toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Links Úteis */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">Se o teste funcionou e criou dados no banco:</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li><Link href="/admin/chats" className="text-primary underline">Ver Chats</Link></li>
              <li><Link href="/admin/leads" className="text-primary underline">Ver Leads</Link></li>
            </ul>
            
            <p className="text-sm mt-4">Se não funcionou:</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>Verifique os logs do console (F12)</li>
              <li>Confirme que o webhook está salvo no Evolution</li>
              <li>Tente enviar uma mensagem real para +55 16 99769-2355</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}