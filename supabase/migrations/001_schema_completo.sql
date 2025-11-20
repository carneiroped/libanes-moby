-- ============================================
-- MOBY CRM - SCHEMA COMPLETO BANCO DE DADOS
-- Sistema de CRM Imobiliário Inteligente
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 1. TABELA: users (Usuários do Sistema)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  cpf TEXT,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'corretor',
  department TEXT,
  position TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  permissions JSONB DEFAULT '[]'::jsonb,
  team_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  manager_id UUID REFERENCES users(id),
  hire_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  creci TEXT,
  commission_percentage DECIMAL(5,2) DEFAULT 0,
  goals JSONB,
  stats JSONB DEFAULT '{
    "total_leads": 0,
    "converted_leads": 0,
    "total_sales": 0,
    "revenue_generated": 0,
    "calls_made": 0,
    "emails_sent": 0
  }'::jsonb,
  preferences JSONB DEFAULT '{
    "theme": "light",
    "language": "pt-BR",
    "timezone": "America/Sao_Paulo",
    "notifications": {
      "email": true,
      "sms": false,
      "push": true,
      "whatsapp": true
    }
  }'::jsonb,
  address JSONB,
  emergency_contact JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_users_account_id ON users(account_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_manager_id ON users(manager_id);

-- ============================================
-- 2. TABELA: leads (Leads/Clientes)
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  cpf TEXT,
  company TEXT,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'novo',
  stage TEXT NOT NULL,
  pipeline_id UUID,
  pipeline_stage_id UUID,
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  budget_min DECIMAL(15,2),
  budget_max DECIMAL(15,2),
  interest_type TEXT,
  preferred_contact TEXT DEFAULT 'WhatsApp',
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contact TIMESTAMP WITH TIME ZONE,
  next_action TEXT,
  next_action_date TIMESTAMP WITH TIME ZONE,
  conversion_probability INTEGER DEFAULT 0 CHECK (conversion_probability >= 0 AND conversion_probability <= 100),
  lost_reason TEXT,
  city TEXT,
  state TEXT,
  property_preferences JSONB,
  interactions_count INTEGER DEFAULT 0,
  is_hot_lead BOOLEAN DEFAULT FALSE,
  is_qualified BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_leads_account_id ON leads(account_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_pipeline_id ON leads(pipeline_id);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_is_hot_lead ON leads(is_hot_lead);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- ============================================
-- 3. TABELA: imoveis (Propriedades/Imóveis)
-- ============================================
CREATE TABLE IF NOT EXISTS imoveis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  descricao TEXT,
  bairro TEXT,
  cidade TEXT,
  lat TEXT,
  long TEXT,
  m2 SMALLINT,
  quartos SMALLINT DEFAULT 2,
  garagem BOOLEAN DEFAULT TRUE,
  foto TEXT,
  loc_venda TEXT DEFAULT 'locacao' CHECK (loc_venda IN ('locacao', 'venda', 'ambos')),
  valor DECIMAL(15,2),
  site TEXT DEFAULT '',
  account_id UUID NOT NULL,
  tipo TEXT,
  banheiros SMALLINT,
  suites SMALLINT,
  vagas_garagem SMALLINT,
  area_terreno DECIMAL(10,2),
  area_construida DECIMAL(10,2),
  status TEXT DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'vendido', 'alugado', 'reservado', 'indisponivel')),
  codigo_referencia TEXT UNIQUE,
  proprietario_id UUID,
  comissao_percentual DECIMAL(5,2),
  iptu_mensal DECIMAL(10,2),
  condominio_mensal DECIMAL(10,2),
  caracteristicas JSONB DEFAULT '[]'::jsonb,
  galeria_fotos TEXT[] DEFAULT ARRAY[]::TEXT[],
  video_url TEXT,
  tour_virtual_url TEXT,
  documentacao_ok BOOLEAN DEFAULT FALSE,
  aceita_permuta BOOLEAN DEFAULT FALSE,
  aceita_financiamento BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_imoveis_account_id ON imoveis(account_id);
CREATE INDEX idx_imoveis_cidade ON imoveis(cidade);
CREATE INDEX idx_imoveis_bairro ON imoveis(bairro);
CREATE INDEX idx_imoveis_tipo ON imoveis(tipo);
CREATE INDEX idx_imoveis_loc_venda ON imoveis(loc_venda);
CREATE INDEX idx_imoveis_status ON imoveis(status);
CREATE INDEX idx_imoveis_valor ON imoveis(valor);
CREATE INDEX idx_imoveis_codigo_referencia ON imoveis(codigo_referencia);
CREATE INDEX idx_imoveis_created_at ON imoveis(created_at DESC);

-- ============================================
-- 4. TABELA: pipelines (Pipelines de Vendas)
-- ============================================
CREATE TABLE IF NOT EXISTS pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  total_leads INTEGER DEFAULT 0,
  total_value DECIMAL(15,2) DEFAULT 0,
  avg_deal_size DECIMAL(15,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  avg_cycle_time INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_pipelines_account_id ON pipelines(account_id);
CREATE INDEX idx_pipelines_is_default ON pipelines(is_default);
CREATE INDEX idx_pipelines_is_active ON pipelines(is_active);

-- ============================================
-- 5. TABELA: pipeline_stages (Estágios do Pipeline)
-- ============================================
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  order_index INTEGER NOT NULL,
  is_closed_won BOOLEAN DEFAULT FALSE,
  is_closed_lost BOOLEAN DEFAULT FALSE,
  automation_rules JSONB,
  lead_count INTEGER DEFAULT 0,
  avg_time_in_stage INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pipeline_stages_pipeline_id ON pipeline_stages(pipeline_id);
CREATE INDEX idx_pipeline_stages_order ON pipeline_stages(order_index);

-- ============================================
-- 6. TABELA: activities (Atividades/Interações)
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'whatsapp', 'meeting', 'note', 'sms', 'visit', 'proposal', 'follow_up', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'missed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  outcome TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activities_account_id ON activities(account_id);
CREATE INDEX idx_activities_lead_id ON activities(lead_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_scheduled_at ON activities(scheduled_at);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

-- ============================================
-- 7. TABELA: chats (Conversas - já fornecida pelo usuário)
-- ============================================
CREATE TABLE IF NOT EXISTS chats (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  phone TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_id TEXT,
  app TEXT DEFAULT 'delivery',
  account_id UUID,
  lead_id UUID REFERENCES leads(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed'))
);

CREATE INDEX idx_chats_phone ON chats(phone);
CREATE INDEX idx_chats_conversation_id ON chats(conversation_id);
CREATE INDEX idx_chats_account_id ON chats(account_id);
CREATE INDEX idx_chats_lead_id ON chats(lead_id);

-- ============================================
-- 8. TABELA: chat_messages (Mensagens - já fornecida pelo usuário)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id TEXT,
  bot_message TEXT,
  phone TEXT,
  user_name TEXT,
  user_message TEXT,
  conversation_id TEXT,
  message_type TEXT,
  active BOOLEAN DEFAULT TRUE,
  app TEXT DEFAULT 'delivery',
  chat_id BIGINT REFERENCES chats(id) ON DELETE CASCADE,
  media_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_phone ON chat_messages(phone);
CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ============================================
-- 9. TABELA: documents (Embeddings para IA - já fornecida pelo usuário)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  metadata JSONB,
  embedding vector(1536),
  account_id UUID,
  document_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_documents_account_id ON documents(account_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);

-- Função de busca de documentos
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_count INT DEFAULT NULL,
  filter JSONB DEFAULT '{}'
) RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE metadata @> filter
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- 10. TABELA: tasks (Tarefas)
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  lead_id UUID REFERENCES leads(id),
  property_id UUID REFERENCES imoveis(id),
  related_to_type TEXT,
  related_to_id UUID,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  checklist JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_tasks_account_id ON tasks(account_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- ============================================
-- 11. TABELA: calendar_events (Eventos de Calendário)
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'visit', 'call', 'task', 'reminder', 'other')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  location TEXT,
  attendees UUID[] DEFAULT ARRAY[]::UUID[],
  lead_id UUID REFERENCES leads(id),
  property_id UUID REFERENCES imoveis(id),
  created_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  reminder_minutes INTEGER DEFAULT 30,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_calendar_events_account_id ON calendar_events(account_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_created_by ON calendar_events(created_by);
CREATE INDEX idx_calendar_events_lead_id ON calendar_events(lead_id);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);

-- ============================================
-- 12. TABELA: notifications (Notificações)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'lead', 'task', 'meeting', 'system')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_account_id ON notifications(account_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- 13. TABELA: teams (Equipes)
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  team_lead_id UUID REFERENCES users(id),
  member_ids UUID[] DEFAULT ARRAY[]::UUID[],
  goals JSONB,
  stats JSONB DEFAULT '{
    "total_leads": 0,
    "converted_leads": 0,
    "total_sales": 0,
    "revenue_generated": 0
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_teams_account_id ON teams(account_id);
CREATE INDEX idx_teams_team_lead_id ON teams(team_lead_id);

-- ============================================
-- 14. TABELA: files (Arquivos/Documentos)
-- ============================================
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL,
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
  lead_id UUID REFERENCES leads(id),
  property_id UUID REFERENCES imoveis(id),
  folder TEXT DEFAULT 'root',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_files_account_id ON files(account_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_lead_id ON files(lead_id);
CREATE INDEX idx_files_property_id ON files(property_id);
CREATE INDEX idx_files_folder ON files(folder);
CREATE INDEX idx_files_created_at ON files(created_at DESC);

-- ============================================
-- 15. TABELA: automations (Automações/Workflows)
-- ============================================
CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB NOT NULL,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  conditions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  execution_count INTEGER DEFAULT 0,
  last_execution TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_automations_account_id ON automations(account_id);
CREATE INDEX idx_automations_trigger_type ON automations(trigger_type);
CREATE INDEX idx_automations_is_active ON automations(is_active);

-- ============================================
-- 16. TABELA: analytics_events (Eventos de Analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_account_id ON analytics_events(account_id);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- ============================================
-- 17. TABELA: settings (Configurações)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, category, key)
);

CREATE INDEX idx_settings_account_id ON settings(account_id);
CREATE INDEX idx_settings_category ON settings(category);

-- ============================================
-- 18. TABELA: accounts (Contas/Tenants)
-- ============================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'professional', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'cancelled')),
  owner_id UUID,
  billing_email TEXT,
  phone TEXT,
  address JSONB,
  settings JSONB DEFAULT '{}'::jsonb,
  limits JSONB DEFAULT '{
    "max_users": 5,
    "max_leads": 1000,
    "max_properties": 100,
    "max_storage_gb": 5
  }'::jsonb,
  usage JSONB DEFAULT '{
    "users": 0,
    "leads": 0,
    "properties": 0,
    "storage_gb": 0
  }'::jsonb,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_accounts_subdomain ON accounts(subdomain);
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_accounts_plan ON accounts(plan);

-- ============================================
-- TRIGGERS: Updated_at automático
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_imoveis_updated_at BEFORE UPDATE ON imoveis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pipelines_updated_at BEFORE UPDATE ON pipelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pipeline_stages_updated_at BEFORE UPDATE ON pipeline_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON automations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================
COMMENT ON TABLE users IS 'Usuários do sistema CRM';
COMMENT ON TABLE leads IS 'Leads e clientes potenciais';
COMMENT ON TABLE imoveis IS 'Catálogo de imóveis/propriedades';
COMMENT ON TABLE pipelines IS 'Pipelines de vendas customizáveis';
COMMENT ON TABLE pipeline_stages IS 'Estágios dos pipelines';
COMMENT ON TABLE activities IS 'Histórico de atividades e interações';
COMMENT ON TABLE chats IS 'Conversas com clientes';
COMMENT ON TABLE chat_messages IS 'Mensagens das conversas';
COMMENT ON TABLE documents IS 'Documentos com embeddings para IA';
COMMENT ON TABLE tasks IS 'Tarefas e to-dos';
COMMENT ON TABLE calendar_events IS 'Eventos e agendamentos';
COMMENT ON TABLE notifications IS 'Notificações do sistema';
COMMENT ON TABLE teams IS 'Equipes de vendas';
COMMENT ON TABLE files IS 'Arquivos e documentos anexados';
COMMENT ON TABLE automations IS 'Automações e workflows';
COMMENT ON TABLE analytics_events IS 'Eventos para analytics';
COMMENT ON TABLE settings IS 'Configurações do sistema';
COMMENT ON TABLE accounts IS 'Contas multi-tenant';

-- ============================================
-- FIM DO SCHEMA
-- ============================================
