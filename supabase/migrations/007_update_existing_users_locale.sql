-- ============================================
-- MIGRATION 007: Update existing users with default locale
-- Atualiza usuários existentes que não têm preferências definidas
-- ============================================

-- Atualizar usuários que não têm language definido
UPDATE users
SET language = 'pt-BR'
WHERE language IS NULL;

-- Atualizar usuários que não têm currency definido
UPDATE users
SET currency = 'BRL'
WHERE currency IS NULL;

-- Atualizar usuários que não têm date_format definido
UPDATE users
SET date_format = 'DD/MM/YYYY'
WHERE date_format IS NULL;
