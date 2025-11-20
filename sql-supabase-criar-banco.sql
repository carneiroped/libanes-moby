
-- ============================================
-- SCRIPT DE CLONAGEM DO BANCO MOBY
-- ============================================
-- Este script cria um banco de dados idêntico ao projeto Supabase atual
-- Execute em um projeto novo do Supabase para replicar a estrutura completa
--
-- INSTRUÇÕES:
-- 1. Crie um novo projeto no Supabase
-- 2. Vá em SQL Editor
-- 3. Cole todo este script
-- 4. Execute (Run)
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ============================================
-- TIPOS ENUMERADOS (ENUMS)
-- ============================================

-- Enum para estágios de leads
CREATE TYPE lead_stage AS ENUM (
  'new',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
);

-- ============================================
-- TABELAS
-- ============================================

-- Tabela: accounts (multi-tenant base)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'trial')),
  owner_id UUID,
  billing_email TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  usage JSONB DEFAULT '{}'::jsonb,
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- Tabela: users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cpf TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'agent', 'user')),
  department TEXT,
  position TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  permissions JSONB DEFAULT '{}'::jsonb,
  team_ids TEXT[],
  manager_id UUID REFERENCES users(id),
  hire_date TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  creci TEXT,
  commission_percentage NUMERIC(5,2),
  goals JSONB DEFAULT '{}'::jsonb,
  stats JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  address JSONB DEFAULT '{}'::jsonb,
  emergency_contact JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE,
  UNIQUE(account_id, email)
);

-- Tabela: leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  company TEXT,
  source TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'active', 'converted', 'lost', 'archived')),
  stage lead_stage DEFAULT 'new',
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  budget_min NUMERIC(15,2),
  budget_max NUMERIC(15,2),
  interest_type TEXT,
  preferred_contact TEXT,
  notes TEXT,
  tags TEXT[],
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_contact TIMESTAMPTZ,
  next_action TEXT,
  next_action_date TIMESTAMPTZ,
  conversion_probability INTEGER CHECK (conversion_probability >= 0 AND conversion_probability <= 100),
  lost_reason TEXT,
  city TEXT,
  state TEXT,
  property_preferences JSONB DEFAULT '{}'::jsonb,
  interactions_count INTEGER DEFAULT 0,
  is_hot_lead BOOLEAN DEFAULT FALSE,
  is_qualified BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  property_types TEXT[]
);

-- Tabela: imoveis (properties)
CREATE TABLE imoveis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  titulo TEXT,
  descricao TEXT,
  tipo TEXT,
  loc_venda TEXT CHECK (loc_venda IN ('venda', 'aluguel', 'ambos')),
  status TEXT DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'reservado', 'vendido', 'alugado', 'inativo')),
  codigo_referencia TEXT,

  -- Endereço
  rua TEXT,
  numero VARCHAR(20),
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado VARCHAR(2),
  cep VARCHAR(10),
  lat TEXT,
  long TEXT,

  -- Características físicas
  m2 SMALLINT,
  area_terreno NUMERIC(10,2),
  area_construida NUMERIC(10,2),
  quartos SMALLINT,
  banheiros SMALLINT,
  suites SMALLINT,
  vagas_garagem SMALLINT,
  garagem BOOLEAN DEFAULT FALSE,
  andar SMALLINT,

  -- Valores
  valor NUMERIC(15,2),
  iptu_mensal NUMERIC(10,2),
  condominio_mensal NUMERIC(10,2),
  comissao_percentual NUMERIC(5,2),

  -- Proprietário
  proprietario_id UUID REFERENCES users(id),
  proprietario_nome TEXT,
  proprietario_telefone VARCHAR(20),
  proprietario_email VARCHAR(255),

  -- Mídia
  foto TEXT,
  galeria_fotos TEXT[],
  video_url TEXT,
  tour_virtual_url TEXT,

  -- Características adicionais
  caracteristicas JSONB DEFAULT '{}'::jsonb,
  documentacao_ok BOOLEAN DEFAULT FALSE,
  aceita_permuta BOOLEAN DEFAULT FALSE,
  aceita_financiamento BOOLEAN DEFAULT FALSE,

  -- SEO
  meta_titulo TEXT,
  meta_descricao TEXT,

  -- Site/Portal
  site TEXT,

  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- Tabela: chats
CREATE TABLE chats (
  id BIGSERIAL PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  conversation_id TEXT,
  app TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: chat_messages
CREATE TABLE chat_messages (
  id BIGSERIAL PRIMARY KEY,
  chat_id BIGINT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  phone TEXT,
  user_name TEXT,
  user_message TEXT,
  bot_message TEXT,
  conversation_id TEXT,
  message_type TEXT,
  active BOOLEAN DEFAULT TRUE,
  app TEXT,
  media_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT
);

-- Tabela: conversation_analytics
CREATE TABLE conversation_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id BIGINT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  sentiment_data JSONB DEFAULT '{}'::jsonb,
  average_sentiment NUMERIC(5,2),
  sentiment_trend TEXT,
  critical_moments_count INTEGER DEFAULT 0,
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabela: activities
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task', 'whatsapp', 'visit', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  outcome TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: calendar_events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'visit', 'call', 'task', 'other')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  location TEXT,
  attendees UUID[],
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  property_id UUID REFERENCES imoveis(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
  reminder_minutes INTEGER DEFAULT 15,
  metadata JSONB DEFAULT '{}'::jsonb,
  check_in_at TIMESTAMPTZ,
  check_out_at TIMESTAMPTZ,
  check_in_location JSONB,
  check_out_notes TEXT,
  meeting_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  property_id UUID REFERENCES imoveis(id) ON DELETE SET NULL,
  related_to_type TEXT,
  related_to_id UUID,
  tags TEXT[],
  checklist JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- Tabela: files
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  storage_url TEXT,
  uploaded_by UUID REFERENCES users(id),
  related_to_type TEXT,
  related_to_id UUID,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  property_id UUID REFERENCES imoveis(id) ON DELETE CASCADE,
  folder TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- Tabela: teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  team_lead_id UUID REFERENCES users(id),
  member_ids UUID[],
  goals JSONB DEFAULT '{}'::jsonb,
  stats JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- Tabela: automations
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}'::jsonb,
  actions JSONB DEFAULT '[]'::jsonb,
  conditions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  execution_count INTEGER DEFAULT 0,
  last_execution TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- Tabela: notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: settings
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, category, key)
);

-- Tabela: analytics_events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: auth_logs
CREATE TABLE auth_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout', 'failed_login', 'password_reset', 'password_change')),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: documents (com vector embedding)
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding vector(1536),
  document_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELAS DE INTEGRAÇÕES
-- ============================================

-- Tabela: olx_zap_integrations
CREATE TABLE olx_zap_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  webhook_url TEXT,
  client_api_key TEXT,
  total_leads_received INTEGER DEFAULT 0,
  last_lead_received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Tabela: olx_zap_leads
CREATE TABLE olx_zap_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  lead_origin TEXT,
  timestamp TIMESTAMPTZ,
  origin_lead_id TEXT,
  origin_listing_id TEXT,
  client_listing_id TEXT,
  name TEXT,
  email TEXT,
  ddd TEXT,
  phone TEXT,
  phone_number TEXT,
  message TEXT,
  temperature TEXT,
  transaction_type TEXT,
  lead_id UUID REFERENCES leads(id),
  imovel_id UUID REFERENCES imoveis(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  processing_error TEXT,
  processed_at TIMESTAMPTZ,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: olx_zap_webhook_logs
CREATE TABLE olx_zap_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  request_method TEXT,
  request_headers JSONB,
  request_body JSONB,
  request_ip TEXT,
  user_agent TEXT,
  response_status INTEGER,
  response_body JSONB,
  processing_time_ms INTEGER,
  error_message TEXT,
  error_stack TEXT,
  olx_zap_lead_id UUID REFERENCES olx_zap_leads(id),
  origin_lead_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: google_ads_integrations
CREATE TABLE google_ads_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  customer_id TEXT,
  developer_token TEXT,
  client_id TEXT,
  client_secret TEXT,
  refresh_token TEXT,
  conversion_action_id TEXT,
  webhook_url TEXT,
  webhook_secret TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  total_leads_received INTEGER DEFAULT 0,
  total_leads_converted INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: google_ads_leads
CREATE TABLE google_ads_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID NOT NULL REFERENCES google_ads_integrations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id),
  gclid TEXT,
  campaign_id TEXT,
  campaign_name TEXT,
  ad_group_id TEXT,
  ad_group_name TEXT,
  creative_id TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  form_data JSONB DEFAULT '{}'::jsonb,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: google_ads_webhook_logs
CREATE TABLE google_ads_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID NOT NULL REFERENCES google_ads_integrations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  method TEXT,
  headers JSONB,
  body JSONB,
  query_params JSONB,
  status_code INTEGER,
  response_body JSONB,
  processed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: meta_ads_integrations
CREATE TABLE meta_ads_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  app_id TEXT,
  app_secret TEXT,
  access_token TEXT,
  page_id TEXT,
  instagram_account_id TEXT,
  form_id TEXT,
  webhook_url TEXT,
  webhook_secret TEXT,
  verify_token TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  total_leads_received INTEGER DEFAULT 0,
  total_leads_converted INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: meta_ads_leads
CREATE TABLE meta_ads_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID NOT NULL REFERENCES meta_ads_integrations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id),
  leadgen_id TEXT,
  platform TEXT CHECK (platform IN ('facebook', 'instagram')),
  form_id TEXT,
  form_name TEXT,
  campaign_id TEXT,
  campaign_name TEXT,
  ad_id TEXT,
  ad_name TEXT,
  adset_id TEXT,
  adset_name TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  form_data JSONB DEFAULT '{}'::jsonb,
  page_id TEXT,
  created_time TIMESTAMPTZ,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: meta_ads_webhook_logs
CREATE TABLE meta_ads_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID NOT NULL REFERENCES meta_ads_integrations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  method TEXT,
  headers JSONB,
  body JSONB,
  query_params JSONB,
  status_code INTEGER,
  response_body JSONB,
  processed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices em accounts
CREATE INDEX idx_accounts_subdomain ON accounts(subdomain);
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_accounts_owner_id ON accounts(owner_id);

-- Índices em users
CREATE INDEX idx_users_account_id ON users(account_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_manager_id ON users(manager_id);

-- Índices em leads
CREATE INDEX idx_leads_account_id ON leads(account_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_is_hot_lead ON leads(is_hot_lead) WHERE is_hot_lead = TRUE;
CREATE INDEX idx_leads_tags ON leads USING GIN(tags);

-- Índices em imoveis
CREATE INDEX idx_imoveis_account_id ON imoveis(account_id);
CREATE INDEX idx_imoveis_status ON imoveis(status);
CREATE INDEX idx_imoveis_tipo ON imoveis(tipo);
CREATE INDEX idx_imoveis_cidade ON imoveis(cidade);
CREATE INDEX idx_imoveis_bairro ON imoveis(bairro);
CREATE INDEX idx_imoveis_valor ON imoveis(valor);
CREATE INDEX idx_imoveis_quartos ON imoveis(quartos);
CREATE INDEX idx_imoveis_loc_venda ON imoveis(loc_venda);
CREATE INDEX idx_imoveis_codigo_referencia ON imoveis(codigo_referencia);

-- Índices em chats
CREATE INDEX idx_chats_account_id ON chats(account_id);
CREATE INDEX idx_chats_lead_id ON chats(lead_id);
CREATE INDEX idx_chats_phone ON chats(phone);
CREATE INDEX idx_chats_conversation_id ON chats(conversation_id);
CREATE INDEX idx_chats_updated_at ON chats(updated_at DESC);

-- Índices em chat_messages
CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_phone ON chat_messages(phone);

-- Índices em conversation_analytics
CREATE INDEX idx_conversation_analytics_chat_id ON conversation_analytics(chat_id);
CREATE INDEX idx_conversation_analytics_account_id ON conversation_analytics(account_id);

-- Índices em activities
CREATE INDEX idx_activities_account_id ON activities(account_id);
CREATE INDEX idx_activities_lead_id ON activities(lead_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_scheduled_at ON activities(scheduled_at);

-- Índices em calendar_events
CREATE INDEX idx_calendar_events_account_id ON calendar_events(account_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_created_by ON calendar_events(created_by);
CREATE INDEX idx_calendar_events_lead_id ON calendar_events(lead_id);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);

-- Índices em tasks
CREATE INDEX idx_tasks_account_id ON tasks(account_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_lead_id ON tasks(lead_id);

-- Índices em files
CREATE INDEX idx_files_account_id ON files(account_id);
CREATE INDEX idx_files_lead_id ON files(lead_id);
CREATE INDEX idx_files_property_id ON files(property_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);

-- Índices em teams
CREATE INDEX idx_teams_account_id ON teams(account_id);
CREATE INDEX idx_teams_team_lead_id ON teams(team_lead_id);

-- Índices em automations
CREATE INDEX idx_automations_account_id ON automations(account_id);
CREATE INDEX idx_automations_is_active ON automations(is_active);

-- Índices em notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Índices em analytics_events
CREATE INDEX idx_analytics_events_account_id ON analytics_events(account_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- Índices em documents (busca vetorial)
CREATE INDEX idx_documents_account_id ON documents(account_id);
CREATE INDEX idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops);

-- Índices de integrações
CREATE INDEX idx_olx_zap_integrations_account_id ON olx_zap_integrations(account_id);
CREATE INDEX idx_olx_zap_leads_account_id ON olx_zap_leads(account_id);
CREATE INDEX idx_olx_zap_leads_lead_id ON olx_zap_leads(lead_id);
CREATE INDEX idx_google_ads_integrations_account_id ON google_ads_integrations(account_id);
CREATE INDEX idx_google_ads_leads_integration_id ON google_ads_leads(integration_id);
CREATE INDEX idx_google_ads_leads_account_id ON google_ads_leads(account_id);
CREATE INDEX idx_meta_ads_integrations_account_id ON meta_ads_integrations(account_id);
CREATE INDEX idx_meta_ads_leads_integration_id ON meta_ads_leads(integration_id);
CREATE INDEX idx_meta_ads_leads_account_id ON meta_ads_leads(account_id);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_imoveis_updated_at BEFORE UPDATE ON imoveis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_olx_zap_integrations_updated_at BEFORE UPDATE ON olx_zap_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_olx_zap_leads_updated_at BEFORE UPDATE ON olx_zap_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_ads_integrations_updated_at BEFORE UPDATE ON google_ads_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_ads_leads_updated_at BEFORE UPDATE ON google_ads_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meta_ads_integrations_updated_at BEFORE UPDATE ON meta_ads_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meta_ads_leads_updated_at BEFORE UPDATE ON meta_ads_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE olx_zap_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE olx_zap_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE olx_zap_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ads_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ads_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ads_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso baseadas em account_id
-- NOTA: Você precisará criar políticas específicas baseadas em auth.uid() e 
-- a relação do usuário com a conta. Exemplo genérico:

-- Exemplo de política para users (adaptar conforme necessidade)
CREATE POLICY "Users can view their own account users"
  ON users FOR SELECT
  USING (account_id IN (
    SELECT account_id FROM users WHERE id = auth.uid()
  ));

-- IMPORTANTE: As políticas RLS devem ser configuradas de acordo com suas regras de negócio
-- Este é apenas um exemplo básico. Você precisará criar políticas para INSERT, UPDATE, DELETE
-- em cada tabela considerando roles, permissões e isolamento multi-tenant

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================

COMMENT ON TABLE accounts IS 'Contas principais do sistema multi-tenant';
COMMENT ON TABLE users IS 'Usuários do sistema por conta';
COMMENT ON TABLE leads IS 'Leads e prospects do CRM';
COMMENT ON TABLE imoveis IS 'Imóveis cadastrados';
COMMENT ON TABLE chats IS 'Conversas com leads';
COMMENT ON TABLE chat_messages IS 'Mensagens individuais das conversas';
COMMENT ON TABLE conversation_analytics IS 'Análise de sentimento das conversas';
COMMENT ON TABLE activities IS 'Atividades e interações com leads';
COMMENT ON TABLE calendar_events IS 'Eventos de calendário e agendamentos';
COMMENT ON TABLE tasks IS 'Tarefas e to-dos';
COMMENT ON TABLE files IS 'Arquivos anexados';
COMMENT ON TABLE teams IS 'Times e equipes';
COMMENT ON TABLE automations IS 'Automações e workflows';
COMMENT ON TABLE notifications IS 'Notificações do sistema';
COMMENT ON TABLE settings IS 'Configurações por conta';
COMMENT ON TABLE analytics_events IS 'Eventos de analytics';
COMMENT ON TABLE documents IS 'Documentos com embeddings vetoriais para RAG';
COMMENT ON TABLE olx_zap_integrations IS 'Integrações com OLX/ZAP';
COMMENT ON TABLE google_ads_integrations IS 'Integrações com Google Ads';
COMMENT ON TABLE meta_ads_integrations IS 'Integrações com Meta Ads (Facebook/Instagram)';

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Script de clonagem executado com sucesso!';
  RAISE NOTICE 'Estrutura completa do banco de dados Moby criada.';
  RAISE NOTICE 'Próximos passos:';
  RAISE NOTICE '1. Configurar políticas RLS específicas para seu caso de uso';
  RAISE NOTICE '2. Ajustar permissões e roles';
  RAISE NOTICE '3. Migrar dados se necessário';
END $$;
