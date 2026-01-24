-- ============================================
-- MIGRATION 012: Recalcular saldo dos cartões
-- Corrige discrepâncias no saldo dos cartões
-- ============================================

-- Recalcular saldo do cartão manualmente para corrigir discrepâncias
UPDATE accounts a
SET current_bill = COALESCE((
  SELECT SUM(t.amount)
  FROM transactions t
  WHERE t.account_id = a.id
  AND t.type = 'EXPENSE'
  AND t.status = 'COMPLETED'
), 0)
WHERE a.type = 'CREDIT_CARD';
