import { CreditCard, BankAccount, Transaction } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';

interface NotificationPreferences {
  billReminder: boolean;
  cardLimitAlert: boolean;
}

/**
 * Verifica se um cartão atingiu 80% do limite
 */
/**
 * Verifica se um cartão atingiu 80% do limite e ainda não foi notificado hoje
 */
export function shouldNotifyCardLimit(card: CreditCard): boolean {
  if (!card.limit || card.currentBalance === undefined || card.currentBalance === null) {
    return false;
  }
  
  const usagePercentage = (card.currentBalance / card.limit) * 100;
  
  // Verificar se atingiu 80% ou mais (mas não mais que 100%)
  if (usagePercentage >= 80 && usagePercentage <= 100) {
    // Verificar se já foi notificado hoje
    const lastNotificationKey = `card-limit-notified-${card.id}`;
    const lastNotificationDate = localStorage.getItem(lastNotificationKey);
    const today = new Date().toDateString();
    
    // Se já foi notificado hoje, não notificar novamente
    if (lastNotificationDate === today) {
      return false;
    }
    
    // Marcar como notificado hoje
    localStorage.setItem(lastNotificationKey, today);
    return true;
  }
  
  return false;
}

/**
 * Verifica se uma conta deve receber notificação de vencimento
 * Retorna o número de dias até o vencimento se deve notificar, ou null
 */
export function shouldNotifyBillDue(transaction: Transaction, currentDate: Date = new Date()): number | null {
  if (!transaction.isRecurring || !transaction.installmentData || transaction.isPaid) {
    return null;
  }

  const dueDate = new Date(transaction.date);
  dueDate.setHours(0, 0, 0, 0);
  
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);
  
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Notificar 7 dias antes e 2 dias antes
  if (daysUntilDue === 7 || daysUntilDue === 2) {
    // Verificar se já foi notificado neste dia específico
    const notificationKey = `bill-due-${transaction.id}-${daysUntilDue}`;
    const lastNotificationDate = localStorage.getItem(notificationKey);
    const todayStr = today.toDateString();
    
    // Se já foi notificado hoje para este vencimento, não notificar novamente
    if (lastNotificationDate === todayStr) {
      return null;
    }
    
    // Marcar como notificado hoje
    localStorage.setItem(notificationKey, todayStr);
    return daysUntilDue;
  }
  
  return null;
}

/**
 * Envia notificação do navegador
 */
export function sendBrowserNotification(
  title: string,
  body: string,
  options?: NotificationOptions
): void {
  if (!('Notification' in window)) {
    console.warn('Navegador não suporta notificações');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Permissão de notificação não concedida');
    return;
  }

  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
}

/**
 * Verifica e envia notificações de cartões
 */
export function checkAndNotifyCardLimits(
  cards: CreditCard[],
  preferences: NotificationPreferences
): void {
  if (!preferences.cardLimitAlert) {
    return;
  }

  cards.forEach((card) => {
    if (shouldNotifyCardLimit(card)) {
      const usagePercentage = Math.round((card.currentBalance! / card.limit!) * 100);
      sendBrowserNotification(
        'Limite do Cartão Aproximando',
        `O cartão ${card.name || card.bankName} atingiu ${usagePercentage}% do limite (${formatCurrency(card.currentBalance!)} de ${formatCurrency(card.limit!)})`,
        {
          tag: `card-limit-${card.id}`,
        }
      );
    }
  });
}

/**
 * Verifica e envia notificações de vencimento de contas
 */
export function checkAndNotifyBillDue(
  transactions: Transaction[],
  preferences: NotificationPreferences
): void {
  if (!preferences.billReminder) {
    return;
  }

  const recurringExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.isRecurring && !t.isPaid
  );

  recurringExpenses.forEach((transaction) => {
    const daysUntilDue = shouldNotifyBillDue(transaction);
    
    if (daysUntilDue !== null) {
      const message = daysUntilDue === 7
        ? `Faltam 7 dias para o vencimento de "${transaction.description}"`
        : `Faltam apenas 2 dias para o vencimento de "${transaction.description}"`;
      
      sendBrowserNotification(
        'Lembrete de Vencimento',
        `${message}. Valor: ${formatCurrency(transaction.amount)}`,
        {
          tag: `bill-due-${transaction.id}-${daysUntilDue}`,
        }
      );
    }
  });
}

