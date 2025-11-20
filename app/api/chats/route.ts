import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MOBY_ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

// GET /api/chats - Query from chats table
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabase
      .from('chats')
      .select(`
        *,
        leads:lead_id (
          id,
          name,
          phone
        )
      `, { count: 'exact' })
      .eq('account_id', MOBY_ACCOUNT_ID);

    // Apply filters
    const id = searchParams.get('id');
    if (id) query = query.eq('id', id);

    const status = searchParams.get('status');
    if (status) query = query.eq('status', status);

    const phone = searchParams.get('phone');
    if (phone) query = query.eq('phone', phone);

    const leadId = searchParams.get('lead_id');
    if (leadId) query = query.eq('lead_id', leadId);

    const search = searchParams.get('search');
    if (search) {
      query = query.or(`phone.ilike.%${search}%,conversation_id.ilike.%${search}%`);
    }

    // Order by last message (most recent first)
    query = query.order('updated_at', { ascending: false });

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    console.log('[API /chats] Executing Supabase query');

    const { data, error, count } = await query;

    if (error) {
      console.error('[API /chats] Error fetching chats:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map database column names to frontend expected names
    const mappedData = (data || []).map((chat: any) => {
      const leadData = chat.leads || {};
      return {
        ...chat,
        lead_name: leadData.name || null,
        user_name: leadData.name || null,
        lead_phone: chat.phone,
        channel_chat_id: chat.conversation_id,
        app: chat.app || 'delivery',
        messages_count: 0, // TODO: calculate this
      };
    });

    console.log('[API /chats] Successfully fetched chats:', mappedData.length);

    return NextResponse.json({
      chats: mappedData,
      count: count || 0,
      page,
      pageSize,
      totalPages: count ? Math.ceil(count / pageSize) : 0
    });
  } catch (error: any) {
    console.error('[API /chats] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/chats - Create new chat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('chats')
      .insert({
        account_id: MOBY_ACCOUNT_ID,
        phone: body.phone,
        conversation_id: body.conversation_id || null,
        app: body.app || 'delivery',
        lead_id: body.lead_id || null,
        status: body.status || 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('[API /chats] Error creating chat:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /chats] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/chats
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', id)
      .eq('account_id', MOBY_ACCOUNT_ID);

    if (error) {
      console.error('[API /chats] Error deleting chat:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API /chats] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/chats - Update chat status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('chats')
      .update({ status })
      .eq('id', id)
      .eq('account_id', MOBY_ACCOUNT_ID)
      .select()
      .single();

    if (error) {
      console.error('[API /chats] Error updating chat:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /chats] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
