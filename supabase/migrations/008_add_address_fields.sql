-- ============================================
-- MIGRATION 008: Add address and phone fields to users table
-- Adiciona campos de telefone e endereço separados
-- ============================================

-- Adicionar coluna de telefone (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone TEXT;
  END IF;
END $$;

-- Adicionar colunas de endereço separadas
ALTER TABLE users
ADD COLUMN IF NOT EXISTS cep TEXT,
ADD COLUMN IF NOT EXISTS street TEXT,
ADD COLUMN IF NOT EXISTS address_number TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- Manter campo address para compatibilidade (pode ser removido depois se não for mais usado)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'address'
  ) THEN
    ALTER TABLE users ADD COLUMN address TEXT;
  END IF;
END $$;

-- Criar comentários para documentação
COMMENT ON COLUMN users.phone IS 'Telefone do usuário (formato livre)';
COMMENT ON COLUMN users.cep IS 'CEP do endereço (8 dígitos)';
COMMENT ON COLUMN users.street IS 'Logradouro/Rua do endereço';
COMMENT ON COLUMN users.address_number IS 'Número do endereço';
COMMENT ON COLUMN users.city IS 'Cidade do endereço';
COMMENT ON COLUMN users.state IS 'UF (Estado) do endereço';
COMMENT ON COLUMN users.address IS 'Endereço completo (legado, mantido para compatibilidade)';
