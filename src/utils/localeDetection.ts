// Mapeamento de países para moedas e formatos de data
const countryToCurrency: Record<string, string> = {
  // América Latina
  BR: 'BRL', // Brasil
  AR: 'ARS', // Argentina
  MX: 'MXN', // México
  CL: 'CLP', // Chile
  CO: 'COP', // Colômbia
  PE: 'PEN', // Peru
  UY: 'UYU', // Uruguai
  PY: 'PYG', // Paraguai
  BO: 'BOB', // Bolívia
  EC: 'USD', // Equador (usa dólar)
  VE: 'VES', // Venezuela
  CR: 'CRC', // Costa Rica
  PA: 'PAB', // Panamá
  GT: 'GTQ', // Guatemala
  HN: 'HNL', // Honduras
  NI: 'NIO', // Nicarágua
  SV: 'USD', // El Salvador (usa dólar)
  DO: 'DOP', // República Dominicana
  CU: 'CUP', // Cuba
  JM: 'JMD', // Jamaica
  TT: 'TTD', // Trinidad e Tobago
  
  // América do Norte
  US: 'USD', // Estados Unidos
  CA: 'CAD', // Canadá
  
  // Europa
  GB: 'GBP', // Reino Unido
  NO: 'NOK', // Noruega
  SE: 'SEK', // Suécia
  DK: 'DKK', // Dinamarca
  IS: 'ISK', // Islândia
  CH: 'CHF', // Suíça
  PL: 'PLN', // Polônia
  CZ: 'CZK', // República Tcheca
  HU: 'HUF', // Hungria
  RO: 'RON', // Romênia
  BG: 'BGN', // Bulgária
  HR: 'HRK', // Croácia
  RS: 'RSD', // Sérvia
  // Eurozone (usando EUR)
  AT: 'EUR', BE: 'EUR', CY: 'EUR', DE: 'EUR', EE: 'EUR',
  ES: 'EUR', FI: 'EUR', FR: 'EUR', GR: 'EUR', IE: 'EUR',
  IT: 'EUR', LT: 'EUR', LU: 'EUR', LV: 'EUR', MT: 'EUR',
  NL: 'EUR', PT: 'EUR', SI: 'EUR', SK: 'EUR',
  
  // Ásia
  CN: 'CNY', // China
  JP: 'JPY', // Japão
  KR: 'KRW', // Coreia do Sul
  IN: 'INR', // Índia
  ID: 'IDR', // Indonésia
  TH: 'THB', // Tailândia
  VN: 'VND', // Vietnã
  PH: 'PHP', // Filipinas
  MY: 'MYR', // Malásia
  SG: 'SGD', // Singapura
  HK: 'HKD', // Hong Kong
  TW: 'TWD', // Taiwan
  
  // Oceania
  AU: 'AUD', // Austrália
  NZ: 'NZD', // Nova Zelândia
  
  // África
  ZA: 'ZAR', // África do Sul
  EG: 'EGP', // Egito
  NG: 'NGN', // Nigéria
  KE: 'KES', // Quênia
};

const countryToDateFormat: Record<string, string> = {
  // Países que usam formato DD/MM/YYYY
  BR: 'DD/MM/YYYY', AR: 'DD/MM/YYYY', MX: 'DD/MM/YYYY',
  CL: 'DD/MM/YYYY', CO: 'DD/MM/YYYY', PE: 'DD/MM/YYYY',
  UY: 'DD/MM/YYYY', PY: 'DD/MM/YYYY', BO: 'DD/MM/YYYY',
  EC: 'DD/MM/YYYY', VE: 'DD/MM/YYYY', CR: 'DD/MM/YYYY',
  PA: 'DD/MM/YYYY', GT: 'DD/MM/YYYY', HN: 'DD/MM/YYYY',
  NI: 'DD/MM/YYYY', SV: 'DD/MM/YYYY', DO: 'DD/MM/YYYY',
  CU: 'DD/MM/YYYY', JM: 'DD/MM/YYYY', TT: 'DD/MM/YYYY',
  // Europa (maioria usa DD/MM/YYYY)
  GB: 'DD/MM/YYYY', NO: 'DD/MM/YYYY', SE: 'DD/MM/YYYY',
  DK: 'DD/MM/YYYY', IS: 'DD/MM/YYYY', CH: 'DD/MM/YYYY',
  PL: 'DD/MM/YYYY', CZ: 'DD/MM/YYYY', HU: 'DD/MM/YYYY',
  RO: 'DD/MM/YYYY', BG: 'DD/MM/YYYY', HR: 'DD/MM/YYYY',
  RS: 'DD/MM/YYYY',
  // Eurozone
  AT: 'DD/MM/YYYY', BE: 'DD/MM/YYYY', CY: 'DD/MM/YYYY',
  DE: 'DD/MM/YYYY', EE: 'DD/MM/YYYY', ES: 'DD/MM/YYYY',
  FI: 'DD/MM/YYYY', FR: 'DD/MM/YYYY', GR: 'DD/MM/YYYY',
  IE: 'DD/MM/YYYY', IT: 'DD/MM/YYYY', LT: 'DD/MM/YYYY',
  LU: 'DD/MM/YYYY', LV: 'DD/MM/YYYY', MT: 'DD/MM/YYYY',
  NL: 'DD/MM/YYYY', PT: 'DD/MM/YYYY', SI: 'DD/MM/YYYY',
  SK: 'DD/MM/YYYY',
  // Ásia
  CN: 'YYYY-MM-DD', JP: 'YYYY/MM/DD', KR: 'YYYY.MM.DD',
  IN: 'DD/MM/YYYY', ID: 'DD/MM/YYYY', TH: 'DD/MM/YYYY',
  VN: 'DD/MM/YYYY', PH: 'MM/DD/YYYY', MY: 'DD/MM/YYYY',
  SG: 'DD/MM/YYYY', HK: 'DD/MM/YYYY', TW: 'YYYY/MM/DD',
  // Oceania
  AU: 'DD/MM/YYYY', NZ: 'DD/MM/YYYY',
  // África
  ZA: 'YYYY/MM/DD', EG: 'DD/MM/YYYY', NG: 'DD/MM/YYYY',
  KE: 'DD/MM/YYYY',
};

// Mapeamento de países para idiomas
const countryToLanguage: Record<string, string> = {
  // América Latina (Espanhol)
  AR: 'es-ES', MX: 'es-ES', CL: 'es-ES', CO: 'es-ES',
  PE: 'es-ES', UY: 'es-ES', PY: 'es-ES', BO: 'es-ES',
  EC: 'es-ES', VE: 'es-ES', CR: 'es-ES', PA: 'es-ES',
  GT: 'es-ES', HN: 'es-ES', NI: 'es-ES', SV: 'es-ES',
  DO: 'es-ES', CU: 'es-ES',
  // Brasil (Português)
  BR: 'pt-BR',
  // América do Norte
  US: 'en-US', CA: 'en-US',
  // Europa
  GB: 'en-US', IE: 'en-US',
  NO: 'no-NO', // Noruega
  DE: 'de-DE', AT: 'de-DE', // Alemanha, Áustria
  FR: 'fr-FR', BE: 'fr-FR', // França, Bélgica
  CH: 'de-DE', // Suíça (padrão alemão, pode ser ajustado)
  ES: 'es-ES', // Espanha
  // Outros países europeus (padrão inglês)
  SE: 'en-US', DK: 'en-US', IS: 'en-US', PL: 'en-US',
  CZ: 'en-US', HU: 'en-US', RO: 'en-US', BG: 'en-US',
  HR: 'en-US', RS: 'en-US',
  // Eurozone (padrão inglês para os não mapeados)
  IT: 'en-US', NL: 'en-US', PT: 'pt-BR', GR: 'en-US',
  FI: 'en-US', EE: 'en-US', LT: 'en-US', LU: 'en-US',
  LV: 'en-US', MT: 'en-US', SI: 'en-US', SK: 'en-US',
};

// Países que usam formato MM/DD/YYYY
const mmddyyyyCountries = ['US', 'CA', 'PH', 'FM', 'MH', 'PW'];

export interface UserPreferences {
  currency: string;
  dateFormat: string;
  language?: string;
}

/**
 * Detecta a localização do usuário e retorna moeda, formato de data e idioma padrão
 */
export function detectUserLocale(): UserPreferences {
  // Tentar obter do navegador
  const locale = navigator.language || 'pt-BR';
  const countryCode = locale.split('-')[1]?.toUpperCase() || 'BR';

  // Obter moeda baseada no país
  const currency = countryToCurrency[countryCode] || 'BRL';
  
  // Obter formato de data baseado no país
  let dateFormat = countryToDateFormat[countryCode] || 'DD/MM/YYYY';
  
  // Ajustar para MM/DD/YYYY se necessário
  if (mmddyyyyCountries.includes(countryCode)) {
    dateFormat = 'MM/DD/YYYY';
  }

  // Obter idioma baseado no país
  const language = countryToLanguage[countryCode] || 'pt-BR';

  return {
    currency,
    dateFormat,
    language,
  };
}

/**
 * Lista completa de moedas disponíveis
 */
export const availableCurrencies = [
  { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
  { code: 'USD', name: 'Dólar Americano', symbol: '$' },
  { code: 'CAD', name: 'Dólar Canadense', symbol: 'C$' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/' },
  { code: 'UYU', name: 'Peso Uruguaio', symbol: '$' },
  { code: 'PYG', name: 'Guarani Paraguaio', symbol: '₲' },
  { code: 'BOB', name: 'Boliviano', symbol: 'Bs.' },
  { code: 'VES', name: 'Bolívar Venezuelano', symbol: 'Bs.' },
  { code: 'CRC', name: 'Colón Costarriquenho', symbol: '₡' },
  { code: 'PAB', name: 'Balboa Panamenho', symbol: 'B/.' },
  { code: 'GTQ', name: 'Quetzal Guatemalteco', symbol: 'Q' },
  { code: 'HNL', name: 'Lempira Hondurenha', symbol: 'L' },
  { code: 'NIO', name: 'Córdoba Nicaraguense', symbol: 'C$' },
  { code: 'DOP', name: 'Peso Dominicano', symbol: '$' },
  { code: 'CUP', name: 'Peso Cubano', symbol: '$' },
  { code: 'JMD', name: 'Dólar Jamaicano', symbol: '$' },
  { code: 'TTD', name: 'Dólar de Trinidad e Tobago', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
  { code: 'NOK', name: 'Coroa Norueguesa', symbol: 'kr' },
  { code: 'SEK', name: 'Coroa Sueca', symbol: 'kr' },
  { code: 'DKK', name: 'Coroa Dinamarquesa', symbol: 'kr' },
  { code: 'ISK', name: 'Coroa Islandesa', symbol: 'kr' },
  { code: 'CHF', name: 'Franco Suíço', symbol: 'CHF' },
  { code: 'PLN', name: 'Zloty Polonês', symbol: 'zł' },
  { code: 'CZK', name: 'Coroa Tcheca', symbol: 'Kč' },
  { code: 'HUF', name: 'Forint Húngaro', symbol: 'Ft' },
  { code: 'RON', name: 'Leu Romeno', symbol: 'lei' },
  { code: 'BGN', name: 'Lev Búlgaro', symbol: 'лв' },
  { code: 'HRK', name: 'Kuna Croata', symbol: 'kn' },
  { code: 'RSD', name: 'Dinar Sérvio', symbol: 'дин' },
  { code: 'JPY', name: 'Iene Japonês', symbol: '¥' },
  { code: 'CNY', name: 'Yuan Chinês', symbol: '¥' },
  { code: 'KRW', name: 'Won Sul-Coreano', symbol: '₩' },
  { code: 'INR', name: 'Rupia Indiana', symbol: '₹' },
  { code: 'IDR', name: 'Rupia Indonésia', symbol: 'Rp' },
  { code: 'THB', name: 'Baht Tailandês', symbol: '฿' },
  { code: 'VND', name: 'Dong Vietnamita', symbol: '₫' },
  { code: 'PHP', name: 'Peso Filipino', symbol: '₱' },
  { code: 'MYR', name: 'Ringgit Malaio', symbol: 'RM' },
  { code: 'SGD', name: 'Dólar de Singapura', symbol: 'S$' },
  { code: 'HKD', name: 'Dólar de Hong Kong', symbol: 'HK$' },
  { code: 'TWD', name: 'Dólar de Taiwan', symbol: 'NT$' },
  { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$' },
  { code: 'NZD', name: 'Dólar Neozelandês', symbol: 'NZ$' },
  { code: 'ZAR', name: 'Rand Sul-Africano', symbol: 'R' },
  { code: 'EGP', name: 'Libra Egípcia', symbol: 'E£' },
  { code: 'NGN', name: 'Naira Nigeriana', symbol: '₦' },
  { code: 'KES', name: 'Xelim Queniano', symbol: 'KSh' },
];

/**
 * Formatos de data disponíveis
 */
export const availableDateFormats = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/AAAA (Brasileiro)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/AAAA (Americano)' },
];

/**
 * Idiomas disponíveis
 */
export const availableLanguages = [
  { code: 'pt-BR', name: 'Português (Brasil)', nativeName: 'Português' },
  { code: 'en-US', name: 'English (United States)', nativeName: 'English' },
  { code: 'es-ES', name: 'Español (España)', nativeName: 'Español' },
  { code: 'fr-FR', name: 'Français (France)', nativeName: 'Français' },
  { code: 'no-NO', name: 'Norsk (Norge)', nativeName: 'Norsk' },
  { code: 'de-DE', name: 'Deutsch (Deutschland)', nativeName: 'Deutsch' },
];
