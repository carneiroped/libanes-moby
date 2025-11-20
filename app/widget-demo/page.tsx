'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function WidgetDemoPage() {
  const [accountId, setAccountId] = useState('123e4567-e89b-12d3-a456-426614174000');
  const [primaryColor, setPrimaryColor] = useState('#00A86B');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const [companyName, setCompanyName] = useState('Imobiliária Demo');
  const [showLeadForm, setShowLeadForm] = useState(true);
  const [copied, setCopied] = useState(false);

  const embedCode = `<script 
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget/moby-chat-widget.js"
  data-account-id="${accountId}"
  data-primary-color="${primaryColor}"
  data-position="${position}"
  data-company-name="${companyName}"
  data-show-lead-form="${showLeadForm}"
></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestWidget = () => {
    // Remove existing widget if any
    const existingScript = document.querySelector('script[src*="moby-chat-widget.js"]');
    const existingContainer = document.getElementById('moby-widget-container');
    
    if (existingScript) existingScript.remove();
    if (existingContainer) existingContainer.remove();
    
    // Add widget script
    const script = document.createElement('script');
    script.src = '/widget/moby-chat-widget.js';
    script.setAttribute('data-account-id', accountId);
    script.setAttribute('data-primary-color', primaryColor);
    script.setAttribute('data-position', position);
    script.setAttribute('data-company-name', companyName);
    script.setAttribute('data-show-lead-form', showLeadForm.toString());
    
    document.body.appendChild(script);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Widget de Chat Moby</h1>
        <p className="text-gray-600">
          Configure e teste o widget de chat embarcável para seu site
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuração */}
        <Card>
          <CardHeader>
            <CardTitle>Configuração do Widget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="Seu Account ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                ID único da sua conta no sistema
              </p>
            </div>

            <div>
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nome da sua imobiliária"
              />
            </div>

            <div>
              <Label htmlFor="primaryColor">Cor Principal</Label>
              <div className="flex space-x-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#00A86B"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label>Posição</Label>
              <div className="flex space-x-4 mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="bottom-right"
                    checked={position === 'bottom-right'}
                    onChange={(e) => setPosition(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <span>Inferior Direito</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="bottom-left"
                    checked={position === 'bottom-left'}
                    onChange={(e) => setPosition(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <span>Inferior Esquerdo</span>
                </label>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showLeadForm}
                  onChange={(e) => setShowLeadForm(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Mostrar formulário de captura de leads</span>
              </label>
            </div>

            <Button onClick={handleTestWidget} className="w-full">
              Testar Widget Nesta Página
            </Button>
          </CardContent>
        </Card>

        {/* Código de Embed */}
        <Card>
          <CardHeader>
            <CardTitle>Código de Instalação</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="simple" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="simple">Simples</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
              </TabsList>
              
              <TabsContent value="simple" className="space-y-4">
                <div>
                  <Label>Cole este código antes do fechamento da tag &lt;/body&gt;</Label>
                  <div className="relative mt-2">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{embedCode}</code>
                    </pre>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      onClick={handleCopy}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    O widget será carregado automaticamente e aparecerá no canto {position === 'bottom-right' ? 'inferior direito' : 'inferior esquerdo'} do seu site.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div>
                  <Label>Configurações Avançadas</Label>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mt-2">
                    <code>{`<script>
  // Configurações avançadas do widget
  window.MobyWidgetConfig = {
    accountId: "${accountId}",
    primaryColor: "${primaryColor}",
    position: "${position}",
    companyName: "${companyName}",
    showLeadForm: ${showLeadForm},
    autoOpen: false,
    autoOpenDelay: 5000,
    businessHours: {
      enabled: true,
      timezone: "America/Sao_Paulo",
      schedule: {
        monday: { start: "09:00", end: "18:00" },
        tuesday: { start: "09:00", end: "18:00" },
        wednesday: { start: "09:00", end: "18:00" },
        thursday: { start: "09:00", end: "18:00" },
        friday: { start: "09:00", end: "18:00" },
        saturday: { start: "09:00", end: "12:00" },
        sunday: { start: "00:00", end: "00:00" }
      }
    }
  };
</script>
<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget/moby-chat-widget.js"></script>`}</code>
                  </pre>
                </div>

                <div>
                  <Label>Eventos JavaScript</Label>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mt-2">
                    <code>{`// Ouvir quando um lead é capturado
window.addEventListener('moby:lead-captured', (event) => {
  console.log('Lead capturado:', event.detail);
  // Integrar com seu sistema de analytics
});

// Controlar o widget programaticamente
window.MobyWidget.open();    // Abrir widget
window.MobyWidget.close();   // Fechar widget
window.MobyWidget.toggle();  // Alternar estado
window.MobyWidget.sendMessage('Olá!'); // Enviar mensagem`}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Recursos */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recursos do Widget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">✅ Chat em Tempo Real</h4>
              <p className="text-sm text-gray-600">
                Comunicação instantânea com IA integrada
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">✅ Captura de Leads</h4>
              <p className="text-sm text-gray-600">
                Formulário customizável para coletar dados
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">✅ Persistência de Conversa</h4>
              <p className="text-sm text-gray-600">
                Histórico mantido entre sessões
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">✅ Mobile Responsivo</h4>
              <p className="text-sm text-gray-600">
                Interface otimizada para dispositivos móveis
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">✅ Horário de Atendimento</h4>
              <p className="text-sm text-gray-600">
                Mensagens offline configuráveis
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">✅ Analytics Integrado</h4>
              <p className="text-sm text-gray-600">
                Rastreamento de eventos e métricas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}