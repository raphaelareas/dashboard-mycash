import { Transaction } from '@/types';

/**
 * Agrupa transações por categoria e soma valores
 * @param transactions - Array de transações
 * @returns Objeto com categorias como chaves e valores somados
 */
export function groupByCategory(transactions: Transaction[]): Record<string, number> {
  return transactions.reduce((acc, transaction) => {
    const category = transaction.category;
    acc[category] = (acc[category] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Filtra transações por intervalo de datas
 * @param transactions - Array de transações
 * @param startDate - Data inicial
 * @param endDate - Data final
 * @returns Array filtrado
 */
export function filterByDateRange(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] {
  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
}

/**
 * Ordena transações por data
 * @param transactions - Array de transações
 * @param order - 'asc' ou 'desc'
 * @returns Array ordenado
 */
export function sortByDate(transactions: Transaction[], order: 'asc' | 'desc' = 'desc'): Transaction[] {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}
