'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, FunnelChart, Funnel, LabelList } from 'recharts'
import { ArrowRight, TrendingUp, TrendingDown, Users, MessageSquare, Phone, Calendar, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DateRange } from 'react-day-picker'

interface FunnelData {
  stage: string
  count: number
  percentage: number
  dropoff: number
  avgTimeToNext: number // in hours
  icon: React.ReactNode
}

interface ConversionFunnelProps {
  accountId: string
  dateRange?: DateRange
}

export default function ConversionFunnel({ accountId, dateRange }: ConversionFunnelProps) {
  const [loading, setLoading] = useState(true)
  const [funnelData, setFunnelData] = useState<FunnelData[]>([])
  const [conversionRate, setConversionRate] = useState(0)
  const [avgCycleTime, setAvgCycleTime] = useState(0)

  const fetchFunnelData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/analytics/funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          startDate: dateRange?.from,
          endDate: dateRange?.to
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFunnelData(data.funnel)
        setConversionRate(data.overallConversionRate)
        setAvgCycleTime(data.averageCycleTime)
      }
    } catch (error) {
      console.error('Error fetching funnel data:', error)
    } finally {
      setLoading(false)
    }
  }, [accountId, dateRange])

  useEffect(() => {
    fetchFunnelData()
  }, [fetchFunnelData])

  // Mock data for demonstration
  const mockFunnelData: FunnelData[] = [
    {
      stage: 'Primeiro Contato',
      count: 1000,
      percentage: 100,
      dropoff: 0,
      avgTimeToNext: 2.5,
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      stage: 'Qualificação',
      count: 750,
      percentage: 75,
      dropoff: 25,
      avgTimeToNext: 4.2,
      icon: <Users className="h-4 w-4" />
    },
    {
      stage: 'Agendamento',
      count: 450,
      percentage: 45,
      dropoff: 40,
      avgTimeToNext: 12.8,
      icon: <Calendar className="h-4 w-4" />
    },
    {
      stage: 'Visita',
      count: 300,
      percentage: 30,
      dropoff: 33.3,
      avgTimeToNext: 48,
      icon: <Phone className="h-4 w-4" />
    },
    {
      stage: 'Proposta',
      count: 150,
      percentage: 15,
      dropoff: 50,
      avgTimeToNext: 72,
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      stage: 'Fechamento',
      count: 75,
      percentage: 7.5,
      dropoff: 50,
      avgTimeToNext: 0,
      icon: <CheckCircle className="h-4 w-4" />
    }
  ]

  const data = loading ? mockFunnelData : (funnelData.length > 0 ? funnelData : mockFunnelData)

  const getStageColor = (index: number) => {
    const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']
    return colors[index % colors.length]
  }

  const formatTime = (hours: number) => {
    if (hours < 24) {
      return `${hours.toFixed(1)}h`
    }
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}d ${remainingHours.toFixed(0)}h`
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(conversionRate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Do primeiro contato ao fechamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tempo Médio do Ciclo
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(avgCycleTime)}</div>
            <p className="text-xs text-muted-foreground">
              Do início ao fechamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Maior Gargalo
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.reduce((max, stage) => stage.dropoff > max.dropoff ? stage : max).stage}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.reduce((max, stage) => stage.dropoff > max.dropoff ? stage : max).dropoff.toFixed(0)}% de perda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>
            Visualização do fluxo de conversão em cada etapa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Visual Funnel */}
            <div className="relative">
              {data.map((stage, index) => (
                <div key={stage.stage} className="mb-4">
                  <div className="flex items-center gap-4">
                    {/* Stage Icon */}
                    <div 
                      className="flex items-center justify-center w-10 h-10 rounded-full"
                      style={{ backgroundColor: `${getStageColor(index)}20` }}
                    >
                      <div style={{ color: getStageColor(index) }}>
                        {stage.icon}
                      </div>
                    </div>

                    {/* Stage Bar */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium">{stage.stage}</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            {stage.count.toLocaleString('pt-BR')} leads
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          {index > 0 && (
                            <Badge variant={stage.dropoff > 30 ? 'destructive' : 'secondary'}>
                              -{stage.dropoff.toFixed(0)}%
                            </Badge>
                          )}
                          <span className="text-sm font-medium">
                            {stage.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                          style={{
                            width: `${stage.percentage}%`,
                            backgroundColor: getStageColor(index)
                          }}
                        />
                      </div>
                      {stage.avgTimeToNext > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatTime(stage.avgTimeToNext)} até próxima etapa
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bar Chart Alternative View */}
            <div className="h-[300px] mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [
                      value.toLocaleString('pt-BR'),
                      'Leads'
                    ]}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStageColor(index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage Details */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Best Converting Stages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Melhores Taxas de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data
                .filter((_, index) => index > 0)
                .sort((a, b) => a.dropoff - b.dropoff)
                .slice(0, 3)
                .map((stage, index) => (
                  <div key={stage.stage} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {(100 - stage.dropoff).toFixed(0)}% de retenção
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottlenecks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gargalos Identificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data
                .filter((_, index) => index > 0)
                .sort((a, b) => b.dropoff - a.dropoff)
                .slice(0, 3)
                .map((stage, index) => (
                  <div key={stage.stage} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-3 w-3 text-red-600" />
                      <span className="text-sm font-medium text-red-600">
                        -{stage.dropoff.toFixed(0)}% de perda
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}