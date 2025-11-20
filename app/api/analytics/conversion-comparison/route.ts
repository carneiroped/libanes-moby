/**
 * API Route: Conversion Comparison
 * GET /api/analytics/conversion-comparison
 *
 * Retorna comparação de conversões entre períodos (mês atual, anterior, ano passado)
 * Dados REAIS do Supabase - SEM MOCKS
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/service-role'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accountId = searchParams.get('account_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id é obrigatório' },
        { status: 400 }
      )
    }

    // Calcular datas dos períodos
    const now = new Date()

    // Se filtros de data fornecidos, usar como período atual
    const thisMonthStart = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthEnd = endDate ? new Date(endDate) : now

    // Calcular período anterior (mesmo tamanho)
    const periodDuration = thisMonthEnd.getTime() - thisMonthStart.getTime()
    const lastMonthEnd = new Date(thisMonthStart.getTime() - 1)
    const lastMonthStart = new Date(lastMonthEnd.getTime() - periodDuration)

    // Mesmo período ano passado
    const lastYearMonthStart = new Date(thisMonthStart.getFullYear() - 1, thisMonthStart.getMonth(), thisMonthStart.getDate())
    const lastYearMonthEnd = new Date(thisMonthEnd.getFullYear() - 1, thisMonthEnd.getMonth(), thisMonthEnd.getDate())

    // Função auxiliar para buscar dados de um período
    async function getPeriodData(startDate: Date, endDate: Date) {
      // Total de leads
      const { data: leads } = await supabaseAdmin
        .from('leads')
        .select('id, status, stage')
        .eq('account_id', accountId || '')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      const totalLeads = leads?.length || 0

      // Agendamentos (calendar_events do tipo 'visit')
      const { data: visits } = await supabaseAdmin
        .from('calendar_events')
        .select('id')
        .eq('account_id', accountId || '')
        .eq('event_type', 'visit')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      const agendamentos = visits?.length || 0

      // Vendas (leads convertidos)
      const vendas = leads?.filter(
        (lead: any) => lead.status === 'convertido' || lead.stage === 'convertido'
      ).length || 0

      return { leads: totalLeads, agendamentos, vendas }
    }

    // Buscar dados dos 3 períodos
    const [currentMonth, lastMonth, lastYearMonth] = await Promise.all([
      getPeriodData(thisMonthStart, thisMonthEnd),
      getPeriodData(lastMonthStart, lastMonthEnd),
      getPeriodData(lastYearMonthStart, lastYearMonthEnd)
    ])

    const comparison = [
      {
        category: 'Este Mês',
        leads: currentMonth.leads,
        agendamentos: currentMonth.agendamentos,
        vendas: currentMonth.vendas
      },
      {
        category: 'Mês Anterior',
        leads: lastMonth.leads,
        agendamentos: lastMonth.agendamentos,
        vendas: lastMonth.vendas
      },
      {
        category: 'Mesmo Período Ano Passado',
        leads: lastYearMonth.leads,
        agendamentos: lastYearMonth.agendamentos,
        vendas: lastYearMonth.vendas
      }
    ]

    return NextResponse.json(comparison)

  } catch (error: any) {
    console.error('Erro no endpoint /api/analytics/conversion-comparison:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    )
  }
}
