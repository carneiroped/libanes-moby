/**
 * API Route: Analytics Metrics
 * GET /api/analytics/metrics
 *
 * Retorna métricas gerais de leads da conta
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

    // Buscar todos os leads da conta com filtro de data opcional
    let query = supabaseAdmin
      .from('leads')
      .select('*')
      .eq('account_id', accountId)

    // Aplicar filtro de data se fornecido
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: allLeads, error: leadsError } = await query

    if (leadsError) {
      console.error('Erro ao buscar leads:', leadsError)
      return NextResponse.json(
        { error: 'Falha ao buscar leads', details: leadsError.message },
        { status: 500 }
      )
    }

    if (!allLeads || allLeads.length === 0) {
      // SEM DADOS = retornar zeros (NÃO MOCK!)
      return NextResponse.json({
        totalLeads: 0,
        activeLeads: 0,
        coldLeads: 0,
        newLeadsToday: 0,
        newLeadsWeek: 0,
        leadsByStage: {},
        leadsBySource: {},
        leadsByInterest: {},
        conversionRate: 0,
        message: 'Nenhum lead encontrado para esta conta'
      })
    }

    // Calcular métricas REAIS
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Leads ativos (não arquivados)
    const activeLeads = allLeads.filter((lead: any) => !lead.archived)

    // Leads frios (sem contato há mais de 30 dias)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const coldLeads = activeLeads.filter((lead: any) => {
      const lastContact = lead.last_contact ? new Date(lead.last_contact) : null
      return !lastContact || lastContact < thirtyDaysAgo
    })

    // Novos leads hoje
    const newLeadsToday = allLeads.filter((lead: any) => {
      const createdAt = new Date(lead.created_at)
      return createdAt >= today
    }).length

    // Novos leads na última semana
    const newLeadsWeek = allLeads.filter((lead: any) => {
      const createdAt = new Date(lead.created_at)
      return createdAt >= weekAgo
    }).length

    // Leads por estágio
    const leadsByStage: Record<string, number> = {}
    activeLeads.forEach((lead: any) => {
      const stage = lead.stage || 'sem_estagio'
      leadsByStage[stage] = (leadsByStage[stage] || 0) + 1
    })

    // Leads por fonte
    const leadsBySource: Record<string, number> = {}
    activeLeads.forEach((lead: any) => {
      const source = lead.source || 'desconhecido'
      leadsBySource[source] = (leadsBySource[source] || 0) + 1
    })

    // Leads por interesse (tipo de imóvel)
    const leadsByInterest: Record<string, number> = {}
    activeLeads.forEach((lead: any) => {
      const interest = lead.interest_type || 'nao_especificado'
      leadsByInterest[interest] = (leadsByInterest[interest] || 0) + 1
    })

    // Taxa de conversão (leads convertidos / total)
    const convertedLeads = allLeads.filter(
      (lead: any) => lead.status === 'convertido' || lead.stage === 'convertido'
    ).length
    const conversionRate = allLeads.length > 0
      ? (convertedLeads / allLeads.length) * 100
      : 0

    return NextResponse.json({
      totalLeads: allLeads.length,
      activeLeads: activeLeads.length,
      coldLeads: coldLeads.length,
      newLeadsToday,
      newLeadsWeek,
      leadsByStage,
      leadsBySource,
      leadsByInterest,
      conversionRate: Math.round(conversionRate * 10) / 10 // 1 casa decimal
    })

  } catch (error: any) {
    console.error('Erro no endpoint /api/analytics/metrics:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    )
  }
}
