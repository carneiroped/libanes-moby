'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { QrCode, MessageSquare, Settings, Webhook, CheckCircle2, XCircle, Plus, Trash2 } from 'lucide-react'
import { useAccount } from '@/hooks/useAccount'
import { useWhatsAppIntegrations, useCreateWhatsAppIntegration, useUpdateWhatsAppIntegration, useDeleteWhatsAppIntegration } from '@/hooks/useIntegrations'
import { EvolutionAPIClient } from '@/lib/integrations/evolution/client'
import Image from 'next/image'

export default function WhatsAppPage() {
  const { account } = useAccount()
  const [loading, setLoading] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<any>(null)
  const [showNewIntegration, setShowNewIntegration] = useState(false)
  
  // Hooks para integrações
  const { data: integrations, isLoading: loadingIntegrations } = useWhatsAppIntegrations()
  const createIntegration = useCreateWhatsAppIntegration()
  const updateIntegration = useUpdateWhatsAppIntegration()
  const deleteIntegration = useDeleteWhatsAppIntegration()
  
  // Form state para nova integração
  const [newIntegrationForm, setNewIntegrationForm] = useState({
    type: 'evolution' as 'official' | 'evolution',
    name: '',
    phone_number: '',
    instance_id: '',
    config: {
      api_key: '',
      api_url: 'https://evolution.baileys.com',
    }
  })

  // Selecionar primeira integração automaticamente
  useEffect(() => {
    if (integrations && integrations.length > 0 && !selectedIntegration) {
      setSelectedIntegration(integrations[0].id)
    }
  }, [integrations, selectedIntegration])

  // Integração selecionada atualmente
  const currentIntegration = integrations?.find(i => i.id === selectedIntegration)

  const checkConnectionStatus = useCallback(async () => {
    if (!currentIntegration || currentIntegration.type !== 'evolution') return
    
    setLoading(true)
    try {
      const config = currentIntegration.config as any
      const evolution = new EvolutionAPIClient({
        token: config.api_key,
        instanceName: currentIntegration.instance_id || config.instance_name,
        apiUrl: config.api_url
      })
      
      const instanceInfo = await evolution.checkInstance()
      setConnectionStatus(instanceInfo)
      
      // Se desconectado, buscar QR Code
      if (!instanceInfo || instanceInfo.state === 'close') {
        const qrData = await evolution.getQRCode()
        setQrCode(qrData.qrcode || qrData.qr || qrData.base64)
      } else {
        setQrCode(null)
      }
    } catch (error) {
      console.error('Error checking status:', error)
      setConnectionStatus(null)
    } finally {
      setLoading(false)
    }
  }, [currentIntegration])

  // Verificar status quando mudar integração
  useEffect(() => {
    if (currentIntegration) {
      checkConnectionStatus()
    }
  }, [currentIntegration, checkConnectionStatus])

  const handleCreateIntegration = async () => {
    if (!account) return
    
    setLoading(true)
    try {
      await createIntegration.mutateAsync(newIntegrationForm)
      setShowNewIntegration(false)
      setNewIntegrationForm({
        type: 'evolution',
        name: '',
        phone_number: '',
        instance_id: '',
        config: {
          api_key: '',
          api_url: 'https://evolution.baileys.com',
        }
      })
    } catch (error) {
      console.error('Error creating integration:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteIntegration = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta integração?')) return
    
    try {
      await deleteIntegration.mutateAsync(id)
      if (selectedIntegration === id) {
        setSelectedIntegration(null)
      }
    } catch (error) {
      console.error('Error deleting integration:', error)
    }
  }

  const testConnection = async () => {
    if (!currentIntegration || currentIntegration.type !== 'evolution') return
    
    setLoading(true)
    try {
      const config = currentIntegration.config as any
      const evolution = new EvolutionAPIClient({
        token: config.api_key,
        instanceName: currentIntegration.instance_id || config.instance_name,
        apiUrl: config.api_url
      })
      
      await evolution.sendTextMessage(
        '5511999999999@s.whatsapp.net',
        'Teste de conexão Moby CRM'
      )
      alert('Mensagem de teste enviada!')
    } catch (error) {
      console.error('Error testing:', error)
      alert('Erro ao enviar mensagem de teste')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp</h1>
          <p className="text-muted-foreground">
            Configure e gerencie suas integrações WhatsApp
          </p>
        </div>
        <Button onClick={() => setShowNewIntegration(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Integração
        </Button>
      </div>

      {/* Seletor de Integração */}
      {integrations && integrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Integrações Configuradas</CardTitle>
            <CardDescription>
              Selecione uma integração para gerenciar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select value={selectedIntegration || ''} onValueChange={setSelectedIntegration}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione uma integração" />
                </SelectTrigger>
                <SelectContent>
                  {integrations.map((integration) => (
                    <SelectItem key={integration.id} value={integration.id}>
                      <div className="flex items-center gap-2">
                        <span>{integration.name}</span>
                        <Badge variant={integration.is_active ? 'default' : 'secondary'}>
                          {integration.type}
                        </Badge>
                        {integration.connection_status === 'connected' && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentIntegration && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteIntegration(currentIntegration.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário Nova Integração */}
      {showNewIntegration && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Integração WhatsApp</CardTitle>
            <CardDescription>
              Configure uma nova integração WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select 
                  value={newIntegrationForm.type} 
                  onValueChange={(value: 'official' | 'evolution') => 
                    setNewIntegrationForm({ ...newIntegrationForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="evolution">Evolution API</SelectItem>
                    <SelectItem value="official">WhatsApp Business API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newIntegrationForm.name}
                  onChange={(e) => setNewIntegrationForm({ ...newIntegrationForm, name: e.target.value })}
                  placeholder="Ex: WhatsApp Vendas"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={newIntegrationForm.phone_number}
                  onChange={(e) => setNewIntegrationForm({ ...newIntegrationForm, phone_number: e.target.value })}
                  placeholder="Ex: +5511999999999"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instance">ID da Instância</Label>
                <Input
                  id="instance"
                  value={newIntegrationForm.instance_id}
                  onChange={(e) => setNewIntegrationForm({ ...newIntegrationForm, instance_id: e.target.value })}
                  placeholder="Ex: moby-vendas"
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={newIntegrationForm.config.api_key}
                  onChange={(e) => setNewIntegrationForm({
                    ...newIntegrationForm,
                    config: { ...newIntegrationForm.config, api_key: e.target.value }
                  })}
                  placeholder="Ex: 975ED7E7B8F6-4904-A086-ED8485BDDEB9"
                />
              </div>
              
              {newIntegrationForm.type === 'evolution' && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="apiUrl">URL da API</Label>
                  <Input
                    id="apiUrl"
                    value={newIntegrationForm.config.api_url}
                    onChange={(e) => setNewIntegrationForm({
                      ...newIntegrationForm,
                      config: { ...newIntegrationForm.config, api_url: e.target.value }
                    })}
                    placeholder="Ex: https://evolution.baileys.com"
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewIntegration(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateIntegration} disabled={loading}>
                Criar Integração
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs de Gerenciamento */}
      {currentIntegration && (
        <Tabs defaultValue="connection" className="space-y-4">
          <TabsList>
            <TabsTrigger value="connection">
              <QrCode className="mr-2 h-4 w-4" />
              Conexão
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="mr-2 h-4 w-4" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="webhook">
              <Webhook className="mr-2 h-4 w-4" />
              Webhook
            </TabsTrigger>
            <TabsTrigger value="test">
              <MessageSquare className="mr-2 h-4 w-4" />
              Teste
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connection">
            <Card>
              <CardHeader>
                <CardTitle>Status da Conexão</CardTitle>
                <CardDescription>
                  {currentIntegration.name} - {currentIntegration.phone_number}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectionStatus ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      {connectionStatus.state === 'open' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        Status: {connectionStatus.state || 'Desconectado'}
                      </span>
                    </div>
                    
                    {qrCode && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Escaneie o QR Code com seu WhatsApp
                        </p>
                        <div className="bg-white p-4 rounded-lg inline-block">
                          <div className="relative w-[300px] h-[300px]">
                            <Image
                              src={qrCode}
                              alt="QR Code"
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert>
                    <AlertTitle>Verificando conexão...</AlertTitle>
                    <AlertDescription>
                      Aguarde enquanto verificamos o status da conexão
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button
                  onClick={checkConnectionStatus}
                  disabled={loading}
                >
                  Verificar Status
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Integração</CardTitle>
                <CardDescription>
                  Informações da configuração atual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Tipo</Label>
                    <p className="font-medium">{currentIntegration.type}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge variant={currentIntegration.is_active ? 'default' : 'secondary'}>
                      {currentIntegration.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Nome</Label>
                    <p className="font-medium">{currentIntegration.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Telefone</Label>
                    <p className="font-medium">{currentIntegration.phone_number}</p>
                  </div>
                  {currentIntegration.instance_id && (
                    <div>
                      <Label className="text-muted-foreground">Instância</Label>
                      <p className="font-medium">{currentIntegration.instance_id}</p>
                    </div>
                  )}
                  {currentIntegration.last_sync_at && (
                    <div>
                      <Label className="text-muted-foreground">Última Sincronização</Label>
                      <p className="font-medium">
                        {new Date(currentIntegration.last_sync_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhook">
            <Card>
              <CardHeader>
                <CardTitle>Configuração do Webhook</CardTitle>
                <CardDescription>
                  URL para receber eventos do WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTitle>URL do Webhook</AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                    <p>Configure esta URL no seu provedor:</p>
                    <code className="block bg-muted p-2 rounded text-sm break-all">
                      {currentIntegration.webhook_url}
                    </code>
                    <p className="text-sm">
                      Esta URL receberá todos os eventos de mensagens e atualizações de status.
                    </p>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <p className="font-medium">Eventos suportados:</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge>messages.upsert</Badge>
                    <Badge>messages.update</Badge>
                    <Badge>connection.update</Badge>
                    <Badge>chats.update</Badge>
                    <Badge>contacts.update</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle>Teste de Envio</CardTitle>
                <CardDescription>
                  Envie uma mensagem de teste
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTitle>Mensagem de Teste</AlertTitle>
                  <AlertDescription>
                    Clique no botão abaixo para enviar uma mensagem de teste para o número
                    +55 11 99999-9999
                  </AlertDescription>
                </Alert>
                
                <Button
                  onClick={testConnection}
                  disabled={loading || connectionStatus?.state !== 'open'}
                >
                  Enviar Mensagem de Teste
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Estado vazio */}
      {!loadingIntegrations && (!integrations || integrations.length === 0) && !showNewIntegration && (
        <Card>
          <CardContent className="text-center py-12">
            <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma integração configurada</h3>
            <p className="text-muted-foreground mb-4">
              Configure uma integração WhatsApp para começar a receber mensagens
            </p>
            <Button onClick={() => setShowNewIntegration(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeira Integração
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}