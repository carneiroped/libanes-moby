'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Button } from '@/components/ui/button'
import { Loader2, TrendingUp, TrendingDown, Download, RefreshCw } from 'lucide-react'
import { useAccount } from '@/hooks/useAccount'
import SentimentChart from '@/components/admin/analytics/conversational/SentimentChart'
import ConversionFunnel from '@/components/admin/analytics/conversational/ConversionFunnel'
import TopicHeatmap from '@/components/admin/analytics/conversational/TopicHeatmap'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'

interface Metrics {
  avgResponseTime: number
  resolutionRate: number
  messagesPerConversation: number
  abandonmentRate: number
  avgConversationDuration: number
  engagementByChannel: {
    channel: string
    engagementRate: number
    avgMessages: number
    avgDuration: number
  }[]
  peakHours: number[]
}

interface ComparativeMetrics {
  current: Metrics
  previous: Metrics
  changes: {
    avgResponseTime: number
    resolutionRate: number
    messagesPerConversation: number
    abandonmentRate: number
    avgConversationDuration: number
  }
}

export default function ConversationalAnalytics() {
  const { account } = useAccount()
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<ComparativeMetrics | null>(null)
  const [sentimentData, setSentimentData] = useState<any>(null)
  const [topicsData, setTopicsData] = useState<any>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  })
  const [channel, setChannel] = useState<string>('all')
  const [compareMode, setCompareMode] = useState<'previous' | 'year'>('previous')

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch metrics
      const metricsResponse = await fetch('/api/admin/analytics/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account?.id,
          startDate: dateRange?.from,
          endDate: dateRange?.to,
          channel: channel !== 'all' ? channel : undefined,
          compareMode
        })
      })
      
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData)
      }

      // Fetch sentiment data
      const sentimentResponse = await fetch('/api/admin/analytics/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account?.id,
          period: 'week'
        })
      })

      if (sentimentResponse.ok) {
        const sentimentData = await sentimentResponse.json()
        setSentimentData(sentimentData)
      }

      // Fetch topics data
      const topicsResponse = await fetch('/api/admin/analytics/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account?.id,
          startDate: dateRange?.from,
          endDate: dateRange?.to
        })
      })

      if (topicsResponse.ok) {
        const topicsData = await topicsResponse.json()
        setTopicsData(topicsData)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [account?.id, dateRange, channel, compareMode])

  useEffect(() => {
    if (account?.id && dateRange?.from && dateRange?.to) {
      fetchAnalytics()
    }
  }, [account?.id, dateRange, channel, fetchAnalytics])

  const formatChange = (value: number) => {
    const formatted = value.toFixed(1)
    if (value > 0) {
      return <span className="text-green-600 flex items-center text-sm">+{formatted}% <TrendingUp className="h-3 w-3 ml-1" /></span>
    } else if (value < 0) {
      return <span className="text-red-600 flex items-center text-sm">{formatted}% <TrendingDown className="h-3 w-3 ml-1" /></span>
    }
    return <span className="text-gray-500 text-sm">0%</span>
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes.toFixed(0)}min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}min`
  }

  const handleExportReport = async () => {
    const response = await fetch('/api/admin/analytics/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: account?.id,
        startDate: dateRange?.from,
        endDate: dateRange?.to,
        format: 'pdf',
        includeMetrics: true,
        includeSentiment: true,
        includeInsights: true,
        includeRecommendations: true
      })
    })

    if (response.ok) {
      const { fileUrl } = await response.json()
      window.open(fileUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Conversacional</h1>
          <p className="text-muted-foreground">
            Insights detalhados sobre suas conversas e atendimentos
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline"
            onClick={fetchAnalytics}
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            onClick={handleExportReport}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os canais</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="webchat">Web Chat</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={compareMode} onValueChange={(value: 'previous' | 'year') => setCompareMode(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="previous">Comparar com anterior</SelectItem>
                <SelectItem value="year">Comparar com ano passado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tempo de Resposta
              </CardTitle>
              {formatChange(metrics.changes.avgResponseTime)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(metrics.current.avgResponseTime)}</div>
              <p className="text-xs text-muted-foreground">
                {compareMode === 'previous' ? 'vs período anterior' : 'vs ano passado'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Resolução
              </CardTitle>
              {formatChange(metrics.changes.resolutionRate)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.current.resolutionRate * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {compareMode === 'previous' ? 'vs período anterior' : 'vs ano passado'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Abandono
              </CardTitle>
              {formatChange(-metrics.changes.abandonmentRate)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.current.abandonmentRate * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {compareMode === 'previous' ? 'vs período anterior' : 'vs ano passado'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Mensagens/Conversa
              </CardTitle>
              {formatChange(metrics.changes.messagesPerConversation)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.current.messagesPerConversation.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                {compareMode === 'previous' ? 'vs período anterior' : 'vs ano passado'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="sentiment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sentiment">Sentimento</TabsTrigger>
          <TabsTrigger value="topics">Tópicos</TabsTrigger>
          <TabsTrigger value="funnel">Funil de Conversão</TabsTrigger>
          <TabsTrigger value="channels">Performance por Canal</TabsTrigger>
        </TabsList>

        <TabsContent value="sentiment" className="space-y-4">
          {sentimentData && <SentimentChart data={sentimentData} />}
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          {topicsData && <TopicHeatmap data={topicsData} />}
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <ConversionFunnel accountId={account?.id || ''} dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Performance por Canal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.current.engagementByChannel.map((channel) => (
                    <div key={channel.channel} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium capitalize">{channel.channel}</p>
                        <p className="text-sm text-muted-foreground">
                          Taxa de engajamento: {(channel.engagementRate * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">{channel.avgMessages.toFixed(1)}</span> msgs/conversa
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(channel.avgDuration)} de duração
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Peak Hours */}
      {metrics && metrics.current.peakHours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Horários de Pico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">Maior volume de conversas:</p>
              <div className="flex gap-2">
                {metrics.current.peakHours.map((hour) => (
                  <span key={hour} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {hour}:00
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}