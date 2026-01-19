-- ============================================
-- MIGRATION 003: Add account_id to categories
-- Adiciona campo para vincular categoria a conta/cartão
-- ============================================

-- Adicionar coluna account_id na tabela categories
ALTER TABLE categories 
ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;

-- Criar índice para melhorar performance de queries
CREATE INDEX idx_categories_account_id ON categories(account_id);
