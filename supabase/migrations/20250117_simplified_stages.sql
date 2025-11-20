-- Migration: Simplificação TOTAL - Estágios fixos direto na tabela leads
-- Remove dependência de pipeline_stages e pipelines
-- Cria coluna ENUM 'stage' com os 7 estágios fixos do setor imobiliário

-- 1. Criar tipo ENUM com os 7 estágios fixos
CREATE TYPE lead_stage AS ENUM (
  'lead_novo',
  'qualificacao',
  'apresentacao',
  'visita_agendada',
  'proposta',
  'documentacao',
  'fechamento'
);

-- 2. Adicionar coluna stage na tabela leads
ALTER TABLE leads
ADD COLUMN stage lead_stage DEFAULT 'lead_novo';

-- 3. Atualizar leads existentes baseado no pipeline_stage_id
UPDATE leads SET stage =
  CASE
    WHEN pipeline_stage_id = '6b4a1ec3-61ad-4bf4-8fa6-acd1a47b70a1' THEN 'lead_novo'
    WHEN pipeline_stage_id = '9931fd09-3c39-431e-82d6-a4cd0c3423cf' THEN 'qualificacao'
    WHEN pipeline_stage_id = '367978fc-692f-4ea8-aa76-5597138f48a5' THEN 'apresentacao'
    WHEN pipeline_stage_id = '016cd30b-34e0-413b-8ba2-7893d7dbb0b5' THEN 'visita_agendada'
    WHEN pipeline_stage_id = 'd3794004-4747-4cde-b357-a053b1d5374e' THEN 'proposta'
    WHEN pipeline_stage_id = '10324cef-3c0f-4b87-a0b0-d8e46090e7d0' THEN 'documentacao'
    WHEN pipeline_stage_id = '46daa9fa-0308-4252-8c5c-bc99ab24b608' THEN 'fechamento'
    ELSE 'lead_novo'
  END
WHERE account_id = '6200796e-5629-4669-a4e1-3d8b027830fa';

-- 4. Remover foreign key e coluna antiga pipeline_stage_id
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_pipeline_stage_id_fkey;
ALTER TABLE leads DROP COLUMN IF EXISTS pipeline_stage_id;

-- 5. Tornar a coluna stage obrigatória
ALTER TABLE leads ALTER COLUMN stage SET NOT NULL;

-- 6. Criar índice para performance
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_account_stage ON leads(account_id, stage);

-- 7. Remover tabelas antigas (não precisamos mais delas!)
DROP TABLE IF EXISTS pipeline_stages CASCADE;
DROP TABLE IF EXISTS pipelines CASCADE;

-- 8. Adicionar comentários
COMMENT ON COLUMN leads.stage IS 'Estágio fixo do lead no funil de vendas imobiliárias';
COMMENT ON TYPE lead_stage IS 'Estágios fixos: Lead Novo → Qualificação → Apresentação → Visita Agendada → Proposta → Documentação → Fechamento';
