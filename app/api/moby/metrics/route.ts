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
    // Buscar total de leads
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', MOBY_ACCOUNT_ID);

    // Buscar total de imóveis
    const { count: totalImoveis } = await supabase
      .from('imoveis')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', MOBY_ACCOUNT_ID);

    // Buscar total de conversas
    const { count: totalChats } = await supabase
      .from('chats')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', MOBY_ACCOUNT_ID);

    // Buscar mensagens hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: messagesToday } = await supabase
      .from('chat_messages')
      .select('*, chats!inner(account_id)', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())
      .eq('chats.account_id', MOBY_ACCOUNT_ID);

    // Buscar mensagens este mês
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const { count: messagesThisMonth } = await supabase
      .from('chat_messages')
      .select('*, chats!inner(account_id)', { count: 'exact', head: true })
      .gte('created_at', firstDayOfMonth.toISOString())
      .eq('chats.account_id', MOBY_ACCOUNT_ID);

    // Buscar conversas ativas (com mensagens nos últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: activeChats } = await supabase
      .from('chats')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', MOBY_ACCOUNT_ID)
      .gte('updated_at', sevenDaysAgo.toISOString());

    // Buscar leads por estágio para calcular taxa de conversão
    const { data: leadsByStage } = await supabase
      .from('leads')
      .select('stage')
      .eq('account_id', MOBY_ACCOUNT_ID);

    // Contar leads por estágio
    const leadsWon = leadsByStage?.filter(l => l.stage === 'won').length || 0;
    const leadsLost = leadsByStage?.filter(l => l.stage === 'lost').length || 0;
    const totalProcessedLeads = leadsWon + leadsLost;
    const conversionRate = totalProcessedLeads > 0
      ? Math.round((leadsWon / totalProcessedLeads) * 100)
      : 0;

    // Buscar últimas mensagens para calcular tempo médio de resposta
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('created_at, chats!inner(account_id)')
      .eq('chats.account_id', MOBY_ACCOUNT_ID)
      .order('created_at', { ascending: false })
      .limit(100);

    // Calcular tempo médio entre mensagens (aproximação de tempo de resposta)
    let avgResponseTime = 0;
    if (recentMessages && recentMessages.length > 1) {
      const timeDiffs: number[] = [];
      for (let i = 0; i < recentMessages.length - 1; i++) {
        const current = new Date(recentMessages[i].created_at).getTime();
        const next = new Date(recentMessages[i + 1].created_at).getTime();
        const diff = Math.abs(current - next) / 1000; // em segundos
        if (diff < 3600) { // Apenas diferenças menores que 1 hora
          timeDiffs.push(diff);
        }
      }
      if (timeDiffs.length > 0) {
        const avgSeconds = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
        avgResponseTime = Math.round(avgSeconds / 60); // converter para minutos
      }
    }

    return NextResponse.json({
      usage: {
        totalLeads: totalLeads || 0,
        totalImoveis: totalImoveis || 0,
        totalChats: totalChats || 0,
        activeChats: activeChats || 0
      },
      engagement: {
        messagesToday: messagesToday || 0,
        messagesThisMonth: messagesThisMonth || 0,
        averageResponseTimeMinutes: avgResponseTime
      },
      performance: {
        conversionRate: conversionRate,
        leadsWon: leadsWon,
        leadsLost: leadsLost,
        totalLeadsProcessed: totalProcessedLeads
      }
    });
  } catch (error: any) {
    console.error('[API /moby/metrics] Erro:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar métricas' },
      { status: 500 }
    );
  }
}
