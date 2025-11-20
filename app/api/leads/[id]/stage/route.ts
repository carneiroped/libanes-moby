import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

/**
 * PATCH /api/leads/[id]/stage
 * Atualiza o estágio de um lead (drag and drop no Kanban)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const body = await request.json();
    const { stage } = body;

    if (!stage) {
      return NextResponse.json(
        { error: 'Stage is required' },
        { status: 400 }
      );
    }

    // Validar estágio (ENUM values)
    const validStages = [
      'lead_novo',
      'qualificacao',
      'apresentacao',
      'visita_agendada',
      'proposta',
      'documentacao',
      'fechamento',
    ];

    if (!validStages.includes(stage)) {
      return NextResponse.json(
        { error: `Invalid stage. Must be one of: ${validStages.join(', ')}` },
        { status: 400 }
      );
    }

    // Atualizar estágio do lead
    const { data: lead, error } = await supabase
      .from('leads')
      .update({
        stage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .eq('account_id', ACCOUNT_ID)
      .select()
      .single();

    if (error) {
      console.error('[API /leads/[id]/stage] Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Lead ${leadId} movido para estágio: ${stage}`);

    return NextResponse.json({
      lead,
      message: 'Lead stage updated successfully',
    });
  } catch (error: any) {
    console.error('[API /leads/[id]/stage] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
