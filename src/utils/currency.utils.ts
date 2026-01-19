/**
 * Formata um número como moeda brasileira
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como "R$ 1.234,56"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata valores grandes de forma compacta para gráficos
 * @param value - Valor numérico
 * @returns String formatada como "R$ 2,5k" ou "R$ 1,2M"
 */
export function formatCompactCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1)}k`;
  }
  return formatCurrency(value);
}

/**
 * Converte string de input de moeda em número
 * Remove "R$", pontos de milhar, substitui vírgula por ponto
 * @param input - String do input do usuário
 * @returns Número limpo ou NaN se inválido
 */
export function parseCurrencyInput(input: string): number {
  const cleaned = input
    .replace(/R\$/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  
  return parseFloat(cleaned) || 0;
}

/**
 * Formata valor automaticamente conforme o usuário digita
 * Remove caracteres não numéricos e formata com ponto de milhar e vírgula decimal
 * Exemplos: "9000" → "9.000,00" | "78690" → "786,90"
 * @param value - String digitada pelo usuário
 * @returns Objeto com { display: string formatada, numeric: number }
 */
export function formatCurrencyInput(value: string): { display: string; numeric: number } {
  // Remove tudo exceto números
  const numbersOnly = value.replace(/\D/g, '');
  
  if (!numbersOnly) {
    return { display: '', numeric: 0 };
  }

  // Se tiver 2 ou menos dígitos, são centavos
  // Se tiver mais de 2 dígitos, os últimos 2 são centavos
  let reais = '0';
  let centavos = '00';

  if (numbersOnly.length <= 2) {
    // Apenas centavos (ex: "89" → "0,89")
    centavos = numbersOnly.padStart(2, '0');
  } else {
    // Reais + centavos (ex: "9000" → "9.000,00" | "78690" → "786,90")
    centavos = numbersOnly.slice(-2);
    reais = numbersOnly.slice(0, -2);
  }

  // Formata reais com pontos de milhar
  const reaisFormatted = parseInt(reais || '0').toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  // Monta o valor formatado
  const display = `${reaisFormatted},${centavos}`;
  
  // Calcula o valor numérico
  const numeric = parseFloat(reais || '0') + (parseInt(centavos) / 100);

  return { display, numeric };
}
