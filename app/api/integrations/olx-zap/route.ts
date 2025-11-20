/**
 * API DE GERENCIAMENTO - INTEGRAÇÃO OLX/ZAP
 *
 * CRUD de configuração e estatísticas da integração
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

/**
 * GET - Buscar configuração e estatísticas
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const accountId = searchParams.get('account_id') || DEFAULT_ACCOUNT_ID;

    // Buscar configuração
    let { data: integration, error } = await supabase
      .from('olx_zap_integrations')
      .select('*')
      .eq('account_id', accountId)
      .single();

    // Se não existe, criar automaticamente
    if (error && error.code === 'PGRST116') {
      const { data: newIntegration } = await supabase
        .from('olx_zap_integrations')
        .insert({
          account_id: accountId,
          is_active: false,
          total_leads_received: 0,
          webhook_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mobydemosummit.vercel.app'}/api/webhooks/olx-zap-leads`,
        })
        .select()
        .single();

      integration = newIntegration;
    }

    if (!integration) {
      return NextResponse.json(
        { error: 'Falha ao buscar/criar integração' },
        { status: 500 }
      );
    }

    // Buscar estatísticas
    const stats = await getIntegrationStats(accountId);

    return NextResponse.json({
      integration,
      stats,
    });
  } catch (error: any) {
    console.error('[API OLX/ZAP] Erro em GET:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Atualizar configuração
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { account_id, is_active, client_api_key } = body;

    if (!account_id) {
      return NextResponse.json(
        { error: 'account_id é obrigatório' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (typeof is_active === 'boolean') {
      updateData.is_active = is_active;
    }

    if (client_api_key !== undefined) {
      updateData.client_api_key = client_api_key;
    }

    const { data, error } = await supabase
      .from('olx_zap_integrations')
      .update(updateData)
      .eq('account_id', account_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      integration: data,
    });
  } catch (error: any) {
    console.error('[API OLX/ZAP] Erro em PATCH:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Criar nova integração
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { account_id, is_active = true, client_api_key } = body;

    if (!account_id) {
      return NextResponse.json(
        { error: 'account_id é obrigatório' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('olx_zap_integrations')
      .insert({
        account_id,
        is_active,
        client_api_key,
        webhook_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mobydemosummit.vercel.app'}/api/webhooks/olx-zap-leads`,
        total_leads_received: 0,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      integration: data,
    });
  } catch (error: any) {
    console.error('[API OLX/ZAP] Erro em POST:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Função auxiliar: buscar estatísticas da integração
 */
async function getIntegrationStats(accountId: string) {
  try {
    // Total de leads
    const { count: totalLeads } = await supabase
      .from('olx_zap_leads')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId);

    // Leads hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: leadsToday } = await supabase
      .from('olx_zap_leads')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .gte('created_at', today.toISOString());

    // Leads esta semana
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { count: leadsThisWeek } = await supabase
      .from('olx_zap_leads')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .gte('created_at', weekAgo.toISOString());

    // Leads este mês
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count: leadsThisMonth } = await supabase
      .from('olx_zap_leads')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .gte('created_at', monthStart.toISOString());

    // Por status
    const { data: byStatus } = await supabase
      .from('olx_zap_leads')
      .select('status')
      .eq('account_id', accountId);

    const statusCounts = {
      pending: 0,
      processed: 0,
      error: 0,
      duplicate: 0,
    };

    byStatus?.forEach((lead) => {
      if (lead.status in statusCounts) {
        statusCounts[lead.status as keyof typeof statusCounts]++;
      }
    });

    // Por temperatura
    const { data: byTemp } = await supabase
      .from('olx_zap_leads')
      .select('temperature')
      .eq('account_id', accountId);

    const tempCounts = {
      alta: 0,
      media: 0,
      baixa: 0,
    };

    byTemp?.forEach((lead) => {
      const temp = lead.temperature?.toLowerCase();
      if (temp === 'alta') tempCounts.alta++;
      else if (temp === 'média' || temp === 'media') tempCounts.media++;
      else if (temp === 'baixa') tempCounts.baixa++;
    });

    // Por tipo de transação
    const { data: byTransaction } = await supabase
      .from('olx_zap_leads')
      .select('transaction_type')
      .eq('account_id', accountId);

    const transactionCounts = {
      sell: 0,
      rent: 0,
    };

    byTransaction?.forEach((lead) => {
      if (lead.transaction_type === 'SELL') transactionCounts.sell++;
      else if (lead.transaction_type === 'RENT') transactionCounts.rent++;
    });

    return {
      total_leads: totalLeads || 0,
      leads_today: leadsToday || 0,
      leads_this_week: leadsThisWeek || 0,
      leads_this_month: leadsThisMonth || 0,
      by_status: statusCounts,
      by_temperature: tempCounts,
      by_transaction_type: transactionCounts,
    };
  } catch (error) {
    console.error('[API OLX/ZAP] Erro ao buscar estatísticas:', error);
    return {
      total_leads: 0,
      leads_today: 0,
      leads_this_week: 0,
      leads_this_month: 0,
      by_status: { pending: 0, processed: 0, error: 0, duplicate: 0 },
      by_temperature: { alta: 0, media: 0, baixa: 0 },
      by_transaction_type: { sell: 0, rent: 0 },
    };
  }
}
