-- ============================================
-- Migration: Adicionar coluna property_types à tabela leads
-- Data: 2025-01-17
-- Objetivo: Suportar array de tipos de propriedade de interesse
-- ============================================

-- Adicionar coluna property_types como array de texto
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS property_types TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Criar índice para busca eficiente
CREATE INDEX IF NOT EXISTS idx_leads_property_types ON leads USING GIN (property_types);

-- Comentário na coluna
COMMENT ON COLUMN leads.property_types IS 'Tipos de propriedade de interesse do lead (Apartamento, Casa, Cobertura, etc.)';
