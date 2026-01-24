-- ============================================
-- MIGRATION 019: Corrigir trigger para não contar transações fixas futuras
-- Transações fixas futuras nunca devem ser contadas, apenas as do mês atual/passado
-- ============================================

CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
DECLARE
  account_type_val TEXT;
  amount_change DECIMAL(12, 2);
  is_fixed_expense BOOLEAN;
  should_count BOOLEAN;
BEGIN
  -- Determinar se é INSERT, UPDATE ou DELETE
  IF TG_OP = 'DELETE' THEN
    -- Se deletou, reverter a transação
    IF OLD.account_id IS NOT NULL THEN
      SELECT type INTO account_type_val FROM accounts WHERE id = OLD.account_id;
      
      IF account_type_val IN ('CHECKING', 'SAVINGS') THEN
        -- Para contas, só atualiza se status era COMPLETED
        IF OLD.status = 'COMPLETED' THEN
          amount_change := CASE 
            WHEN OLD.type = 'INCOME' THEN -OLD.amount
            WHEN OLD.type = 'EXPENSE' THEN OLD.amount
            ELSE 0
          END;
          UPDATE accounts 
          SET balance = balance + amount_change
          WHERE id = OLD.account_id;
        END IF;
      ELSIF account_type_val = 'CREDIT_CARD' THEN
        -- Para cartão, atualiza se for EXPENSE (independente do status)
        IF OLD.type = 'EXPENSE' THEN
          -- Verificar se é despesa fixa
          is_fixed_expense := (OLD.total_installments >= 999);
          
          IF is_fixed_expense THEN
            -- Para despesas fixas, só conta se:
            -- 1. Data <= hoje (não futura)
            -- 2. E for a transação mais recente da série
            IF OLD.date <= CURRENT_DATE THEN
              SELECT NOT EXISTS (
                SELECT 1 FROM transactions t
                WHERE t.account_id = OLD.account_id
                AND t.description = OLD.description
                AND t.category_id = OLD.category_id
                AND t.total_installments >= 999
                AND t.type = 'EXPENSE'
                AND t.id != OLD.id
                AND t.date <= CURRENT_DATE
                AND t.date > OLD.date
              ) INTO should_count;
            ELSE
              should_count := FALSE; -- Transações futuras nunca contam
            END IF;
          ELSE
            should_count := TRUE; -- Despesas normais sempre contam
          END IF;
          
          IF should_count THEN
            UPDATE accounts 
            SET current_bill = current_bill - OLD.amount
            WHERE id = OLD.account_id;
          END IF;
        END IF;
      END IF;
    END IF;
    
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Se atualizou, calcular diferença
    -- Primeiro reverter a transação antiga
    IF OLD.account_id IS NOT NULL THEN
      SELECT type INTO account_type_val FROM accounts WHERE id = OLD.account_id;
      
      IF account_type_val IN ('CHECKING', 'SAVINGS') THEN
        -- Para contas, só atualiza se status era COMPLETED
        IF OLD.status = 'COMPLETED' THEN
          amount_change := CASE 
            WHEN OLD.type = 'INCOME' THEN -OLD.amount
            WHEN OLD.type = 'EXPENSE' THEN OLD.amount
            ELSE 0
          END;
          UPDATE accounts 
          SET balance = balance + amount_change
          WHERE id = OLD.account_id;
        END IF;
      ELSIF account_type_val = 'CREDIT_CARD' AND OLD.type = 'EXPENSE' THEN
        -- Para cartão, reverter sempre que for EXPENSE
        is_fixed_expense := (OLD.total_installments >= 999);
        
        IF is_fixed_expense THEN
          IF OLD.date <= CURRENT_DATE THEN
            SELECT NOT EXISTS (
              SELECT 1 FROM transactions t
              WHERE t.account_id = OLD.account_id
              AND t.description = OLD.description
              AND t.category_id = OLD.category_id
              AND t.total_installments >= 999
              AND t.type = 'EXPENSE'
              AND t.id != OLD.id
              AND t.date <= CURRENT_DATE
              AND t.date > OLD.date
            ) INTO should_count;
          ELSE
            should_count := FALSE;
          END IF;
        ELSE
          should_count := TRUE;
        END IF;
        
        IF should_count THEN
          UPDATE accounts 
          SET current_bill = current_bill - OLD.amount
          WHERE id = OLD.account_id;
        END IF;
      END IF;
    END IF;
    
    -- Depois aplicar a transação nova
    IF NEW.account_id IS NOT NULL THEN
      SELECT type INTO account_type_val FROM accounts WHERE id = NEW.account_id;
      
      IF account_type_val IN ('CHECKING', 'SAVINGS') THEN
        -- Para contas, só atualiza se status é COMPLETED
        IF NEW.status = 'COMPLETED' THEN
          amount_change := CASE 
            WHEN NEW.type = 'INCOME' THEN NEW.amount
            WHEN NEW.type = 'EXPENSE' THEN -NEW.amount
            ELSE 0
          END;
          UPDATE accounts 
          SET balance = balance + amount_change
          WHERE id = NEW.account_id;
        END IF;
      ELSIF account_type_val = 'CREDIT_CARD' AND NEW.type = 'EXPENSE' THEN
        -- Para cartão, atualizar sempre que for EXPENSE (independente do status)
        is_fixed_expense := (NEW.total_installments >= 999);
        
        IF is_fixed_expense THEN
          -- Para despesas fixas, só conta se:
          -- 1. Data <= hoje (não futura)
          -- 2. E for a transação mais recente da série
          IF NEW.date <= CURRENT_DATE THEN
            SELECT NOT EXISTS (
              SELECT 1 FROM transactions t
              WHERE t.account_id = NEW.account_id
              AND t.description = NEW.description
              AND t.category_id = NEW.category_id
              AND t.total_installments >= 999
              AND t.type = 'EXPENSE'
              AND t.id != NEW.id
              AND t.date <= CURRENT_DATE
              AND t.date > NEW.date
            ) INTO should_count;
          ELSE
            should_count := FALSE; -- Transações futuras nunca contam
          END IF;
        ELSE
          should_count := TRUE; -- Despesas normais sempre contam
        END IF;
        
        IF should_count THEN
          UPDATE accounts 
          SET current_bill = current_bill + NEW.amount
          WHERE id = NEW.account_id;
        END IF;
      END IF;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    -- Se inseriu, adicionar à conta
    IF NEW.account_id IS NOT NULL THEN
      SELECT type INTO account_type_val FROM accounts WHERE id = NEW.account_id;
      
      IF account_type_val IN ('CHECKING', 'SAVINGS') THEN
        -- Para contas, só atualiza se status é COMPLETED
        IF NEW.status = 'COMPLETED' THEN
          amount_change := CASE 
            WHEN NEW.type = 'INCOME' THEN NEW.amount
            WHEN NEW.type = 'EXPENSE' THEN -NEW.amount
            ELSE 0
          END;
          UPDATE accounts 
          SET balance = balance + amount_change
          WHERE id = NEW.account_id;
        END IF;
      ELSIF account_type_val = 'CREDIT_CARD' AND NEW.type = 'EXPENSE' THEN
        -- Para cartão, atualizar sempre que for EXPENSE (independente do status)
        is_fixed_expense := (NEW.total_installments >= 999);
        
        IF is_fixed_expense THEN
          -- Para despesas fixas, só conta se:
          -- 1. Data <= hoje (não futura)
          -- 2. E for a transação mais recente da série
          IF NEW.date <= CURRENT_DATE THEN
            SELECT NOT EXISTS (
              SELECT 1 FROM transactions t
              WHERE t.account_id = NEW.account_id
              AND t.description = NEW.description
              AND t.category_id = NEW.category_id
              AND t.total_installments >= 999
              AND t.type = 'EXPENSE'
              AND t.id != NEW.id
              AND t.date <= CURRENT_DATE
              AND t.date > NEW.date
            ) INTO should_count;
          ELSE
            should_count := FALSE; -- Transações futuras nunca contam
          END IF;
        ELSE
          should_count := TRUE; -- Despesas normais sempre contam
        END IF;
        
        IF should_count THEN
          UPDATE accounts 
          SET current_bill = current_bill + NEW.amount
          WHERE id = NEW.account_id;
        END IF;
      END IF;
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
