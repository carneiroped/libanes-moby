'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, TrendingUp, Users, Hash } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface TopicData {
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
  }[]
  frequentQuestions: {
    question: string
    count: number
    variations: string[]
  }[]
}

interface TopicHeatmapProps {
  data: TopicData
}

export default function TopicHeatmap({ data }: TopicHeatmapProps) {
  // Calculate topic intensity for heatmap
  const maxCount = Math.max(...data.topTopics.map(t => t.count))
  
  const getIntensityColor = (count: number, sentiment: number) => {
    const intensity = count / maxCount
    const opacity = 0.2 + (intensity * 0.8)
    
    if (sentiment > 0.5) {
      return `rgba(34, 197, 94, ${opacity})` // green
    } else if (sentiment < -0.5) {
      return `rgba(239, 68, 68, ${opacity})` // red
    } else {
      return `rgba(251, 146, 60, ${opacity})` // orange
    }
  }

  const getTopicSize = (count: number) => {
    const intensity = count / maxCount
    return 80 + (intensity * 40) // 80px to 120px
  }

  // Group topics by category (mock categorization)
  const categorizeTopics = () => {
    const categories: Record<string, typeof data.topTopics> = {
      'Localização': [],
      'Preço e Financiamento': [],
      'Características': [],
      'Processo': [],
      'Outros': []
    }

    data.topTopics.forEach(topic => {
      const lowerTopic = topic.topic.toLowerCase()
      if (lowerTopic.includes('bairro') || lowerTopic.includes('região') || lowerTopic.includes('local')) {
        categories['Localização'].push(topic)
      } else if (lowerTopic.includes('preço') || lowerTopic.includes('valor') || lowerTopic.includes('financiamento')) {
        categories['Preço e Financiamento'].push(topic)
      } else if (lowerTopic.includes('quarto') || lowerTopic.includes('área') || lowerTopic.includes('vaga')) {
        categories['Características'].push(topic)
      } else if (lowerTopic.includes('visita') || lowerTopic.includes('documento') || lowerTopic.includes('contrato')) {
        categories['Processo'].push(topic)
      } else {
        categories['Outros'].push(topic)
      }
    })

    return Object.entries(categories).filter(([_, topics]) => topics.length > 0)
  }

  const categorizedTopics = categorizeTopics()

  return (
    <div className="space-y-6">
      <Tabs defaultValue="heatmap" className="space-y-4">
        <TabsList>
          <TabsTrigger value="heatmap">Mapa de Calor</TabsTrigger>
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
          <TabsTrigger value="objections">Objeções</TabsTrigger>
          <TabsTrigger value="questions">Perguntas</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Tópicos</CardTitle>
              <CardDescription>
                Tamanho indica frequência, cor indica sentimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <TooltipProvider>
                  {data.topTopics.map((topic, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger>
                        <div
                          className="relative rounded-lg p-4 cursor-pointer transition-all hover:scale-105"
                          style={{
                            backgroundColor: getIntensityColor(topic.count, topic.sentiment),
                            minHeight: `${getTopicSize(topic.count)}px`
                          }}
                        >
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <MessageSquare className="h-5 w-5 mb-2 opacity-70" />
                            <p className="font-medium text-sm line-clamp-2">{topic.topic}</p>
                            <p className="text-xs opacity-70 mt-1">{topic.count} menções</p>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-2">
                          <p className="font-medium">{topic.topic}</p>
                          <p className="text-sm">Frequência: {topic.count}</p>
                          <p className="text-sm">Sentimento: {(topic.sentiment * 100).toFixed(0)}%</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {topic.keywords.slice(0, 3).map((keyword, kidx) => (
                              <Badge key={kidx} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)' }} />
                  <span className="text-sm">Sentimento Negativo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(251, 146, 60, 0.8)' }} />
                  <span className="text-sm">Neutro</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.8)' }} />
                  <span className="text-sm">Sentimento Positivo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="space-y-4">
            {categorizedTopics.map(([category, topics]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <CardDescription>
                    {topics.length} tópicos identificados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topics.map((topic, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{topic.topic}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {topic.keywords.map((keyword, kidx) => (
                              <Badge key={kidx} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{topic.count}</div>
                          <div className="text-xs text-muted-foreground">menções</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="objections">
          <Card>
            <CardHeader>
              <CardTitle>Principais Objeções</CardTitle>
              <CardDescription>
                Barreiras mais comuns nas conversas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.commonObjections.map((objection, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{objection.objection}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{objection.frequency} vezes</Badge>
                        <Badge 
                          variant={objection.resolutionRate > 0.7 ? 'default' : objection.resolutionRate > 0.4 ? 'secondary' : 'destructive'}
                        >
                          {(objection.resolutionRate * 100).toFixed(0)}% resolvido
                        </Badge>
                      </div>
                    </div>
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
                        style={{ width: `${objection.resolutionRate * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle>Perguntas Mais Frequentes</CardTitle>
              <CardDescription>
                Questões recorrentes dos clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.frequentQuestions.map((question, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{question.question}</p>
                        {question.variations.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">Variações:</p>
                            <div className="space-y-1">
                              {question.variations.slice(0, 2).map((variation, vidx) => (
                                <p key={vidx} className="text-sm text-muted-foreground pl-2">
                                  • {variation}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold">{question.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}