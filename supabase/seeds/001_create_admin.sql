-- ============================================
-- SEED: Criar Conta e Usuário Admin Inicial
-- Execute este script APÓS as migrations
-- ============================================

-- IMPORTANTE: Você precisa primeiro criar o usuário no Supabase Auth
-- Vá em Authentication > Users > Add User
-- Email: pedro@moby.casa
-- Password: SuaSenhaSegura123!
-- Após criar, copie o UUID do usuário e substitua abaixo

-- ============================================
-- OPÇÃO 1: Se você já criou o usuário no Auth
-- ============================================

-- Substitua 'SEU_USER_UUID_AQUI' pelo UUID do usuário criado no Auth
DO $$
DECLARE
  v_user_id UUID := 'SEU_USER_UUID_AQUI'; -- ⚠️ SUBSTITUA AQUI
  v_account_id UUID;
BEGIN
  -- 1. Criar conta principal
  INSERT INTO accounts (
    id,
    name,
    subdomain,
    plan,
    status,
    owner_id,
    billing_email,
    settings,
    limits,
    usage
  ) VALUES (
    gen_random_uuid(),
    'Moby Imobiliária',
    'moby',
    'professional',
    'active',
    v_user_id,
    'pedro@moby.casa',
    '{
      "timezone": "America/Sao_Paulo",
      "language": "pt-BR",
      "currency": "BRL"
    }'::jsonb,
    '{
      "max_users": 50,
      "max_leads": 10000,
      "max_properties": 5000,
      "max_storage_gb": 100
    }'::jsonb,
    '{
      "users": 1,
      "leads": 0,
      "properties": 0,
      "storage_gb": 0
    }'::jsonb
  )
  RETURNING id INTO v_account_id;

  -- 2. Criar usuário admin na tabela users
  INSERT INTO users (
    id,
    account_id,
    name,
    email,
    phone,
    role,
    department,
    position,
    status,
    permissions,
    stats,
    preferences
  ) VALUES (
    v_user_id,
    v_account_id,
    'Pedro',
    'pedro@moby.casa',
    '+55 11 99999-9999',
    'admin',
    'Administração',
    'Administrador',
    'active',
    '[
      "admin.full_access",
      "users.manage",
      "leads.manage",
      "properties.manage",
      "pipelines.manage",
      "settings.manage",
      "analytics.view"
    ]'::jsonb,
    '{
      "total_leads": 0,
      "converted_leads": 0,
      "total_sales": 0,
      "revenue_generated": 0,
      "calls_made": 0,
      "emails_sent": 0
    }'::jsonb,
    '{
      "theme": "dark",
      "language": "pt-BR",
      "timezone": "America/Sao_Paulo",
      "notifications": {
        "email": true,
        "sms": false,
        "push": true,
        "whatsapp": true
      }
    }'::jsonb
  );

  -- 3. Criar pipeline padrão
  INSERT INTO pipelines (
    id,
    account_id,
    name,
    description,
    is_default,
    is_active,
    created_by
  ) VALUES (
    gen_random_uuid(),
    v_account_id,
    'Pipeline Padrão',
    'Pipeline principal de vendas',
    true,
    true,
    v_user_id
  );

  -- 4. Criar estágios do pipeline
  WITH new_pipeline AS (
    SELECT id FROM pipelines WHERE account_id = v_account_id AND is_default = true LIMIT 1
  )
  INSERT INTO pipeline_stages (pipeline_id, name, color, order_index, is_closed_won, is_closed_lost)
  SELECT
    (SELECT id FROM new_pipeline),
    stage_name,
    stage_color,
    stage_order,
    is_won,
    is_lost
  FROM (VALUES
    ('Lead Novo', '#3b82f6', 1, false, false),
    ('Qualificação', '#8b5cf6', 2, false, false),
    ('Apresentação', '#06b6d4', 3, false, false),
    ('Proposta', '#10b981', 4, false, false),
    ('Negociação', '#f59e0b', 5, false, false),
    ('Fechado - Ganho', '#22c55e', 6, true, false),
    ('Fechado - Perdido', '#ef4444', 7, false, true)
  ) AS stages(stage_name, stage_color, stage_order, is_won, is_lost);

  -- 5. Criar configurações iniciais
  INSERT INTO settings (account_id, category, key, value) VALUES
    (v_account_id, 'general', 'company_name', '"Moby Imobiliária"'::jsonb),
    (v_account_id, 'general', 'timezone', '"America/Sao_Paulo"'::jsonb),
    (v_account_id, 'general', 'language', '"pt-BR"'::jsonb),
    (v_account_id, 'general', 'currency', '"BRL"'::jsonb),
    (v_account_id, 'features', 'whatsapp_integration', 'true'::jsonb),
    (v_account_id, 'features', 'ai_qualification', 'true'::jsonb),
    (v_account_id, 'features', 'automation', 'true'::jsonb),
    (v_account_id, 'public', 'allow_public_listings', 'false'::jsonb);

  RAISE NOTICE 'Conta e usuário admin criados com sucesso!';
  RAISE NOTICE 'Account ID: %', v_account_id;
  RAISE NOTICE 'User ID: %', v_user_id;

END $$;

-- ============================================
-- OPÇÃO 2: Criar tudo automaticamente (ALTERNATIVA)
-- Não funciona no dashboard SQL Editor, mas funciona via código
-- ============================================

/*
-- Este bloco só funciona se você estiver usando service_role_key no código
-- Não execute no dashboard, use apenas via script Node.js

-- 1. Criar usuário no Supabase Auth
-- 2. Criar account
-- 3. Criar user na tabela users
-- 4. Criar pipeline e estágios

-- Exemplo em TypeScript:
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // SERVICE ROLE!
)

async function createAdmin() {
  // 1. Criar usuário auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'pedro@moby.casa',
    password: 'SuaSenhaSegura123!',
    email_confirm: true,
    user_metadata: {
      name: 'Pedro',
      role: 'admin'
    }
  })

  if (authError) throw authError
  console.log('Usuário auth criado:', authData.user.id)

  // 2. Criar account
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .insert({
      name: 'Moby Imobiliária',
      subdomain: 'moby',
      plan: 'professional',
      status: 'active',
      owner_id: authData.user.id,
      billing_email: 'pedro@moby.casa'
    })
    .select()
    .single()

  if (accountError) throw accountError
  console.log('Account criada:', account.id)

  // 3. Criar user
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      account_id: account.id,
      name: 'Pedro',
      email: 'pedro@moby.casa',
      role: 'admin',
      status: 'active'
    })

  if (userError) throw userError
  console.log('User criado!')

  return { userId: authData.user.id, accountId: account.id }
}

createAdmin().then(console.log).catch(console.error)
*/

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verifique se tudo foi criado corretamente
SELECT
  'Accounts' as table_name,
  COUNT(*) as count
FROM accounts
UNION ALL
SELECT
  'Users',
  COUNT(*)
FROM users
UNION ALL
SELECT
  'Pipelines',
  COUNT(*)
FROM pipelines
UNION ALL
SELECT
  'Pipeline Stages',
  COUNT(*)
FROM pipeline_stages
UNION ALL
SELECT
  'Settings',
  COUNT(*)
FROM settings;

-- Verificar dados do admin
SELECT
  u.id,
  u.name,
  u.email,
  u.role,
  a.name as account_name,
  a.plan
FROM users u
JOIN accounts a ON a.id = u.account_id
WHERE u.role = 'admin';

-- ============================================
-- FIM DO SEED
-- ============================================
