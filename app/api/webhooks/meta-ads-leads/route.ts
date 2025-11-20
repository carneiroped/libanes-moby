import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';
import type { Database } from '@/types/supabase';
import type { MetaWebhookPayload, FacebookLeadFormData } from '@/types/meta-ads';

const MOBY_ACCOUNT_ID = 'cb9f91dd-f076-4535-bc1a-49162615de7d';

// Supabase service role client para operações privilegiadas
const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
};

/**
 * GET /api/webhooks/meta-ads-leads
 *
 * Verificação do webhook (Facebook/Instagram exige)
 *
 * Query params:
 * - hub.mode: 'subscribe'
 * - hub.challenge: código de verificação
 * - hub.verify_token: token configurado na integração
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const challenge = searchParams.get('hub.challenge');
    const verifyToken = searchParams.get('hub.verify_token');

    // Buscar integração ativa
    const supabase = getServiceClient();
    const { data: integration } = await supabase
      .from('meta_ads_integrations')
      .select('verify_token')
      .eq('account_id', MOBY_ACCOUNT_ID)
      .eq('is_active', true)
      .single();

    // Validar verificação
    if (mode === 'subscribe' && verifyToken === integration?.verify_token) {
      console.log('Webhook Meta Ads verificado com sucesso');
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    console.error('Falha na verificação do webhook Meta Ads:', {
      mode,
      verifyToken,
      expectedToken: integration?.verify_token
    });

    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );

  } catch (error: any) {
    console.error('Erro na verificação do webhook Meta Ads:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/webhooks/meta-ads-leads
 *
 * Webhook endpoint para receber leads de Meta Ads (Facebook/Instagram Lead Forms)
 *
 * Headers esperados:
 * - X-Hub-Signature-256: SHA256 HMAC do body
 * - Content-Type: application/json
 */
export async function POST(request: NextRequest) {
  const supabase = getServiceClient();
  const startTime = Date.now();

  let integrationId: string | null = null;
  let accountId = MOBY_ACCOUNT_ID;

  try {
    // 1. Ler body e headers
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    // 2. Log inicial da requisição
    const logData = {
      account_id: accountId,
      method: 'POST',
      headers: Object.fromEntries(request.headers.entries()),
      body: body ? JSON.parse(body) : null,
      processed: false,
      created_at: new Date().toISOString()
    };

    const { data: webhookLog, error: logError } = await supabase
      .from('meta_ads_webhook_logs')
      .insert(logData)
      .select()
      .single();

    if (logError) {
      console.error('Erro ao criar webhook log:', logError);
    }

    // 3. Parse body
    let webhookData: MetaWebhookPayload;
    try {
      webhookData = JSON.parse(body);
    } catch (e) {
      await updateWebhookLog(supabase, webhookLog?.id, {
        status_code: 400,
        response_body: { error: 'Invalid JSON' },
        error_message: 'JSON parse error'
      });

      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // 4. Buscar integração ativa
    const { data: integration, error: integrationError } = await supabase
      .from('meta_ads_integrations')
      .select('*')
      .eq('account_id', accountId)
      .eq('is_active', true)
      .single();

    if (integrationError || !integration) {
      await updateWebhookLog(supabase, webhookLog?.id, {
        status_code: 404,
        response_body: { error: 'No active integration found' },
        error_message: 'Integration not found or inactive'
      });

      return NextResponse.json(
        { error: 'No active Meta Ads integration found' },
        { status: 404 }
      );
    }

    integrationId = integration.id;
    accountId = integration.account_id;

    // Atualizar log com integration_id
    if (webhookLog?.id) {
      await supabase
        .from('meta_ads_webhook_logs')
        .update({ integration_id: integrationId })
        .eq('id', webhookLog.id);
    }

    // 5. Validar assinatura (se presente)
    if (signature && integration.app_secret) {
      const isValid = validateMetaSignature(body, signature, integration.app_secret);

      if (!isValid) {
        await updateWebhookLog(supabase, webhookLog?.id, {
          status_code: 401,
          response_body: { error: 'Invalid signature' },
          error_message: 'HMAC signature validation failed'
        });

        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }

    // 6. Processar cada entry do webhook
    const processedLeads = [];

    for (const entry of webhookData.entry) {
      for (const change of entry.changes) {
        if (change.field === 'leadgen') {
          const leadgenId = change.value.leadgen_id;

          if (leadgenId) {
            try {
              // Buscar dados completos do lead via Graph API
              const leadData = await fetchLeadFromFacebook(
                leadgenId,
                integration.access_token!
              );

              // Processar lead
              const processed = await processMetaAdsLead(
                supabase,
                integrationId,
                accountId,
                leadData,
                change.value.platform || 'facebook'
              );

              processedLeads.push(processed);
            } catch (error: any) {
              console.error(`Erro ao processar lead ${leadgenId}:`, error);
              // Continua processando outros leads mesmo se um falhar
            }
          }
        }
      }
    }

    // 7. Atualizar métricas da integração
    if (processedLeads.length > 0) {
      await supabase
        .from('meta_ads_integrations')
        .update({
          total_leads_received: (integration.total_leads_received || 0) + processedLeads.length,
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', integrationId);
    }

    // 8. Atualizar log com sucesso
    await updateWebhookLog(supabase, webhookLog?.id, {
      status_code: 200,
      response_body: {
        success: true,
        leads_processed: processedLeads.length,
        lead_ids: processedLeads.map(p => p.leadId)
      },
      processed: true
    });

    // 9. Resposta de sucesso
    return NextResponse.json({
      success: true,
      leads_processed: processedLeads.length,
      processing_time_ms: Date.now() - startTime
    });

  } catch (error: any) {
    console.error('Erro ao processar webhook Meta Ads:', error);

    // Log de erro
    if (integrationId) {
      await supabase
        .from('meta_ads_webhook_logs')
        .insert({
          integration_id: integrationId,
          account_id: accountId,
          method: 'POST',
          headers: Object.fromEntries(request.headers.entries()),
          status_code: 500,
          response_body: { error: 'Internal server error' },
          error_message: error.message,
          processed: false
        });
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Valida assinatura Meta (Facebook/Instagram)
 */
function validateMetaSignature(body: string, signature: string, appSecret: string): boolean {
  try {
    // Remover prefixo "sha256="
    const signatureHash = signature.replace('sha256=', '');

    const expectedSignature = createHmac('sha256', appSecret)
      .update(body)
      .digest('hex');

    return signatureHash === expectedSignature;
  } catch (error) {
    console.error('Erro ao validar assinatura Meta:', error);
    return false;
  }
}

/**
 * Busca dados completos do lead via Facebook Graph API
 */
async function fetchLeadFromFacebook(
  leadgenId: string,
  accessToken: string
): Promise<FacebookLeadFormData> {
  try {
    const url = `https://graph.facebook.com/v18.0/${leadgenId}?access_token=${accessToken}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Facebook Graph API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Erro ao buscar lead do Facebook:', error);
    throw error;
  }
}

/**
 * Processa lead do Meta Ads e cria registro no CRM
 */
async function processMetaAdsLead(
  supabase: ReturnType<typeof getServiceClient>,
  integrationId: string,
  accountId: string,
  leadData: FacebookLeadFormData,
  platform: string
) {
  // Extrair dados do formulário
  const formFields = extractMetaFormFields(leadData.field_data);

  // 1. Criar lead na tabela meta_ads_leads
  const metaAdsLeadData = {
    integration_id: integrationId,
    account_id: accountId,
    lead_id: null, // Será preenchido depois

    // Meta Data
    leadgen_id: leadData.id,
    platform: platform,
    form_id: leadData.form_id || null,
    campaign_id: leadData.campaign_id || null,
    ad_id: leadData.ad_id || null,
    adset_id: leadData.adgroup_id || null,

    // Lead Data
    name: formFields.name || null,
    email: formFields.email || null,
    phone: formFields.phone || null,

    // Custom Form Fields
    form_data: leadData.field_data || [],

    // Metadata
    created_time: leadData.created_time || new Date().toISOString(),
    utm_source: platform === 'instagram' ? 'instagram' : 'facebook',
    utm_medium: 'social',

    // Status
    status: 'new',

    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: metaAdsLead, error: metaAdsError } = await supabase
    .from('meta_ads_leads')
    .insert(metaAdsLeadData)
    .select()
    .single();

  if (metaAdsError) {
    console.error('Erro ao criar meta_ads_lead:', metaAdsError);
    throw new Error('Failed to create Meta Ads lead record');
  }

  // 2. Criar lead na tabela principal do CRM
  const leadCrmData = {
    account_id: accountId,

    // Dados básicos
    name: formFields.name || `Lead ${platform}`,
    email: formFields.email || null,
    phone: formFields.phone || null,

    // Origem
    source: platform === 'instagram' ? 'instagram' : 'facebook',
    medium: 'social',
    campaign: leadData.campaign_id || null,

    // Pipeline
    stage: 'lead_novo' as const, // Estágio inicial padrão

    // Status
    status: 'new',

    // Metadata
    metadata: {
      leadgen_id: leadData.id,
      platform: platform,
      form_id: leadData.form_id,
      campaign_id: leadData.campaign_id,
      ad_id: leadData.ad_id,
      adset_id: leadData.adgroup_id,
      form_fields: formFields,
      meta_ads_lead_id: metaAdsLead.id,
      is_organic: leadData.is_organic
    },

    created_at: leadData.created_time || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: crmLead, error: crmError } = await supabase
    .from('leads')
    .insert(leadCrmData)
    .select()
    .single();

  if (crmError) {
    console.error('Erro ao criar lead no CRM:', crmError);
    throw new Error('Failed to create CRM lead record');
  }

  // 3. Atualizar meta_ads_lead com referência ao lead do CRM
  await supabase
    .from('meta_ads_leads')
    .update({ lead_id: crmLead.id })
    .eq('id', metaAdsLead.id);

  return {
    leadId: crmLead.id,
    metaAdsLeadId: metaAdsLead.id
  };
}

/**
 * Extrai campos do formulário Meta para formato normalizado
 */
function extractMetaFormFields(fieldData: FacebookLeadFormData['field_data']) {
  const fields: Record<string, any> = {};

  for (const field of fieldData) {
    const name = field.name?.toLowerCase() || '';
    const value = field.values?.[0] || '';

    // Mapear campos padrão
    if (name.includes('full_name') || name.includes('name')) {
      fields.name = value;
    } else if (name.includes('email')) {
      fields.email = value;
    } else if (name.includes('phone')) {
      fields.phone = value;
    } else if (name.includes('city')) {
      fields.city = value;
    } else if (name.includes('state')) {
      fields.state = value;
    } else if (name.includes('zip') || name.includes('postal')) {
      fields.zipCode = value;
    } else {
      // Campos personalizados
      fields[name] = value;
    }
  }

  return fields;
}

/**
 * Atualiza webhook log com resultado do processamento
 */
async function updateWebhookLog(
  supabase: ReturnType<typeof getServiceClient>,
  logId: string | undefined,
  update: {
    status_code?: number;
    response_body?: any;
    error_message?: string;
    processed?: boolean;
  }
) {
  if (!logId) return;

  await supabase
    .from('meta_ads_webhook_logs')
    .update(update)
    .eq('id', logId);
}
