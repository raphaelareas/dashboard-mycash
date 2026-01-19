/**
 * Calcula a exibição de parcelas para mostrar no formato "X/Y"
 * onde X é o número da parcela atual e Y é o total de parcelas
 * 
 * Exemplo:
 * - Se é parcela 1 de 3, mostra "1/3"
 * - Se é parcela 2 de 3, mostra "2/3"
 * - Se é parcela 3 de 3, mostra "3/3"
 * 
 * @param installmentNumber Número da parcela atual (ex: 1, 2, 3)
 * @param totalInstallments Total de parcelas (ex: 3)
 * @returns String no formato "X/Y" ou null se não for parcela
 */
export function formatInstallmentDisplay(
  installmentNumber: number | undefined,
  totalInstallments: number | undefined
): string | null {
  if (!installmentNumber || !totalInstallments || totalInstallments <= 1) {
    return null;
  }

  // Mostrar diretamente: parcela atual / total de parcelas
  // Ex: installment_number = 2, total_installments = 3 → "2/3"
  return `${installmentNumber}/${totalInstallments}`;
}
