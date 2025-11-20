import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MOBY_ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = parseInt(searchParams.get('pageSize') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * pageSize;

    // Buscar imóveis do Supabase
    const { data: imoveis, error, count } = await supabase
      .from('imoveis')
      .select('*', { count: 'exact' })
      .eq('account_id', MOBY_ACCOUNT_ID)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching imoveis:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar imóveis', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imoveis: imoveis || [],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    });
  } catch (error: any) {
    console.error('[API /imoveis] Erro:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar imóveis' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Adicionar account_id automaticamente
    const imovelData = {
      ...body,
      account_id: MOBY_ACCOUNT_ID
    };

    const { data, error } = await supabase
      .from('imoveis')
      .insert([imovelData])
      .select()
      .single();

    if (error) {
      console.error('Error creating imovel:', error);
      return NextResponse.json(
        { error: 'Erro ao criar imóvel', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /imoveis POST] Erro:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar imóvel' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do imóvel é obrigatório' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('imoveis')
      .update(updateData)
      .eq('id', id)
      .eq('account_id', MOBY_ACCOUNT_ID)
      .select()
      .single();

    if (error) {
      console.error('Error updating imovel:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar imóvel', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /imoveis PATCH] Erro:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar imóvel' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID do imóvel é obrigatório' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('imoveis')
      .delete()
      .eq('id', id)
      .eq('account_id', MOBY_ACCOUNT_ID);

    if (error) {
      console.error('Error deleting imovel:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar imóvel', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API /imoveis DELETE] Erro:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar imóvel' },
      { status: 500 }
    );
  }
}
