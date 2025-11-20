-- ============================================
-- Migration: Automação Chat → Lead
-- Data: 2025-01-17
-- Objetivo: Criar leads automaticamente quando novos chats chegam
-- ============================================

-- ============================================
-- 1. Função para criar ou atualizar lead a partir do chat
-- ============================================
CREATE OR REPLACE FUNCTION sync_chat_to_lead()
RETURNS TRIGGER AS $$
DECLARE
  v_lead_id UUID;
  v_contact_name TEXT;
  v_account_id UUID;
  v_default_stage_id UUID;
BEGIN
  -- Verificar se já existe um lead com este telefone
  SELECT id INTO v_lead_id
  FROM leads
  WHERE phone = NEW.phone
    AND account_id = NEW.account_id
  LIMIT 1;

  -- Se não existe lead, criar um novo
  IF v_lead_id IS NULL THEN
    -- Buscar o nome do contato nas últimas mensagens
    SELECT COALESCE(user_name, 'Cliente ' || SUBSTRING(NEW.phone FROM LENGTH(NEW.phone) - 5))
    INTO v_contact_name
    FROM chat_messages
    WHERE phone = NEW.phone
      AND user_name IS NOT NULL
      AND user_name != ''
    ORDER BY created_at DESC
    LIMIT 1;

    -- Se não encontrou nome, usar padrão
    IF v_contact_name IS NULL OR v_contact_name = '' THEN
      v_contact_name := 'Cliente ' || SUBSTRING(NEW.phone FROM LENGTH(NEW.phone) - 5);
    END IF;

    -- Buscar o estágio padrão do pipeline
    SELECT ps.id INTO v_default_stage_id
    FROM pipeline_stages ps
    JOIN pipelines p ON p.id = ps.pipeline_id
    WHERE p.account_id = NEW.account_id
      AND p.is_default = TRUE
      AND ps.order_index = 1
    ORDER BY ps.order_index ASC
    LIMIT 1;

    -- Criar o lead
    INSERT INTO leads (
      account_id,
      name,
      phone,
      source,
      status,
      stage,
      pipeline_stage_id,
      score,
      created_at,
      updated_at
    ) VALUES (
      NEW.account_id,
      v_contact_name,
      NEW.phone,
      'whatsapp',
      'novo',
      'novo',
      v_default_stage_id,
      50, -- Score médio inicial
      NOW(),
      NOW()
    )
    RETURNING id INTO v_lead_id;

    -- Criar atividade inicial
    INSERT INTO activities (
      account_id,
      lead_id,
      type,
      title,
      description,
      status,
      completed_at,
      created_at,
      updated_at
    ) VALUES (
      NEW.account_id,
      v_lead_id,
      'whatsapp',
      'Primeiro contato via WhatsApp',
      'Lead entrou em contato pela primeira vez através do WhatsApp',
      'completed',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;

  -- Atualizar o chat com o lead_id
  NEW.lead_id := v_lead_id;

  -- Atualizar a data de último contato do lead
  UPDATE leads
  SET
    last_contact = NOW(),
    interactions_count = interactions_count + 1,
    updated_at = NOW()
  WHERE id = v_lead_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. Trigger para executar automação em novos chats
-- ============================================
DROP TRIGGER IF EXISTS trigger_sync_chat_to_lead ON chats;

CREATE TRIGGER trigger_sync_chat_to_lead
  BEFORE INSERT ON chats
  FOR EACH ROW
  EXECUTE FUNCTION sync_chat_to_lead();

-- ============================================
-- 3. Função para atualizar lead quando novas mensagens chegam
-- ============================================
CREATE OR REPLACE FUNCTION update_lead_on_message()
RETURNS TRIGGER AS $$
DECLARE
  v_lead_id UUID;
  v_chat_lead_id UUID;
BEGIN
  -- Buscar o lead_id do chat
  SELECT lead_id INTO v_chat_lead_id
  FROM chats
  WHERE id = NEW.chat_id;

  -- Se o chat tem lead associado, atualizar
  IF v_chat_lead_id IS NOT NULL THEN
    UPDATE leads
    SET
      last_contact = NOW(),
      interactions_count = interactions_count + 1,
      updated_at = NOW()
    WHERE id = v_chat_lead_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. Trigger para atualizar lead em novas mensagens
-- ============================================
DROP TRIGGER IF EXISTS trigger_update_lead_on_message ON chat_messages;

CREATE TRIGGER trigger_update_lead_on_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_on_message();

-- ============================================
-- 5. Índices para performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leads_phone_account ON leads(phone, account_id);
CREATE INDEX IF NOT EXISTS idx_chats_phone_account ON chats(phone, account_id);

-- ============================================
-- Comentários
-- ============================================
COMMENT ON FUNCTION sync_chat_to_lead() IS 'Cria automaticamente um lead quando um novo chat é iniciado';
COMMENT ON FUNCTION update_lead_on_message() IS 'Atualiza informações do lead quando novas mensagens chegam';
COMMENT ON TRIGGER trigger_sync_chat_to_lead ON chats IS 'Trigger que executa sync_chat_to_lead antes de inserir novo chat';
COMMENT ON TRIGGER trigger_update_lead_on_message ON chat_messages IS 'Trigger que atualiza lead ao receber nova mensagem';
