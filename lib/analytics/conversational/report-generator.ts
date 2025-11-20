import { createClient } from '@/lib/supabase/server'
import { format, startOfDay, endOfDay, subDays, startOfWeek, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Database } from '@/types/supabase'
// import * as XLSX from 'xlsx'
// import jsPDF from 'jspdf'
// import 'jspdf-autotable'
import sentimentAnalyzer from './sentiment-analyzer'
import conversationMetrics from './conversation-metrics'
import insightExtractor from './insight-extractor'

// Extend jsPDF types
// declare module 'jspdf' {
//   interface jsPDF {
//     autoTable: (options: any) => jsPDF
//   }
// }

// TODO: Instalar dependências: npm install xlsx jspdf jspdf-autotable @types/jspdf
const XLSX: unknown = null;
const jsPDF: unknown = null;

// TODO: Criar tabelas analytics_reports, scheduled_reports no banco de dados
// Tipos temporários até as tabelas serem criadas
type AnalyticsReport = {
  id: string
  account_id: string
  report_type: string
  start_date: string
  end_date: string
  file_url?: string | null
  metadata?: unknown
  generated_at?: string
}

type ScheduledReport = {
  id: string
  account_id: string
  frequency: string
  time: string
  day_of_week?: number | null
  day_of_month?: number | null
  report_config?: unknown
  recipients?: string[]
  is_active?: boolean
  created_at?: string
}

interface ReportConfig {
  accountId: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  startDate?: Date
  endDate?: Date
  includeMetrics: boolean
  includeSentiment: boolean
  includeInsights: boolean
  includeRecommendations: boolean
  format: 'pdf' | 'excel' | 'json'
}

interface ReportMetrics {
  avgResponseTime: number
  resolutionRate: number
  messagesPerConversation: number
  abandonmentRate: number
  avgConversationDuration: number
  engagementByChannel?: Array<{
    channel: string
    engagementRate: number
    avgMessages: number
    avgDuration: number
  }>
}

interface ReportSentiment {
  overallTrend: string
}

interface ReportInsight {
  topTopics?: Array<{
    topic: string
    count: number
    sentiment: number
  }>
  commonObjections?: Array<{
    objection: string
    frequency: number
    resolutionRate: number
  }>
  emergingTrends?: Array<{
    trend: string
    growth: number
    implications: string[]
  }>
  frequentQuestions?: Array<{
    question: string
  }>
}

interface GeneratedReport {
  id: string
  accountId: string
  period: {
    type: string
    startDate: Date
    endDate: Date
  }
  metrics?: ReportMetrics
  sentiment?: ReportSentiment
  insights?: ReportInsight
  recommendations?: string[]
  generatedAt: Date
  fileUrl?: string
}

export class ReportGenerator {
  private async getSupabase() {
    return await createClient()
  }

  async generateReport(config: ReportConfig): Promise<GeneratedReport> {
    // Determine date range
    const { startDate, endDate } = this.getDateRange(config)

    // Collect data based on config
    const reportData: GeneratedReport = {
      id: `report_${Date.now()}`,
      accountId: config.accountId,
      period: {
        type: config.type,
        startDate,
        endDate
      },
      generatedAt: new Date()
    }

    // Fetch requested data in parallel
    const promises: Promise<void>[] = []

    if (config.includeMetrics) {
      promises.push(
        conversationMetrics.calculateMetrics({
          accountId: config.accountId,
          startDate,
          endDate
        }).then(metrics => { reportData.metrics = metrics })
      )
    }

    if (config.includeSentiment) {
      promises.push(
        sentimentAnalyzer.getHistoricalTrends(config.accountId, config.type as 'day' | 'week' | 'month')
          .then(sentiment => { reportData.sentiment = sentiment })
      )
    }

    if (config.includeInsights) {
      promises.push(
        insightExtractor.extractInsights(
          config.accountId,
          Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        ).then(insights => { reportData.insights = insights })
      )
    }

    await Promise.all(promises)

    // Generate recommendations
    if (config.includeRecommendations) {
      reportData.recommendations = this.generateRecommendations(reportData)
    }

    // Generate file based on format
    let fileUrl
    switch (config.format) {
      case 'pdf':
        fileUrl = await this.generatePDF(reportData)
        break
      case 'excel':
        fileUrl = await this.generateExcel(reportData)
        break
      case 'json':
        fileUrl = await this.saveJSON(reportData)
        break
    }

    reportData.fileUrl = fileUrl

    // Save report metadata
    await this.saveReportMetadata(reportData)

    return reportData
  }

  private getDateRange(config: ReportConfig): { startDate: Date; endDate: Date } {
    const now = new Date()
    let startDate: Date
    let endDate: Date = endOfDay(now)

    switch (config.type) {
      case 'daily':
        startDate = startOfDay(now)
        break
      case 'weekly':
        startDate = startOfWeek(now, { locale: ptBR })
        break
      case 'monthly':
        startDate = startOfMonth(now)
        break
      case 'custom':
        startDate = config.startDate || subDays(now, 7)
        endDate = config.endDate || now
        break
      default:
        startDate = subDays(now, 7)
    }

    return { startDate, endDate }
  }

  private generateRecommendations(data: GeneratedReport): string[] {
    const recommendations: string[] = []

    // Metrics-based recommendations
    if (data.metrics) {
      if (data.metrics.avgResponseTime > 30) {
        recommendations.push(
          'Response time is above 30 minutes. Consider implementing automated responses or increasing agent availability.'
        )
      }
      if (data.metrics.abandonmentRate > 0.2) {
        recommendations.push(
          'High abandonment rate detected. Implement proactive follow-ups for inactive conversations.'
        )
      }
      if (data.metrics.resolutionRate < 0.7) {
        recommendations.push(
          'Resolution rate is below 70%. Review agent training and response templates.'
        )
      }
    }

    // Sentiment-based recommendations
    if (data.sentiment) {
      if (data.sentiment.overallTrend === 'declining') {
        recommendations.push(
          'Customer sentiment is declining. Review recent interactions and address common pain points.'
        )
      }
    }

    // Insights-based recommendations
    if (data.insights) {
      data.insights.commonObjections?.slice(0, 2).forEach((objection) => {
        if (objection.resolutionRate < 0.5) {
          recommendations.push(
            `Low resolution rate for objection: "${objection.objection}". Train agents on effective responses.`
          )
        }
      })

      data.insights.emergingTrends?.slice(0, 2).forEach((trend) => {
        recommendations.push(
          `Emerging trend detected: ${trend.trend} (${trend.growth.toFixed(0)}% growth). ${trend.implications[0]}`
        )
      })
    }

    return recommendations
  }

  private async generatePDF(data: GeneratedReport): Promise<string> {
    // TODO: Instalar jsPDF antes de usar - npm install jspdf jspdf-autotable @types/jspdf
    console.log('generatePDF - jsPDF não instalado ainda')
    return ''

    // Código comentado até jsPDF ser instalado:
    /*
    const doc = new jsPDF()
    let yPosition = 20

    // Header
    doc.setFontSize(20)
    doc.text('Relatório de Analytics Conversacional', 20, yPosition)
    yPosition += 10

    doc.setFontSize(12)
    doc.text(
      `Período: ${format(data.period.startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(data.period.endDate, 'dd/MM/yyyy', { locale: ptBR })}`,
      20,
      yPosition
    )
    yPosition += 20

    // Metrics Section
    if (data.metrics) {
      doc.setFontSize(16)
      doc.text('Métricas Principais', 20, yPosition)
      yPosition += 10

      const metricsData = [
        ['Métrica', 'Valor'],
        ['Tempo Médio de Resposta', `${data.metrics.avgResponseTime.toFixed(1)} min`],
        ['Taxa de Resolução', `${(data.metrics.resolutionRate * 100).toFixed(1)}%`],
        ['Mensagens por Conversa', data.metrics.messagesPerConversation.toFixed(1)],
        ['Taxa de Abandono', `${(data.metrics.abandonmentRate * 100).toFixed(1)}%`],
        ['Duração Média', `${data.metrics.avgConversationDuration.toFixed(1)} min`]
      ]

      doc.autoTable({
        startY: yPosition,
        head: [metricsData[0]],
        body: metricsData.slice(1),
        theme: 'grid'
      })

      yPosition = (doc.lastAutoTable?.finalY || yPosition) + 20
    }

    // Sentiment Section
    if (data.sentiment && yPosition < 250) {
      doc.setFontSize(16)
      doc.text('Análise de Sentimento', 20, yPosition)
      yPosition += 10

      doc.setFontSize(12)
      doc.text(`Tendência: ${data.sentiment.overallTrend}`, 20, yPosition)
      yPosition += 20
    }

    // Insights Section
    if (data.insights && yPosition < 250) {
      doc.setFontSize(16)
      doc.text('Principais Insights', 20, yPosition)
      yPosition += 10

      data.insights.topTopics?.slice(0, 3).forEach((topic) => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }
        doc.setFontSize(12)
        doc.text(`• ${topic.topic} (${topic.count} menções)`, 25, yPosition)
        yPosition += 7
      })
    }

    // Recommendations
    if (data.recommendations && data.recommendations.length > 0) {
      if (yPosition > 220) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(16)
      doc.text('Recomendações', 20, yPosition)
      yPosition += 10

      data.recommendations.forEach((rec) => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }
        doc.setFontSize(11)
        const lines = doc.splitTextToSize(rec, 170)
        doc.text(lines, 25, yPosition)
        yPosition += lines.length * 5 + 5
      })
    }

    // Save to buffer and upload
    const pdfBuffer = doc.output('arraybuffer')
    const fileName = `report_${data.accountId}_${Date.now()}.pdf`

    const supabase = await this.getSupabase()
    const { error } = await supabase.storage
      .from('reports')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (error) {
      console.error('Error uploading PDF:', error)
      return ''
    }

    const { data: { publicUrl } } = supabase.storage
      .from('reports')
      .getPublicUrl(fileName)

    return publicUrl
    */
  }

  private async generateExcel(data: GeneratedReport): Promise<string> {
    // TODO: Instalar XLSX antes de usar - npm install xlsx
    console.log('generateExcel - XLSX não instalado ainda')
    return ''

    // Código comentado até XLSX ser instalado:
    /*
    const workbook = XLSX.utils.book_new()

    // Summary Sheet
    const summaryData = [
      ['Relatório de Analytics Conversacional'],
      [''],
      ['Período', `${format(data.period.startDate, 'dd/MM/yyyy')} - ${format(data.period.endDate, 'dd/MM/yyyy')}`],
      ['Gerado em', format(data.generatedAt, 'dd/MM/yyyy HH:mm')],
      [''],
      ['Resumo Executivo']
    ]

    if (data.recommendations) {
      data.recommendations.forEach(rec => {
        summaryData.push(['• ' + rec])
      })
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo')

    // Metrics Sheet
    if (data.metrics) {
      const metricsData = [
        ['Métricas de Conversação'],
        [''],
        ['Métrica', 'Valor', 'Unidade'],
        ['Tempo Médio de Resposta', data.metrics.avgResponseTime.toFixed(2), 'minutos'],
        ['Taxa de Resolução', (data.metrics.resolutionRate * 100).toFixed(2), '%'],
        ['Mensagens por Conversa', data.metrics.messagesPerConversation.toFixed(2), 'mensagens'],
        ['Taxa de Abandono', (data.metrics.abandonmentRate * 100).toFixed(2), '%'],
        ['Duração Média da Conversa', data.metrics.avgConversationDuration.toFixed(2), 'minutos'],
        [''],
        ['Engajamento por Canal'],
        ['Canal', 'Taxa de Engajamento', 'Mensagens Médias', 'Duração Média']
      ]

      data.metrics.engagementByChannel?.forEach((channel) => {
        metricsData.push([
          channel.channel,
          (channel.engagementRate * 100).toFixed(2) + '%',
          channel.avgMessages.toFixed(2),
          channel.avgDuration.toFixed(2) + ' min'
        ])
      })

      const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData)
      XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Métricas')
    }

    // Insights Sheet
    if (data.insights) {
      const insightsData = [
        ['Insights Extraídos'],
        [''],
        ['Tópicos Mais Discutidos'],
        ['Tópico', 'Frequência', 'Sentimento']
      ]

      data.insights.topTopics?.forEach((topic) => {
        insightsData.push([
          topic.topic,
          topic.count.toString(),
          topic.sentiment.toFixed(2)
        ])
      })

      insightsData.push([''], ['Objeções Comuns'], ['Objeção', 'Frequência', 'Taxa de Resolução'])

      data.insights.commonObjections?.forEach((objection) => {
        insightsData.push([
          objection.objection,
          objection.frequency.toString(),
          (objection.resolutionRate * 100).toFixed(2) + '%'
        ])
      })

      const insightsSheet = XLSX.utils.aoa_to_sheet(insightsData)
      XLSX.utils.book_append_sheet(workbook, insightsSheet, 'Insights')
    }

    // Generate buffer and upload
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const fileName = `report_${data.accountId}_${Date.now()}.xlsx`

    const supabase = await this.getSupabase()
    const { error } = await supabase.storage
      .from('reports')
      .upload(fileName, excelBuffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: false
      })

    if (error) {
      console.error('Error uploading Excel:', error)
      return ''
    }

    const { data: { publicUrl } } = supabase.storage
      .from('reports')
      .getPublicUrl(fileName)

    return publicUrl
    */
  }

  private async saveJSON(data: GeneratedReport): Promise<string> {
    // TODO: Implementar storage quando necessário
    console.log('saveJSON - Storage não configurado ainda')
    return ''

    // Código comentado até storage ser configurado:
    /*
    const fileName = `report_${data.accountId}_${Date.now()}.json`
    const jsonString = JSON.stringify(data, null, 2)

    const supabase = await this.getSupabase()
    const { error } = await supabase.storage
      .from('reports')
      .upload(fileName, jsonString, {
        contentType: 'application/json',
        upsert: false
      })

    if (error) {
      console.error('Error uploading JSON:', error)
      return ''
    }

    const { data: { publicUrl } } = supabase.storage
      .from('reports')
      .getPublicUrl(fileName)

    return publicUrl
    */
  }

  private async saveReportMetadata(report: GeneratedReport) {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('analytics_reports')
      .insert({
        id: report.id,
        account_id: report.accountId,
        report_type: report.period.type,
        start_date: report.period.startDate.toISOString(),
        end_date: report.period.endDate.toISOString(),
        file_url: report.fileUrl,
        metadata: {
          hasMetrics: !!report.metrics,
          hasSentiment: !!report.sentiment,
          hasInsights: !!report.insights,
          recommendationsCount: report.recommendations?.length || 0
        },
        generated_at: report.generatedAt.toISOString()
      })

    if (error) {
      console.error('Error saving report metadata:', error)
    }
  }

  async scheduleReport(config: {
    accountId: string
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string // HH:mm format
    dayOfWeek?: number // 0-6 for weekly
    dayOfMonth?: number // 1-31 for monthly
    reportConfig: Omit<ReportConfig, 'accountId' | 'type'>
    recipients: string[]
  }) {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('scheduled_reports')
      .insert({
        account_id: config.accountId,
        frequency: config.frequency,
        time: config.time,
        day_of_week: config.dayOfWeek,
        day_of_month: config.dayOfMonth,
        report_config: config.reportConfig,
        recipients: config.recipients,
        is_active: true,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error scheduling report:', error)
      throw error
    }

    return { success: true, message: 'Report scheduled successfully' }
  }

  async getScheduledReports(accountId: string): Promise<ScheduledReport[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('account_id', accountId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching scheduled reports:', error)
      return []
    }

    return (data || []) as ScheduledReport[]
  }

  async getReportHistory(accountId: string, limit: number = 10): Promise<AnalyticsReport[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('analytics_reports')
      .select('*')
      .eq('account_id', accountId)
      .order('generated_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching report history:', error)
      return []
    }

    return (data || []) as AnalyticsReport[]
  }

  async compareReports(reportId1: string, reportId2: string) {
    const [report1, report2] = await Promise.all([
      this.getReportById(reportId1),
      this.getReportById(reportId2)
    ])

    if (!report1 || !report2) {
      throw new Error('One or both reports not found')
    }

    // Compare metrics
    const metricsComparison = this.compareMetrics(report1.metadata as ReportMetrics, report2.metadata as ReportMetrics)

    // Compare insights
    const insightsComparison = this.compareInsights(report1.metadata as ReportInsight, report2.metadata as ReportInsight)

    return {
      report1: {
        id: report1.id,
        period: {
          type: report1.report_type,
          startDate: report1.start_date,
          endDate: report1.end_date
        }
      },
      report2: {
        id: report2.id,
        period: {
          type: report2.report_type,
          startDate: report2.start_date,
          endDate: report2.end_date
        }
      },
      comparison: {
        metrics: metricsComparison,
        insights: insightsComparison
      }
    }
  }

  private async getReportById(reportId: string): Promise<AnalyticsReport | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('analytics_reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (error) {
      console.error('Error fetching report:', error)
      return null
    }

    return data as AnalyticsReport
  }

  private compareMetrics(metrics1: ReportMetrics | null, metrics2: ReportMetrics | null) {
    if (!metrics1 || !metrics2) return null

    return {
      avgResponseTime: {
        value1: metrics1.avgResponseTime,
        value2: metrics2.avgResponseTime,
        change: ((metrics2.avgResponseTime - metrics1.avgResponseTime) / metrics1.avgResponseTime) * 100
      },
      resolutionRate: {
        value1: metrics1.resolutionRate,
        value2: metrics2.resolutionRate,
        change: ((metrics2.resolutionRate - metrics1.resolutionRate) / metrics1.resolutionRate) * 100
      },
      abandonmentRate: {
        value1: metrics1.abandonmentRate,
        value2: metrics2.abandonmentRate,
        change: ((metrics2.abandonmentRate - metrics1.abandonmentRate) / metrics1.abandonmentRate) * 100
      }
    }
  }

  private compareInsights(insights1: ReportInsight | null, insights2: ReportInsight | null) {
    if (!insights1 || !insights2) return null

    return {
      newTopics: insights2.topTopics?.filter((t2) =>
        !insights1.topTopics?.find((t1) => t1.topic === t2.topic)
      ),
      resolvedObjections: insights1.commonObjections?.filter((o1) =>
        !insights2.commonObjections?.find((o2) => o1.objection === o2.objection)
      ),
      persistentQuestions: insights1.frequentQuestions?.filter((q1) =>
        insights2.frequentQuestions?.find((q2) => q1.question === q2.question)
      )
    }
  }
}

const reportGenerator = new ReportGenerator();
export default reportGenerator;