-- ============================================
-- MIGRATION 006: Add language column to users
-- Adiciona coluna de idioma para preferências do usuário
-- ============================================

-- Adicionar coluna de idioma na tabela users (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'language'
  ) THEN
    ALTER TABLE users
    ADD COLUMN language TEXT DEFAULT 'pt-BR';
    
    COMMENT ON COLUMN users.language IS 'Código do idioma preferido: pt-BR, en-US, es-ES, fr-FR, no-NO, de-DE';
  END IF;
END $$;

-- Criar índice para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_users_language ON users(language);
