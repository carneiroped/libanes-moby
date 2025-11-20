/**
 * API Route: Sales Time
 * GET /api/analytics/sales-time
 *
 * Retorna distribuição do tempo entre primeiro contato e conversão
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

    // Buscar leads convertidos com datas e filtros opcionais
    let query = supabaseAdmin
      .from('leads')
      .select('id, created_at, updated_at, status')
      .eq('account_id', accountId)
      .eq('status', 'convertido')

    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: convertedLeads, error } = await query

    if (error) {
      console.error('Erro ao buscar leads convertidos:', error)
      return NextResponse.json(
        { error: 'Falha ao buscar leads', details: error.message },
        { status: 500 }
      )
    }

    if (!convertedLeads || convertedLeads.length === 0) {
      // Sem conversões = retornar estrutura vazia
      return NextResponse.json([
        { date: '0-7 dias', count: 0 },
        { date: '8-15 dias', count: 0 },
        { date: '16-30 dias', count: 0 },
        { date: '31-60 dias', count: 0 },
        { date: '61-90 dias', count: 0 },
        { date: '90+ dias', count: 0 }
      ])
    }

    // Calcular tempo (em dias) entre created_at e updated_at para cada lead
    const timeBuckets = {
      '0-7 dias': 0,
      '8-15 dias': 0,
      '16-30 dias': 0,
      '31-60 dias': 0,
      '61-90 dias': 0,
      '90+ dias': 0
    }

    convertedLeads.forEach((lead: any) => {
      const createdAt = new Date(lead.created_at)
      const convertedAt = new Date(lead.updated_at) // Assumindo que updated_at = data de conversão
      const diffTime = Math.abs(convertedAt.getTime() - createdAt.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays <= 7) {
        timeBuckets['0-7 dias']++
      } else if (diffDays <= 15) {
        timeBuckets['8-15 dias']++
      } else if (diffDays <= 30) {
        timeBuckets['16-30 dias']++
      } else if (diffDays <= 60) {
        timeBuckets['31-60 dias']++
      } else if (diffDays <= 90) {
        timeBuckets['61-90 dias']++
      } else {
        timeBuckets['90+ dias']++
      }
    })

    const salesTimeData = Object.entries(timeBuckets).map(([date, count]) => ({
      date,
      count
    }))

    return NextResponse.json(salesTimeData)

  } catch (error: any) {
    console.error('Erro no endpoint /api/analytics/sales-time:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    )
  }
}
