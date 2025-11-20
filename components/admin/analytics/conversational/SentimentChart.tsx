'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface SentimentData {
  period: 'day' | 'week' | 'month'
  data: {
    date: string
    averageSentiment: number
    count: number
    emotions: {
      satisfaction: number
      frustration: number
      urgency: number
      interest: number
      confusion: number
    }
  }[]
  overallTrend: 'improving' | 'declining' | 'stable'
  insights: string[]
  emotionalPatterns: {
    peakFrustrationTimes: {
      hourOfDay: number[]
      dayOfWeek: string[]
      triggers: string[]
    }
    highSatisfactionTriggers: string[]
    commonConfusionTopics: string[]
    urgencyPatterns: {
      indicators: string[]
      averageConversionRate: number
      bestResponseStrategy: string
    }
  }
}

interface SentimentChartProps {
  data: SentimentData
}

export default function SentimentChart({ data }: SentimentChartProps) {
  const getTrendIcon = () => {
    switch (data.overallTrend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendText = () => {
    switch (data.overallTrend) {
      case 'improving':
        return 'Melhorando'
      case 'declining':
        return 'Piorando'
      default:
        return 'Estável'
    }
  }

  const formatXAxis = (value: string) => {
    const date = new Date(value)
    if (data.period === 'day') {
      return format(date, 'HH:mm')
    } else if (data.period === 'week') {
      return format(date, 'EEE', { locale: ptBR })
    } else {
      return format(date, 'dd/MM')
    }
  }

  const getSentimentColor = (value: number) => {
    if (value > 0.5) return '#22c55e'
    if (value > 0) return '#84cc16'
    if (value > -0.5) return '#f59e0b'
    return '#ef4444'
  }

  // Prepare heatmap data for hourly sentiment
  const hourlyHeatmap = Array.from({ length: 24 }, (_, hour) => {
    const hourData = data.data.filter(d => new Date(d.date).getHours() === hour)
    const avgSentiment = hourData.length > 0
      ? hourData.reduce((sum, d) => sum + d.averageSentiment, 0) / hourData.length
      : 0
    return {
      hour,
      value: avgSentiment,
      count: hourData.length
    }
  })

  // Prepare emotion distribution data
  const emotionData = data.data.length > 0 ? [
    {
      emotion: 'Satisfação',
      value: data.data.reduce((sum, d) => sum + d.emotions.satisfaction, 0) / data.data.length,
      color: '#22c55e'
    },
    {
      emotion: 'Frustração',
      value: data.data.reduce((sum, d) => sum + d.emotions.frustration, 0) / data.data.length,
      color: '#ef4444'
    },
    {
      emotion: 'Urgência',
      value: data.data.reduce((sum, d) => sum + d.emotions.urgency, 0) / data.data.length,
      color: '#f59e0b'
    },
    {
      emotion: 'Interesse',
      value: data.data.reduce((sum, d) => sum + d.emotions.interest, 0) / data.data.length,
      color: '#3b82f6'
    },
    {
      emotion: 'Confusão',
      value: data.data.reduce((sum, d) => sum + d.emotions.confusion, 0) / data.data.length,
      color: '#8b5cf6'
    }
  ] : []

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Análise de Sentimento</CardTitle>
              <CardDescription>
                Evolução do sentimento nas conversas
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className="font-medium">{getTrendText()}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList>
              <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
              <TabsTrigger value="emotions">Emoções</TabsTrigger>
              <TabsTrigger value="heatmap">Mapa de Calor</TabsTrigger>
              <TabsTrigger value="patterns">Padrões</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.data}>
                    <defs>
                      <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatXAxis}
                    />
                    <YAxis 
                      domain={[-1, 1]}
                      ticks={[-1, -0.5, 0, 0.5, 1]}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy HH:mm')}
                      formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Sentimento']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="averageSentiment" 
                      stroke="#22c55e"
                      fill="url(#sentimentGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="emotions">
              <div className="space-y-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={emotionData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <YAxis type="category" dataKey="emotion" />
                      <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                      <Bar dataKey="value">
                        {emotionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {emotionData.map((emotion) => (
                    <div key={emotion.emotion} className="text-center p-2 border rounded-lg">
                      <div 
                        className="text-2xl font-bold" 
                        style={{ color: emotion.color }}
                      >
                        {(emotion.value * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">{emotion.emotion}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="heatmap">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Sentimento por Hora do Dia</h3>
                <div className="grid grid-cols-12 gap-1">
                  {hourlyHeatmap.slice(0, 12).map((hour) => (
                    <div key={`am-${hour.hour}`} className="text-center">
                      <div 
                        className="aspect-square rounded flex items-center justify-center text-xs font-medium"
                        style={{ 
                          backgroundColor: getSentimentColor(hour.value),
                          opacity: hour.count > 0 ? 0.8 : 0.2
                        }}
                      >
                        {hour.hour}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">AM</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-12 gap-1">
                  {hourlyHeatmap.slice(12).map((hour) => (
                    <div key={`pm-${hour.hour}`} className="text-center">
                      <div 
                        className="aspect-square rounded flex items-center justify-center text-xs font-medium"
                        style={{ 
                          backgroundColor: getSentimentColor(hour.value),
                          opacity: hour.count > 0 ? 0.8 : 0.2
                        }}
                      >
                        {hour.hour}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">PM</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
                    <span className="text-sm">Negativo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }} />
                    <span className="text-sm">Neutro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} />
                    <span className="text-sm">Positivo</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="patterns">
              <div className="space-y-4">
                {/* Peak Frustration Times */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Horários de Pico - Frustração</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Horas:</span>
                        <div className="flex gap-1">
                          {data.emotionalPatterns.peakFrustrationTimes.hourOfDay.map(hour => (
                            <Badge key={hour} variant="secondary">{hour}:00</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Dias:</span>
                        <div className="flex gap-1">
                          {data.emotionalPatterns.peakFrustrationTimes.dayOfWeek.map(day => (
                            <Badge key={day} variant="secondary">{day}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Gatilhos comuns:</span>
                        <ul className="text-sm text-muted-foreground mt-1">
                          {data.emotionalPatterns.peakFrustrationTimes.triggers.map(trigger => (
                            <li key={trigger}>• {trigger}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Satisfaction Triggers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Gatilhos de Satisfação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {data.emotionalPatterns.highSatisfactionTriggers.map(trigger => (
                        <Badge key={trigger} variant="default" className="bg-green-600">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Confusion Topics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tópicos que Geram Confusão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {data.emotionalPatterns.commonConfusionTopics.map(topic => (
                        <Badge key={topic} variant="outline">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Urgency Patterns */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Padrões de Urgência</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Indicadores:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {data.emotionalPatterns.urgencyPatterns.indicators.map(indicator => (
                            <Badge key={indicator} variant="destructive">{indicator}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Taxa de conversão:</span>{' '}
                        <span className="text-green-600 font-bold">
                          {(data.emotionalPatterns.urgencyPatterns.averageConversionRate * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Melhor estratégia:</span>{' '}
                        {data.emotionalPatterns.urgencyPatterns.bestResponseStrategy}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Insights */}
      {data.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Insights de Sentimento</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}