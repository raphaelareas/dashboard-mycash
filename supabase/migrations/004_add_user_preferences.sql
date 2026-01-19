-- ============================================
-- MIGRATION 004: Add user preferences (currency and date format)
-- Adiciona campos para moeda padrão e formato de data
-- ============================================

-- Adicionar colunas de preferências na tabela users
ALTER TABLE users
ADD COLUMN currency TEXT DEFAULT 'BRL',
ADD COLUMN date_format TEXT DEFAULT 'DD/MM/YYYY';

-- Criar comentários para documentação
COMMENT ON COLUMN users.currency IS 'Código da moeda padrão (ISO 4217): BRL, USD, CAD, ARS, EUR, GBP, JPY, MXN, NOK, CNY, etc.';
COMMENT ON COLUMN users.date_format IS 'Formato de data preferido: DD/MM/YYYY (brasileiro) ou MM/DD/YYYY (americano)';

-- Criar índice para melhorar performance de queries
CREATE INDEX idx_users_currency ON users(currency);
