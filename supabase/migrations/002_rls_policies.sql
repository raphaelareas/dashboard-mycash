-- ============================================
-- MIGRATION 002: Row Level Security (RLS) Policies
-- Cada usuário tem acesso somente às suas informações
-- ============================================

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNCTION: Get current user ID from auth.users
-- ============================================

-- Supabase usa auth.uid() para obter o UUID do usuário autenticado
-- Vamos criar uma função helper para facilitar

-- ============================================
-- USERS POLICIES
-- ============================================

-- Usuários podem ler apenas seus próprios dados
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

-- Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Usuários podem inserir seus próprios dados (durante registro)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- ============================================
-- FAMILY MEMBERS POLICIES
-- ============================================

-- Usuários podem ver apenas seus family members
CREATE POLICY "Users can view own family members"
  ON family_members FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Usuários podem inserir family members para si
CREATE POLICY "Users can insert own family members"
  ON family_members FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Usuários podem atualizar seus family members
CREATE POLICY "Users can update own family members"
  ON family_members FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Usuários podem deletar seus family members
CREATE POLICY "Users can delete own family members"
  ON family_members FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- CATEGORIES POLICIES
-- ============================================

-- Usuários podem ver apenas suas categorias
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Usuários podem inserir categorias para si
CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Usuários podem atualizar suas categorias
CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Usuários podem deletar suas categorias
CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- ACCOUNTS POLICIES
-- ============================================

-- Usuários podem ver apenas suas contas/cartões
CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Usuários podem inserir contas/cartões para si
CREATE POLICY "Users can insert own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Usuários podem atualizar suas contas/cartões
CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Usuários podem deletar suas contas/cartões
CREATE POLICY "Users can delete own accounts"
  ON accounts FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- TRANSACTIONS POLICIES
-- ============================================

-- Usuários podem ver apenas suas transações
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Usuários podem inserir transações para si
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Usuários podem atualizar suas transações
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Usuários podem deletar suas transações
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- RECURRING TRANSACTIONS POLICIES
-- ============================================

-- Usuários podem ver apenas suas transações recorrentes
CREATE POLICY "Users can view own recurring transactions"
  ON recurring_transactions FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Usuários podem inserir transações recorrentes para si
CREATE POLICY "Users can insert own recurring transactions"
  ON recurring_transactions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Usuários podem atualizar suas transações recorrentes
CREATE POLICY "Users can update own recurring transactions"
  ON recurring_transactions FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Usuários podem deletar suas transações recorrentes
CREATE POLICY "Users can delete own recurring transactions"
  ON recurring_transactions FOR DELETE
  USING (auth.uid()::text = user_id::text);
