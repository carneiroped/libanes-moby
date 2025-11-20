'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  Brain, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  MessageSquare,
  Zap,
  DollarSign
} from 'lucide-react'

interface AIMetrics {
  totalInteractions: number
  successRate: number
  averageResponseTime: number
  averageConfidence: number
  intentDistribution: Record<string, number>
  errorRate: number
  tokensUsed: number
}

interface AIMetricsData {
  realtime: {
    totalInteractions: number
    successRate: number
    averageResponseTime: number
    averageConfidence: number
    intentDistribution: Record<string, number>
    errorRate: number
    tokensUsed: number
    anomalies: string[]
    report?: string
  }
  historical: {
    hourlyMetrics: any[]
    recentInteractions: any[]
  }
}

const INTENT_COLORS = {
  greeting: '#10B981',
  property_search: '#3B82F6',
  schedule_visit: '#8B5CF6',
  information: '#F59E0B',
  unknown: '#6B7280'
}

const INTENT_LABELS = {
  greeting: 'Saudações',
  property_search: 'Busca de Imóveis',
  schedule_visit: 'Agendamento',
  information: 'Informações',
  unknown: 'Não Identificado'
}

export function AIMetricsDashboard() {
  const [metrics, setMetrics] = useState<AIMetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeWindow, setTimeWindow] = useState(60)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/ai-metrics?timeWindow=${timeWindow}&report=true`)
      const data = await response.json()
      
      if (data.success) {
        setMetrics(data.data)
      }
    } catch (error) {
      console.error('Error fetching AI metrics:', error)
    } finally {
      setLoading(false)
    }
  }, [timeWindow])

  useEffect(() => {
    fetchMetrics()
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchMetrics, 30000)
    setRefreshInterval(interval)
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [fetchMetrics])

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Preparar dados para gráficos
  const intentData = Object.entries(metrics.realtime.intentDistribution).map(([intent, count]) => ({
    name: INTENT_LABELS[intent as keyof typeof INTENT_LABELS] || intent,
    value: count,
    color: INTENT_COLORS[intent as keyof typeof INTENT_COLORS] || '#6B7280'
  }))

  const hourlyData = metrics.historical.hourlyMetrics.slice(0, 24).reverse().map(metric => ({
    hour: new Date(metric.hour).toLocaleTimeString('pt-BR', { hour: '2-digit' }),
    interações: metric.total_interactions,
    sucesso: metric.successful_interactions,
    falhas: metric.failed_interactions,
    tokens: metric.total_tokens
  }))

  return (
    <div className="space-y-6">
      {/* Alertas de Anomalias */}
      {metrics.realtime.anomalies.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Anomalias Detectadas:</strong>
            <ul className="mt-2 list-disc list-inside">
              {metrics.realtime.anomalies.map((anomaly, index) => (
                <li key={index}>{anomaly}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Total de Interações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.realtime.totalInteractions}</div>
            <p className="text-xs text-muted-foreground">
              Últimos {timeWindow} minutos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.realtime.successRate.toFixed(1)}%</div>
            <Progress value={metrics.realtime.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tempo de Resposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.realtime.averageResponseTime.toFixed(0)}ms</div>
            <Badge variant={metrics.realtime.averageResponseTime < 3000 ? 'default' : 'destructive'}>
              {metrics.realtime.averageResponseTime < 3000 ? 'Rápido' : 'Lento'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Confiança Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics.realtime.averageConfidence * 100).toFixed(1)}%
            </div>
            <Progress value={metrics.realtime.averageConfidence * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Análises */}
      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="distribution">Distribuição de Intenções</TabsTrigger>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="interactions">Interações Recentes</TabsTrigger>
          <TabsTrigger value="report">Relatório</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Intenções</CardTitle>
              <CardDescription>
                Tipos de perguntas mais comuns dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={intentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {intentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {intentData.map((intent) => (
                    <div key={intent.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: intent.color }}
                        />
                        <span className="text-sm">{intent.name}</span>
                      </div>
                      <span className="text-sm font-medium">{intent.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividade nas Últimas 24 Horas</CardTitle>
              <CardDescription>
                Volume de interações e uso de tokens ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="interações" 
                      stackId="1"
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="falhas" 
                      stackId="1"
                      stroke="#EF4444" 
                      fill="#EF4444"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Taxa de Erro</div>
                  <div className="text-xl font-bold text-red-600">
                    {metrics.realtime.errorRate.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Tokens Utilizados</div>
                  <div className="text-xl font-bold flex items-center justify-center gap-1">
                    <Zap className="h-4 w-4" />
                    {metrics.realtime.tokensUsed.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Custo Estimado</div>
                  <div className="text-xl font-bold flex items-center justify-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {((metrics.realtime.tokensUsed / 1000) * 0.001).toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interações Recentes</CardTitle>
              <CardDescription>
                Últimas conversas processadas pela IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.historical.recentInteractions.map((interaction) => (
                  <div key={interaction.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {INTENT_LABELS[interaction.intent as keyof typeof INTENT_LABELS] || interaction.intent}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(interaction.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="text-sm">
                          <strong>Usuário:</strong> {interaction.user_message}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>IA:</strong> {interaction.ai_response}
                        </div>
                      </div>
                      <div className="text-right text-xs space-y-1">
                        <div>
                          <Clock className="inline h-3 w-3 mr-1" />
                          {interaction.processing_time_ms}ms
                        </div>
                        <div>
                          <Brain className="inline h-3 w-3 mr-1" />
                          {(interaction.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    {interaction.error && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription className="text-xs">
                          {interaction.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Performance</CardTitle>
              <CardDescription>
                Análise detalhada do desempenho da IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                {metrics.realtime.report}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}