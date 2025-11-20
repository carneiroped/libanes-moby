import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json(
        { error: 'ids parameter is required' },
        { status: 400 }
      );
    }

    const ids = idsParam.split(',').filter(Boolean);

    const { data: leads, error } = await supabase
      .from('leads')
      .select('id, name, phone, email')
      .in('id', ids)
      .eq('account_id', ACCOUNT_ID);

    if (error) {
      console.error('[API /leads GET] Error fetching leads:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ leads: leads || [] });
  } catch (error: any) {
    console.error('[API /leads GET] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const body = await request.json();

    // Validar campos obrigatórios
    if (!body.phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Preparar dados do lead com valores padrão
    const leadData = {
      ...body,
      account_id: ACCOUNT_ID, // Adicionar account_id automaticamente
      source: body.source || 'website',
      status: body.status || 'novo',
      stage: body.stage || 'lead_novo', // Stage padrão válido
      score: body.score !== undefined ? body.score : 50,
      tags: body.tags || [],
    };

    console.log('[API /leads POST] Creating lead with data:', leadData);

    // Inserir lead no banco de dados
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (error) {
      console.error('[API /leads POST] Error creating lead:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('[API /leads POST] Lead created successfully:', data);

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('[API /leads POST] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
