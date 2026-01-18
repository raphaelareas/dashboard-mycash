import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata data no formato DD/MM/AAAA
 * @param date - Objeto Date
 * @returns String formatada
 */
export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
}

/**
 * Formata data no formato longo: "15 de Janeiro de 2024"
 * @param date - Objeto Date
 * @returns String formatada
 */
export function formatDateLong(date: Date): string {
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

/**
 * Formata intervalo de datas: "01 jan - 31 jan, 2024"
 * @param startDate - Data inicial
 * @param endDate - Data final
 * @returns String formatada
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth();

  if (sameMonth) {
    return `${format(startDate, 'dd', { locale: ptBR })} ${format(startDate, 'MMM', { locale: ptBR })} - ${format(endDate, 'dd', { locale: ptBR })} ${format(endDate, 'MMM', { locale: ptBR })}, ${format(endDate, 'yyyy')}`;
  }

  if (sameYear) {
    return `${format(startDate, 'dd MMM', { locale: ptBR })} - ${format(endDate, 'dd MMM', { locale: ptBR })}, ${format(endDate, 'yyyy')}`;
  }

  return `${format(startDate, 'dd MMM yyyy', { locale: ptBR })} - ${format(endDate, 'dd MMM yyyy', { locale: ptBR })}`;
}

/**
 * Retorna data relativa: "Hoje", "Ontem", "Há 3 dias"
 * @param date - Objeto Date
 * @returns String formatada
 */
export function formatRelativeDate(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
}

/**
 * Formata data curta: DD/MM
 * @param date - Objeto Date
 * @returns String formatada
 */
export function formatDateShort(date: Date): string {
  return format(date, 'dd/MM', { locale: ptBR });
}
