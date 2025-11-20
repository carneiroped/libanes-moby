-- =====================================================
-- INTEGRAÇÃO GRUPO OLX/ZAP - WEBHOOKS DE LEADS
-- =====================================================
-- Criado em: 2025-01-19
-- Descrição: Sistema completo para receber e gerenciar
--            leads do Grupo OLX (ZAP Imóveis, Viva Real)
-- =====================================================

-- Tabela de configuração de integração por conta
CREATE TABLE IF NOT EXISTS public.olx_zap_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,

    -- Configuração
    is_active BOOLEAN DEFAULT false,
    webhook_url TEXT, -- URL gerada para o cliente configurar no Canal Pro
    client_api_key TEXT, -- API key do cliente (se necessário)

    -- Estatísticas
    total_leads_received INTEGER DEFAULT 0,
    last_lead_received_at TIMESTAMPTZ,

    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),

    -- Garantir uma integração por conta
    UNIQUE(account_id)
);

-- Tabela de leads recebidos do OLX/ZAP
CREATE TABLE IF NOT EXISTS public.olx_zap_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,

    -- Dados do webhook (payload original)
    lead_origin TEXT DEFAULT 'Grupo OLX',
    timestamp TIMESTAMPTZ NOT NULL,
    origin_lead_id TEXT NOT NULL, -- ID único do lead no sistema OLX
    origin_listing_id TEXT, -- ID do anúncio no portal
    client_listing_id TEXT, -- ID do imóvel no CRM

    -- Dados do lead
    name TEXT NOT NULL,
    email TEXT,
    ddd TEXT,
    phone TEXT,
    phone_number TEXT,
    message TEXT,
    temperature TEXT, -- Alta, Média, Baixa
    transaction_type TEXT, -- SELL, RENT

    -- Relacionamento com entidades do CRM
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    imovel_id UUID REFERENCES public.imoveis(id) ON DELETE SET NULL,

    -- Status de processamento
    status TEXT DEFAULT 'pending', -- pending, processed, error, duplicate
    processing_error TEXT,
    processed_at TIMESTAMPTZ,

    -- Payload completo (backup)
    raw_payload JSONB,

    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Índices para performance
    CONSTRAINT unique_origin_lead_id UNIQUE(account_id, origin_lead_id)
);

-- Tabela de logs de webhook (auditoria detalhada)
CREATE TABLE IF NOT EXISTS public.olx_zap_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,

    -- Request details
    request_method TEXT,
    request_headers JSONB,
    request_body JSONB,
    request_ip TEXT,
    user_agent TEXT,

    -- Response details
    response_status INTEGER,
    response_body JSONB,
    processing_time_ms INTEGER,

    -- Error tracking
    error_message TEXT,
    error_stack TEXT,

    -- Lead association
    olx_zap_lead_id UUID REFERENCES public.olx_zap_leads(id) ON DELETE SET NULL,
    origin_lead_id TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_olx_zap_integrations_account ON public.olx_zap_integrations(account_id);
CREATE INDEX IF NOT EXISTS idx_olx_zap_integrations_active ON public.olx_zap_integrations(is_active);

CREATE INDEX IF NOT EXISTS idx_olx_zap_leads_account ON public.olx_zap_leads(account_id);
CREATE INDEX IF NOT EXISTS idx_olx_zap_leads_origin_id ON public.olx_zap_leads(origin_lead_id);
CREATE INDEX IF NOT EXISTS idx_olx_zap_leads_status ON public.olx_zap_leads(status);
CREATE INDEX IF NOT EXISTS idx_olx_zap_leads_created ON public.olx_zap_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_olx_zap_leads_lead_id ON public.olx_zap_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_olx_zap_leads_imovel_id ON public.olx_zap_leads(imovel_id);

CREATE INDEX IF NOT EXISTS idx_olx_zap_logs_account ON public.olx_zap_webhook_logs(account_id);
CREATE INDEX IF NOT EXISTS idx_olx_zap_logs_created ON public.olx_zap_webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_olx_zap_logs_status ON public.olx_zap_webhook_logs(response_status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_olx_zap_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER olx_zap_integrations_updated_at
    BEFORE UPDATE ON public.olx_zap_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_olx_zap_updated_at();

CREATE TRIGGER olx_zap_leads_updated_at
    BEFORE UPDATE ON public.olx_zap_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_olx_zap_updated_at();

-- RLS (Row Level Security) Policies
ALTER TABLE public.olx_zap_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.olx_zap_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.olx_zap_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários só podem ver dados da própria conta
CREATE POLICY olx_zap_integrations_account_isolation ON public.olx_zap_integrations
    FOR ALL
    USING (account_id IN (
        SELECT account_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY olx_zap_leads_account_isolation ON public.olx_zap_leads
    FOR ALL
    USING (account_id IN (
        SELECT account_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY olx_zap_logs_account_isolation ON public.olx_zap_webhook_logs
    FOR ALL
    USING (account_id IN (
        SELECT account_id FROM public.users WHERE id = auth.uid()
    ));

-- Comentários de documentação
COMMENT ON TABLE public.olx_zap_integrations IS 'Configuração de integração com Grupo OLX/ZAP por conta';
COMMENT ON TABLE public.olx_zap_leads IS 'Leads recebidos via webhook do Grupo OLX/ZAP';
COMMENT ON TABLE public.olx_zap_webhook_logs IS 'Logs de auditoria de requisições webhook OLX/ZAP';

COMMENT ON COLUMN public.olx_zap_leads.origin_lead_id IS 'ID único do lead no sistema OLX - usar para deduplicação';
COMMENT ON COLUMN public.olx_zap_leads.client_listing_id IS 'ID do imóvel conhecido pelo CRM e GrupoZap - usar para relacionar com imoveis';
COMMENT ON COLUMN public.olx_zap_leads.temperature IS 'Qualidade/prioridade do lead: Alta, Média, Baixa';
COMMENT ON COLUMN public.olx_zap_leads.transaction_type IS 'Tipo de transação: SELL (venda) ou RENT (locação)';
