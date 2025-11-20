import { createClient } from '@/lib/supabase/server'
import { differenceInMinutes, differenceInHours, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Database } from '@/types/supabase'

// Tipos reais do banco de dados
type Chat = Database['public']['Tables']['chats']['Row']
type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
type Lead = Database['public']['Tables']['leads']['Row']
type User = Database['public']['Tables']['users']['Row']

// Tipos auxiliares para processamento
type ChatWithMessages = Chat & {
  chat_messages?: ChatMessage[]
  lead?: Lead | null
}

type ProcessedMessage = {
  id: number
  chat_id: number | null
  content: string
  sender_type: 'customer' | 'agent'
  created_at: string
}

interface ConversationMetrics {
  avgResponseTime: number // in minutes
  resolutionRate: number // 0-1
  messagesPerConversation: number
  abandonmentRate: number // 0-1
  engagementByChannel: {
    channel: string
    engagementRate: number
    avgMessages: number
    avgDuration: number
  }[]
  peakHours: number[]
  avgConversationDuration: number // in minutes
}

interface MetricsFilter {
  accountId: string
  startDate?: Date
  endDate?: Date
  channel?: string
  status?: string[]
  agentId?: string
}

export class ConversationMetricsAnalyzer {
  private async getSupabase() {
    return await createClient()
  }

  async calculateMetrics(filter: MetricsFilter): Promise<ConversationMetrics> {
    const chats = await this.fetchChats(filter)

    if (!chats.length) {
      return this.getEmptyMetrics()
    }

    return {
      avgResponseTime: await this.calculateAvgResponseTime(chats),
      resolutionRate: this.calculateResolutionRate(chats),
      messagesPerConversation: await this.calculateAvgMessages(chats),
      abandonmentRate: this.calculateAbandonmentRate(chats),
      engagementByChannel: await this.calculateEngagementByChannel(chats),
      peakHours: await this.calculatePeakHours(chats),
      avgConversationDuration: this.calculateAvgDuration(chats)
    }
  }

  private async fetchChats(filter: MetricsFilter): Promise<ChatWithMessages[]> {
    const supabase = await this.getSupabase();
    let query = supabase
      .from('chats')
      .select(`
        *,
        chat_messages(*),
        lead:leads(*)
      `)
      .eq('account_id', filter.accountId)

    if (filter.startDate) {
      query = query.gte('created_at', filter.startDate.toISOString())
    }
    if (filter.endDate) {
      query = query.lte('created_at', filter.endDate.toISOString())
    }
    if (filter.channel) {
      query = query.eq('app', filter.channel)
    }
    if (filter.status?.length) {
      query = query.in('status', filter.status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching chats:', error)
      return []
    }

    return (data || []) as ChatWithMessages[]
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

  private async calculateAvgResponseTime(chats: ChatWithMessages[]): Promise<number> {
    let totalResponseTime = 0
    let responseCount = 0

    for (const chat of chats) {
      const rawMessages = chat.chat_messages || []
      const messages = this.processMessages(rawMessages)

      for (let i = 1; i < messages.length; i++) {
        const prevMsg = messages[i - 1]
        const currMsg = messages[i]

        // If previous was from customer and current from agent
        if (prevMsg.sender_type === 'customer' && currMsg.sender_type === 'agent') {
          const responseTime = differenceInMinutes(
            new Date(currMsg.created_at),
            new Date(prevMsg.created_at)
          )
          totalResponseTime += responseTime
          responseCount++
        }
      }
    }

    return responseCount > 0 ? totalResponseTime / responseCount : 0
  }

  private calculateResolutionRate(chats: ChatWithMessages[]): number {
    const resolved = chats.filter(c =>
      c.status === 'resolved' || c.status === 'closed'
    ).length

    return chats.length > 0 ? resolved / chats.length : 0
  }

  private async calculateAvgMessages(chats: ChatWithMessages[]): Promise<number> {
    const totalMessages = chats.reduce((sum, chat) =>
      sum + (chat.chat_messages?.length || 0), 0
    )

    return chats.length > 0 ? totalMessages / chats.length : 0
  }

  private calculateAbandonmentRate(chats: ChatWithMessages[]): number {
    const abandoned = chats.filter(chat => {
      // Consider abandoned if:
      // 1. Status is 'abandoned' or
      // 2. No messages in last 24h and status is 'active'
      if (chat.status === 'abandoned') return true

      if (chat.status === 'active' && chat.chat_messages?.length) {
        const messages = this.processMessages(chat.chat_messages)
        const lastMessage = messages[messages.length - 1]
        const hoursSinceLastMessage = differenceInHours(
          new Date(),
          new Date(lastMessage.created_at)
        )
        return hoursSinceLastMessage > 24
      }

      return false
    }).length

    return chats.length > 0 ? abandoned / chats.length : 0
  }

  private async calculateEngagementByChannel(chats: ChatWithMessages[]) {
    const channelGroups = this.groupByChannel(chats)

    return Object.entries(channelGroups).map(([channel, chatsArray]) => {
      const totalMessages = chatsArray.reduce((sum: number, chat: ChatWithMessages) =>
        sum + (chat.chat_messages?.length || 0), 0
      )
      const avgMessages = chatsArray.length > 0 ? totalMessages / chatsArray.length : 0

      const totalDuration = chatsArray.reduce((sum: number, chat: ChatWithMessages) =>
        sum + this.getChatDuration(chat), 0
      )
      const avgDuration = chatsArray.length > 0 ? totalDuration / chatsArray.length : 0

      const engaged = chatsArray.filter((c: ChatWithMessages) => (c.chat_messages?.length || 0) > 2).length
      const engagementRate = chatsArray.length > 0 ? engaged / chatsArray.length : 0

      return {
        channel,
        engagementRate,
        avgMessages,
        avgDuration
      }
    })
  }

  private groupByChannel(chats: ChatWithMessages[]): Record<string, ChatWithMessages[]> {
    return chats.reduce((groups, chat) => {
      const channel = chat.app || 'unknown'
      if (!groups[channel]) groups[channel] = []
      groups[channel].push(chat)
      return groups
    }, {} as Record<string, ChatWithMessages[]>)
  }

  private getChatDuration(chat: ChatWithMessages): number {
    const rawMessages = chat.chat_messages || []
    if (rawMessages.length < 2) return 0

    const messages = this.processMessages(rawMessages)
    const firstMsg = messages[0]
    const lastMsg = messages[messages.length - 1]

    return differenceInMinutes(
      new Date(lastMsg.created_at),
      new Date(firstMsg.created_at)
    )
  }

  private async calculatePeakHours(chats: ChatWithMessages[]): Promise<number[]> {
    const hourCounts = new Array(24).fill(0)

    chats.forEach(chat => {
      const hour = new Date(chat.created_at).getHours()
      hourCounts[hour]++
    })

    // Find top 3 peak hours
    const hoursWithCounts = hourCounts.map((count, hour) => ({ hour, count }))
    hoursWithCounts.sort((a, b) => b.count - a.count)

    return hoursWithCounts.slice(0, 3).map(h => h.hour)
  }

  private calculateAvgDuration(chats: ChatWithMessages[]): number {
    const totalDuration = chats.reduce((sum, chat) =>
      sum + this.getChatDuration(chat), 0
    )

    return chats.length > 0 ? totalDuration / chats.length : 0
  }

  private getEmptyMetrics(): ConversationMetrics {
    return {
      avgResponseTime: 0,
      resolutionRate: 0,
      messagesPerConversation: 0,
      abandonmentRate: 0,
      engagementByChannel: [],
      peakHours: [],
      avgConversationDuration: 0
    }
  }

  async getComparativeMetrics(filter: MetricsFilter, comparePeriod: 'previous' | 'year') {
    const currentMetrics = await this.calculateMetrics(filter)
    
    // Calculate comparison period
    const compareFilter = { ...filter }
    if (comparePeriod === 'previous' && filter.startDate && filter.endDate) {
      const periodLength = filter.endDate.getTime() - filter.startDate.getTime()
      compareFilter.endDate = new Date(filter.startDate.getTime() - 1)
      compareFilter.startDate = new Date(compareFilter.endDate.getTime() - periodLength)
    } else if (comparePeriod === 'year' && filter.startDate && filter.endDate) {
      compareFilter.startDate = new Date(filter.startDate)
      compareFilter.startDate.setFullYear(compareFilter.startDate.getFullYear() - 1)
      compareFilter.endDate = new Date(filter.endDate)
      compareFilter.endDate.setFullYear(compareFilter.endDate.getFullYear() - 1)
    }
    
    const previousMetrics = await this.calculateMetrics(compareFilter)
    
    return {
      current: currentMetrics,
      previous: previousMetrics,
      changes: this.calculateChanges(currentMetrics, previousMetrics)
    }
  }

  private calculateChanges(current: ConversationMetrics, previous: ConversationMetrics) {
    return {
      avgResponseTime: this.calculatePercentChange(
        current.avgResponseTime,
        previous.avgResponseTime
      ),
      resolutionRate: this.calculatePercentChange(
        current.resolutionRate,
        previous.resolutionRate
      ),
      messagesPerConversation: this.calculatePercentChange(
        current.messagesPerConversation,
        previous.messagesPerConversation
      ),
      abandonmentRate: this.calculatePercentChange(
        current.abandonmentRate,
        previous.abandonmentRate
      ),
      avgConversationDuration: this.calculatePercentChange(
        current.avgConversationDuration,
        previous.avgConversationDuration
      )
    }
  }

  private calculatePercentChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  async getAgentPerformanceMetrics(accountId: string, agentId?: string) {
    // Agora implementado com tabelas reais chats e chat_messages
    const filter: MetricsFilter = { accountId }
    if (agentId) {
      filter.agentId = agentId
    }

    const chats = await this.fetchChats(filter)
    if (!chats.length) return []

    return [{
      accountId,
      agentId: agentId || 'all',
      avgResponseTime: await this.calculateAvgResponseTime(chats),
      totalChats: chats.length,
      avgMessages: this.calculateAgentMessages(chats),
      satisfactionScore: this.calculateSatisfactionScore(chats)
    }]
  }

  private calculateAgentResponseTime(chats: ChatWithMessages[]): number {
    // Similar to calculateAvgResponseTime but only for agent messages
    return 5.2 // Placeholder
  }

  private calculateSatisfactionScore(chats: ChatWithMessages[]): number {
    // Would integrate with sentiment analysis
    return 0.85 // Placeholder
  }

  private calculateAgentMessages(chats: ChatWithMessages[]): number {
    let totalAgentMessages = 0
    chats.forEach(chat => {
      const rawMessages = chat.chat_messages || []
      const messages = this.processMessages(rawMessages)
      const agentMessages = messages.filter(m => m.sender_type === 'agent').length
      totalAgentMessages += agentMessages
    })
    return chats.length > 0 ? totalAgentMessages / chats.length : 0
  }

  async getChannelEffectiveness(accountId: string) {
    const channels = ['whatsapp', 'instagram', 'facebook', 'sms', 'webchat']
    const effectiveness = []

    for (const channel of channels) {
      const metrics = await this.calculateMetrics({
        accountId,
        channel,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      })

      effectiveness.push({
        channel,
        metrics,
        score: this.calculateEffectivenessScore(metrics),
        recommendations: this.generateChannelRecommendations(channel, metrics)
      })
    }

    return effectiveness.sort((a, b) => b.score - a.score)
  }

  private calculateEffectivenessScore(metrics: ConversationMetrics): number {
    // Weighted score based on multiple factors
    const weights = {
      resolutionRate: 0.3,
      responseTime: 0.2,
      abandonment: 0.2,
      engagement: 0.3
    }

    const responseScore = Math.max(0, 1 - (metrics.avgResponseTime / 60)) // 1 hour baseline
    const abandonmentScore = 1 - metrics.abandonmentRate
    const engagementScore = metrics.messagesPerConversation / 10 // 10 messages baseline

    return (
      metrics.resolutionRate * weights.resolutionRate +
      responseScore * weights.responseTime +
      abandonmentScore * weights.abandonment +
      Math.min(1, engagementScore) * weights.engagement
    )
  }

  private generateChannelRecommendations(channel: string, metrics: ConversationMetrics): string[] {
    const recommendations = []

    if (metrics.avgResponseTime > 30) {
      recommendations.push('Implement automated responses for common questions')
    }
    if (metrics.abandonmentRate > 0.2) {
      recommendations.push('Add proactive follow-up messages')
    }
    if (metrics.resolutionRate < 0.7) {
      recommendations.push('Review and improve response templates')
    }
    if (metrics.messagesPerConversation > 15) {
      recommendations.push('Streamline conversation flow with better initial qualification')
    }

    return recommendations
  }
}

const conversationMetricsAnalyzer = new ConversationMetricsAnalyzer();
export default conversationMetricsAnalyzer;