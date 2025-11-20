'use client';

import React, { useState } from 'react';
import { 
  useNotification, 
  useNotify, 
  useProgressNotification, 
  useConfirmation,
  useScopedNotification
} from '@/hooks/useNotification';
import { useProgress, useSteppedProgress, useMultiProgress } from '@/hooks/useProgress';
import { ActivityFeed, CompactActivityFeed } from './ActivityFeed';
import { ProgressOverlay } from './ProgressOverlay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Loader2,
  Upload,
  Download,
  Settings,
  Trash2,
  Save,
  RefreshCw,
  Clock
} from 'lucide-react';

export function FeedbackSystemDemo() {
  // Basic notifications
  const notifications = useNotification();
  const notify = useNotify();
  const confirm = useConfirmation();
  
  // Scoped notifications for different features
  const uploadNotifications = useScopedNotification('Upload');
  const userNotifications = useScopedNotification('Usuário');
  
  // Progress operations
  const fileProgress = useProgress('file-upload', 'Enviando arquivo...');
  const [showProgressOverlay, setShowProgressOverlay] = useState(false);
  const progressNotification = useProgressNotification();
  
  // Stepped progress
  const steppedProgress = useSteppedProgress('data-migration', [
    { id: 'validate', label: 'Validando dados', description: 'Verificando integridade dos dados' },
    { id: 'backup', label: 'Criando backup', description: 'Backup de segurança dos dados atuais' },
    { id: 'migrate', label: 'Migrando dados', description: 'Transferindo dados para novo formato' },
    { id: 'verify', label: 'Verificando migração', description: 'Confirmando sucesso da migração' },
  ]);
  
  // Multi progress
  const multiProgress = useMultiProgress();

  // Demo functions
  const showBasicNotifications = () => {
    notify.success('Operação realizada com sucesso!');
    setTimeout(() => notify.warning('Atenção: alguns dados podem estar desatualizados'), 1000);
    setTimeout(() => notify.info('Nova funcionalidade disponível'), 2000);
    setTimeout(() => notify.error('Falha na conexão com o servidor'), 3000);
  };

  const showPredefinedNotifications = () => {
    notify.saved('Documento');
    setTimeout(() => notify.deleted('Item', () => {
      notify.success('Item restaurado com sucesso!');
    }), 1000);
    setTimeout(() => notify.updated('Perfil'), 2000);
    setTimeout(() => notify.created('Novo projeto', () => {
      notify.info('Navegando para o projeto...');
    }), 3000);
  };

  const showErrorNotifications = () => {
    notify.networkError();
    setTimeout(() => notify.validationError('Email é obrigatório'), 1000);
    setTimeout(() => notify.permissionError(), 2000);
    setTimeout(() => notify.serverError(), 3000);
  };

  const showScopedNotifications = () => {
    uploadNotifications.success('Arquivo enviado com sucesso!');
    setTimeout(() => userNotifications.warning('Perfil incompleto'), 1000);
    setTimeout(() => uploadNotifications.error('Falha no upload'), 2000);
  };

  const showPromiseNotification = () => {
    const mockApiCall = new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 
          ? resolve('Dados carregados com sucesso!')
          : reject('Erro ao carregar dados');
      }, 3000);
    });

    notify.promiseOperation(mockApiCall, {
      loading: 'Carregando dados...',
      success: (data) => data,
      error: (error) => `Erro: ${error}`
    });
  };

  const showConfirmationDialogs = async () => {
    const result = await confirm.confirmDelete('este item', () => {
      notify.success('Item excluído com sucesso!');
    });
    
    if (!result) {
      notify.info('Exclusão cancelada');
    }
  };

  const simulateFileUpload = () => {
    const upload = progressNotification.fileUpload('documento.pdf');
    
    upload.start();
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      
      if (progress >= 100) {
        upload.complete();
        clearInterval(interval);
      } else {
        upload.update(progress);
      }
    }, 500);
  };

  const simulateProgressOverlay = () => {
    setShowProgressOverlay(true);
    fileProgress.start('Processando arquivo...', 100);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      
      if (progress >= 100) {
        fileProgress.complete('Arquivo processado com sucesso!');
        setTimeout(() => setShowProgressOverlay(false), 2000);
        clearInterval(interval);
      } else {
        fileProgress.update(progress, `Processando... ${Math.round(progress)}%`);
      }
    }, 300);
  };

  const simulateSteppedProgress = () => {
    steppedProgress.startSteppedProcess('Iniciando migração de dados...');
    
    // Simulate stepped execution
    setTimeout(() => {
      steppedProgress.updateStepProgress(50);
      setTimeout(() => {
        steppedProgress.completeStep();
        setTimeout(() => {
          steppedProgress.updateStepProgress(75);
          setTimeout(() => {
            steppedProgress.completeStep();
            setTimeout(() => {
              steppedProgress.updateStepProgress(100);
              setTimeout(() => {
                steppedProgress.completeStep();
                setTimeout(() => {
                  steppedProgress.updateStepProgress(100);
                  steppedProgress.completeStep();
                }, 1000);
              }, 1000);
            }, 1000);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const simulateMultiProgress = () => {
    // Add multiple operations
    multiProgress.addOperation('sync-contacts', 'Sincronizando contatos');
    multiProgress.addOperation('sync-properties', 'Sincronizando propriedades');
    multiProgress.addOperation('sync-leads', 'Sincronizando leads');
    
    // Simulate progress for each
    ['sync-contacts', 'sync-properties', 'sync-leads'].forEach((id, index) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        
        if (progress >= 100) {
          multiProgress.completeOperation(id);
          clearInterval(interval);
        } else {
          multiProgress.updateOperation(id, progress);
        }
      }, 500 + (index * 200));
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sistema de Feedback - Demonstração</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Demonstração completa do sistema de feedback e notificações
          </p>
        </div>
        <Badge variant="outline">v1.0</Badge>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="confirmations">Confirmações</TabsTrigger>
          <TabsTrigger value="activity">Atividades</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Notificações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={showBasicNotifications} className="w-full">
                  Mostrar Notificações Básicas
                </Button>
                <Button onClick={showPredefinedNotifications} variant="outline" className="w-full">
                  Mostrar Notificações Predefinidas
                </Button>
                <Button onClick={showErrorNotifications} variant="destructive" className="w-full">
                  Mostrar Notificações de Erro
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Notificações Avançadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={showScopedNotifications} className="w-full">
                  Notificações com Escopo
                </Button>
                <Button onClick={showPromiseNotification} variant="outline" className="w-full">
                  Notificação com Promise
                </Button>
                <div className="flex items-center justify-between text-sm">
                  <span>Som:</span>
                  <Button
                    size="sm"
                    variant={notifications.soundEnabled ? "default" : "outline"}
                    onClick={() => notifications.setSoundEnabled(!notifications.soundEnabled)}
                  >
                    {notifications.soundEnabled ? 'Ativado' : 'Desativado'}
                  </Button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Vibração:</span>
                  <Button
                    size="sm"
                    variant={notifications.hapticEnabled ? "default" : "outline"}
                    onClick={() => notifications.setHapticEnabled(!notifications.hapticEnabled)}
                  >
                    {notifications.hapticEnabled ? 'Ativado' : 'Desativado'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Indicadores de Progresso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={simulateFileUpload} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Simular Upload
                </Button>
                <Button onClick={simulateProgressOverlay} variant="outline" className="w-full">
                  <Loader2 className="h-4 w-4 mr-2" />
                  Mostrar Overlay de Progresso
                </Button>
                <Button onClick={simulateMultiProgress} variant="secondary" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Múltiplos Progressos
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Progresso por Etapas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={simulateSteppedProgress} className="w-full">
                  Iniciar Migração de Dados
                </Button>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Progresso Geral:</span>
                    <span>{steppedProgress.overallProgress}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Etapa Atual:</span>
                    <span>{steppedProgress.currentStepIndex + 1}/4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={steppedProgress.isActive ? "default" : "secondary"}>
                      {steppedProgress.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {multiProgress.operations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Operações em Andamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {multiProgress.operations.map((op) => (
                    <div key={op.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{op.message}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${op.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{Math.round(op.progress)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="confirmations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Diálogos de Confirmação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={showConfirmationDialogs} variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Confirmar Exclusão
              </Button>
              <Button
                onClick={() => confirm.confirmDiscardChanges(() => {
                  notify.info('Alterações descartadas');
                })}
                variant="outline"
                className="w-full"
              >
                Descartar Alterações
              </Button>
              <Button
                onClick={() => confirm.confirmLogout(() => {
                  notify.success('Logout realizado');
                })}
                variant="secondary"
                className="w-full"
              >
                Confirmar Logout
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ActivityFeed
                title="Feed de Atividades Completo"
                showFilter={true}
                showSearch={true}
                showClearAll={true}
                maxItems={20}
                compact={false}
                showTimestamps={true}
                showUndoActions={true}
                groupByDate={true}
              />
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Atividades Recentes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <CompactActivityFeed maxItems={5} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ProgressOverlay
        isOpen={showProgressOverlay}
        title="Processando Arquivo"
        description="Aguarde enquanto o arquivo é processado..."
        progress={fileProgress.progress}
        showPercentage={true}
        showProgressBar={true}
        status={fileProgress.hasError ? 'error' : fileProgress.isComplete ? 'success' : 'loading'}
        onCancel={() => {
          fileProgress.cancel();
          setShowProgressOverlay(false);
        }}
        cancelable={fileProgress.isActive}
        size="md"
        variant="overlay"
      />
    </div>
  );
}