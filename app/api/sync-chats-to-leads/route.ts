import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Buscar todos os chats sem lead_id
    const { data: chatsWithoutLead, error: chatsError } = await supabase
      .from('chats')
      .select('id, phone, created_at, conversation_id')
      .is('lead_id', null)
      .eq('account_id', ACCOUNT_ID);

    if (chatsError) {
      console.error('[API /sync-chats-to-leads] Error fetching chats:', chatsError);
      return NextResponse.json({ error: chatsError.message }, { status: 500 });
    }

    if (!chatsWithoutLead || chatsWithoutLead.length === 0) {
      return NextResponse.json({
        message: 'Nenhum chat sem lead encontrado',
        synced: 0,
        total: 0
      });
    }

    console.log(`[API /sync-chats-to-leads] Found ${chatsWithoutLead.length} chats without leads`);

    // 2. Buscar estágio padrão do pipeline
    const { data: defaultStage } = await supabase
      .from('pipeline_stages')
      .select('id')
      .eq('pipeline_id', (
        await supabase
          .from('pipelines')
          .select('id')
          .eq('account_id', ACCOUNT_ID)
          .eq('is_default', true)
          .single()
      ).data?.id)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();

    const defaultStageId = defaultStage?.id;

    let syncedCount = 0;
    let errors: any[] = [];

    // 3. Processar cada chat
    for (const chat of chatsWithoutLead) {
      try {
        // 3.1 Verificar se já existe lead com este telefone
        const { data: existingLead } = await supabase
          .from('leads')
          .select('id')
          .eq('phone', chat.phone)
          .eq('account_id', ACCOUNT_ID)
          .single();

        let leadId: string;

        if (existingLead) {
          // Lead já existe, apenas vincular
          leadId = existingLead.id;
          console.log(`[API /sync-chats-to-leads] Chat ${chat.id} linked to existing lead ${leadId}`);
        } else {
          // 3.2 Buscar nome do usuário nas mensagens
          const { data: latestMessage } = await supabase
            .from('chat_messages')
            .select('user_name')
            .eq('phone', chat.phone)
            .not('user_name', 'is', null)
            .neq('user_name', '')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const contactName = latestMessage?.user_name || `Cliente ${chat.phone.slice(-6)}`;

          // 3.3 Criar novo lead
          const { data: newLead, error: leadError } = await supabase
            .from('leads')
            .insert({
              account_id: ACCOUNT_ID,
              name: contactName,
              phone: chat.phone,
              source: 'whatsapp',
              status: 'novo',
              stage: 'novo',
              pipeline_stage_id: defaultStageId,
              score: 50,
              last_contact: chat.created_at,
              created_at: chat.created_at
            })
            .select('id')
            .single();

          if (leadError) {
            console.error(`[API /sync-chats-to-leads] Error creating lead for chat ${chat.id}:`, leadError);
            errors.push({ chat_id: chat.id, error: leadError.message });
            continue;
          }

          leadId = newLead.id;
          console.log(`[API /sync-chats-to-leads] Created new lead ${leadId} for chat ${chat.id}`);

          // 3.4 Criar atividade inicial
          await supabase.from('activities').insert({
            account_id: ACCOUNT_ID,
            lead_id: leadId,
            type: 'whatsapp',
            title: 'Primeiro contato via WhatsApp',
            description: `Lead entrou em contato pela primeira vez através do WhatsApp (sincronizado do chat ${chat.id})`,
            status: 'completed',
            completed_at: chat.created_at,
            created_at: chat.created_at
          });
        }

        // 3.5 Atualizar chat com lead_id
        const { error: updateError } = await supabase
          .from('chats')
          .update({ lead_id: leadId })
          .eq('id', chat.id);

        if (updateError) {
          console.error(`[API /sync-chats-to-leads] Error updating chat ${chat.id}:`, updateError);
          errors.push({ chat_id: chat.id, error: updateError.message });
          continue;
        }

        syncedCount++;
      } catch (error: any) {
        console.error(`[API /sync-chats-to-leads] Error processing chat ${chat.id}:`, error);
        errors.push({ chat_id: chat.id, error: error.message });
      }
    }

    return NextResponse.json({
      message: 'Sincronização concluída',
      synced: syncedCount,
      total: chatsWithoutLead.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('[API /sync-chats-to-leads] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
