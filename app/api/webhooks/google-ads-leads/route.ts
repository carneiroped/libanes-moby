import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';
import type { Database } from '@/types/supabase';
import type { GoogleAdsLeadFormSubmission } from '@/types/google-ads';

const MOBY_ACCOUNT_ID = 'cb9f91dd-f076-4535-bc1a-49162615de7d';

// Supabase service role client para operações privilegiadas
const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
};

/**
 * POST /api/webhooks/google-ads-leads
 *
 * Webhook endpoint para receber leads de Google Ads Lead Forms
 *
 * Headers esperados:
 * - X-Google-Ads-Signature: HMAC SHA-256 do body
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
    const signature = request.headers.get('x-google-ads-signature');
    const contentType = request.headers.get('content-type');

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
      .from('google_ads_webhook_logs')
      .insert(logData)
      .select()
      .single();

    if (logError) {
      console.error('Erro ao criar webhook log:', logError);
    }

    // 3. Validar content-type
    if (!contentType?.includes('application/json')) {
      await updateWebhookLog(supabase, webhookLog?.id, {
        status_code: 400,
        response_body: { error: 'Content-Type must be application/json' },
        error_message: 'Invalid Content-Type'
      });

      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    // 4. Parse body
    let leadData: GoogleAdsLeadFormSubmission;
    try {
      leadData = JSON.parse(body);
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

    // 5. Buscar integração ativa
    const { data: integration, error: integrationError } = await supabase
      .from('google_ads_integrations')
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
        { error: 'No active Google Ads integration found' },
        { status: 404 }
      );
    }

    integrationId = integration.id;
    accountId = integration.account_id;

    // Atualizar log com integration_id
    if (webhookLog?.id) {
      await supabase
        .from('google_ads_webhook_logs')
        .update({ integration_id: integrationId })
        .eq('id', webhookLog.id);
    }

    // 6. Validar assinatura HMAC
    if (signature) {
      const isValid = validateSignature(body, signature, integration.webhook_secret);

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

    // 7. Processar lead
    const processedLead = await processGoogleAdsLead(
      supabase,
      integrationId,
      accountId,
      leadData
    );

    // 8. Atualizar métricas da integração
    await supabase
      .from('google_ads_integrations')
      .update({
        total_leads_received: (integration.total_leads_received || 0) + 1,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', integrationId);

    // 9. Atualizar log com sucesso
    await updateWebhookLog(supabase, webhookLog?.id, {
      status_code: 200,
      response_body: {
        success: true,
        lead_id: processedLead.leadId,
        google_ads_lead_id: processedLead.googleAdsLeadId
      },
      processed: true
    });

    // 10. Resposta de sucesso
    return NextResponse.json({
      success: true,
      lead_id: processedLead.leadId,
      google_ads_lead_id: processedLead.googleAdsLeadId,
      processing_time_ms: Date.now() - startTime
    });

  } catch (error: any) {
    console.error('Erro ao processar webhook Google Ads:', error);

    // Log de erro
    if (integrationId) {
      await supabase
        .from('google_ads_webhook_logs')
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
 * Valida assinatura HMAC SHA-256
 */
function validateSignature(body: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Erro ao validar assinatura:', error);
    return false;
  }
}

/**
 * Processa lead do Google Ads e cria registro no CRM
 */
async function processGoogleAdsLead(
  supabase: ReturnType<typeof getServiceClient>,
  integrationId: string,
  accountId: string,
  leadData: GoogleAdsLeadFormSubmission
) {
  // Extrair dados do formulário
  const formFields = extractFormFields(leadData.user_column_data);

  // 1. Criar lead na tabela google_ads_leads
  const googleAdsLeadData = {
    integration_id: integrationId,
    account_id: accountId,
    lead_id: null, // Será preenchido depois

    // Dados do Google Ads
    gclid: leadData.gclid || null,
    campaign_id: leadData.campaign_id || null,
    campaign_name: null, // Nome da campanha não vem no webhook
    ad_group_id: leadData.ad_group_id || null,
    ad_group_name: null, // Nome do ad group não vem no webhook
    creative_id: leadData.creative_id || null,

    // Dados do lead
    name: formFields.name || null,
    email: formFields.email || null,
    phone: formFields.phone || null,

    // Form data completo
    form_data: leadData.user_column_data || [],

    // Metadata
    utm_source: 'google_ads',
    utm_medium: 'cpc',
    utm_campaign: null, // Nome da campanha não vem no webhook

    // Status
    status: 'new',

    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: googleAdsLead, error: googleAdsError } = await supabase
    .from('google_ads_leads')
    .insert(googleAdsLeadData)
    .select()
    .single();

  if (googleAdsError) {
    console.error('Erro ao criar google_ads_lead:', googleAdsError);
    throw new Error('Failed to create Google Ads lead record');
  }

  // 2. Criar lead na tabela principal do CRM
  const leadCrmData = {
    account_id: accountId,

    // Dados básicos
    name: formFields.name || 'Lead Google Ads',
    email: formFields.email || null,
    phone: formFields.phone || null,

    // Origem
    source: 'google_ads',
    medium: 'cpc',
    campaign: null, // Nome da campanha não vem no webhook

    // Localização (se disponível)
    city: formFields.city || null,
    state: formFields.state || null,
    zip_code: formFields.zipCode || null,

    // Pipeline
    stage: 'lead_novo' as const, // Estágio inicial padrão

    // Status
    status: 'new',

    // Metadata
    metadata: {
      gclid: leadData.gclid,
      campaign_id: leadData.campaign_id,
      ad_group_id: leadData.ad_group_id,
      creative_id: leadData.creative_id,
      form_fields: formFields,
      google_ads_lead_id: googleAdsLead.id
    },

    created_at: new Date().toISOString(),
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

  // 3. Atualizar google_ads_lead com referência ao lead do CRM
  await supabase
    .from('google_ads_leads')
    .update({ lead_id: crmLead.id })
    .eq('id', googleAdsLead.id);

  return {
    leadId: crmLead.id,
    googleAdsLeadId: googleAdsLead.id
  };
}

/**
 * Extrai campos do formulário Google Ads para formato normalizado
 */
function extractFormFields(userColumnData: GoogleAdsLeadFormSubmission['user_column_data']) {
  const fields: Record<string, any> = {};

  for (const field of userColumnData) {
    const key = field.column_id?.toLowerCase() || '';
    const value = field.string_value || field.phone_number_value || '';

    // Mapear campos padrão do Google
    if (key.includes('full_name') || key.includes('name')) {
      fields.name = value;
    } else if (key.includes('email')) {
      fields.email = value;
    } else if (key.includes('phone')) {
      fields.phone = value;
    } else if (key.includes('city')) {
      fields.city = value;
    } else if (key.includes('state')) {
      fields.state = value;
    } else if (key.includes('zip') || key.includes('cep')) {
      fields.zipCode = value;
    } else if (key.includes('street')) {
      fields.street = value;
    } else {
      // Campos personalizados
      fields[key] = value;
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
    .from('google_ads_webhook_logs')
    .update(update)
    .eq('id', logId);
}
