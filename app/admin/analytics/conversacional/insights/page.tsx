'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, TrendingUp, AlertCircle, MessageSquare, Users, Target, Lightbulb, ArrowRight } from 'lucide-react'
import { useAccount } from '@/hooks/useAccount'
import InsightCards from '@/components/admin/analytics/conversational/InsightCards'

interface InsightSummary {
  topTopics: {
    topic: string
    count: number
    sentiment: number
    keywords: string[]
  }[]
  commonObjections: {
    objection: string
    frequency: number
    resolutionRate: number
    suggestedResponses: string[]
  }[]
  frequentQuestions: {
    question: string
    variations: string[]
    count: number
    suggestedAnswer: string
  }[]
  behaviorPatterns: {
    pattern: string
    description: string
    frequency: number
    segments: string[]
    opportunity: string
  }[]
  emergingTrends: {
    trend: string
    growth: number
    timeframe: string
    implications: string[]
  }[]
}

export default function ConversationalInsights() {
  const { account } = useAccount()
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<InsightSummary | null>(null)
  const [actionableInsights, setActionableInsights] = useState<any[]>([])
  const [selectedInsight, setSelectedInsight] = useState<any>(null)

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch detailed insights
      const insightsResponse = await fetch('/api/admin/analytics/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account?.id,
          period: 7
        })
      })

      if (insightsResponse.ok) {
        const data = await insightsResponse.json()
        setInsights(data)
      }

      // Fetch actionable insights
      const actionableResponse = await fetch('/api/admin/analytics/insights/actionable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account?.id
        })
      })

      if (actionableResponse.ok) {
        const data = await actionableResponse.json()
        setActionableInsights(data)
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }, [account?.id])

  useEffect(() => {
    if (account?.id) {
      fetchInsights()
    }
  }, [account?.id, fetchInsights])

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.5) return 'text-green-600'
    if (sentiment < -0.5) return 'text-red-600'
    return 'text-yellow-600'
  }

  const getImpactBadge = (impact: string) => {
    const variants: Record<string, 'destructive' | 'default' | 'secondary'> = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    }
    return <Badge variant={variants[impact] || 'default'}>{impact}</Badge>
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insights Conversacionais</h1>
        <p className="text-muted-foreground">
          Descubra padrões e oportunidades nas suas conversas
        </p>
      </div>

      {/* Actionable Insights */}
      {actionableInsights.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Ações Recomendadas</h2>
          <InsightCards insights={actionableInsights} onSelectInsight={setSelectedInsight} />
        </div>
      )}

      {/* Selected Insight Detail */}
      {selectedInsight && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>{selectedInsight.description}</AlertTitle>
          <AlertDescription className="space-y-2 mt-2">
            <div>
              <strong>Recomendações:</strong>
              <ul className="list-disc list-inside mt-1">
                {selectedInsight.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="text-sm">{rec}</li>
                ))}
              </ul>
            </div>
            {selectedInsight.examples.length > 0 && (
              <div>
                <strong>Exemplos:</strong>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedInsight.examples.map((example: string, idx: number) => (
                    <Badge key={idx} variant="outline">{example}</Badge>
                  ))}
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Insights Tabs */}
      {insights && (
        <Tabs defaultValue="topics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="topics">Tópicos</TabsTrigger>
            <TabsTrigger value="objections">Objeções</TabsTrigger>
            <TabsTrigger value="questions">Perguntas</TabsTrigger>
            <TabsTrigger value="patterns">Padrões</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tópicos Mais Discutidos</CardTitle>
                <CardDescription>
                  Assuntos que dominam as conversas com seus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.topTopics.map((topic, idx) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          {topic.topic}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{topic.count} menções</Badge>
                          <span className={`text-sm font-medium ${getSentimentColor(topic.sentiment)}`}>
                            Sentimento: {(topic.sentiment * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {topic.keywords.map((keyword, kidx) => (
                          <Badge key={kidx} variant="secondary">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="objections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Objeções Comuns</CardTitle>
                <CardDescription>
                  Principais barreiras identificadas nas conversas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.commonObjections.map((objection, idx) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          {objection.objection}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{objection.frequency} vezes</Badge>
                          <Badge 
                            variant={objection.resolutionRate > 0.7 ? 'default' : 'destructive'}
                          >
                            {(objection.resolutionRate * 100).toFixed(0)}% resolvido
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Respostas sugeridas:</p>
                        <ul className="space-y-1">
                          {objection.suggestedResponses.map((response, ridx) => (
                            <li key={ridx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              {response}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Perguntas Frequentes</CardTitle>
                <CardDescription>
                  Questões recorrentes que precisam de respostas padronizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.frequentQuestions.map((question, idx) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{question.question}</h3>
                        <Badge variant="outline">{question.count} vezes</Badge>
                      </div>
                      {question.variations.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Variações:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {question.variations.map((variation, vidx) => (
                              <li key={vidx}>• {variation}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="bg-muted/50 rounded-md p-3">
                        <p className="text-sm font-medium mb-1">Resposta sugerida:</p>
                        <p className="text-sm">{question.suggestedAnswer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Padrões de Comportamento</CardTitle>
                <CardDescription>
                  Tendências identificadas no comportamento dos usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.behaviorPatterns.map((pattern, idx) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {pattern.pattern}
                        </h3>
                        <Badge variant="outline">Frequência: {pattern.frequency}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{pattern.description}</p>
                      <div>
                        <p className="text-sm font-medium mb-2">Segmentos afetados:</p>
                        <div className="flex flex-wrap gap-2">
                          {pattern.segments.map((segment, sidx) => (
                            <Badge key={sidx} variant="secondary">{segment}</Badge>
                          ))}
                        </div>
                      </div>
                      <Alert className="bg-blue-50 border-blue-200">
                        <Target className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800">Oportunidade</AlertTitle>
                        <AlertDescription className="text-blue-700">
                          {pattern.opportunity}
                        </AlertDescription>
                      </Alert>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tendências Emergentes</CardTitle>
                <CardDescription>
                  Mudanças significativas detectadas no período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.emergingTrends.map((trend, idx) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          {trend.trend}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-600">
                            +{trend.growth.toFixed(0)}%
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {trend.timeframe}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Implicações:</p>
                        <ul className="space-y-1">
                          {trend.implications.map((implication, iidx) => (
                            <li key={iidx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              {implication}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}