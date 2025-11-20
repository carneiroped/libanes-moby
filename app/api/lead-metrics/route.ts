import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

export async function GET(request: Request) {
  try {
    // Extrair leadId da query string se fornecido
    const url = new URL(request.url);
    const leadId = url.searchParams.get('leadId');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Se um leadId específico for fornecido, retornar métricas desse lead
    if (leadId) {
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .eq('account_id', ACCOUNT_ID)
        .single();

      if (leadError) {
        console.error('[API /lead-metrics] Error fetching lead:', leadError);
        // Retornar métricas vazias em vez de erro
        return NextResponse.json({
          score: 50,
          temperature: 'warm',
          interactions: 0,
          lastContact: null,
          daysInStage: 0
        });
      }

      // Calcular métricas do lead
      const now = new Date();
      const updatedAt = lead?.updated_at ? new Date(lead.updated_at) : now;
      const daysInStage = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));

      return NextResponse.json({
        score: lead?.score || 50,
        temperature: lead?.temperature || 'warm',
        interactions: 0, // TODO: buscar de activities
        lastContact: lead?.last_contact || null,
        daysInStage
      });
    }

    // Buscar todos os leads para métricas gerais
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('account_id', ACCOUNT_ID);

    if (leadsError) {
      console.error('[API /lead-metrics] Error fetching leads:', leadsError);
      // Retornar métricas vazias em vez de erro
      return NextResponse.json({
        totalLeads: 0,
        newLeads: 0,
        activeLeads: 0,
        convertedLeads: 0,
        conversionRate: 0,
        leadsBySource: {},
        avgScore: 0,
        hotLeads: 0
      });
    }

    // Calcular métricas
    const totalLeads = leads?.length || 0;
    const newLeads = leads?.filter(l => l.status === 'novo' || l.stage === 'lead_novo').length || 0;
    const activeLeads = leads?.filter(l => l.status === 'active' || (l.stage && l.stage !== 'lead_novo' && l.stage !== 'fechamento')).length || 0;
    const convertedLeads = leads?.filter(l => l.status === 'converted' || l.stage === 'fechamento').length || 0;

    // Taxa de conversão
    const conversionRate = totalLeads > 0 ? parseFloat(((convertedLeads / totalLeads) * 100).toFixed(1)) : 0;

    // Leads por fonte
    const leadsBySource: Record<string, number> = {};
    leads?.forEach(lead => {
      const source = lead.source || 'Desconhecido';
      leadsBySource[source] = (leadsBySource[source] || 0) + 1;
    });

    // Score médio
    const avgScore = leads?.length
      ? parseInt((leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length).toFixed(0))
      : 0;

    return NextResponse.json({
      totalLeads,
      newLeads,
      activeLeads,
      convertedLeads,
      conversionRate,
      leadsBySource,
      avgScore,
      hotLeads: leads?.filter(l => l.score >= 75).length || 0
    });
  } catch (error: any) {
    console.error('[API /lead-metrics] Error:', error);
    // Retornar métricas vazias em vez de erro para evitar undefined
    return NextResponse.json({
      totalLeads: 0,
      newLeads: 0,
      activeLeads: 0,
      convertedLeads: 0,
      conversionRate: 0,
      leadsBySource: {},
      avgScore: 0,
      hotLeads: 0
    });
  }
}
