-- ============================================
-- MIGRATION 008: Add address and phone fields to users table
-- Adiciona campos de telefone e endereço separados
-- ============================================

-- Adicionar coluna de telefone (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone TEXT;
  END IF;
END $$;

-- Adicionar coluna CEP (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'cep'
  ) THEN
    ALTER TABLE users ADD COLUMN cep TEXT;
  END IF;
END $$;

-- Adicionar coluna street (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'street'
  ) THEN
    ALTER TABLE users ADD COLUMN street TEXT;
  END IF;
END $$;

-- Adicionar coluna address_number (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'address_number'
  ) THEN
    ALTER TABLE users ADD COLUMN address_number TEXT;
  END IF;
END $$;

-- Adicionar coluna city (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'city'
  ) THEN
    ALTER TABLE users ADD COLUMN city TEXT;
  END IF;
END $$;

-- Adicionar coluna state (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'state'
  ) THEN
    ALTER TABLE users ADD COLUMN state TEXT;
  END IF;
END $$;

-- Manter campo address para compatibilidade (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'address'
  ) THEN
    ALTER TABLE users ADD COLUMN address TEXT;
  END IF;
END $$;

-- Criar comentários para documentação
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'phone'
  ) THEN
    COMMENT ON COLUMN users.phone IS 'Telefone do usuário (formato livre)';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'cep'
  ) THEN
    COMMENT ON COLUMN users.cep IS 'CEP do endereço (8 dígitos)';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'street'
  ) THEN
    COMMENT ON COLUMN users.street IS 'Logradouro/Rua do endereço';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'address_number'
  ) THEN
    COMMENT ON COLUMN users.address_number IS 'Número do endereço';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'city'
  ) THEN
    COMMENT ON COLUMN users.city IS 'Cidade do endereço';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'state'
  ) THEN
    COMMENT ON COLUMN users.state IS 'UF (Estado) do endereço';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'address'
  ) THEN
    COMMENT ON COLUMN users.address IS 'Endereço completo (legado, mantido para compatibilidade)';
  END IF;
END $$;
