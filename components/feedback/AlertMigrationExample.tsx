'use client';

import React from 'react';
import { useNotify } from '@/hooks/useNotification';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Migration example showing how to replace browser alert() calls
 * with the new notification system
 */
export function AlertMigrationExample() {
  const notify = useNotify();

  // BEFORE: Using browser alert() - Bad UX
  const oldWayExample = () => {
    // ❌ This is what we had before
    // alert('Máximo de 30 imagens permitido');
    // alert('Vídeo deve ter no máximo 100MB');
    // alert('Dados salvos com sucesso!');
  };

  // AFTER: Using notification system - Good UX
  const newWayExample = () => {
    // ✅ This is what we should use now
    notify.warning('Máximo de 30 imagens permitido', {
      duration: 5000,
      description: 'Remova algumas imagens antes de continuar'
    });
    
    setTimeout(() => {
      notify.error('Vídeo deve ter no máximo 100MB', {
        duration: 6000,
        description: 'Selecione um arquivo menor'
      });
    }, 1000);
    
    setTimeout(() => {
      notify.success('Dados salvos com sucesso!', {
        duration: 4000,
        action: {
          label: 'Visualizar',
          onClick: () => notify.info('Navegando para visualização...')
        }
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Migração de alert() para Sistema de Notificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Antes (Problemático)</h3>
            <Code language="typescript" className="mb-2">
{`// ❌ Problema: Bloqueia a UI, sem contexto visual, ruim para UX
alert('Máximo de 30 imagens permitido');
alert('Dados salvos com sucesso!');`}
            </Code>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Problemas: Bloqueia a UI, não permite customização, sem contexto visual
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Depois (Melhor UX)</h3>
            <Code language="typescript" className="mb-2">
{`// ✅ Solução: Notificação não-bloqueante com melhor UX
import { useNotify } from '@/hooks/useNotification';

const notify = useNotify();

// Para avisos
notify.warning('Máximo de 30 imagens permitido', {
  duration: 5000,
  description: 'Remova algumas imagens antes de continuar'
});

// Para erros
notify.error('Arquivo muito grande', {
  duration: 6000,
  important: true,
  action: {
    label: 'Como corrigir?',
    onClick: () => showHelp()
  }
});

// Para sucesso
notify.success('Dados salvos com sucesso!', {
  action: {
    label: 'Visualizar',
    onClick: () => navigate('/item')
  }
});`}
            </Code>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Benefícios: Não bloqueia UI, visual moderno, ações personalizáveis, melhor UX
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Demonstração</h3>
            <Button onClick={newWayExample}>
              Ver Exemplo das Novas Notificações
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Padrões de Migração Comuns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">1. Validação de Formulário</h4>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">❌ Antes</p>
                <Code language="typescript" size="sm">
{`if (!email) {
  alert('Email é obrigatório');
  return;
}`}
                </Code>
              </div>
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">✅ Depois</p>
                <Code language="typescript" size="sm">
{`if (!email) {
  notify.validationError('Email é obrigatório');
  return;
}`}
                </Code>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">2. Operações de Sucesso</h4>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">❌ Antes</p>
                <Code language="typescript" size="sm">
{`alert('Salvo com sucesso!');`}
                </Code>
              </div>
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">✅ Depois</p>
                <Code language="typescript" size="sm">
{`notify.saved('Documento');
// ou
notify.success('Salvo!', {
  action: { 
    label: 'Ver', 
    onClick: () => navigate('/item') 
  }
});`}
                </Code>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">3. Erros de Sistema</h4>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">❌ Antes</p>
                <Code language="typescript" size="sm">
{`alert('Erro no servidor');`}
                </Code>
              </div>
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">✅ Depois</p>
                <Code language="typescript" size="sm">
{`notify.serverError();
// ou
notify.error('Erro no servidor', {
  action: {
    label: 'Tentar novamente',
    onClick: () => retryOperation()
  }
});`}
                </Code>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">4. Confirmações</h4>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">❌ Antes</p>
                <Code language="typescript" size="sm">
{`if (confirm('Excluir item?')) {
  deleteItem();
}`}
                </Code>
              </div>
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">✅ Depois</p>
                <Code language="typescript" size="sm">
{`const confirm = useConfirmation();
await confirm.confirmDelete('item', () => {
  deleteItem();
});`}
                </Code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Script de Migração Automática</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Para facilitar a migração, use este padrão de busca e substituição:
          </p>
          
          <div className="space-y-2">
            <div>
              <p className="font-medium text-sm">Buscar:</p>
              <Code language="regex" size="sm">alert\(&apos;([^&apos;]+)&apos;\);</Code>
            </div>
            <div>
              <p className="font-medium text-sm">Substituir por:</p>
              <Code language="typescript" size="sm">notify.info(&apos;$1&apos;);</Code>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-md">
            <p className="text-sm">
              <strong>Nota:</strong> Após a substituição automática, revise cada caso para usar o tipo 
              de notificação apropriado (success, error, warning, info) e adicionar ações quando necessário.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Code component for syntax highlighting
const Code = ({ 
  children, 
  language = 'typescript', 
  size = 'base',
  className = '' 
}: { 
  children: string;
  language?: string;
  size?: 'sm' | 'base';
  className?: string;
}) => (
  <pre className={`
    bg-gray-100 dark:bg-gray-900 rounded-md p-3 overflow-x-auto text-sm
    ${size === 'sm' ? 'text-xs' : 'text-sm'}
    ${className}
  `}>
    <code className="language-typescript">{children.trim()}</code>
  </pre>
);