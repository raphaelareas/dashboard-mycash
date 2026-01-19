/**
 * Formata o nome completo para exibição abreviada
 * Ex: "Raphael Areas" → "Raphael A."
 * Ex: "Maria Silva Santos" → "Maria S."
 */
export function formatUserName(fullName: string): string {
  if (!fullName || !fullName.trim()) {
    return 'Usuário';
  }

  const words = fullName.trim().split(/\s+/);
  
  if (words.length === 0) {
    return 'Usuário';
  }
  
  if (words.length === 1) {
    return words[0];
  }
  
  // Primeiro nome + primeira letra do último nome + ponto
  const firstName = words[0];
  const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
  
  return `${firstName} ${lastInitial}.`;
}