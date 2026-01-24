-- ============================================
-- MIGRATION 018: Recalcular saldo de todos os cartões
-- Contando apenas a transação fixa mais recente de cada série
-- ============================================

-- Recalcular saldo de todos os cartões
UPDATE accounts a
SET current_bill = (
  -- Despesas normais (sempre conta)
  SELECT COALESCE(SUM(t1.amount), 0)
  FROM transactions t1
  WHERE t1.account_id = a.id
  AND t1.type = 'EXPENSE'
  AND t1.total_installments < 999
  
  -- Somar despesas fixas: apenas a mais recente de cada série
  + COALESCE((
    SELECT SUM(latest.amount)
    FROM (
      SELECT DISTINCT ON (t2.description, t2.category_id) t2.amount
      FROM transactions t2
      WHERE t2.account_id = a.id
      AND t2.type = 'EXPENSE'
      AND t2.total_installments >= 999
      AND t2.date <= CURRENT_DATE
      ORDER BY t2.description, t2.category_id, t2.date DESC
    ) latest
  ), 0)
)
WHERE a.type = 'CREDIT_CARD';
