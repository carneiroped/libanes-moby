import { NextRequest, NextResponse } from 'next/server';
import { supabase, getUserAccountId } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const accountId = await getUserAccountId();
    if (!accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id');

    if (!leadId) {
      return NextResponse.json({ error: 'lead_id is required' }, { status: 400 });
    }

    // Buscar atividades/interações do lead
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        users:user_id (
          id,
          name,
          email
        )
      `)
      .eq('lead_id', leadId)
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API /lead-interactions GET] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mapear activities para formato de interações
    const interactions = (data || []).map(activity => ({
      id: activity.id,
      lead_id: leadId,
      interaction_type: activity.type || 'other',
      description: activity.description,
      created_at: activity.created_at,
      created_by: activity.user_id,
      user_id: activity.user_id,
      type: activity.type,
      outcome: activity.outcome || null,
      duration_minutes: activity.duration_minutes || null,
      metadata: activity.metadata,
      user_name: activity.users?.name || activity.users?.email || 'Usuário Desconhecido'
    }));

    return NextResponse.json({ data: interactions });
  } catch (error: any) {
    console.error('[API /lead-interactions GET] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const accountId = await getUserAccountId();
    if (!accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      lead_id,
      interaction_type,
      description,
      created_by,
      outcome,
      duration_minutes
    } = body;

    if (!lead_id || !interaction_type || !description || !created_by) {
      return NextResponse.json(
        { error: 'lead_id, interaction_type, description, and created_by are required' },
        { status: 400 }
      );
    }

    // Criar activity/interação
    const { data, error } = await supabase
      .from('activities')
      .insert({
        account_id: accountId,
        lead_id,
        type: interaction_type,
        title: description.substring(0, 100), // Título limitado
        description,
        user_id: created_by,
        outcome: outcome || null,
        duration_minutes: duration_minutes || null,
        metadata: {
          interaction_type
        }
      })
      .select()
      .single();

    if (error) {
      console.error('[API /lead-interactions POST] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('[API /lead-interactions POST] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const accountId = await getUserAccountId();
    if (!accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Deletar activity/interação
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)
      .eq('account_id', accountId);

    if (error) {
      console.error('[API /lead-interactions DELETE] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: { id, deleted: true } });
  } catch (error: any) {
    console.error('[API /lead-interactions DELETE] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
