'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Copy, ExternalLink, ArrowRight, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  action?: {
    type: 'copy' | 'external' | 'none';
    label: string;
    value?: string;
    url?: string;
  };
  validation?: {
    message: string;
    checkFn?: () => boolean;
  };
  tips?: string[];
}

interface SetupWizardProps {
  integration: 'olx-zap' | 'google-ads' | 'meta-ads';
  webhookUrl: string;
  webhookSecret?: string;
  onComplete?: () => void;
  autoShow?: boolean;
}

const OLX_ZAP_STEPS: SetupStep[] = [
  {
    id: 'welcome',
    title: '👋 Bem-vindo à Integração OLX e ZAP!',
    description: 'Vamos configurar sua integração em poucos passos simples. Você receberá leads automaticamente sempre que alguém entrar em contato com seus anúncios.',
    tips: [
      'Todo o processo leva menos de 5 minutos',
      'Você pode pausar e voltar depois',
      'Nossa equipe está disponível para ajudar'
    ]
  },
  {
    id: 'access-portal',
    title: 'Passo 1: Acesse o Portal OLX/ZAP',
    description: 'Entre no seu painel de anunciante do OLX ou ZAP Imóveis usando seu login e senha.',
    action: {
      type: 'external',
      label: 'Abrir Portal OLX/ZAP',
      url: 'https://www.olx.com.br/minha-conta'
    },
    tips: [
      'Use o mesmo login que você usa para publicar anúncios',
      'Se esqueceu a senha, clique em "Recuperar senha"',
      'Mantenha esta janela aberta para voltar aqui depois'
    ]
  },
  {
    id: 'find-integrations',
    title: 'Passo 2: Encontre a área de Integrações',
    description: 'No menu lateral do portal, procure por "Integrações", "Webhooks" ou "API". Geralmente fica em Configurações → Integrações.',
    tips: [
      'Se não encontrar, procure pelo ícone de engrenagem ⚙️',
      'Em alguns casos está em "Ferramentas" ou "Avançado"',
      'A interface pode variar entre OLX e ZAP'
    ]
  },
  {
    id: 'copy-webhook',
    title: 'Passo 3: Copie sua URL de Webhook',
    description: 'Esta é a URL que você vai colar no portal OLX/ZAP. Ela é única para sua conta.',
    action: {
      type: 'copy',
      label: 'Copiar URL do Webhook',
      value: '' // Será preenchido dinamicamente
    },
    tips: [
      'Esta URL é exclusiva da sua conta',
      'Nunca compartilhe com outras pessoas',
      'Se tiver problemas, você pode gerar uma nova depois'
    ]
  },
  {
    id: 'add-webhook',
    title: 'Passo 4: Adicione o Webhook no OLX/ZAP',
    description: 'No portal OLX/ZAP, clique em "Adicionar Webhook" ou "Nova Integração" e cole a URL que você copiou.',
    tips: [
      'Cole a URL no campo "URL do Webhook"',
      'Método deve ser "POST"',
      'Deixe os outros campos como padrão',
      'Alguns portais pedem um nome - use "Moby CRM"'
    ]
  },
  {
    id: 'test-webhook',
    title: 'Passo 5: Teste a Integração',
    description: 'No portal OLX/ZAP, clique em "Testar Webhook" ou "Enviar Teste". Você deve receber uma confirmação de sucesso.',
    validation: {
      message: 'Webhook funcionando! Leads serão capturados automaticamente.',
    },
    tips: [
      'Se der erro, verifique se copiou a URL completa',
      'Certifique-se de que salvou as alterações',
      'O teste pode demorar alguns segundos'
    ]
  },
  {
    id: 'complete',
    title: '🎉 Tudo Pronto!',
    description: 'Sua integração está ativa! Agora todos os leads dos seus anúncios OLX e ZAP chegarão automaticamente no seu CRM.',
    tips: [
      'Leads aparecem em tempo real na aba "Leads"',
      'Você receberá notificações de novos leads',
      'Pode gerenciar a integração a qualquer momento aqui',
      'Nossa equipe monitora a integração 24/7'
    ]
  }
];

const GOOGLE_ADS_STEPS: SetupStep[] = [
  {
    id: 'welcome',
    title: '👋 Configurar Google Ads Lead Forms',
    description: 'Vamos conectar seus formulários de leads do Google Ads ao CRM em poucos passos.',
    tips: ['Processo simples e rápido', 'Leads capturados automaticamente']
  },
  {
    id: 'access-google-ads',
    title: 'Passo 1: Acesse o Google Ads',
    description: 'Entre na sua conta do Google Ads.',
    action: {
      type: 'external',
      label: 'Abrir Google Ads',
      url: 'https://ads.google.com'
    }
  },
  {
    id: 'copy-webhook',
    title: 'Passo 2: Copie sua URL de Webhook',
    description: 'Copie esta URL - você vai precisar dela no Google Ads.',
    action: {
      type: 'copy',
      label: 'Copiar URL do Webhook',
      value: ''
    }
  },
  {
    id: 'configure',
    title: 'Passo 3: Configure o Webhook',
    description: 'No Google Ads, vá em Ferramentas → Conversões → Webhook e cole a URL.',
    tips: ['Siga a documentação completa se precisar de ajuda']
  },
  {
    id: 'complete',
    title: '✅ Integração Ativa!',
    description: 'Leads do Google Ads agora chegam automaticamente.',
  }
];

const META_ADS_STEPS: SetupStep[] = [
  {
    id: 'welcome',
    title: '👋 Configurar Meta Ads (Facebook/Instagram)',
    description: 'Conecte seus Lead Forms do Facebook e Instagram ao CRM.',
    tips: ['Suporta Facebook e Instagram', 'Configuração unificada']
  },
  {
    id: 'access-meta',
    title: 'Passo 1: Acesse o Meta Business Suite',
    description: 'Entre no painel do Meta Business.',
    action: {
      type: 'external',
      label: 'Abrir Meta Business',
      url: 'https://business.facebook.com'
    }
  },
  {
    id: 'copy-webhook',
    title: 'Passo 2: Copie sua URL de Webhook',
    description: 'Esta URL será usada no Meta Business Suite.',
    action: {
      type: 'copy',
      label: 'Copiar URL do Webhook',
      value: ''
    }
  },
  {
    id: 'configure',
    title: 'Passo 3: Configure o Webhook',
    description: 'No Meta, vá em Webhooks e adicione a URL copiada.',
    tips: ['Documentação completa disponível']
  },
  {
    id: 'complete',
    title: '✅ Tudo Certo!',
    description: 'Leads do Facebook e Instagram sincronizados.',
  }
];

export function SetupWizard({
  integration,
  webhookUrl,
  webhookSecret,
  onComplete,
  autoShow = false
}: SetupWizardProps) {
  const [isOpen, setIsOpen] = useState(autoShow);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const steps = integration === 'olx-zap' ? OLX_ZAP_STEPS :
                integration === 'google-ads' ? GOOGLE_ADS_STEPS :
                META_ADS_STEPS;

  // Sincronizar estado interno com prop externa
  useEffect(() => {
    setIsOpen(autoShow);
  }, [autoShow]);

  // Preencher URLs dinamicamente
  const stepsWithData = steps.map(step => ({
    ...step,
    action: step.action && step.action.type === 'copy'
      ? { ...step.action, value: webhookUrl }
      : step.action
  }));

  const currentStepData = stepsWithData[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === stepsWithData.length - 1;
  const progress = ((currentStep + 1) / stepsWithData.length) * 100;

  useEffect(() => {
    // Salvar progresso no localStorage
    const key = `setup-wizard-${integration}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const { step, completed } = JSON.parse(saved);
        setCurrentStep(step);
        setCompletedSteps(new Set(completed));
      } catch (e) {
        // Ignore
      }
    }
  }, [integration]);

  const saveProgress = (step: number, completed: Set<string>) => {
    const key = `setup-wizard-${integration}`;
    localStorage.setItem(key, JSON.stringify({
      step,
      completed: Array.from(completed)
    }));
  };

  const handleNext = () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStepData.id);
    setCompletedSteps(newCompleted);

    if (isLastStep) {
      // Concluído!
      localStorage.removeItem(`setup-wizard-${integration}`);
      onComplete?.();
      setIsOpen(false);
      toast({
        title: '🎉 Integração configurada!',
        description: 'Você começará a receber leads automaticamente.',
      });
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveProgress(nextStep, newCompleted);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveProgress(prevStep, completedSteps);
    }
  };

  const handleCopy = () => {
    if (currentStepData.action?.value) {
      navigator.clipboard.writeText(currentStepData.action.value);
      toast({
        title: '✅ Copiado!',
        description: 'URL copiada para a área de transferência.',
      });
    }
  };

  const handleExternalLink = () => {
    if (currentStepData.action?.url) {
      window.open(currentStepData.action.url, '_blank');
    }
  };

  const handleSkipForNow = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    saveProgress(nextStep, completedSteps);
  };

  return (
    <>
      {/* Botão flutuante para reabrir o tutorial */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
          size="lg"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Tutorial de Integração
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Barra de Progresso */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <DialogHeader className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="text-xs">
                Passo {currentStep + 1} de {stepsWithData.length}
              </Badge>
              {!isFirstStep && !isLastStep && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipForNow}
                  className="text-xs"
                >
                  Pular por agora
                </Button>
              )}
            </div>
            <DialogTitle className="text-2xl font-bold leading-tight">
              {currentStepData.title}
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed pt-2">
              {currentStepData.description}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            {/* Ação do Passo */}
            {currentStepData.action && (
              <div className="bg-muted/50 rounded-lg p-4 border-2 border-dashed">
                {currentStepData.action.type === 'copy' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sua URL de Webhook:</span>
                      <Button
                        onClick={handleCopy}
                        size="sm"
                        variant="outline"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        {currentStepData.action.label}
                      </Button>
                    </div>
                    <code className="block p-3 bg-background rounded border text-xs break-all">
                      {currentStepData.action.value}
                    </code>
                  </div>
                )}

                {currentStepData.action.type === 'external' && (
                  <Button
                    onClick={handleExternalLink}
                    size="lg"
                    className="w-full"
                  >
                    {currentStepData.action.label}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Dicas */}
            {currentStepData.tips && currentStepData.tips.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  Dicas úteis:
                </h4>
                <ul className="space-y-2">
                  {currentStepData.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Validação */}
            {currentStepData.validation && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Tudo certo!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      {currentStepData.validation.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Indicadores de Passos */}
            <div className="flex justify-center gap-2 pt-4">
              {stepsWithData.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => {
                    if (index <= currentStep) {
                      setCurrentStep(index);
                    }
                  }}
                  className={cn(
                    "transition-all",
                    index === currentStep ? "w-8" : "w-2",
                  )}
                >
                  <div
                    className={cn(
                      "h-2 rounded-full transition-colors",
                      completedSteps.has(step.id)
                        ? "bg-green-500"
                        : index === currentStep
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Navegação */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isFirstStep}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <Button
              onClick={handleNext}
              size="lg"
              className="min-w-[140px]"
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Concluir
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
