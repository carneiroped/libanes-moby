/**
 * API Route: Sales Evolution
 * GET /api/analytics/sales-evolution
 *
 * Retorna evolução de vendas ao longo do tempo
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
    const period = searchParams.get('period') || 'day' // day, week, month

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id é obrigatório' },
        { status: 400 }
      )
    }

    // Calcular data de início baseado no período ou usar datas customizadas
    const now = new Date()
    let queryStartDate: Date
    let queryEndDate: Date
    let daysCount: number

    if (startDate && endDate) {
      // Usar datas customizadas
      queryStartDate = new Date(startDate)
      queryEndDate = new Date(endDate)
      daysCount = Math.ceil((queryEndDate.getTime() - queryStartDate.getTime()) / (1000 * 60 * 60 * 24))
    } else {
      // Usar período padrão (últimos 30 dias)
      queryEndDate = now
      queryStartDate = new Date()
      queryStartDate.setDate(now.getDate() - 30)
      daysCount = 30
    }

    // Buscar leads convertidos no período
    const { data: convertedLeads, error } = await supabaseAdmin
      .from('leads')
      .select('id, created_at, updated_at, status, property_preferences')
      .eq('account_id', accountId)
      .eq('status', 'convertido')
      .gte('updated_at', queryStartDate.toISOString())
      .lte('updated_at', queryEndDate.toISOString())
      .order('updated_at', { ascending: true })

    if (error) {
      console.error('Erro ao buscar vendas:', error)
      return NextResponse.json(
        { error: 'Falha ao buscar vendas', details: error.message },
        { status: 500 }
      )
    }

    if (!convertedLeads || convertedLeads.length === 0) {
      // Retornar estrutura vazia mas válida
      const emptyData = []
      const currentDate = new Date(queryStartDate)

      for (let i = 0; i < Math.min(daysCount, 90); i++) {
        const dateStr = currentDate.toISOString().split('T')[0]
        emptyData.push({
          date: dateStr,
          vendas: 0,
          valor: 0
        })
        currentDate.setDate(currentDate.getDate() + 1)
      }

      return NextResponse.json(emptyData)
    }

    // Agrupar vendas por data (usando updated_at como data de conversão)
    const salesByDate: Record<string, { count: number; totalValue: number }> = {}

    convertedLeads.forEach((lead: any) => {
      const date = new Date(lead.updated_at).toISOString().split('T')[0]

      if (!salesByDate[date]) {
        salesByDate[date] = { count: 0, totalValue: 0 }
      }

      salesByDate[date].count++

      // Tentar extrair valor da venda (pode estar em property_preferences)
      const prefs = lead.property_preferences as any
      const value = prefs?.valor || prefs?.price || 0
      salesByDate[date].totalValue += Number(value) || 0
    })

    // Criar array com todos os dias do período (incluindo dias sem vendas)
    const salesEvolution = []
    const currentDate = new Date(queryStartDate)

    for (let i = 0; i < Math.min(daysCount, 90); i++) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const daySales = salesByDate[dateStr] || { count: 0, totalValue: 0 }

      salesEvolution.push({
        date: dateStr,
        vendas: daySales.count,
        valor: Math.round(daySales.totalValue)
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json(salesEvolution)

  } catch (error: any) {
    console.error('Erro no endpoint /api/analytics/sales-evolution:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    )
  }
}
