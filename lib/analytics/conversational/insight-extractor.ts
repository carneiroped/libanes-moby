import { createClient, type SupabaseClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { subDays, startOfDay, endOfDay } from 'date-fns'

interface ConversationInsight {
  type: 'topic' | 'objection' | 'question' | 'pattern' | 'opportunity'
  category: string
  description: string
  frequency: number
  impact: 'high' | 'medium' | 'low'
  examples: string[]
  recommendations: string[]
}

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
    currentAnswer?: string
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

export class InsightExtractor {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  private async getSupabase(): Promise<SupabaseClient> {
    return await createClient()
  }

  async extractInsights(
    accountId: string,
    period: number = 7 // days
  ): Promise<InsightSummary> {
    const startDate = startOfDay(subDays(new Date(), period))
    const endDate = endOfDay(new Date())

    // Fetch conversations for the period
    const conversations = await this.fetchConversationsWithMessages(
      accountId,
      startDate,
      endDate
    )

    // Extract different types of insights
    const [topics, objections, questions, patterns, trends] = await Promise.all([
      this.extractTopics(conversations),
      this.extractObjections(conversations),
      this.extractFrequentQuestions(conversations),
      this.extractBehaviorPatterns(conversations),
      this.extractEmergingTrends(conversations, period)
    ])

    const summary: InsightSummary = {
      topTopics: topics,
      commonObjections: objections,
      frequentQuestions: questions,
      behaviorPatterns: patterns,
      emergingTrends: trends
    }

    // Save insights to database
    await this.saveInsights(accountId, summary)

    return summary
  }

  private async fetchConversationsWithMessages(
    accountId: string,
    startDate: Date,
    endDate: Date
  ) {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages(*),
        lead:leads(*),
        property:properties(*)
      `)
      .eq('account_id', accountId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (error) {
      console.error('Error fetching conversations:', error)
      return []
    }

    return data || []
  }

  private async extractTopics(conversations: any[]) {
    // Concatenate all messages for topic extraction
    const allMessages = conversations.flatMap(conv => 
      (conv.messages || []).map((m: any) => m.content)
    ).join('\n\n')

    if (!allMessages) return []

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: `You are an expert at analyzing real estate conversations. 
          Extract the main topics discussed, their frequency, and sentiment.
          Focus on property-related topics, customer needs, and concerns.
          Return as JSON array with: topic, count, sentiment (-1 to 1), keywords.`
        }, {
          role: 'user',
          content: `Extract topics from these conversations:\n\n${allMessages.substring(0, 8000)}`
        }],
        response_format: { type: 'json_object' },
        temperature: 0.3
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return result.topics || []
    } catch (error) {
      console.error('Error extracting topics:', error)
      return []
    }
  }

  private async extractObjections(conversations: any[]) {
    const customerMessages = conversations.flatMap(conv => 
      (conv.messages || [])
        .filter((m: any) => m.sender_type === 'customer')
        .map((m: any) => ({
          content: m.content,
          conversationId: conv.id,
          resolved: conv.status === 'resolved'
        }))
    )

    if (!customerMessages.length) return []

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: `Identify common objections and concerns in real estate conversations.
          Focus on price objections, location concerns, property features, timing, etc.
          For each objection, analyze if it was resolved and suggest responses.
          Return as JSON array with: objection, frequency, resolutionRate, suggestedResponses.`
        }, {
          role: 'user',
          content: `Analyze these customer messages for objections:\n\n${JSON.stringify(customerMessages.slice(0, 50))}`
        }],
        response_format: { type: 'json_object' },
        temperature: 0.3
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return result.objections || []
    } catch (error) {
      console.error('Error extracting objections:', error)
      return []
    }
  }

  private async extractFrequentQuestions(conversations: any[]) {
    const questions = conversations.flatMap(conv => 
      (conv.messages || [])
        .filter((m: any) => m.sender_type === 'customer' && m.content.includes('?'))
        .map((m: any) => m.content)
    )

    if (!questions.length) return []

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: `Group similar questions together and identify the most frequent ones.
          For each question group, provide variations and suggested answers.
          Focus on real estate specific questions.
          Return as JSON array with: question, variations, count, suggestedAnswer.`
        }, {
          role: 'user',
          content: `Group these questions:\n\n${questions.slice(0, 100).join('\n')}`
        }],
        response_format: { type: 'json_object' },
        temperature: 0.3
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return result.questions || []
    } catch (error) {
      console.error('Error extracting questions:', error)
      return []
    }
  }

  private async extractBehaviorPatterns(conversations: any[]) {
    // Analyze conversation flows and user behaviors
    const conversationFlows = conversations.map(conv => ({
      duration: this.getConversationDuration(conv),
      messageCount: conv.messages?.length || 0,
      channel: conv.channel,
      timeOfDay: new Date(conv.created_at).getHours(),
      dayOfWeek: new Date(conv.created_at).getDay(),
      leadQuality: conv.lead?.score || 0,
      outcome: conv.status,
      propertyType: conv.property?.type
    }))

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: `Analyze user behavior patterns in real estate conversations.
          Identify patterns related to: engagement times, channel preferences, 
          conversation length vs outcome, lead quality indicators.
          Return as JSON array with: pattern, description, frequency, segments, opportunity.`
        }, {
          role: 'user',
          content: `Analyze these conversation patterns:\n\n${JSON.stringify(conversationFlows.slice(0, 100))}`
        }],
        response_format: { type: 'json_object' },
        temperature: 0.3
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return result.patterns || []
    } catch (error) {
      console.error('Error extracting patterns:', error)
      return []
    }
  }

  private async extractEmergingTrends(conversations: any[], period: number) {
    // Compare current period with previous period
    const midPoint = Math.floor(conversations.length / 2)
    const firstHalf = conversations.slice(0, midPoint)
    const secondHalf = conversations.slice(midPoint)

    const firstHalfTopics = await this.extractTopics(firstHalf)
    const secondHalfTopics = await this.extractTopics(secondHalf)

    // Calculate growth rates
    const trends = []
    for (const topic of secondHalfTopics) {
      const previousCount = firstHalfTopics.find((t: any) => t.topic === topic.topic)?.count || 0
      const growth = previousCount > 0
        ? ((topic.count - previousCount) / previousCount) * 100
        : 100

      if (growth > 20) { // Significant growth
        trends.push({
          trend: topic.topic,
          growth,
          timeframe: `${period} days`,
          implications: this.generateTrendImplications(topic.topic, growth)
        })
      }
    }

    return trends.sort((a, b) => b.growth - a.growth).slice(0, 5)
  }

  private getConversationDuration(conversation: any): number {
    const messages = conversation.messages || []
    if (messages.length < 2) return 0

    const first = new Date(messages[0].created_at)
    const last = new Date(messages[messages.length - 1].created_at)
    return (last.getTime() - first.getTime()) / (1000 * 60) // minutes
  }

  private generateTrendImplications(trend: string, growth: number): string[] {
    const implications = []
    
    if (trend.toLowerCase().includes('preço') || trend.toLowerCase().includes('valor')) {
      implications.push('Review pricing strategy and market positioning')
      implications.push('Prepare detailed value justification materials')
    }
    
    if (trend.toLowerCase().includes('financiamento')) {
      implications.push('Partner with financial institutions for better rates')
      implications.push('Create financing simulation tools')
    }
    
    if (growth > 50) {
      implications.push('Allocate more resources to address this growing concern')
      implications.push('Create dedicated content and FAQs')
    }
    
    return implications
  }

  private async saveInsights(accountId: string, insights: InsightSummary) {
    const supabase = await this.getSupabase()
    const { error } = await supabase
      .from('conversation_insights')
      .insert({
        account_id: accountId,
        insights_data: insights,
        extracted_at: new Date().toISOString(),
        period_days: 7,
        total_conversations_analyzed: insights.topTopics.reduce((sum, t) => sum + t.count, 0)
      })

    if (error) {
      console.error('Error saving insights:', error)
    }
  }

  async getActionableInsights(accountId: string): Promise<ConversationInsight[]> {
    const supabase = await this.getSupabase()
    const { data: latestInsights } = await supabase
      .from('conversation_insights')
      .select('*')
      .eq('account_id', accountId)
      .order('extracted_at', { ascending: false })
      .limit(1)
      .single()

    if (!latestInsights) return []

    const insights: ConversationInsight[] = []
    const insightData = latestInsights.insights_data as InsightSummary

    // Convert top topics to actionable insights
    insightData.topTopics.slice(0, 3).forEach(topic => {
      insights.push({
        type: 'topic',
        category: 'Popular Topic',
        description: `"${topic.topic}" is being discussed frequently`,
        frequency: topic.count,
        impact: topic.count > 20 ? 'high' : topic.count > 10 ? 'medium' : 'low',
        examples: topic.keywords,
        recommendations: [
          `Create detailed content about ${topic.topic}`,
          `Train agents on addressing ${topic.topic} questions`,
          `Update FAQ section with ${topic.topic} information`
        ]
      })
    })

    // Convert objections to insights
    insightData.commonObjections.slice(0, 3).forEach(objection => {
      insights.push({
        type: 'objection',
        category: 'Common Objection',
        description: objection.objection,
        frequency: objection.frequency,
        impact: objection.resolutionRate < 0.5 ? 'high' : 'medium',
        examples: [],
        recommendations: objection.suggestedResponses
      })
    })

    // Convert patterns to insights
    insightData.behaviorPatterns.slice(0, 2).forEach(pattern => {
      insights.push({
        type: 'pattern',
        category: 'Behavior Pattern',
        description: pattern.description,
        frequency: pattern.frequency,
        impact: 'medium',
        examples: pattern.segments,
        recommendations: [pattern.opportunity]
      })
    })

    // Add emerging trends
    insightData.emergingTrends.slice(0, 2).forEach(trend => {
      insights.push({
        type: 'opportunity',
        category: 'Emerging Trend',
        description: `${trend.trend} is growing ${trend.growth.toFixed(0)}%`,
        frequency: 0,
        impact: 'high',
        examples: [],
        recommendations: trend.implications
      })
    })

    return insights
  }

  async getInsightHistory(accountId: string, limit: number = 10) {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('conversation_insights')
      .select('*')
      .eq('account_id', accountId)
      .order('extracted_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching insight history:', error)
      return []
    }

    return data || []
  }

  async compareInsightPeriods(accountId: string, periodDays: number = 7) {
    const current = await this.extractInsights(accountId, periodDays)
    const previous = await this.extractInsights(accountId, periodDays * 2)

    // Extract insights from the previous period (older half)
    const previousFiltered = {
      topTopics: previous.topTopics.filter((t, i) => i >= previous.topTopics.length / 2),
      commonObjections: previous.commonObjections.filter((o, i) => i >= previous.commonObjections.length / 2),
      frequentQuestions: previous.frequentQuestions.filter((q, i) => i >= previous.frequentQuestions.length / 2)
    }

    return {
      current,
      previous: previousFiltered,
      changes: {
        newTopics: current.topTopics.filter(ct => 
          !previousFiltered.topTopics.find(pt => pt.topic === ct.topic)
        ),
        resolvedObjections: previousFiltered.commonObjections.filter(po =>
          !current.commonObjections.find(co => co.objection === po.objection)
        ),
        newQuestions: current.frequentQuestions.filter(cq =>
          !previousFiltered.frequentQuestions.find(pq => pq.question === cq.question)
        )
      }
    }
  }
}

const insightExtractor = new InsightExtractor();
export default insightExtractor;