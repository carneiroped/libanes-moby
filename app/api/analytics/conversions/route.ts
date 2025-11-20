/**
 * API Route: Analytics Stage Conversions
 * GET /api/analytics/conversions
 *
 * Retorna funil de conversão por estágios do pipeline
 * Dados REAIS do Supabase - SEM MOCKS
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/service-role'

// Estágios fixos do ENUM lead_stage
const FIXED_STAGES = [
  { id: 'lead_novo', name: 'Lead Novo', order: 0 },
  { id: 'qualificacao', name: 'Qualificação', order: 1 },
  { id: 'apresentacao', name: 'Apresentação', order: 2 },
  { id: 'visita_agendada', name: 'Visita Agendada', order: 3 },
  { id: 'proposta', name: 'Proposta', order: 4 },
  { id: 'documentacao', name: 'Documentação', order: 5 },
  { id: 'fechamento', name: 'Fechamento', order: 6 },
]

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

    // Buscar TODOS os leads da conta com filtro de data opcional
    let query = supabaseAdmin
      .from('leads')
      .select('id, stage')
      .eq('account_id', accountId)

    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: leads, error: leadsError } = await query

    if (leadsError) {
      console.error('Erro ao buscar leads:', leadsError)
      return NextResponse.json(
        { error: 'Falha ao buscar leads', details: leadsError.message },
        { status: 500 }
      )
    }

    // Contar leads por estágio ENUM
    const leadCountByStage: Record<string, number> = {}

    if (leads) {
      leads.forEach((lead: any) => {
        const stage = lead.stage || 'lead_novo' // Default para lead_novo
        leadCountByStage[stage] = (leadCountByStage[stage] || 0) + 1
      })
    }

    const totalLeads = leads?.length || 0

    // Montar funil de conversão CUMULATIVO usando os 7 estágios fixos
    // Cada estágio mostra quantos leads chegaram nele ou passaram por ele
    const conversions = FIXED_STAGES.map((stage, index) => {
      // Contar leads que estão neste estágio OU em estágios posteriores
      let cumulativeCount = 0

      // Somar contagem deste estágio + todos os estágios seguintes
      for (let i = index; i < FIXED_STAGES.length; i++) {
        const stageId = FIXED_STAGES[i].id
        cumulativeCount += leadCountByStage[stageId] || 0
      }

      // Percentual em relação ao total de leads
      const percentage = totalLeads > 0 ? (cumulativeCount / totalLeads) * 100 : 0

      // Taxa de conversão = leads que chegaram aqui / leads que chegaram no estágio anterior
      let conversionRate = 100
      if (index > 0) {
        // Contar leads do estágio anterior (cumulativo)
        let previousCumulativeCount = 0
        for (let i = index - 1; i < FIXED_STAGES.length; i++) {
          const stageId = FIXED_STAGES[i].id
          previousCumulativeCount += leadCountByStage[stageId] || 0
        }
        conversionRate = previousCumulativeCount > 0 ? (cumulativeCount / previousCumulativeCount) * 100 : 0
      }

      return {
        stage_id: stage.id,
        stage_name: stage.name,
        count: cumulativeCount, // Contagem cumulativa (passaram por aqui ou estão além)
        percentage: Math.round(percentage * 10) / 10,
        conversion_rate: Math.round(conversionRate * 10) / 10
      }
    })

    return NextResponse.json(conversions)

  } catch (error: any) {
    console.error('Erro no endpoint /api/analytics/conversions:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    )
  }
}
