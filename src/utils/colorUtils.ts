// Cores disponíveis para contas, cartões e categorias
export const availableColors = [
  // Vermelho - 4 tons (escuro → claro)
  '#991B1B', // red-800
  '#B91C1C', // red-700
  '#DC2626', // red-600
  '#EF4444', // red-500
  
  // Roxo/Violeta - 4 tons (escuro → claro)
  '#5B21B6', // violet-800
  '#6D28D9', // violet-700
  '#7C3AED', // violet-600
  '#8B5CF6', // violet-500
  
  // Azul - 4 tons (escuro → claro)
  '#1E40AF', // blue-800
  '#1D4ED8', // blue-700
  '#2563EB', // blue-600
  '#3B82F6', // blue-500
  
  // Verde Esmeralda - 4 tons (escuro → claro)
  '#065F46', // emerald-800
  '#047857', // emerald-700
  '#059669', // emerald-600
  '#10B981', // emerald-500
  
  // Rosa/Pink - 4 tons (escuro → claro)
  '#9F1239', // pink-800
  '#BE185D', // pink-700
  '#DB2777', // pink-600
  '#EC4899', // pink-500
  
  // Laranja/Âmbar - 4 tons (escuro → claro)
  '#92400E', // amber-800
  '#B45309', // amber-700
  '#D97706', // amber-600
  '#F59E0B', // amber-500
  
  // Verde Limão - 4 tons (escuro → claro)
  '#4D7C0F', // lime-700
  '#65A30D', // lime-600
  '#84CC16', // lime-500
  '#A3E635', // lime-400
  
  // Índigo - 4 tons (escuro → claro)
  '#3730A3', // indigo-800
  '#4338CA', // indigo-700
  '#4F46E5', // indigo-600
  '#6366F1', // indigo-500
  
  // Ciano/Teal - 4 tons (escuro → claro)
  '#0F766E', // teal-700
  '#0D9488', // teal-600
  '#0891B2', // cyan-600
  '#06B6D4', // cyan-500
  
  // Cinzas/Pretos - 4 tons (escuro → claro)
  '#000000', // Preto
  '#111827', // gray-900
  '#1F2937', // gray-800
  '#374151', // gray-700
];

/**
 * Gera uma cor aleatória da lista de cores disponíveis
 * @returns Uma cor hexadecimal aleatória
 */
export function getRandomColor(): string {
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  return availableColors[randomIndex];
}
