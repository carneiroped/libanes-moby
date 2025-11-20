import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateBody, leadSchemas } from '@/lib/validation/schemas';
import { rateLimiters } from '@/lib/security/rate-limiter';

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
    // Rate limiting
    const rateLimitKey = request.headers.get('x-forwarded-for') || 'unknown';
    const isAllowed = await rateLimiters.standard.isAllowed(rateLimitKey);

    if (!isAllowed) {
      return NextResponse.json(
        { error: rateLimiters.standard.getMessage() },
        { status: 429 }
      );
    }

    const { id: leadId } = await params;

    // Validate lead ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(leadId)) {
      return NextResponse.json(
        { error: 'Invalid lead ID format' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Validate request body
    const validation = await validateBody(request, leadSchemas.updateStage);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { stage } = validation.data;

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
      console.error('[API /leads/[id]/stage] Database error:', error.code);
      return NextResponse.json(
        { error: 'Failed to update lead stage' },
        { status: 500 }
      );
    }

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Lead ${leadId} stage updated to: ${stage}`);

    return NextResponse.json({
      lead,
      message: 'Lead stage updated successfully',
    });
  } catch (error: any) {
    console.error('[API /leads/[id]/stage] Unexpected error:', error.name);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
