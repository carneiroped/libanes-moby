/**
 * API Route: AI Insights
 * GET /api/analytics/ai-insights
 *
 * Gera insights automáticos usando Azure OpenAI
 * Analisa dados REAIS do Supabase e gera recomendações
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/service-role'

// Cliente Azure OpenAI
import { AzureOpenAI } from 'openai'

const azureOpenAI = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview',
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-5-chat'
})

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

    // Buscar dados para análise
    const [
      { data: leads },
      { data: conversions },
      { data: sources }
    ] = await Promise.all([
      // Métricas gerais
      supabaseAdmin
        .from('leads')
        .select('id, status, stage, source, created_at')
        .eq('account_id', accountId),

      // Conversões recentes
      supabaseAdmin
        .from('leads')
        .select('id, created_at, updated_at')
        .eq('account_id', accountId)
        .eq('status', 'convertido')
        .order('updated_at', { ascending: false })
        .limit(10),

      // Distribuição por fonte
      supabaseAdmin
        .from('leads')
        .select('source')
        .eq('account_id', accountId)
    ])

    if (!leads || leads.length === 0) {
      return NextResponse.json({
        insights: [
          'Nenhum lead encontrado ainda. Comece a adicionar leads para receber insights personalizados.'
        ]
      })
    }

    // Calcular estatísticas para o prompt
    const totalLeads = leads.length
    const convertedLeads = leads.filter((l: any) => l.status === 'convertido').length
    const conversionRate = (convertedLeads / totalLeads) * 100

    const sourceDistribution: Record<string, number> = {}
    sources?.forEach((l: any) => {
      const source = l.source || 'Desconhecido'
      sourceDistribution[source] = (sourceDistribution[source] || 0) + 1
    })

    const topSources = Object.entries(sourceDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([source, count]) => ({ source, count }))

    // Tempo médio até conversão
    let avgDaysToConversion = 0
    if (conversions && conversions.length > 0) {
      const totalDays = conversions.reduce((sum: number, conv: any) => {
        const created = new Date(conv.created_at).getTime()
        const converted = new Date(conv.updated_at).getTime()
        const days = Math.abs(converted - created) / (1000 * 60 * 60 * 24)
        return sum + days
      }, 0)
      avgDaysToConversion = Math.round(totalDays / conversions.length)
    }

    // Prompt para Azure OpenAI
    const prompt = `Você é um analista de dados especializado em CRM imobiliário.

Analise os seguintes dados e gere 3-5 insights acionáveis em português do Brasil:

DADOS:
- Total de Leads: ${totalLeads}
- Taxa de Conversão: ${conversionRate.toFixed(1)}%
- Tempo Médio até Conversão: ${avgDaysToConversion} dias
- Top 3 Fontes de Leads: ${topSources.map(s => `${s.source} (${s.count})`).join(', ')}

INSTRUÇÕES:
1. Seja específico e baseie-se apenas nos dados fornecidos
2. Cada insight deve ter 1-2 frases
3. Foque em ações práticas e recomendações
4. Use tom profissional mas acessível
5. NÃO invente números ou estatísticas
6. Retorne APENAS um array JSON com os insights (sem markdown, sem explicações extras)

Formato de saída:
["Insight 1", "Insight 2", "Insight 3"]`

    // Chamar Azure OpenAI
    const completion = await azureOpenAI.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-5-chat',
      messages: [
        {
          role: 'system',
          content: 'Você é um analista de CRM imobiliário que gera insights práticos baseados em dados.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('Azure OpenAI não retornou resposta')
    }

    // Parse da resposta (assumindo que vem como JSON array)
    let insights: string[]
    try {
      // Remover markdown se existir
      const cleanResponse = aiResponse.replace(/```json\n?|```\n?/g, '').trim()
      insights = JSON.parse(cleanResponse)
    } catch {
      // Se falhar o parse, dividir por linhas
      insights = aiResponse
        .split('\n')
        .filter(line => line.trim().length > 0 && !line.includes('[') && !line.includes(']'))
        .map(line => line.replace(/^[-*"]\s*/, '').replace(/"$/, '').trim())
        .filter(line => line.length > 10)
    }

    return NextResponse.json({ insights })

  } catch (error: any) {
    console.error('Erro no endpoint /api/analytics/ai-insights:', error)

    // Em caso de erro, retornar insights básicos baseados apenas em dados
    return NextResponse.json({
      insights: [
        'Análise de IA temporariamente indisponível. Insights básicos sendo exibidos com base em seus dados históricos.'
      ],
      error: error.message
    })
  }
}
