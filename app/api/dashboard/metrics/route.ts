/**
 * API Route: Dashboard Metrics
 * GET /api/dashboard/metrics
 *
 * Retorna métricas do dashboard - DADOS REAIS DO SUPABASE
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/service-role'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accountId = searchParams.get('account_id')

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar dados em paralelo para melhor performance
    const [
      leadsResult,
      imoveisResult,
      chatsResult,
      leadsPreviousResult
    ] = await Promise.all([
      // Leads atuais
      supabaseAdmin
        .from('leads')
        .select('id, status, stage, created_at', { count: 'exact' })
        .eq('account_id', accountId)
        .eq('archived', false),

      // Imóveis ativos
      supabaseAdmin
        .from('imoveis')
        .select('id', { count: 'exact' })
        .eq('account_id', accountId)
        .eq('archived', false),

      // Chats ativos
      supabaseAdmin
        .from('chats')
        .select('id, status', { count: 'exact' })
        .eq('account_id', accountId),

      // Leads do mês anterior (para comparação)
      supabaseAdmin
        .from('leads')
        .select('id', { count: 'exact' })
        .eq('account_id', accountId)
        .eq('archived', false)
        .gte('created_at', getFirstDayOfPreviousMonth())
        .lt('created_at', getFirstDayOfCurrentMonth())
    ])

    // Verificar erros
    if (leadsResult.error) throw leadsResult.error
    if (imoveisResult.error) throw imoveisResult.error
    if (chatsResult.error) throw chatsResult.error

    const leads = leadsResult.data || []
    const totalLeads = leadsResult.count || 0
    const totalImoveis = imoveisResult.count || 0
    const totalChats = chatsResult.count || 0
    const previousMonthLeads = leadsPreviousResult.count || 0

    // Leads por status
    const leadsNovos = leads.filter((l: any) => l.status === 'novo' || l.stage === 'new').length
    const leadsAtivos = leads.filter((l: any) =>
      l.status === 'contato' ||
      l.status === 'qualificado' ||
      l.stage === 'contact' ||
      l.stage === 'qualified'
    ).length
    const leadsConvertidos = leads.filter((l: any) =>
      l.status === 'convertido' ||
      l.status === 'ganho' ||
      l.stage === 'won'
    ).length

    // Chats ativos
    const chatsAtivos = chatsResult.data?.filter((c: any) => c.status === 'active').length || 0

    // Calcular trends
    const leadTrend = previousMonthLeads > 0
      ? Math.round(((totalLeads - previousMonthLeads) / previousMonthLeads) * 100)
      : totalLeads > 0 ? 100 : 0

    const metrics = {
      // Métricas principais
      totalLeads,
      totalImoveis,
      totalChats,
      chatsAtivos,

      // Breakdown de leads
      leadsNovos,
      leadsAtivos,
      leadsConvertidos,

      // Comparações
      previousPeriod: {
        totalLeads: previousMonthLeads,
        totalImoveis: 0, // Pode adicionar depois se necessário
        totalChats: 0,
      },

      // Trends
      trends: {
        totalLeads: leadTrend,
        totalImoveis: 0,
        totalChats: 0,
      },

      // Taxa de conversão
      conversionRate: totalLeads > 0
        ? Math.round((leadsConvertidos / totalLeads) * 100)
        : 0,

      // Timestamp
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(metrics)

  } catch (error: any) {
    console.error('Erro no endpoint /api/dashboard/metrics:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// Helpers para cálculo de datas
function getFirstDayOfCurrentMonth(): string {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  return firstDay.toISOString()
}

function getFirstDayOfPreviousMonth(): string {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return firstDay.toISOString()
}
