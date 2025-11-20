/**
 * API Route: Temporal Metrics
 * GET /api/analytics/temporal-metrics
 *
 * Retorna métricas comparando período atual com período anterior
 * Dados REAIS do Supabase - SEM MOCKS
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/service-role'

type MetricComparison = {
  current: number
  previous: number
  change: number
  changePercent: number
  trend?: 'up' | 'down' | 'neutral'
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accountId = searchParams.get('account_id')
    const periodType = searchParams.get('period_type') || 'month' // week, month, quarter, year

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id é obrigatório' },
        { status: 400 }
      )
    }

    // Calcular períodos
    const now = new Date()
    let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date

    switch (periodType) {
      case 'week':
        currentEnd = now
        currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousEnd = new Date(currentStart.getTime() - 1)
        previousStart = new Date(previousEnd.getTime() - 7 * 24 * 60 * 60 * 1000)
        break

      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3)
        currentStart = new Date(now.getFullYear(), currentQuarter * 3, 1)
        currentEnd = now
        previousStart = new Date(now.getFullYear(), currentQuarter * 3 - 3, 1)
        previousEnd = new Date(currentStart.getTime() - 1)
        break

      case 'year':
        currentStart = new Date(now.getFullYear(), 0, 1)
        currentEnd = now
        previousStart = new Date(now.getFullYear() - 1, 0, 1)
        previousEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59)
        break

      default: // month
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
        currentEnd = now
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    }

    // Função para buscar métricas de um período
    async function getPeriodMetrics(startDate: Date, endDate: Date) {
      const { data: leads } = await supabaseAdmin
        .from('leads')
        .select('id, status, stage, archived')
        .eq('account_id', accountId as string)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      const totalLeads = leads?.length || 0
      const activeLeads = leads?.filter((l: any) => !l.archived).length || 0
      const convertedLeads = leads?.filter(
        (l: any) => l.status === 'convertido' || l.stage === 'convertido'
      ).length || 0
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

      return {
        totalLeads,
        activeLeads,
        conversionRate,
        newLeadsWeek: totalLeads // Simplificado - todos são "novos" no período
      }
    }

    // Buscar métricas dos dois períodos
    const [currentMetrics, previousMetrics] = await Promise.all([
      getPeriodMetrics(currentStart, currentEnd),
      getPeriodMetrics(previousStart, previousEnd)
    ])

    // Calcular comparações
    function compareMetric(current: number, previous: number): MetricComparison {
      const change = current - previous
      const changePercent = previous > 0 ? (change / previous) * 100 : 0

      let trend: 'up' | 'down' | 'neutral' = 'neutral'
      if (Math.abs(changePercent) > 1) {
        trend = change > 0 ? 'up' : 'down'
      }

      return {
        current,
        previous,
        change,
        changePercent: Math.round(changePercent * 10) / 10,
        trend
      }
    }

    const temporalMetrics = {
      totalLeads: compareMetric(currentMetrics.totalLeads, previousMetrics.totalLeads),
      activeLeads: compareMetric(currentMetrics.activeLeads, previousMetrics.activeLeads),
      conversionRate: compareMetric(currentMetrics.conversionRate, previousMetrics.conversionRate),
      newLeadsWeek: compareMetric(currentMetrics.newLeadsWeek, previousMetrics.newLeadsWeek)
    }

    return NextResponse.json(temporalMetrics)

  } catch (error: any) {
    console.error('Erro no endpoint /api/analytics/temporal-metrics:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    )
  }
}
