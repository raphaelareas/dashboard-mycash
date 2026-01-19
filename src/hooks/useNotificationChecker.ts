import { useEffect, useRef, useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { 
  checkAndNotifyCardLimits, 
  checkAndNotifyBillDue 
} from '@/services/notificationService';

interface NotificationPreferences {
  billReminder: boolean;
  cardLimitAlert: boolean;
}

/**
 * Hook para verificar periodicamente e enviar notificações
 * Carrega preferências do localStorage ou usa valores padrão
 */
export function useNotificationChecker() {
  const { creditCards, transactions } = useFinance();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    // Carregar preferências do localStorage
    const saved = localStorage.getItem('notificationPreferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { billReminder: false, cardLimitAlert: false };
      }
    }
    return { billReminder: false, cardLimitAlert: false };
  });

  // Atualizar preferências quando mudarem no localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('notificationPreferences');
      if (saved) {
        try {
          setPreferences(JSON.parse(saved));
        } catch {
          // Ignorar erros de parsing
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Verificar também localmente (para mudanças na mesma aba)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Verificar imediatamente quando os dados ou preferências mudarem
    if (preferences.cardLimitAlert || preferences.billReminder) {
      checkAndNotifyCardLimits(creditCards, preferences);
      checkAndNotifyBillDue(transactions, preferences);
    }

    // Verificar a cada 5 minutos
    intervalRef.current = setInterval(() => {
      if (preferences.cardLimitAlert || preferences.billReminder) {
        checkAndNotifyCardLimits(creditCards, preferences);
        checkAndNotifyBillDue(transactions, preferences);
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [creditCards, transactions, preferences]);
}
