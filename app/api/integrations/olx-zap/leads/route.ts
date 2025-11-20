/**
 * API - LISTAGEM DE LEADS OLX/ZAP
 *
 * Busca leads recebidos via webhook com filtros e paginação
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

/**
 * GET - Listar leads OLX/ZAP com filtros
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const accountId = searchParams.get('account_id') || DEFAULT_ACCOUNT_ID;
    const status = searchParams.get('status');
    const temperature = searchParams.get('temperature');
    const transactionType = searchParams.get('transaction_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Query base
    let query = supabase
      .from('olx_zap_leads')
      .select(`
        *,
        lead:leads(id, name, email, phone, status, stage),
        imovel:imoveis(id, titulo, tipo, loc_venda, valor)
      `, { count: 'exact' })
      .eq('account_id', accountId);

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status);
    }

    if (temperature) {
      query = query.ilike('temperature', temperature);
    }

    if (transactionType) {
      query = query.eq('transaction_type', transactionType);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Ordenação e paginação
    const offset = (page - 1) * limit;

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      leads: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('[API OLX/ZAP Leads] Erro em GET:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
