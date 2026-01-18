/**
 * Gera ID único usando timestamp e random
 * @returns String ID único
 */
export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
