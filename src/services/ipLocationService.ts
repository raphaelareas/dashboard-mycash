/**
 * Serviço para detectar localização do usuário baseado no IP
 * Usa API gratuita ipapi.co (sem autenticação necessária)
 */

export interface IPLocationData {
  countryCode: string | null;
  countryName: string | null;
}

/**
 * Detecta o país do usuário baseado no IP
 * Retorna o código do país (ex: 'BR', 'US', 'ES') ou null em caso de erro
 */
export async function detectCountryByIP(): Promise<string | null> {
  try {
    // Usar ipapi.co (gratuito, sem autenticação, 1000 req/dia)
    // Alternativa: ip-api.com/json (gratuito, 45 req/min)
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('⚠️ Erro ao detectar país por IP:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.error) {
      console.warn('⚠️ Erro na resposta da API de IP:', data.reason);
      return null;
    }

    const countryCode = data.country_code || data.country || null;
    
    if (countryCode) {
      console.log('🌍 País detectado por IP:', countryCode, data.country_name);
      return countryCode.toUpperCase();
    }

    return null;
  } catch (error) {
    // Em caso de erro (rede, CORS, etc), não bloquear o fluxo
    console.warn('⚠️ Erro ao detectar país por IP (continuando com fallback):', error);
    return null;
  }
}

/**
 * Versão alternativa usando ip-api.com (fallback)
 */
export async function detectCountryByIPFallback(): Promise<string | null> {
  try {
    const response = await fetch('https://ip-api.com/json/?fields=countryCode', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const countryCode = data.countryCode || null;
    
    if (countryCode) {
      console.log('🌍 País detectado por IP (fallback):', countryCode);
      return countryCode.toUpperCase();
    }

    return null;
  } catch (error) {
    console.warn('⚠️ Erro no fallback de detecção de IP:', error);
    return null;
  }
}

/**
 * Detecta país com retry automático usando fallback
 */
export async function detectCountryByIPWithFallback(): Promise<string | null> {
  // Tentar primeiro com ipapi.co
  const country = await detectCountryByIP();
  if (country) return country;

  // Se falhar, tentar com ip-api.com
  const fallbackCountry = await detectCountryByIPFallback();
  if (fallbackCountry) return fallbackCountry;

  // Se ambos falharem, retornar null (usar fallback do navegador)
  return null;
}
