import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MOBY_ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

// GET - Buscar configuração da integração
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('account_id') || MOBY_ACCOUNT_ID;

    const { data, error } = await supabase
      .from('google_ads_integrations')
      .select('*')
      .eq('account_id', accountId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({ integration: data || null });
  } catch (error: any) {
    console.error('[Google Ads API] GET Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST - Criar/Atualizar integração
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accountId = body.account_id || MOBY_ACCOUNT_ID;

    // Verificar se já existe integração
    const { data: existing } = await supabase
      .from('google_ads_integrations')
      .select('id')
      .eq('account_id', accountId)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://leo.moby.casa';
    const webhookUrl = `${baseUrl}/api/webhooks/google-ads-leads`;
    const webhookSecret = randomBytes(32).toString('hex');

    const integrationData = {
      account_id: accountId,
      customer_id: body.customer_id || null,
      developer_token: body.developer_token || null,
      client_id: body.client_id || null,
      client_secret: body.client_secret || null,
      refresh_token: body.refresh_token || null,
      conversion_action_id: body.conversion_action_id || null,
      webhook_url: webhookUrl,
      webhook_secret: webhookSecret,
      is_active: body.is_active ?? false,
      settings: body.settings || {},
    };

    let result;
    if (existing) {
      // Atualizar
      const { data, error } = await supabase
        .from('google_ads_integrations')
        .update(integrationData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Criar
      const { data, error } = await supabase
        .from('google_ads_integrations')
        .insert(integrationData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ integration: result });
  } catch (error: any) {
    console.error('[Google Ads API] POST Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar status ou configurações
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const accountId = body.account_id || MOBY_ACCOUNT_ID;

    const { data, error } = await supabase
      .from('google_ads_integrations')
      .update({
        is_active: body.is_active,
        settings: body.settings,
      })
      .eq('account_id', accountId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ integration: data });
  } catch (error: any) {
    console.error('[Google Ads API] PATCH Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
