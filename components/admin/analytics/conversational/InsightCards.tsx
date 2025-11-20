'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Lightbulb, 
  TrendingUp, 
  AlertCircle, 
  MessageSquare, 
  Users, 
  Target,
  ArrowRight,
  Sparkles
} from 'lucide-react'

interface Insight {
  type: 'topic' | 'objection' | 'question' | 'pattern' | 'opportunity'
  category: string
  description: string
  frequency?: number
  impact: 'high' | 'medium' | 'low'
  examples?: string[]
  recommendations: string[]
}

interface InsightCardsProps {
  insights: Insight[]
  onSelectInsight?: (insight: Insight) => void
}

export default function InsightCards({ insights, onSelectInsight }: InsightCardsProps) {
  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'topic':
        return <MessageSquare className="h-5 w-5" />
      case 'objection':
        return <AlertCircle className="h-5 w-5" />
      case 'pattern':
        return <Users className="h-5 w-5" />
      case 'opportunity':
        return <TrendingUp className="h-5 w-5" />
      default:
        return <Lightbulb className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: Insight['type']) => {
    switch (type) {
      case 'topic':
        return 'text-blue-600 bg-blue-50'
      case 'objection':
        return 'text-orange-600 bg-orange-50'
      case 'pattern':
        return 'text-purple-600 bg-purple-50'
      case 'opportunity':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-yellow-600 bg-yellow-50'
    }
  }

  const getImpactColor = (impact: Insight['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
    }
  }

  const prioritizedInsights = [...insights].sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 }
    return impactOrder[a.impact] - impactOrder[b.impact]
  })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {prioritizedInsights.map((insight, index) => (
        <Card 
          key={index} 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSelectInsight?.(insight)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg ${getTypeColor(insight.type)}`}>
                {getIcon(insight.type)}
              </div>
              <Badge className={getImpactColor(insight.impact)}>
                {insight.impact === 'high' ? 'Alto Impacto' : 
                 insight.impact === 'medium' ? 'Médio Impacto' : 
                 'Baixo Impacto'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{insight.category}</p>
              <p className="font-medium line-clamp-2">{insight.description}</p>
            </div>
            
            {insight.frequency && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-3 w-3" />
                <span>{insight.frequency} ocorrências</span>
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Ação recomendada:</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {insight.recommendations[0]}
              </p>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2"
              onClick={(e) => {
                e.stopPropagation()
                onSelectInsight?.(insight)
              }}
            >
              Ver detalhes
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}