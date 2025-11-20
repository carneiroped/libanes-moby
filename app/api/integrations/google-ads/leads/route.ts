import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const MOBY_ACCOUNT_ID = 'cb9f91dd-f076-4535-bc1a-49162615de7d';

// Supabase service role client para operações privilegiadas
const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
};

/**
 * GET /api/integrations/google-ads/leads
 *
 * Lista leads recebidos do Google Ads com filtros e paginação
 *
 * Query params:
 * - account_id (opcional): ID da conta
 * - status: new, contacted, qualified, converted, lost
 * - page: número da página (padrão: 1)
 * - limit: itens por página (padrão: 20, max: 100)
 * - start_date: filtro data inicial (ISO 8601)
 * - end_date: filtro data final (ISO 8601)
 * - campaign_id: filtro por campanha
 * - search: busca por nome, email ou telefone
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('account_id') || MOBY_ACCOUNT_ID;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const campaignId = searchParams.get('campaign_id');
    const search = searchParams.get('search');

    const supabase = getServiceClient();

    // Construir query
    let query = supabase
      .from('google_ads_leads')
      .select('*, lead:leads(*)', { count: 'exact' })
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // Paginação
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: leads, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar leads Google Ads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch Google Ads leads' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      leads: leads || [],
      total: count || 0,
      page,
      limit,
      total_pages: count ? Math.ceil(count / limit) : 0
    });

  } catch (error: any) {
    console.error('Erro no GET /api/integrations/google-ads/leads:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Função auxiliar para calcular estatísticas dos leads Google Ads
 * (não exportada - apenas para uso interno)
 */
async function getStats(accountId: string) {
  const supabase = getServiceClient();

  // Buscar totais por status
  const { data: leads, error } = await supabase
    .from('google_ads_leads')
    .select('status, created_at')
    .eq('account_id', accountId);

  if (error || !leads) {
    return {
      total_leads: 0,
      new_leads: 0,
      contacted_leads: 0,
      qualified_leads: 0,
      converted_leads: 0,
      lost_leads: 0,
      conversion_rate: 0,
      last_7_days: 0,
      last_30_days: 0
    };
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats = {
    total_leads: leads.length,
    new_leads: leads.filter(l => l.status === 'new').length,
    contacted_leads: leads.filter(l => l.status === 'contacted').length,
    qualified_leads: leads.filter(l => l.status === 'qualified').length,
    converted_leads: leads.filter(l => l.status === 'converted').length,
    lost_leads: leads.filter(l => l.status === 'lost').length,
    conversion_rate: leads.length > 0
      ? leads.filter(l => l.status === 'converted').length / leads.length
      : 0,
    last_7_days: leads.filter(l => l.created_at && new Date(l.created_at) >= sevenDaysAgo).length,
    last_30_days: leads.filter(l => l.created_at && new Date(l.created_at) >= thirtyDaysAgo).length
  };

  return stats;
}
