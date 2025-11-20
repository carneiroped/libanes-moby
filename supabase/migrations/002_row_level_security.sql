-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-tenant security para Moby CRM
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Get current user's account_id
-- ============================================
CREATE OR REPLACE FUNCTION auth.get_user_account_id()
RETURNS UUID AS $$
  SELECT account_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE;

-- ============================================
-- ACCOUNTS POLICIES
-- ============================================
CREATE POLICY "Users can view their own account"
  ON accounts FOR SELECT
  USING (id = auth.get_user_account_id());

CREATE POLICY "Account owners can update their account"
  ON accounts FOR UPDATE
  USING (owner_id = auth.uid());

-- ============================================
-- USERS POLICIES
-- ============================================
CREATE POLICY "Users can view users in their account"
  ON users FOR SELECT
  USING (account_id = auth.get_user_account_id());

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can manage all users in their account"
  ON users FOR ALL
  USING (
    account_id = auth.get_user_account_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- ============================================
-- LEADS POLICIES
-- ============================================
CREATE POLICY "Users can view leads in their account"
  ON leads FOR SELECT
  USING (account_id = auth.get_user_account_id());

CREATE POLICY "Users can view their assigned leads"
  ON leads FOR SELECT
  USING (assigned_to = auth.uid());

CREATE POLICY "Users can create leads in their account"
  ON leads FOR INSERT
  WITH CHECK (account_id = auth.get_user_account_id());

CREATE POLICY "Users can update their assigned leads"
  ON leads FOR UPDATE
  USING (
    account_id = auth.get_user_account_id()
    AND (assigned_to = auth.uid() OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'supervisor')
    ))
  );

CREATE POLICY "Managers can delete leads in their account"
  ON leads FOR DELETE
  USING (
    account_id = auth.get_user_account_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- ============================================
-- IMOVEIS POLICIES
-- ============================================
CREATE POLICY "Users can view properties in their account"
  ON imoveis FOR SELECT
  USING (account_id = auth.get_user_account_id());

CREATE POLICY "Users can create properties in their account"
  ON imoveis FOR INSERT
  WITH CHECK (account_id = auth.get_user_account_id());

CREATE POLICY "Users can update properties in their account"
  ON imoveis FOR UPDATE
  USING (
    account_id = auth.get_user_account_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'corretor')
    )
  );

CREATE POLICY "Admins can delete properties in their account"
  ON imoveis FOR DELETE
  USING (
    account_id = auth.get_user_account_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- ============================================
-- PIPELINES POLICIES
-- ============================================
CREATE POLICY "Users can view pipelines in their account"
  ON pipelines FOR SELECT
  USING (account_id = auth.get_user_account_id());

CREATE POLICY "Managers can manage pipelines in their account"
  ON pipelines FOR ALL
  USING (
    account_id = auth.get_user_account_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- ============================================
-- PIPELINE_STAGES POLICIES
-- ============================================
CREATE POLICY "Users can view pipeline stages in their account"
  ON pipeline_stages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pipelines
      WHERE id = pipeline_stages.pipeline_id
      AND account_id = auth.get_user_account_id()
    )
  );

CREATE POLICY "Managers can manage pipeline stages"
  ON pipeline_stages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pipelines p
      JOIN users u ON u.account_id = p.account_id
      WHERE p.id = pipeline_stages.pipeline_id
      AND u.id = auth.uid()
      AND u.role IN ('admin', 'manager')
    )
  );

-- ============================================
-- ACTIVITIES POLICIES
-- ============================================
CREATE POLICY "Users can view activities in their account"
  ON activities FOR SELECT
  USING (account_id = auth.get_user_account_id());

CREATE POLICY "Users can view their own activities"
  ON activities FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create activities in their account"
  ON activities FOR INSERT
  WITH CHECK (account_id = auth.get_user_account_id());

CREATE POLICY "Users can update their own activities"
  ON activities FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- CHATS POLICIES
-- ============================================
CREATE POLICY "Users can view chats in their account"
  ON chats FOR SELECT
  USING (account_id = auth.get_user_account_id());

CREATE POLICY "Users can create chats in their account"
  ON chats FOR INSERT
  WITH CHECK (account_id = auth.get_user_account_id());

CREATE POLICY "Users can update chats in their account"
  ON chats FOR UPDATE
  USING (account_id = auth.get_user_account_id());

-- ============================================
-- CHAT_MESSAGES POLICIES
-- ============================================
CREATE POLICY "Users can view chat messages for their chats"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE id = chat_messages.chat_id
      AND account_id = auth.get_user_account_id()
    )
  );

CREATE POLICY "Users can create chat messages for their chats"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats
      WHERE id = chat_messages.chat_id
      AND account_id = auth.get_user_account_id()
    )
  );

-- ============================================
-- DOCUMENTS POLICIES (Para IA/Embeddings)
-- ============================================
CREATE POLICY "Users can view documents in their account"
  ON documents FOR SELECT
  USING (account_id = auth.get_user_account_id());

CREATE POLICY "Users can create documents in their account"
  ON documents FOR INSERT
  WITH CHECK (account_id = auth.get_user_account_id());

CREATE POLICY "Admins can delete documents in their account"
  ON documents FOR DELETE
  USING (
    account_id = auth.get_user_account_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- ============================================
-- TASKS POLICIES
-- ============================================
CREATE POLICY "Users can view tasks in their account"
  ON tasks FOR SELECT
  USING (account_id = auth.get_user_account_id());

CREATE POLICY "Users can view their assigned tasks"
  ON tasks FOR SELECT
  USING (assigned_to = auth.uid());

CREATE POLICY "Users can create tasks in their account"
  ON tasks FOR INSERT
  WITH CHECK (account_id = auth.get_user_account_id());

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (assigned_to = auth.uid() OR created_by = auth.uid());

-- ============================================
-- CALENDAR_EVENTS POLICIES
-- ============================================
CREATE POLICY "Users can view calendar events in their account"
  ON calendar_events FOR SELECT
  USING (account_id = auth.get_user_account_id());

CREATE POLICY "Users can view events they're attending"
  ON calendar_events FOR SELECT
  USING (auth.uid() = ANY(attendees));

CREATE POLICY "Users can create calendar events in their account"
  ON calendar_events FOR INSERT
  WITH CHECK (account_id = auth.get_user_account_id());

CREATE POLICY "Users can update their own calendar events"
  ON calendar_events FOR UPDATE
  USING (created_by = auth.uid());

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications for users in account"
  ON notifications FOR INSERT
  WITH CHECK (account_id = auth.get_user_account_id());

-- ============================================
-- TEAMS POLICIES
-- ============================================
CREATE POLICY "Users can view teams in their account"
  ON teams FOR SELECT
  USING (account_id = auth.get_user_account_id());

CREATE POLICY "Team leads can manage their teams"
  ON teams FOR UPDATE
  USING (team_lead_id = auth.uid());

CREATE POLICY "Admins can manage all teams in their account"
  ON teams FOR ALL
  USING (
    account_id = auth.get_user_account_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- ============================================
-- FILES POLICIES
-- ============================================
CREATE POLICY "Users can view files in their account"
  ON files FOR SELECT
  USING (account_id = auth.get_user_account_id());

CREATE POLICY "Users can view their uploaded files"
  ON files FOR SELECT
  USING (uploaded_by = auth.uid());

CREATE POLICY "Users can create files in their account"
  ON files FOR INSERT
  WITH CHECK (account_id = auth.get_user_account_id());

CREATE POLICY "Users can delete their own files"
  ON files FOR DELETE
  USING (uploaded_by = auth.uid());

-- ============================================
-- AUTOMATIONS POLICIES
-- ============================================
CREATE POLICY "Users can view automations in their account"
  ON automations FOR SELECT
  USING (account_id = auth.get_user_account_id());

CREATE POLICY "Admins can manage automations in their account"
  ON automations FOR ALL
  USING (
    account_id = auth.get_user_account_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- ============================================
-- ANALYTICS_EVENTS POLICIES
-- ============================================
CREATE POLICY "Users can view analytics events in their account"
  ON analytics_events FOR SELECT
  USING (account_id = auth.get_user_account_id());

CREATE POLICY "System can create analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (account_id = auth.get_user_account_id());

-- ============================================
-- SETTINGS POLICIES
-- ============================================
CREATE POLICY "Users can view settings in their account"
  ON settings FOR SELECT
  USING (account_id = auth.get_user_account_id());

CREATE POLICY "Admins can manage settings in their account"
  ON settings FOR ALL
  USING (
    account_id = auth.get_user_account_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- ============================================
-- PUBLIC ACCESS POLICIES (Para features públicas)
-- ============================================

-- Permitir acesso público a imóveis marcados como públicos
CREATE POLICY "Public can view public properties"
  ON imoveis FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM settings
      WHERE account_id = imoveis.account_id
      AND category = 'public'
      AND key = 'allow_public_listings'
      AND value::boolean = true
    )
  );

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON POLICY "Users can view leads in their account" ON leads IS 'Multi-tenant: usuários só veem leads da sua conta';
COMMENT ON POLICY "Users can view their assigned leads" ON leads IS 'Usuários veem seus leads atribuídos';
COMMENT ON POLICY "Admins can manage all teams in their account" ON teams IS 'Admins têm acesso total às equipes da conta';

-- ============================================
-- FIM DAS POLÍTICAS RLS
-- ============================================
