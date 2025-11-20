-- Migration: Pipeline Fixo para Vendas Imobiliárias
-- Cria um pipeline único e fixo com estágios otimizados para o setor imobiliário

-- 1. Limpar pipelines e stages existentes (manter leads)
DELETE FROM pipeline_stages;
DELETE FROM pipelines;

-- 2. Criar o pipeline fixo único
INSERT INTO pipelines (id, account_id, name, description, is_default, is_active, total_leads)
VALUES (
  'a4691893-47fb-4667-895c-1009e8bd3d76'::uuid,
  '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
  'Pipeline de Vendas Imobiliárias',
  'Funil otimizado para conversão de leads em vendas de imóveis',
  true,
  true,
  0
);

-- 3. Criar os 7 estágios fixos otimizados
INSERT INTO pipeline_stages (id, pipeline_id, name, description, color, order_index) VALUES
-- Estágio 1: Lead Novo (Azul claro - início)
('6b4a1ec3-61ad-4bf4-8fa6-acd1a47b70a1'::uuid,
 'a4691893-47fb-4667-895c-1009e8bd3d76'::uuid,
 'Lead Novo',
 'Primeiro contato com o lead - captura inicial',
 '#3b82f6',
 1),

-- Estágio 2: Qualificação (Roxo - validação)
('9931fd09-3c39-431e-82d6-a4cd0c3423cf'::uuid,
 'a4691893-47fb-4667-895c-1009e8bd3d76'::uuid,
 'Qualificação',
 'Verificação de perfil, orçamento e necessidades',
 '#8b5cf6',
 2),

-- Estágio 3: Apresentação (Laranja - engajamento)
('367978fc-692f-4ea8-aa76-5597138f48a5'::uuid,
 'a4691893-47fb-4667-895c-1009e8bd3d76'::uuid,
 'Apresentação',
 'Apresentação de opções de imóveis compatíveis',
 '#f97316',
 3),

-- Estágio 4: Visita Agendada (Amarelo - ação crítica)
('016cd30b-34e0-413b-8ba2-7893d7dbb0b5'::uuid,
 'a4691893-47fb-4667-895c-1009e8bd3d76'::uuid,
 'Visita Agendada',
 'Lead agendou visita presencial ao imóvel',
 '#eab308',
 4),

-- Estágio 5: Proposta (Verde claro - negociação)
('d3794004-4747-4cde-b357-a053b1d5374e'::uuid,
 'a4691893-47fb-4667-895c-1009e8bd3d76'::uuid,
 'Proposta',
 'Negociação de valores e condições',
 '#22c55e',
 5),

-- Estágio 6: Documentação (Azul escuro - burocracia)
('10324cef-3c0f-4b87-a0b0-d8e46090e7d0'::uuid,
 'a4691893-47fb-4667-895c-1009e8bd3d76'::uuid,
 'Documentação',
 'Análise de crédito, documentos e aprovações',
 '#0ea5e9',
 6),

-- Estágio 7: Fechamento (Verde escuro - ganho!)
('46daa9fa-0308-4252-8c5c-bc99ab24b608'::uuid,
 'a4691893-47fb-4667-895c-1009e8bd3d76'::uuid,
 'Fechamento',
 'Contrato assinado - venda concluída',
 '#059669',
 7);

-- 4. Atualizar todos os leads para o primeiro estágio (Lead Novo)
-- IMPORTANTE: Isso redistribui os leads existentes no novo pipeline
UPDATE leads
SET pipeline_stage_id = '6b4a1ec3-61ad-4bf4-8fa6-acd1a47b70a1'::uuid
WHERE account_id = '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid;

-- 5. Comentário de controle
COMMENT ON TABLE pipelines IS 'Pipeline fixo único para vendas imobiliárias - não permitir criação de novos';
COMMENT ON TABLE pipeline_stages IS 'Estágios fixos otimizados para o funil de vendas imobiliárias';
