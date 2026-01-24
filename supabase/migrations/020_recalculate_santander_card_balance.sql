-- ============================================
-- MIGRATION 020: Recalcular saldo do Cartão Santander
-- Aplicar correção manual para o saldo atual
-- ============================================

-- Recalcular saldo do Cartão Santander
WITH normal_expenses AS (
  SELECT COALESCE(SUM(amount), 0) as total
  FROM transactions
  WHERE account_id = '289aef5a-f2c9-426a-ada4-d3a77a06223b'
  AND type = 'EXPENSE'
  AND total_installments < 999
),
fixed_latest AS (
  SELECT COALESCE(SUM(amount), 0) as total
  FROM (
    SELECT DISTINCT ON (description, category_id) amount
    FROM transactions
    WHERE account_id = '289aef5a-f2c9-426a-ada4-d3a77a06223b'
    AND type = 'EXPENSE'
    AND total_installments >= 999
    AND date <= CURRENT_DATE
    ORDER BY description, category_id, date DESC
  ) sub
)
UPDATE accounts
SET current_bill = (SELECT total FROM normal_expenses) + (SELECT total FROM fixed_latest)
WHERE id = '289aef5a-f2c9-426a-ada4-d3a77a06223b';

-- Recalcular saldo de todos os outros cartões também
UPDATE accounts a
SET current_bill = (
  SELECT COALESCE(SUM(t1.amount), 0)
  FROM transactions t1
  WHERE t1.account_id = a.id
  AND t1.type = 'EXPENSE'
  AND t1.total_installments < 999
  
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
WHERE a.type = 'CREDIT_CARD'
AND a.id != '289aef5a-f2c9-426a-ada4-d3a77a06223b';
