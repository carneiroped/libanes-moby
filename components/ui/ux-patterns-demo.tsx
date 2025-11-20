/**
 * UX Patterns Demo - Moby CRM
 * 
 * Comprehensive examples and usage patterns for all UX components.
 * This file serves as both documentation and testing playground.
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import our UX patterns
import {
  StandardLoadingState,
  StandardErrorState,
  StandardEmptyState,
  StandardPagination,
  StandardSearchFilter,
  StandardModal,
  StandardConfirmDialog,
  StandardDragDrop
} from './ux-patterns';

// Import UX hooks
import {
  useRealTimeValidation,
  usePagination,
  useSearch,
  useConflictDetection,
  useFeedback,
  useDragDrop,
  useAsyncState
} from '@/hooks/useUXPatterns';

// Import UX standards
import { UX_CONFIG, VALIDATION_RULES } from '@/lib/ux-standards';

export function UXPatternsDemo() {
  // Demo state
  const [currentTab, setCurrentTab] = useState('loading');
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Hooks examples
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 10,
    total: 157
  });
  
  const search = useSearch({
    onSearch: (query) => {
      console.log('Searching for:', query);
    }
  });
  
  const feedback = useFeedback();
  
  const validation = useRealTimeValidation({
    initialValues: { email: '', phone: '', name: '' },
    validationRules: {
      email: [VALIDATION_RULES.required(), VALIDATION_RULES.email()],
      phone: [VALIDATION_RULES.required(), VALIDATION_RULES.phone()],
      name: [VALIDATION_RULES.required(), VALIDATION_RULES.minLength(2)]
    }
  });
  
  const dragDrop = useDragDrop({
    accept: ['image/*', 'application/pdf'],
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (files) => {
      console.log('Files dropped:', files);
      feedback.success.upload();
    }
  });

  const asyncState = useAsyncState({
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error),
    showFeedback: true
  });

  // Sample data for examples
  const sampleFilters = [
    {
      label: 'Status',
      key: 'status',
      type: 'select' as const,
      options: [
        { label: 'Ativo', value: 'active', count: 25 },
        { label: 'Inativo', value: 'inactive', count: 10 },
        { label: 'Pendente', value: 'pending', count: 5 }
      ]
    },
    {
      label: 'Categoria',
      key: 'category',
      type: 'multiselect' as const,
      options: [
        { label: 'Casa', value: 'house', count: 15 },
        { label: 'Apartamento', value: 'apartment', count: 20 },
        { label: 'Terreno', value: 'land', count: 8 }
      ]
    }
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Moby CRM - UX Patterns Demo</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore todos os padrões de UX disponíveis no sistema. Esta demonstração 
          mostra como usar cada componente e hook para criar experiências consistentes.
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="loading">Loading</TabsTrigger>
          <TabsTrigger value="error">Error</TabsTrigger>
          <TabsTrigger value="empty">Empty</TabsTrigger>
          <TabsTrigger value="pagination">Pagination</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="modal">Modal</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="dragdrop">Drag & Drop</TabsTrigger>
        </TabsList>

        {/* Loading States Tab */}
        <TabsContent value="loading" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estados de Carregamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Spinner</h3>
                  <StandardLoadingState config="DEFAULT" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Skeleton</h3>
                  <StandardLoadingState config="TABLE" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Progress</h3>
                  <StandardLoadingState config={{
                    type: 'progress',
                    showProgress: true,
                    progress: 65,
                    text: 'Processando...'
                  }} />
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Dots</h3>
                  <StandardLoadingState config="REALTIME_SYNC" />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <Button
                  onClick={() => asyncState.execute(
                    () => new Promise(resolve => setTimeout(() => resolve('Success!'), 2000)),
                    'Operação concluída!'
                  )}
                  disabled={asyncState.loading}
                >
                  {asyncState.loading ? 'Carregando...' : 'Testar Async State'}
                </Button>
                {asyncState.data && (
                  <p className="mt-2 text-sm text-green-600">Resultado: {asyncState.data}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Error States Tab */}
        <TabsContent value="error" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estados de Erro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <StandardErrorState 
                  config="NETWORK_ERROR"
                  onRetry={() => feedback.success.save()}
                />
                
                <StandardErrorState 
                  config="SERVER_ERROR"
                  onRetry={() => feedback.error.server()}
                  onReport={() => feedback.info.processing()}
                />
                
                <StandardErrorState 
                  config="PERMISSION_ERROR"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Empty States Tab */}
        <TabsContent value="empty" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estados Vazios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StandardEmptyState 
                  config="NO_LEADS"
                  onAction={(action) => feedback.info.processing()}
                />
                
                <StandardEmptyState 
                  config="NO_SEARCH_RESULTS"
                />
                
                <StandardEmptyState 
                  config="NO_TASKS"
                />
                
                <StandardEmptyState 
                  config="NO_MESSAGES"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pagination Tab */}
        <TabsContent value="pagination" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paginação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-sm text-muted-foreground mb-4">
                Estado atual: Página {pagination.page} de {pagination.totalPages} 
                ({pagination.total} itens total)
              </div>
              
              <StandardPagination
                pagination={pagination}
                onPageChange={pagination.goToPage}
                onPageSizeChange={pagination.changePageSize}
                showPageSize={true}
                showInfo={true}
              />
              
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={pagination.goToFirstPage}
                  disabled={!pagination.hasPrev}
                >
                  Primeira
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={pagination.goToLastPage}
                  disabled={!pagination.hasNext}
                >
                  Última
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={pagination.reset}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search & Filter Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pesquisa e Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <StandardSearchFilter
                searchValue={search.query}
                onSearchChange={search.setQuery}
                filters={sampleFilters}
                activeFilters={{}}
                onFilterChange={(key, value) => console.log('Filter change:', key, value)}
                onClearFilters={() => console.log('Clear filters')}
                placeholder="Pesquisar leads, imóveis..."
              />
              
              <div className="border-t pt-4 space-y-2">
                <div className="text-sm">
                  <strong>Query atual:</strong> {search.query || '(vazio)'}
                </div>
                <div className="text-sm">
                  <strong>Query com debounce:</strong> {search.debouncedQuery || '(vazio)'}
                </div>
                <div className="text-sm">
                  <strong>Pesquisando:</strong> {search.isSearching ? 'Sim' : 'Não'}
                </div>
                
                {search.recentSearches.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Pesquisas recentes:</div>
                    <div className="flex flex-wrap gap-1">
                      {search.recentSearches.map((term, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="cursor-pointer"
                          onClick={() => search.executeSearch(term)}
                        >
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modal Tab */}
        <TabsContent value="modal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modais e Diálogos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={() => setShowModal(true)}>
                  Abrir Modal
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowConfirm(true)}
                >
                  Confirmar Ação
                </Button>
              </div>
              
              <StandardModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Exemplo de Modal"
                description="Este é um modal de exemplo com conteúdo customizado."
                size="md"
                footer={
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowModal(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => {
                      feedback.success.save();
                      setShowModal(false);
                    }}>
                      Salvar
                    </Button>
                  </div>
                }
              >
                <div className="space-y-4">
                  <p>Este é o conteúdo do modal. Você pode colocar qualquer coisa aqui.</p>
                  <Input placeholder="Campo de exemplo..." />
                </div>
              </StandardModal>
              
              <StandardConfirmDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={async () => {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  feedback.success.delete();
                  setShowConfirm(false);
                }}
                title="Confirmar Exclusão"
                description="Tem certeza de que deseja excluir este item? Esta ação não pode ser desfeita."
                confirmText="Excluir"
                variant="destructive"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Validação em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    value={validation.values.name || ''}
                    onChange={(e) => validation.setValue('name', e.target.value)}
                    placeholder="Digite seu nome..."
                    className={validation.errors.name ? 'border-red-500' : ''}
                  />
                  {validation.errors.name && (
                    <p className="text-sm text-red-500">{validation.errors.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">E-mail</label>
                  <Input
                    value={validation.values.email || ''}
                    onChange={(e) => validation.setValue('email', e.target.value)}
                    placeholder="seu@email.com"
                    className={validation.errors.email ? 'border-red-500' : ''}
                  />
                  {validation.errors.email && (
                    <p className="text-sm text-red-500">{validation.errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    value={validation.values.phone || ''}
                    onChange={(e) => validation.setValue('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={validation.errors.phone ? 'border-red-500' : ''}
                  />
                  {validation.errors.phone && (
                    <p className="text-sm text-red-500">{validation.errors.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center space-x-4 text-sm">
                  <Badge variant={validation.isValid ? 'default' : 'destructive'}>
                    {validation.isValid ? 'Válido' : 'Inválido'}
                  </Badge>
                  <Badge variant={validation.isValidating ? 'default' : 'outline'}>
                    {validation.isValidating ? 'Validando...' : 'Pronto'}
                  </Badge>
                  <span>
                    Campos validados: {validation.validatedFields.size}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={validation.validateAllFields}
                    disabled={validation.isValidating}
                  >
                    Validar Todos
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={validation.resetValidation}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drag & Drop Tab */}
        <TabsContent value="dragdrop" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Drag & Drop</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <StandardDragDrop
                onDrop={dragDrop.handleDrop}
                accept={['image/*', 'application/pdf']}
                multiple={true}
                className="min-h-[200px]"
              >
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center space-y-4">
                  <div className="text-muted-foreground">
                    <p className="text-lg font-medium">Arraste arquivos aqui</p>
                    <p className="text-sm">ou clique para selecionar</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Aceita imagens e PDFs até 10MB
                  </p>
                </div>
              </StandardDragDrop>
              
              {dragDrop.errors.length > 0 && (
                <div className="space-y-1">
                  {dragDrop.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-500">{error}</p>
                  ))}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={dragDrop.clearErrors}
                  >
                    Limpar Erros
                  </Button>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="text-sm space-y-1">
                  <div>Estado do drag: {dragDrop.isDragging ? 'Arrastando' : 'Normal'}</div>
                  {dragDrop.draggedItem && (
                    <div>Item arrastado: {JSON.stringify(dragDrop.draggedItem)}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feedback System Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              size="sm" 
              onClick={feedback.success.save}
              className="bg-green-600 hover:bg-green-700"
            >
              Success
            </Button>
            <Button 
              size="sm" 
              onClick={feedback.error.generic}
              className="bg-red-600 hover:bg-red-700"
            >
              Error
            </Button>
            <Button 
              size="sm" 
              onClick={feedback.warning.unsavedChanges}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Warning
            </Button>
            <Button 
              size="sm" 
              onClick={feedback.info.loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Info
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}