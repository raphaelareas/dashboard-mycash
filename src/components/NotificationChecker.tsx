import { useNotificationChecker } from '@/hooks/useNotificationChecker';

/**
 * Componente wrapper para verificar notificações periodicamente
 * Este componente deve ser renderizado uma vez no App para funcionar globalmente
 */
export function NotificationChecker() {
  useNotificationChecker();
  return null; // Componente invisível
}
