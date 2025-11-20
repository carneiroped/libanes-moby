-- Migration: Integrações de Anúncios Pagos (Google Ads e Meta Ads)
-- Criado em: 2025-01-19
-- Descrição: Tabelas para gerenciar integrações com Google Ads e Meta Ads

-- =====================================================
-- GOOGLE ADS INTEGRATION
-- =====================================================

-- Tabela de configuração da integração Google Ads
CREATE TABLE IF NOT EXISTS google_ads_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  -- Configurações de API
  customer_id TEXT, -- ID do cliente Google Ads
  developer_token TEXT, -- Token de desenvolvedor
  client_id TEXT, -- OAuth Client ID
  client_secret TEXT, -- OAuth Client Secret
  refresh_token TEXT, -- OAuth Refresh Token

  -- Configurações de Lead Forms
  conversion_action_id TEXT, -- ID da ação de conversão

  -- Webhook Configuration
  webhook_url TEXT NOT NULL UNIQUE,
  webhook_secret TEXT NOT NULL,

  -- Status e Métricas
  is_active BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  total_leads_received INTEGER DEFAULT 0,
  total_leads_converted INTEGER DEFAULT 0,

  -- Metadata
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de leads recebidos do Google Ads
CREATE TABLE IF NOT EXISTS google_ads_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES google_ads_integrations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Dados do Google Ads
  gclid TEXT, -- Google Click ID
  campaign_id TEXT,
  campaign_name TEXT,
  ad_group_id TEXT,
  ad_group_name TEXT,
  ad_id TEXT,
  keyword TEXT,

  -- Dados do Lead
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,

  -- Dados da conversão
  conversion_date TIMESTAMP WITH TIME ZONE,
  conversion_value NUMERIC(10, 2),

  -- Campos personalizados do formulário
  form_data JSONB DEFAULT '{}',

  -- Metadata
  source_url TEXT,
  user_agent TEXT,
  ip_address TEXT,
  utm_source TEXT DEFAULT 'google_ads',
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,

  -- Status
  status TEXT DEFAULT 'new', -- new, contacted, qualified, converted, lost
  processed_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de webhook Google Ads
CREATE TABLE IF NOT EXISTS google_ads_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES google_ads_integrations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  -- Request data
  method TEXT NOT NULL,
  headers JSONB,
  body JSONB,
  query_params JSONB,

  -- Response data
  status_code INTEGER,
  response_body JSONB,

  -- Processing
  processed BOOLEAN DEFAULT false,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- META ADS INTEGRATION (Facebook & Instagram)
-- =====================================================

-- Tabela de configuração da integração Meta Ads
CREATE TABLE IF NOT EXISTS meta_ads_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  -- Configurações de API
  app_id TEXT, -- Facebook App ID
  app_secret TEXT, -- Facebook App Secret
  access_token TEXT, -- Long-lived Page Access Token
  page_id TEXT, -- Facebook Page ID

  -- Instagram (opcional)
  instagram_account_id TEXT,

  -- Configurações de Lead Forms
  form_id TEXT, -- ID do formulário de leads

  -- Webhook Configuration
  webhook_url TEXT NOT NULL UNIQUE,
  webhook_secret TEXT NOT NULL,
  verify_token TEXT NOT NULL, -- Token de verificação do webhook

  -- Status e Métricas
  is_active BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  total_leads_received INTEGER DEFAULT 0,
  total_leads_converted INTEGER DEFAULT 0,

  -- Metadata
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de leads recebidos do Meta Ads
CREATE TABLE IF NOT EXISTS meta_ads_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES meta_ads_integrations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Dados do Meta
  leadgen_id TEXT UNIQUE, -- ID único do lead no Meta
  platform TEXT, -- 'facebook' ou 'instagram'
  form_id TEXT,
  form_name TEXT,
  campaign_id TEXT,
  campaign_name TEXT,
  ad_id TEXT,
  ad_name TEXT,
  adset_id TEXT,
  adset_name TEXT,

  -- Dados do Lead
  name TEXT,
  email TEXT,
  phone TEXT,

  -- Campos personalizados do formulário
  form_data JSONB DEFAULT '{}',

  -- Metadata
  page_id TEXT,
  created_time TIMESTAMP WITH TIME ZONE,
  utm_source TEXT DEFAULT 'meta_ads',
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,

  -- Status
  status TEXT DEFAULT 'new', -- new, contacted, qualified, converted, lost
  processed_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de webhook Meta Ads
CREATE TABLE IF NOT EXISTS meta_ads_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES meta_ads_integrations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  -- Request data
  method TEXT NOT NULL,
  headers JSONB,
  body JSONB,
  query_params JSONB,

  -- Response data
  status_code INTEGER,
  response_body JSONB,

  -- Processing
  processed BOOLEAN DEFAULT false,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Google Ads
CREATE INDEX idx_google_ads_integrations_account ON google_ads_integrations(account_id);
CREATE INDEX idx_google_ads_integrations_webhook ON google_ads_integrations(webhook_url);
CREATE INDEX idx_google_ads_leads_integration ON google_ads_leads(integration_id);
CREATE INDEX idx_google_ads_leads_account ON google_ads_leads(account_id);
CREATE INDEX idx_google_ads_leads_status ON google_ads_leads(status);
CREATE INDEX idx_google_ads_leads_created ON google_ads_leads(created_at DESC);
CREATE INDEX idx_google_ads_leads_gclid ON google_ads_leads(gclid);
CREATE INDEX idx_google_ads_webhook_logs_integration ON google_ads_webhook_logs(integration_id);
CREATE INDEX idx_google_ads_webhook_logs_created ON google_ads_webhook_logs(created_at DESC);

-- Meta Ads
CREATE INDEX idx_meta_ads_integrations_account ON meta_ads_integrations(account_id);
CREATE INDEX idx_meta_ads_integrations_webhook ON meta_ads_integrations(webhook_url);
CREATE INDEX idx_meta_ads_leads_integration ON meta_ads_leads(integration_id);
CREATE INDEX idx_meta_ads_leads_account ON meta_ads_leads(account_id);
CREATE INDEX idx_meta_ads_leads_status ON meta_ads_leads(status);
CREATE INDEX idx_meta_ads_leads_created ON meta_ads_leads(created_at DESC);
CREATE INDEX idx_meta_ads_leads_leadgen_id ON meta_ads_leads(leadgen_id);
CREATE INDEX idx_meta_ads_webhook_logs_integration ON meta_ads_webhook_logs(integration_id);
CREATE INDEX idx_meta_ads_webhook_logs_created ON meta_ads_webhook_logs(created_at DESC);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Google Ads
CREATE TRIGGER update_google_ads_integrations_updated_at
  BEFORE UPDATE ON google_ads_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_ads_leads_updated_at
  BEFORE UPDATE ON google_ads_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Meta Ads
CREATE TRIGGER update_meta_ads_integrations_updated_at
  BEFORE UPDATE ON meta_ads_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meta_ads_leads_updated_at
  BEFORE UPDATE ON meta_ads_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE google_ads_integrations IS 'Configurações de integração com Google Ads para recebimento de leads';
COMMENT ON TABLE google_ads_leads IS 'Leads recebidos via Google Lead Form Extensions';
COMMENT ON TABLE google_ads_webhook_logs IS 'Logs de requisições webhook do Google Ads para debugging';

COMMENT ON TABLE meta_ads_integrations IS 'Configurações de integração com Meta Ads (Facebook/Instagram)';
COMMENT ON TABLE meta_ads_leads IS 'Leads recebidos via Facebook/Instagram Lead Forms';
COMMENT ON TABLE meta_ads_webhook_logs IS 'Logs de requisições webhook do Meta para debugging';
