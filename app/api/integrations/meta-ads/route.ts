import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import type { Database } from '@/types/supabase';

const MOBY_ACCOUNT_ID = 'cb9f91dd-f076-4535-bc1a-49162615de7d';

// Supabase service role client para operações privilegiadas
const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
};

/**
 * GET /api/integrations/meta-ads
 *
 * Busca configuração da integração Meta Ads
 *
 * Query params:
 * - account_id (opcional): ID da conta
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('account_id') || MOBY_ACCOUNT_ID;

    const supabase = getServiceClient();

    const { data: integration, error } = await supabase
      .from('meta_ads_integrations')
      .select('*')
      .eq('account_id', accountId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erro ao buscar integração Meta Ads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch Meta Ads integration' },
        { status: 500 }
      );
    }

    return NextResponse.json({ integration: integration || null });
  } catch (error: any) {
    console.error('Erro no GET /api/integrations/meta-ads:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrations/meta-ads
 *
 * Cria ou atualiza integração Meta Ads
 *
 * Body:
 * {
 *   "account_id": "uuid" (opcional),
 *   "app_id": "string",
 *   "app_secret": "string",
 *   "access_token": "string",
 *   "page_id": "string",
 *   "instagram_account_id": "string" (opcional),
 *   "form_id": "string" (opcional),
 *   "is_active": boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accountId = body.account_id || MOBY_ACCOUNT_ID;

    const supabase = getServiceClient();

    // Gerar webhook URL e tokens
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://libanes.moby.casa';
    const webhookUrl = `${baseUrl}/api/webhooks/meta-ads-leads`;
    const webhookSecret = randomBytes(32).toString('hex');
    const verifyToken = randomBytes(16).toString('hex');

    const integrationData = {
      account_id: accountId,

      // API Configuration
      app_id: body.app_id || null,
      app_secret: body.app_secret || null,
      access_token: body.access_token || null,
      page_id: body.page_id || null,

      // Instagram (optional)
      instagram_account_id: body.instagram_account_id || null,

      // Lead Forms
      form_id: body.form_id || null,

      // Webhook
      webhook_url: webhookUrl,
      webhook_secret: webhookSecret,
      verify_token: verifyToken,

      // Status
      is_active: body.is_active ?? false,

      // Metadata
      settings: body.settings || {},
      updated_at: new Date().toISOString()
    };

    // Verificar se já existe integração
    const { data: existing } = await supabase
      .from('meta_ads_integrations')
      .select('id')
      .eq('account_id', accountId)
      .single();

    let result;

    if (existing) {
      // Atualizar existente
      const { data, error } = await supabase
        .from('meta_ads_integrations')
        .update(integrationData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar integração:', error);
        return NextResponse.json(
          { error: 'Failed to update Meta Ads integration' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Criar nova
      const { data, error } = await supabase
        .from('meta_ads_integrations')
        .insert({
          ...integrationData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar integração:', error);
        return NextResponse.json(
          { error: 'Failed to create Meta Ads integration' },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json({
      integration: result,
      webhook_url: webhookUrl,
      verify_token: verifyToken
    });

  } catch (error: any) {
    console.error('Erro no POST /api/integrations/meta-ads:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/integrations/meta-ads
 *
 * Atualiza parcialmente a integração
 *
 * Body:
 * {
 *   "account_id": "uuid" (opcional),
 *   "is_active": boolean,
 *   "settings": object (opcional)
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const accountId = body.account_id || MOBY_ACCOUNT_ID;

    const supabase = getServiceClient();

    // Buscar integração existente
    const { data: existing, error: findError } = await supabase
      .from('meta_ads_integrations')
      .select('id')
      .eq('account_id', accountId)
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        { error: 'Meta Ads integration not found' },
        { status: 404 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (typeof body.is_active === 'boolean') {
      updateData.is_active = body.is_active;
    }

    if (body.settings) {
      updateData.settings = body.settings;
    }

    // Atualizar
    const { data, error } = await supabase
      .from('meta_ads_integrations')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar status:', error);
      return NextResponse.json(
        { error: 'Failed to update Meta Ads integration' },
        { status: 500 }
      );
    }

    return NextResponse.json({ integration: data });

  } catch (error: any) {
    console.error('Erro no PATCH /api/integrations/meta-ads:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
