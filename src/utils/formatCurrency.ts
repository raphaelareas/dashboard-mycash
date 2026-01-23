// DEPRECATED: Use useCurrencyFormat hook instead
// Esta função mantém compatibilidade mas deve ser substituída pelo hook
export function formatCurrency(value: number): string {
  // Tentar pegar moeda do localStorage (fallback temporário)
  // Em produção, todos os componentes devem usar useCurrencyFormat
  const savedCurrency = localStorage.getItem('user_currency') || 'BRL';
  const savedLanguage = localStorage.getItem('language') || 'pt-BR';
  
  // Mapeamento de idioma para locale
  const languageToLocale: Record<string, string> = {
    'pt-BR': 'pt-BR',
    'en-US': 'en-US',
    'es-ES': 'es-ES',
    'fr-FR': 'fr-FR',
    'no-NO': 'nb-NO',
    'de-DE': 'de-DE',
  };
  
  const locale = languageToLocale[savedLanguage] || 'pt-BR';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: savedCurrency,
  }).format(value);
}
