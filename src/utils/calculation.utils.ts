/**
 * Calcula percentual de um valor parcial em relação ao total
 * @param partial - Valor parcial
 * @param total - Valor total
 * @returns Percentual com uma casa decimal (0 se total for zero)
 */
export function calculatePercentage(partial: number, total: number): number {
  if (total === 0) return 0;
  return Number(((partial / total) * 100).toFixed(1));
}

/**
 * Calcula diferença entre dois valores
 * @param value1 - Valor inicial
 * @param value2 - Valor final
 * @returns Objeto com diferença absoluta e percentual
 */
export function calculateDifference(value1: number, value2: number): {
  absolute: number;
  percentage: number;
} {
  const absolute = value2 - value1;
  const percentage = value1 === 0 ? 0 : Number(((absolute / value1) * 100).toFixed(1));

  return { absolute, percentage };
}

/**
 * Calcula valor de cada parcela
 * @param totalValue - Valor total
 * @param installments - Número de parcelas
 * @returns Valor de cada parcela arredondado para 2 casas decimais
 */
export function calculateInstallmentValue(totalValue: number, installments: number): number {
  if (installments <= 0) return totalValue;
  return Number((totalValue / installments).toFixed(2));
}
