/**
 * API ENDPOINT - WEBHOOK GRUPO OLX/ZAP
 *
 * Recebe leads do Grupo OLX (ZAP Imóveis, Viva Real) via webhook
 *
 * Documentação oficial:
 * https://developers.grupozap.com/webhooks/integration_leads.html
 *
 * Comportamento:
 * - 2xx: Sucesso (lead recebido)
 * - 3xx, 4xx, 5xx: Falha (retry automático 3x, buffer de 14 dias)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { OlxZapWebhookPayload, OlxZapLead } from '@/types/olx-zap';

// Configuração Supabase (service role para bypass RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// SECRET_KEY fornecida pelo Grupo OLX
const OLX_ZAP_SECRET_KEY = process.env.OLX_ZAP_SECRET_KEY ||
  'dml2YXJlYWw6ZjZmMTg0MDhkNTE1ZDE3NmRjYTE5ODlhYjY1ZTVmNjk=';

// Account ID padrão (Moby Imobiliária)
const DEFAULT_ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

/**
 * POST - Recebe webhook de lead do Grupo OLX/ZAP
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let payload: OlxZapWebhookPayload | null = null;
  let accountId: string | null = null;

  try {
    // ============================================
    // 1. VALIDAÇÃO DE AUTENTICAÇÃO
    // ============================================

    const userAgent = request.headers.get('user-agent') || '';
    const authHeader = request.headers.get('authorization') || '';

    // Validar user-agent (OLX envia "olx-group-api")
    if (!userAgent.includes('olx-group-api') && process.env.NODE_ENV === 'production') {
      console.warn('[OLX/ZAP Webhook] User-agent inválido:', userAgent);

      await logWebhookRequest(request, null, 401, {
        error: 'User-agent inválido',
        userAgent,
      }, startTime);

      return NextResponse.json(
        { success: false, message: 'Unauthorized - Invalid user-agent' },
        { status: 401 }
      );
    }

    // Validar SECRET_KEY (pode vir no header Authorization)
    // Nota: Algumas implementações enviam via query param ou header custom
    const secretKey = authHeader.replace('Bearer ', '') ||
                      request.nextUrl.searchParams.get('secret_key');

    if (secretKey && secretKey !== OLX_ZAP_SECRET_KEY && process.env.NODE_ENV === 'production') {
      console.warn('[OLX/ZAP Webhook] SECRET_KEY inválida');

      await logWebhookRequest(request, null, 401, {
        error: 'SECRET_KEY inválida',
      }, startTime);

      return NextResponse.json(
        { success: false, message: 'Unauthorized - Invalid secret key' },
        { status: 401 }
      );
    }

    // ============================================
    // 2. PARSE DO PAYLOAD
    // ============================================

    try {
      payload = await request.json() as OlxZapWebhookPayload;
    } catch (error) {
      console.error('[OLX/ZAP Webhook] Erro ao fazer parse do JSON:', error);

      await logWebhookRequest(request, null, 400, {
        error: 'JSON inválido',
      }, startTime);

      return NextResponse.json(
        { success: false, message: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    console.log('[OLX/ZAP Webhook] Payload recebido:', {
      originLeadId: payload.originLeadId,
      name: payload.name,
      clientListingId: payload.clientListingId,
      temperature: payload.temperature,
    });

    // ============================================
    // 3. VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS
    // ============================================

    if (!payload.originLeadId || !payload.name || !payload.timestamp) {
      console.error('[OLX/ZAP Webhook] Campos obrigatórios faltando:', payload);

      await logWebhookRequest(request, null, 400, {
        error: 'Campos obrigatórios faltando',
        payload,
      }, startTime);

      return NextResponse.json(
        { success: false, message: 'Missing required fields: originLeadId, name, timestamp' },
        { status: 400 }
      );
    }

    // ============================================
    // 4. DETERMINAR ACCOUNT_ID
    // ============================================

    // TODO: Implementar lógica para determinar account_id do cliente
    // Por enquanto, usar account padrão Moby
    accountId = DEFAULT_ACCOUNT_ID;

    // Verificar se a integração está ativa para esta conta
    const { data: integration } = await supabase
      .from('olx_zap_integrations')
      .select('*')
      .eq('account_id', accountId)
      .single();

    if (!integration) {
      console.warn('[OLX/ZAP Webhook] Integração não configurada para account:', accountId);

      // Criar integração automaticamente
      await supabase.from('olx_zap_integrations').insert({
        account_id: accountId,
        is_active: true,
        total_leads_received: 0,
      });
    }

    if (integration && !integration.is_active) {
      console.warn('[OLX/ZAP Webhook] Integração desativada para account:', accountId);

      await logWebhookRequest(request, accountId, 403, {
        error: 'Integração desativada',
      }, startTime);

      return NextResponse.json(
        { success: false, message: 'Integration disabled for this account' },
        { status: 403 }
      );
    }

    // ============================================
    // 5. VERIFICAR DUPLICAÇÃO (originLeadId)
    // ============================================

    const { data: existingLead } = await supabase
      .from('olx_zap_leads')
      .select('id, status, lead_id')
      .eq('account_id', accountId)
      .eq('origin_lead_id', payload.originLeadId)
      .single();

    if (existingLead) {
      console.log('[OLX/ZAP Webhook] Lead duplicado (já existe):', existingLead.id);

      await logWebhookRequest(request, accountId, 200, {
        message: 'Lead duplicado (já processado)',
        olxZapLeadId: existingLead.id,
        leadId: existingLead.lead_id,
      }, startTime, existingLead.id);

      // Retornar 200 mesmo sendo duplicado (GrupoZap espera sucesso)
      return NextResponse.json({
        success: true,
        message: 'Lead already exists (duplicate)',
        olxZapLeadId: existingLead.id,
        leadId: existingLead.lead_id,
      }, { status: 200 });
    }

    // ============================================
    // 6. CRIAR REGISTRO EM olx_zap_leads
    // ============================================

    const olxZapLeadData: Partial<OlxZapLead> = {
      account_id: accountId,
      lead_origin: payload.leadOrigin,
      timestamp: payload.timestamp,
      origin_lead_id: payload.originLeadId,
      origin_listing_id: payload.originListingId || null,
      client_listing_id: payload.clientListingId || null,
      name: payload.name,
      email: payload.email || null,
      ddd: payload.ddd || null,
      phone: payload.phone || null,
      phone_number: payload.phoneNumber || null,
      message: payload.message || null,
      temperature: payload.temperature || null,
      transaction_type: payload.transactionType || null,
      status: 'pending',
      raw_payload: payload as any,
    };

    const { data: createdOlxLead, error: olxLeadError } = await supabase
      .from('olx_zap_leads')
      .insert(olxZapLeadData)
      .select()
      .single();

    if (olxLeadError || !createdOlxLead) {
      console.error('[OLX/ZAP Webhook] Erro ao criar olx_zap_lead:', olxLeadError);

      await logWebhookRequest(request, accountId, 500, {
        error: 'Erro ao salvar lead OLX/ZAP',
        details: olxLeadError,
      }, startTime);

      return NextResponse.json(
        { success: false, message: 'Failed to save OLX/ZAP lead' },
        { status: 500 }
      );
    }

    console.log('[OLX/ZAP Webhook] olx_zap_lead criado:', createdOlxLead.id);

    // ============================================
    // 7. BUSCAR IMÓVEL RELACIONADO (clientListingId)
    // ============================================

    let imovelId: string | null = null;

    if (payload.clientListingId) {
      // Buscar imóvel pelo ID customizado (pode ser titulo, codigo, etc)
      const { data: imovel } = await supabase
        .from('imoveis')
        .select('id')
        .eq('account_id', accountId)
        .or(`titulo.ilike.%${payload.clientListingId}%,id.eq.${payload.clientListingId}`)
        .single();

      if (imovel) {
        imovelId = imovel.id;
        console.log('[OLX/ZAP Webhook] Imóvel encontrado:', imovelId);
      } else {
        console.warn('[OLX/ZAP Webhook] Imóvel não encontrado para clientListingId:', payload.clientListingId);
      }
    }

    // ============================================
    // 8. CRIAR LEAD NO SISTEMA (tabela leads)
    // ============================================

    const leadData = {
      account_id: accountId,
      name: payload.name,
      email: payload.email || null,
      phone: payload.phoneNumber || `${payload.ddd}${payload.phone}`,

      // Status e estágio
      status: 'ativo',
      stage: 'new',

      // Fonte
      source: 'Grupo OLX',
      source_details: `${payload.leadOrigin} - ${payload.originListingId}`,

      // Preferências de imóvel
      property_preferences: {
        tipo_interesse: payload.transactionType === 'SELL' ? 'compra' : 'locacao',
        mensagem: payload.message,
        imovel_interesse_id: payload.clientListingId,
      },

      // Qualificação
      score: payload.temperature === 'Alta' ? 90 : payload.temperature === 'Média' ? 60 : 30,
      temperature: payload.temperature?.toLowerCase(),

      // Relacionamento
      imovel_id: imovelId,

      // Datas
      last_contact: new Date().toISOString(),
    };

    const { data: createdLead, error: leadError } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (leadError || !createdLead) {
      console.error('[OLX/ZAP Webhook] Erro ao criar lead:', leadError);

      // Marcar olx_zap_lead como erro
      await supabase
        .from('olx_zap_leads')
        .update({
          status: 'error',
          processing_error: leadError?.message || 'Erro ao criar lead',
        })
        .eq('id', createdOlxLead.id);

      await logWebhookRequest(request, accountId, 500, {
        error: 'Erro ao criar lead no sistema',
        details: leadError,
      }, startTime, createdOlxLead.id);

      return NextResponse.json(
        { success: false, message: 'Failed to create lead in CRM' },
        { status: 500 }
      );
    }

    console.log('[OLX/ZAP Webhook] Lead criado no sistema:', createdLead.id);

    // ============================================
    // 9. ATUALIZAR olx_zap_lead COM lead_id
    // ============================================

    await supabase
      .from('olx_zap_leads')
      .update({
        lead_id: createdLead.id,
        imovel_id: imovelId,
        status: 'processed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', createdOlxLead.id);

    // ============================================
    // 10. ATUALIZAR ESTATÍSTICAS DA INTEGRAÇÃO
    // ============================================

    try {
      await supabase.rpc('increment', {
        table_name: 'olx_zap_integrations',
        column_name: 'total_leads_received',
        row_id: integration?.id,
      });
    } catch {
      // Fallback: atualizar manualmente
      await supabase
        .from('olx_zap_integrations')
        .update({
          total_leads_received: (integration?.total_leads_received || 0) + 1,
          last_lead_received_at: new Date().toISOString(),
        })
        .eq('account_id', accountId);
    }

    // ============================================
    // 11. LOG DE SUCESSO
    // ============================================

    await logWebhookRequest(request, accountId, 200, {
      success: true,
      olxZapLeadId: createdOlxLead.id,
      leadId: createdLead.id,
      imovelId,
    }, startTime, createdOlxLead.id);

    console.log('[OLX/ZAP Webhook] ✅ Lead processado com sucesso:', {
      olxZapLeadId: createdOlxLead.id,
      leadId: createdLead.id,
      imovelId,
      processingTime: Date.now() - startTime + 'ms',
    });

    // ============================================
    // 12. RETORNAR SUCESSO (200)
    // ============================================

    return NextResponse.json({
      success: true,
      message: 'Lead received and processed successfully',
      olxZapLeadId: createdOlxLead.id,
      leadId: createdLead.id,
      imovelId,
    }, { status: 200 });

  } catch (error: any) {
    console.error('[OLX/ZAP Webhook] ❌ Erro não tratado:', error);

    await logWebhookRequest(request, accountId, 500, {
      error: 'Erro interno do servidor',
      message: error.message,
      stack: error.stack,
    }, startTime);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Função auxiliar para registrar log de webhook
 */
async function logWebhookRequest(
  request: NextRequest,
  accountId: string | null,
  statusCode: number,
  responseBody: any,
  startTime: number,
  olxZapLeadId?: string
) {
  try {
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let requestBody: any = null;
    try {
      requestBody = await request.clone().json();
    } catch {
      // Ignorar se não conseguir fazer parse
    }

    await supabase.from('olx_zap_webhook_logs').insert({
      account_id: accountId,
      request_method: request.method,
      request_headers: headers,
      request_body: requestBody,
      request_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
      response_status: statusCode,
      response_body: responseBody,
      processing_time_ms: Date.now() - startTime,
      olx_zap_lead_id: olxZapLeadId || null,
      origin_lead_id: requestBody?.originLeadId || null,
    });
  } catch (error) {
    console.error('[OLX/ZAP Webhook] Erro ao criar log:', error);
  }
}

/**
 * GET - Retorna status da API (healthcheck)
 */
export async function GET() {
  return NextResponse.json({
    service: 'OLX/ZAP Webhook Receiver',
    status: 'active',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
