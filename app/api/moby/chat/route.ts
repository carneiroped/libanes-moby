import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

// Configuração do Azure OpenAI
const azureOpenAI = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: '2024-08-01-preview',
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini'
});

// Configuração do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MOBY_ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

// Função para buscar métricas do Supabase
async function getBusinessMetrics() {
  try {
    // Buscar total de leads
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', MOBY_ACCOUNT_ID);

    // Buscar leads por status
    const { data: leadsByStatus } = await supabase
      .from('leads')
      .select('stage')
      .eq('account_id', MOBY_ACCOUNT_ID);

    // Buscar total de imóveis
    const { count: totalImoveis } = await supabase
      .from('imoveis')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', MOBY_ACCOUNT_ID);

    // Buscar imóveis por tipo
    const { data: imoveisByType } = await supabase
      .from('imoveis')
      .select('type')
      .eq('account_id', MOBY_ACCOUNT_ID);

    // Buscar conversas ativas
    const { count: activeChats } = await supabase
      .from('chats')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', MOBY_ACCOUNT_ID)
      .eq('status', 'active');

    // Buscar total de mensagens hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: messagesToday } = await supabase
      .from('chat_messages')
      .select('*, chats!inner(account_id)', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())
      .eq('chats.account_id', MOBY_ACCOUNT_ID);

    // Calcular distribuição de leads por estágio
    const stageDistribution: Record<string, number> = {};
    leadsByStatus?.forEach((lead: any) => {
      const stage = lead.stage || 'unknown';
      stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;
    });

    // Calcular distribuição de imóveis por tipo
    const typeDistribution: Record<string, number> = {};
    imoveisByType?.forEach((imovel: any) => {
      const type = imovel.type || 'unknown';
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });

    return {
      totalLeads: totalLeads || 0,
      leadsByStage: stageDistribution,
      totalImoveis: totalImoveis || 0,
      imoveisByType: typeDistribution,
      activeChats: activeChats || 0,
      messagesToday: messagesToday || 0
    };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem não fornecida' },
        { status: 400 }
      );
    }

    // Buscar métricas do negócio
    const metrics = await getBusinessMetrics();

    // Nome da imobiliária
    const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'sua imobiliária';

    // Construir contexto com métricas
    let context = `Você é o Moby, um agente especializado em vendas de imóveis. Você trabalha para a ${companyName} e tem acesso às seguintes informações atualizadas do negócio:\n\n`;

    if (metrics) {
      context += `Métricas Atuais:\n`;
      context += `- Total de Leads: ${metrics.totalLeads}\n`;
      context += `- Distribuição de Leads por Estágio:\n`;
      Object.entries(metrics.leadsByStage).forEach(([stage, count]) => {
        context += `  - ${stage}: ${count} leads\n`;
      });
      context += `- Total de Imóveis: ${metrics.totalImoveis}\n`;
      context += `- Distribuição de Imóveis por Tipo:\n`;
      Object.entries(metrics.imoveisByType).forEach(([type, count]) => {
        const typeName = type === 'apartment' ? 'Apartamentos' :
                         type === 'house' ? 'Casas' :
                         type === 'commercial' ? 'Comerciais' :
                         type === 'land' ? 'Terrenos' : type;
        context += `  - ${typeName}: ${count}\n`;
      });
      context += `- Conversas Ativas no WhatsApp: ${metrics.activeChats}\n`;
      context += `- Mensagens Trocadas Hoje: ${metrics.messagesToday}\n\n`;
    }

    context += `Suas Capacidades:
- Analisar métricas e tendências de vendas
- Responder perguntas sobre leads, imóveis e conversas
- Fornecer insights estratégicos para aumentar vendas
- Ajudar a entender o desempenho comercial
- Sugerir ações baseadas nos dados da ${companyName}

Diretrizes IMPORTANTES:
- NUNCA use formatação markdown (**, *, _, ##, etc)
- NUNCA use emojis
- Seja profissional, consultivo e focado em vendas
- Use dados concretos quando disponíveis
- Forneça insights acionáveis para fechar mais negócios
- Conheça profundamente o mercado imobiliário brasileiro
- Use linguagem clara, objetiva e SEM FORMATAÇÃO
- Quando falar de valores, use R$ (reais brasileiros)
- Sempre mencione que você trabalha para a ${companyName}
- Responda em texto puro, sem nenhuma formatação especial`;

    // Chamada à API do Azure OpenAI
    const completion = await azureOpenAI.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: context
        },
        {
          role: 'user',
          content: message
        }
      ],
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('[API /moby/chat] Erro:', error);

    // Tratamento de erros específicos
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Não foi possível conectar ao Azure OpenAI. Verifique as configurações.' },
        { status: 503 }
      );
    }

    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Credenciais do Azure OpenAI inválidas. Verifique a API Key.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
}
