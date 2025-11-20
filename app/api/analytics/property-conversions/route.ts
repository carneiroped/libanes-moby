/**
 * API Route: Property Conversions
 * GET /api/analytics/property-conversions
 *
 * Retorna taxa de conversão e interesse por imóvel
 * Dados REAIS do Supabase - SEM MOCKS
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/service-role'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accountId = searchParams.get('account_id')
    const propertyType = searchParams.get('property_type') // vendas ou locacao
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar imóveis da conta com filtros opcionais
    let query = supabaseAdmin
      .from('imoveis')
      .select('id, descricao, bairro, cidade, valor, tipo, loc_venda')
      .eq('account_id', accountId)
      .eq('archived', false)

    // Filtrar por tipo de transação (vendas/locacao)
    if (propertyType === 'vendas') {
      query = query.or('loc_venda.eq.venda,loc_venda.eq.ambos')
    } else if (propertyType === 'locacao') {
      query = query.or('loc_venda.eq.locacao,loc_venda.eq.ambos')
    }

    const { data: imoveis, error: imoveisError } = await query.limit(10)

    if (imoveisError) {
      console.error('Erro ao buscar imóveis:', imoveisError)
      return NextResponse.json(
        { error: 'Falha ao buscar imóveis', details: imoveisError.message },
        { status: 500 }
      )
    }

    if (!imoveis || imoveis.length === 0) {
      return NextResponse.json([])
    }

    // Para cada imóvel, calcular:
    // 1. Quantos leads demonstraram interesse (property_preferences ou activities)
    // 2. Quantos agendaram visita
    // 3. Taxa de conversão

    const conversions = await Promise.all(
      imoveis.map(async (imovel) => {
        // Buscar leads que demonstraram interesse neste imóvel
        // (através de property_preferences JSONB)
        const { data: interestedLeads } = await supabaseAdmin
          .from('leads')
          .select('id, property_preferences, status')
          .eq('account_id', accountId)

        // Filtrar leads que tem este imóvel nas preferências
        const leadsWithInterest = interestedLeads?.filter((lead: any) => {
          if (!lead.property_preferences) return false
          const prefs = lead.property_preferences as any

          // Verificar se menciona o ID do imóvel ou características similares
          return (
            prefs?.property_id === (imovel as any).id ||
            prefs?.tipo === (imovel as any).tipo ||
            prefs?.bairro === (imovel as any).bairro
          )
        }) || []

        // Buscar atividades de visita relacionadas ao imóvel
        const { data: visits } = await supabaseAdmin
          .from('calendar_events')
          .select('id')
          .eq('account_id', accountId)
          .eq('property_id', (imovel as any).id)
          .eq('event_type', 'visit')

        const visitCount = visits?.length || 0

        // Calcular conversões (leads que viraram clientes após interesse)
        const convertedLeads = leadsWithInterest.filter(
          (lead: any) => lead.status === 'convertido'
        ).length

        const conversionRate = leadsWithInterest.length > 0
          ? (convertedLeads / leadsWithInterest.length) * 100
          : 0

        // Score de interesse (baseado em quantidade de interações)
        const interestScore = Math.min(
          100,
          (leadsWithInterest.length * 10) + (visitCount * 5)
        )

        return {
          property_id: (imovel as any).id,
          property_name: `${(imovel as any).tipo || 'Imóvel'} ${(imovel as any).bairro || ''} - R$ ${(imovel as any).valor?.toLocaleString('pt-BR') || 'N/A'}`,
          visit_count: visitCount,
          conversion_rate: Math.round(conversionRate * 10) / 10,
          interest_score: Math.round(interestScore)
        }
      })
    )

    // Ordenar por score de interesse
    conversions.sort((a, b) => b.interest_score - a.interest_score)

    return NextResponse.json(conversions)

  } catch (error: any) {
    console.error('Erro no endpoint /api/analytics/property-conversions:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    )
  }
}
