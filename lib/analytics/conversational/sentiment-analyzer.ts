import { createClient, type SupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import OpenAI from 'openai'

// Tipos reais do banco de dados
type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
type Chat = Database['public']['Tables']['chats']['Row']

// Tipo auxiliar para processamento de mensagens
type ProcessedMessage = {
  id: number
  chat_id: number | null
  content: string
  sender_type: 'customer' | 'agent'
  created_at: string
}

// TODO: Criar tabela conversation_analytics quando necessário para analytics de sentimento
type ConversationAnalytics = {
  id?: string
  chat_id: number
  account_id?: string
  sentiment_data?: unknown
  average_sentiment?: number
  sentiment_trend?: string
  critical_moments_count?: number
  analyzed_at?: string
  metadata?: unknown
}

interface SentimentScore {
  overall: number // -1 to 1
  emotions: {
    satisfaction: number
    frustration: number
    urgency: number
    interest: number
    confusion: number
  }
  confidence: number
}

interface ConversationSentiment {
  chatId: number
  scores: SentimentScore[]
  averageScore: number
  trend: 'improving' | 'declining' | 'stable'
  criticalMoments: {
    timestamp: Date
    message: string
    score: number
    reason: string
  }[]
}

export class SentimentAnalyzer {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  private async getSupabase(): Promise<SupabaseClient> {
    return await createClient()
  }

  // Converte chat_messages em formato processado
  private processMessages(messages: ChatMessage[]): ProcessedMessage[] {
    return messages.map(msg => ({
      id: msg.id,
      chat_id: msg.chat_id,
      content: msg.user_message || msg.bot_message || '',
      sender_type: msg.user_message ? 'customer' : 'agent',
      created_at: msg.created_at
    }))
  }

  async analyzeMessage(message: string, context?: string[]): Promise<SentimentScore> {
    try {
      const prompt = `
        Analyze the sentiment of this message in a customer service context.
        ${context?.length ? `Previous messages for context: ${context.join('\n')}` : ''}
        
        Message: "${message}"
        
        Return a JSON object with:
        - overall: sentiment score from -1 (very negative) to 1 (very positive)
        - emotions: object with scores 0-1 for: satisfaction, frustration, urgency, interest, confusion
        - confidence: confidence level 0-1
      `

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: 'You are a sentiment analysis expert. Return only valid JSON.'
        }, {
          role: 'user',
          content: prompt
        }],
        response_format: { type: 'json_object' },
        temperature: 0.3
      })

      return JSON.parse(response.choices[0].message.content || '{}')
    } catch (error) {
      console.error('Error analyzing sentiment:', error)
      return {
        overall: 0,
        emotions: {
          satisfaction: 0,
          frustration: 0,
          urgency: 0,
          interest: 0,
          confusion: 0
        },
        confidence: 0
      }
    }
  }

  async analyzeConversation(chatId: number): Promise<ConversationSentiment> {
    // Fetch chat messages
    const supabase = await this.getSupabase()
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (error || !messages) {
      throw new Error('Failed to fetch chat messages')
    }

    const rawMessages = (messages || []) as ChatMessage[]
    const processedMessages = this.processMessages(rawMessages)
    const scores: SentimentScore[] = []
    const criticalMoments: ConversationSentiment['criticalMoments'] = []

    // Analyze each message
    for (let i = 0; i < processedMessages.length; i++) {
      const context = processedMessages.slice(Math.max(0, i - 3), i).map(m => m.content)
      const score = await this.analyzeMessage(processedMessages[i].content, context)
      scores.push(score)

      // Detect critical moments
      if (score.overall < -0.5 || score.emotions.frustration > 0.7) {
        criticalMoments.push({
          timestamp: new Date(processedMessages[i].created_at),
          message: processedMessages[i].content,
          score: score.overall,
          reason: this.getCriticalReason(score)
        })
      }
    }

    // Calculate average and trend
    const averageScore = scores.reduce((sum, s) => sum + s.overall, 0) / scores.length
    const trend = this.calculateTrend(scores)

    // Save to database (quando tabela conversation_analytics existir)
    await this.saveSentimentAnalysis(chatId, {
      chatId,
      scores,
      averageScore,
      trend,
      criticalMoments
    })

    return {
      chatId,
      scores,
      averageScore,
      trend,
      criticalMoments
    }
  }

  private calculateTrend(scores: SentimentScore[]): 'improving' | 'declining' | 'stable' {
    if (scores.length < 3) return 'stable'

    const firstThird = scores.slice(0, Math.floor(scores.length / 3))
    const lastThird = scores.slice(Math.floor(scores.length * 2 / 3))

    const firstAvg = firstThird.reduce((sum, s) => sum + s.overall, 0) / firstThird.length
    const lastAvg = lastThird.reduce((sum, s) => sum + s.overall, 0) / lastThird.length

    const difference = lastAvg - firstAvg

    if (difference > 0.2) return 'improving'
    if (difference < -0.2) return 'declining'
    return 'stable'
  }

  private getCriticalReason(score: SentimentScore): string {
    const reasons = []
    
    if (score.overall < -0.5) reasons.push('Very negative sentiment')
    if (score.emotions.frustration > 0.7) reasons.push('High frustration')
    if (score.emotions.confusion > 0.7) reasons.push('High confusion')
    if (score.emotions.urgency > 0.8) reasons.push('High urgency')
    
    return reasons.join(', ') || 'Critical moment detected'
  }

  private async saveSentimentAnalysis(chatId: number, analysis: ConversationSentiment) {
    // TODO: Criar tabela conversation_analytics quando necessário
    // Por enquanto apenas log
    console.log(`Sentiment analysis for chat ${chatId}:`, {
      averageScore: analysis.averageScore,
      trend: analysis.trend,
      criticalMomentsCount: analysis.criticalMoments.length
    })

    // Quando a tabela conversation_analytics for criada, descomentar:
    /*
    const supabase = await this.getSupabase()
    const { error } = await supabase
      .from('conversation_analytics')
      .upsert({
        chat_id: chatId,
        sentiment_data: analysis,
        average_sentiment: analysis.averageScore,
        sentiment_trend: analysis.trend,
        critical_moments_count: analysis.criticalMoments.length,
        analyzed_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error saving sentiment analysis:', error)
    }
    */
  }

  async getHistoricalTrends(accountId: string, period: 'day' | 'week' | 'month' = 'week') {
    // TODO: Implementar quando tabela conversation_analytics for criada
    console.log(`getHistoricalTrends - tabela conversation_analytics não existe ainda`)

    return {
      period,
      data: [],
      overallTrend: 'stable',
      insights: ['Análise histórica disponível após criação da tabela conversation_analytics']
    }

    /* Implementação quando conversation_analytics existir:
    const dateFilter = this.getDateFilter(period)

    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('conversation_analytics')
      .select('*')
      .eq('account_id', accountId)
      .gte('analyzed_at', dateFilter)
      .order('analyzed_at', { ascending: true })

    if (error || !data) {
      throw new Error('Failed to fetch historical trends')
    }

    const analyticsData = (data || []) as ConversationAnalytics[]

    // Group by date and calculate averages
    const grouped = this.groupByDate(analyticsData, period)

    return {
      period,
      data: grouped,
      overallTrend: this.calculateOverallTrend(grouped),
      insights: this.generateTrendInsights(grouped)
    }
    */
  }

  private getDateFilter(period: 'day' | 'week' | 'month'): string {
    const now = new Date()
    switch (period) {
      case 'day':
        now.setDate(now.getDate() - 1)
        break
      case 'week':
        now.setDate(now.getDate() - 7)
        break
      case 'month':
        now.setMonth(now.getMonth() - 1)
        break
    }
    return now.toISOString()
  }

  private groupByDate(data: ConversationAnalytics[], period: 'day' | 'week' | 'month'): ConversationAnalytics[] {
    // Implementation would group data by date based on period
    // Returns array of { date, averageSentiment, count, trend }
    return data
  }

  private calculateOverallTrend(grouped: ConversationAnalytics[]): string {
    // Calculate overall trend from grouped data
    return 'stable'
  }

  private generateTrendInsights(grouped: ConversationAnalytics[]): string[] {
    // Generate insights from trend data
    return [
      'Customer satisfaction is improving',
      'Peak frustration occurs on Mondays',
      'Response time affects sentiment significantly'
    ]
  }

  async detectEmotionalPatterns(accountId: string) {
    // TODO: Implementar quando tabela conversation_analytics for criada
    console.log(`detectEmotionalPatterns - tabela conversation_analytics não existe ainda`)

    return {
      peakFrustrationTimes: {
        hourOfDay: [],
        dayOfWeek: [],
        triggers: []
      },
      highSatisfactionTriggers: [],
      commonConfusionTopics: [],
      urgencyPatterns: {
        indicators: [],
        averageConversionRate: 0,
        bestResponseStrategy: 'Análise disponível após criação da tabela'
      }
    }

    /* Implementação quando conversation_analytics existir:
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('conversation_analytics')
      .select('sentiment_data')
      .eq('account_id', accountId)
      .gte('analyzed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (error || !data) {
      throw new Error('Failed to fetch emotional patterns')
    }

    const analyticsData = (data || []) as ConversationAnalytics[]

    const patterns = {
      peakFrustrationTimes: this.findPeakEmotionTimes(analyticsData, 'frustration'),
      highSatisfactionTriggers: this.findSatisfactionTriggers(analyticsData),
      commonConfusionTopics: this.findConfusionTopics(analyticsData),
      urgencyPatterns: this.findUrgencyPatterns(analyticsData)
    }

    return patterns
    */
  }

  private findPeakEmotionTimes(data: ConversationAnalytics[], emotion: string) {
    // Analyze when specific emotions peak
    return {
      hourOfDay: [14, 15, 16], // Example: 2-4 PM
      dayOfWeek: ['Monday', 'Friday'],
      triggers: ['wait time', 'pricing questions']
    }
  }

  private findSatisfactionTriggers(data: ConversationAnalytics[]): string[] {
    // Find what triggers high satisfaction
    return ['quick response', 'personalized recommendations', 'problem solved']
  }

  private findConfusionTopics(data: ConversationAnalytics[]): string[] {
    // Find topics that cause confusion
    return ['pricing structure', 'contract terms', 'availability']
  }

  private findUrgencyPatterns(data: ConversationAnalytics[]) {
    // Analyze urgency patterns
    return {
      indicators: ['preciso', 'urgente', 'hoje', 'agora'],
      averageConversionRate: 0.75,
      bestResponseStrategy: 'immediate callback'
    }
  }
}

const sentimentAnalyzer = new SentimentAnalyzer();
export default sentimentAnalyzer;