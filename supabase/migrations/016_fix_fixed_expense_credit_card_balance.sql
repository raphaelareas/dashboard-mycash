-- ============================================
-- MIGRATION 016: Corrigir cálculo de saldo do cartão para despesas fixas
-- Despesas fixas devem contar apenas o valor mensal, não somar todas as parcelas futuras
-- ============================================

CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
DECLARE
  account_type_val TEXT;
  amount_change DECIMAL(12, 2);
  is_fixed_expense BOOLEAN;
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
          
          -- Para despesas fixas, só conta se a data for <= hoje (não conta futuras)
          -- Para despesas normais, sempre conta
          IF NOT is_fixed_expense OR OLD.date <= CURRENT_DATE THEN
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
        
        -- Para despesas fixas, só conta se a data for <= hoje
        IF NOT is_fixed_expense OR OLD.date <= CURRENT_DATE THEN
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
        
        -- Para despesas fixas, só conta se a data for <= hoje (não conta futuras)
        -- Para despesas normais, sempre conta
        IF NOT is_fixed_expense OR NEW.date <= CURRENT_DATE THEN
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
        
        -- Para despesas fixas, só conta se a data for <= hoje (não conta futuras)
        -- Para despesas normais, sempre conta
        IF NOT is_fixed_expense OR NEW.date <= CURRENT_DATE THEN
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
