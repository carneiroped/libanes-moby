/**
 * API Route: Sparklines
 * GET /api/analytics/sparklines
 *
 * Retorna dados para mini-gráficos de tendência de métricas
 * Dados REAIS do Supabase - SEM MOCKS
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/service-role'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accountId = searchParams.get('account_id')
    const metricsParam = searchParams.get('metrics') // comma-separated: "totalLeads,activeLeads,conversionRate"
    const period = searchParams.get('period') || 'week' // week, month

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id é obrigatório' },
        { status: 400 }
      )
    }

    if (!metricsParam) {
      return NextResponse.json(
        { error: 'metrics é obrigatório (ex: totalLeads,activeLeads)' },
        { status: 400 }
      )
    }

    const metricsRequested = metricsParam.split(',')

    // Determinar número de pontos e intervalo
    const points = period === 'week' ? 7 : 30
    const now = new Date()
    const startDate = new Date(now.getTime() - points * 24 * 60 * 60 * 1000)

    // Buscar todos os leads criados no período
    const { data: allLeads, error } = await supabaseAdmin
      .from('leads')
      .select('id, created_at, status, stage, archived')
      .eq('account_id', accountId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erro ao buscar leads:', error)
      return NextResponse.json(
        { error: 'Falha ao buscar leads', details: error.message },
        { status: 500 }
      )
    }

    // Agrupar leads por data
    const leadsByDate: Record<string, any[]> = {}
    allLeads?.forEach((lead: any) => {
      const date = new Date(lead.created_at).toISOString().split('T')[0]
      if (!leadsByDate[date]) {
        leadsByDate[date] = []
      }
      leadsByDate[date].push(lead)
    })

    // Gerar dados para cada métrica solicitada
    const sparklines: Record<string, any> = {}

    metricsRequested.forEach(metricKey => {
      const dataPoints: Array<{ date: string; value: number }> = []
      const currentDate = new Date(startDate)

      for (let i = 0; i < points; i++) {
        const dateStr = currentDate.toISOString().split('T')[0]
        const leadsOnDate = leadsByDate[dateStr] || []

        let value = 0

        switch (metricKey.trim()) {
          case 'totalLeads':
            value = leadsOnDate.length
            break

          case 'activeLeads':
            value = leadsOnDate.filter(l => !l.archived).length
            break

          case 'conversionRate':
            const converted = leadsOnDate.filter(
              l => l.status === 'convertido' || l.stage === 'convertido'
            ).length
            value = leadsOnDate.length > 0
              ? (converted / leadsOnDate.length) * 100
              : 0
            break

          case 'newLeadsWeek':
            value = leadsOnDate.length
            break

          default:
            value = 0
        }

        dataPoints.push({ date: dateStr, value })
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Calcular tendência
      const firstValue = dataPoints[0]?.value || 0
      const lastValue = dataPoints[dataPoints.length - 1]?.value || 0
      const change = lastValue - firstValue
      const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0

      let trend: 'up' | 'down' | 'neutral' = 'neutral'
      if (Math.abs(changePercent) > 1) {
        trend = change > 0 ? 'up' : 'down'
      }

      sparklines[metricKey.trim()] = {
        data: dataPoints,
        trend,
        change: Math.round(changePercent * 10) / 10
      }
    })

    return NextResponse.json(sparklines)

  } catch (error: any) {
    console.error('Erro no endpoint /api/analytics/sparklines:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    )
  }
}
