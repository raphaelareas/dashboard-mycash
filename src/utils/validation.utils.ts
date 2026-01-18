/**
 * Valida formato de email
 * @param email - String de email
 * @returns true se válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida estrutura de CPF (apenas formato, sem validação completa)
 * @param cpf - String de CPF
 * @returns true se formato válido
 */
export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.length === 11;
}

/**
 * Verifica se data é válida
 * @param date - Objeto Date
 * @param allowFuture - Permite datas futuras
 * @returns true se válida
 */
export function isValidDate(date: Date, allowFuture: boolean = false): boolean {
  if (isNaN(date.getTime())) return false;
  if (!allowFuture && date > new Date()) return false;
  return true;
}

/**
 * Verifica se valor é número positivo maior que zero
 * @param value - Valor a verificar
 * @returns true se válido
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0 && !isNaN(value);
}
