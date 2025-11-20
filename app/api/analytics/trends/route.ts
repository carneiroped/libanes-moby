/**
 * API Route: Analytics Trends
 * GET /api/analytics/trends
 *
 * Retorna tendências de leads ao longo do tempo
 * Dados REAIS do Supabase - SEM MOCKS
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/service-role'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accountId = searchParams.get('account_id')
    const period = searchParams.get('period') || 'month' // week, month, quarter, year
    const customStartDate = searchParams.get('start_date')
    const customEndDate = searchParams.get('end_date')

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id é obrigatório' },
        { status: 400 }
      )
    }

    // Calcular data de início baseado no período ou usar datas customizadas
    const now = new Date()
    let startDate: Date
    let endDate: Date
    let daysCount: number

    if (customStartDate && customEndDate) {
      // Usar datas customizadas
      startDate = new Date(customStartDate)
      endDate = new Date(customEndDate)
      daysCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    } else {
      // Usar período padrão
      endDate = now
      startDate = new Date()

      switch (period) {
        case 'week':
          startDate.setDate(now.getDate() - 7)
          daysCount = 7
          break
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3)
          daysCount = 90
          break
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1)
          daysCount = 365
          break
        default: // month
          startDate.setMonth(now.getMonth() - 1)
          daysCount = 30
      }
    }

    // Buscar leads criados no período
    const { data: leads, error } = await supabaseAdmin
      .from('leads')
      .select('id, created_at')
      .eq('account_id', accountId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erro ao buscar leads:', error)
      return NextResponse.json(
        { error: 'Falha ao buscar leads', details: error.message },
        { status: 500 }
      )
    }

    // Agrupar leads por data
    const leadsPerDay: Record<string, number> = {}

    if (leads && leads.length > 0) {
      leads.forEach((lead: any) => {
        const date = new Date(lead.created_at).toISOString().split('T')[0]
        leadsPerDay[date] = (leadsPerDay[date] || 0) + 1
      })
    }

    // Criar array com todos os dias do período (incluindo dias sem leads)
    const trends = []
    const currentDate = new Date(startDate)

    for (let i = 0; i < daysCount; i++) {
      const dateStr = currentDate.toISOString().split('T')[0]
      trends.push({
        date: dateStr,
        count: leadsPerDay[dateStr] || 0
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json(trends)

  } catch (error: any) {
    console.error('Erro no endpoint /api/analytics/trends:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    )
  }
}
