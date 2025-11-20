import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MOBY_ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

// GET /api/chats/messages - Get messages for a chat
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chat_id');
    const phone = searchParams.get('phone');

    if (!chatId && !phone) {
      return NextResponse.json({ error: 'chat_id or phone is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // If searching by phone, first get the chat
    let finalChatId = chatId;
    if (!finalChatId && phone) {
      const { data: chats, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .eq('phone', phone)
        .eq('account_id', MOBY_ACCOUNT_ID)
        .limit(1);

      if (chatError || !chats || chats.length === 0) {
        console.log('[API /chats/messages] No chat found for phone:', phone);
        return NextResponse.json([]);
      }

      finalChatId = chats[0].id.toString();
    }

    // Verify chat belongs to account
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('id')
      .eq('id', finalChatId)
      .eq('account_id', MOBY_ACCOUNT_ID)
      .single();

    if (chatError || !chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Get messages
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', finalChatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[API /chats/messages] Error fetching messages:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API /chats/messages] Successfully fetched messages:', data?.length || 0);
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('[API /chats/messages] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/chats/messages - Send a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chat_id, user_message, bot_message, phone, user_name } = body;

    if (!chat_id) {
      return NextResponse.json({ error: 'chat_id is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify chat belongs to account
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('id')
      .eq('id', chat_id)
      .eq('account_id', MOBY_ACCOUNT_ID)
      .single();

    if (chatError || !chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id,
        user_message,
        bot_message,
        phone,
        user_name,
        conversation_id: body.conversation_id || null,
        message_type: body.message_type || 'text',
        app: body.app || 'delivery',
        status: 'sent',
        active: true
      })
      .select()
      .single();

    if (error) {
      console.error('[API /chats/messages] Error creating message:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update chat's updated_at
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chat_id);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /chats/messages] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
