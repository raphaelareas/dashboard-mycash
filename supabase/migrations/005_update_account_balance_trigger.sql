-- Função para atualizar saldo da conta quando transação é criada/atualizada/deletada
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
DECLARE
  account_type_val TEXT;
  amount_change DECIMAL(12, 2);
BEGIN
  -- Determinar se é INSERT, UPDATE ou DELETE
  IF TG_OP = 'DELETE' THEN
    -- Se deletou, reverter a transação
    IF OLD.account_id IS NOT NULL AND OLD.status = 'COMPLETED' THEN
      SELECT type INTO account_type_val FROM accounts WHERE id = OLD.account_id;
      
      IF account_type_val IN ('CHECKING', 'SAVINGS') THEN
        amount_change := CASE 
          WHEN OLD.type = 'INCOME' THEN -OLD.amount
          WHEN OLD.type = 'EXPENSE' THEN OLD.amount
          ELSE 0
        END;
        UPDATE accounts 
        SET balance = balance + amount_change
        WHERE id = OLD.account_id;
      ELSIF account_type_val = 'CREDIT_CARD' THEN
        -- Para cartão, só atualiza se for EXPENSE
        IF OLD.type = 'EXPENSE' THEN
          UPDATE accounts 
          SET current_bill = current_bill - OLD.amount
          WHERE id = OLD.account_id;
        END IF;
      END IF;
    END IF;
    
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Se atualizou, calcular diferença
    -- Primeiro reverter a transação antiga
    IF OLD.account_id IS NOT NULL AND OLD.status = 'COMPLETED' THEN
      SELECT type INTO account_type_val FROM accounts WHERE id = OLD.account_id;
      
      IF account_type_val IN ('CHECKING', 'SAVINGS') THEN
        amount_change := CASE 
          WHEN OLD.type = 'INCOME' THEN -OLD.amount
          WHEN OLD.type = 'EXPENSE' THEN OLD.amount
          ELSE 0
        END;
        UPDATE accounts 
        SET balance = balance + amount_change
        WHERE id = OLD.account_id;
      ELSIF account_type_val = 'CREDIT_CARD' AND OLD.type = 'EXPENSE' THEN
        UPDATE accounts 
        SET current_bill = current_bill - OLD.amount
        WHERE id = OLD.account_id;
      END IF;
    END IF;
    
    -- Depois aplicar a transação nova
    IF NEW.account_id IS NOT NULL AND NEW.status = 'COMPLETED' THEN
      SELECT type INTO account_type_val FROM accounts WHERE id = NEW.account_id;
      
      IF account_type_val IN ('CHECKING', 'SAVINGS') THEN
        amount_change := CASE 
          WHEN NEW.type = 'INCOME' THEN NEW.amount
          WHEN NEW.type = 'EXPENSE' THEN -NEW.amount
          ELSE 0
        END;
        UPDATE accounts 
        SET balance = balance + amount_change
        WHERE id = NEW.account_id;
      ELSIF account_type_val = 'CREDIT_CARD' AND NEW.type = 'EXPENSE' THEN
        UPDATE accounts 
        SET current_bill = current_bill + NEW.amount
        WHERE id = NEW.account_id;
      END IF;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    -- Se inseriu, adicionar à conta
    IF NEW.account_id IS NOT NULL AND NEW.status = 'COMPLETED' THEN
      SELECT type INTO account_type_val FROM accounts WHERE id = NEW.account_id;
      
      IF account_type_val IN ('CHECKING', 'SAVINGS') THEN
        amount_change := CASE 
          WHEN NEW.type = 'INCOME' THEN NEW.amount
          WHEN NEW.type = 'EXPENSE' THEN -NEW.amount
          ELSE 0
        END;
        UPDATE accounts 
        SET balance = balance + amount_change
        WHERE id = NEW.account_id;
      ELSIF account_type_val = 'CREDIT_CARD' AND NEW.type = 'EXPENSE' THEN
        UPDATE accounts 
        SET current_bill = current_bill + NEW.amount
        WHERE id = NEW.account_id;
      END IF;
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_update_account_balance ON transactions;
CREATE TRIGGER trigger_update_account_balance
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance();
