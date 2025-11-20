import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateBody, leadSchemas } from '@/lib/validation/schemas';
import { rateLimiters } from '@/lib/security/rate-limiter';

const ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

/**
 * GET /api/leads - Fetch leads by IDs
 */
export async function GET(request: Request) {
  try {
    // Rate limiting
    const rateLimitKey = request.headers.get('x-forwarded-for') || 'unknown';
    const isAllowed = await rateLimiters.api.isAllowed(rateLimitKey);

    if (!isAllowed) {
      return NextResponse.json(
        { error: rateLimiters.api.getMessage() },
        { status: 429 }
      );
    }

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

    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'ids parameter must contain at least one ID' },
        { status: 400 }
      );
    }

    const { data: leads, error } = await supabase
      .from('leads')
      .select('id, name, phone, email')
      .in('id', ids)
      .eq('account_id', ACCOUNT_ID);

    if (error) {
      console.error('[API /leads GET] Database error:', error.code);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    return NextResponse.json({ leads: leads || [] });
  } catch (error: any) {
    console.error('[API /leads GET] Unexpected error:', error.name);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads - Create a new lead
 */
export async function POST(request: Request) {
  try {
    // Rate limiting - stricter for POST operations
    const rateLimitKey = request.headers.get('x-forwarded-for') || 'unknown';
    const isAllowed = await rateLimiters.standard.isAllowed(rateLimitKey);

    if (!isAllowed) {
      return NextResponse.json(
        { error: rateLimiters.standard.getMessage() },
        { status: 429 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Validate and sanitize request body
    const validation = await validateBody(request, leadSchemas.create);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const body = validation.data;

    // Preparar dados do lead com valores padrão
    const leadData = {
      ...body,
      account_id: ACCOUNT_ID,
      source: body.source || 'website',
      status: body.status || 'novo',
      stage: body.stage || 'lead_novo',
      score: body.score !== undefined ? body.score : 50,
      tags: body.tags || [],
    };

    console.log('[API /leads POST] Creating lead');

    // Inserir lead no banco de dados
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (error) {
      console.error('[API /leads POST] Database error:', error.code);

      // Handle specific database errors
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Lead with this phone already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      );
    }

    console.log('[API /leads POST] Lead created successfully');

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('[API /leads POST] Unexpected error:', error.name);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
