import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

/**
 * GET /api/leads/kanban
 * Busca todos os leads do Kanban agrupados por estágio
 */
export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Buscar todos os leads ativos
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('account_id', ACCOUNT_ID)
      .eq('archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API /leads/kanban] Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Agrupar leads por estágio
    const leadsByStage = (leads || []).reduce((acc: any, lead: any) => {
      const stage = lead.stage || 'lead_novo';
      if (!acc[stage]) {
        acc[stage] = [];
      }
      acc[stage].push(lead);
      return acc;
    }, {});

    return NextResponse.json({
      leadsByStage,
      total: leads?.length || 0,
      leads: leads || [],
    });
  } catch (error: any) {
    console.error('[API /leads/kanban] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
