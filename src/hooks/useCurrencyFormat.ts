import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { userService } from '@/services/userService';
import { useState, useEffect } from 'react';

// Mapeamento de código de idioma para locale do Intl
const languageToLocale: Record<string, string> = {
  'pt-BR': 'pt-BR',
  'en-US': 'en-US',
  'es-ES': 'es-ES',
  'fr-FR': 'fr-FR',
  'no-NO': 'nb-NO', // Norueguês Bokmål
  'de-DE': 'de-DE',
};

/**
 * Hook para formatação de moeda baseada no perfil do usuário
 * Retorna funções de formatação que usam a moeda e locale do usuário
 */
export function useCurrencyFormat() {
  const { user } = useAuth();
  const { language } = useI18n();
  
  // Calcular moeda padrão baseada no idioma
  const getDefaultCurrency = (lang: string): string => {
    return lang === 'no-NO' ? 'NOK' : 
           lang === 'en-US' ? 'USD' :
           lang === 'es-ES' ? 'EUR' :
           lang === 'fr-FR' ? 'EUR' :
           lang === 'de-DE' ? 'EUR' : 'BRL';
  };
  
  // Inicializar com moeda baseada no idioma ou do localStorage
  const [userCurrency, setUserCurrency] = useState<string>(() => {
    const saved = localStorage.getItem('user_currency');
    if (saved) return saved;
    return getDefaultCurrency(language);
  });
  const [loading, setLoading] = useState(true);

  // Carregar moeda do perfil do usuário
  useEffect(() => {
    const loadUserCurrency = async () => {
      // Calcular moeda padrão baseada no idioma
      const getDefaultCurrency = () => {
        return language === 'no-NO' ? 'NOK' : 
               language === 'en-US' ? 'USD' :
               language === 'es-ES' ? 'EUR' :
               language === 'fr-FR' ? 'EUR' :
               language === 'de-DE' ? 'EUR' : 'BRL';
      };

      if (!user?.id) {
        // Se não há usuário, usar moeda padrão baseada no idioma
        const defaultCurrency = getDefaultCurrency();
        setUserCurrency(defaultCurrency);
        localStorage.setItem('user_currency', defaultCurrency);
        setLoading(false);
        return;
      }

      try {
        const profile = await userService.getProfile(user.id);
        if (profile?.currency) {
          setUserCurrency(profile.currency);
          localStorage.setItem('user_currency', profile.currency);
        } else {
          // Fallback para moeda baseada no idioma
          const defaultCurrency = getDefaultCurrency();
          setUserCurrency(defaultCurrency);
          localStorage.setItem('user_currency', defaultCurrency);
        }
      } catch (error) {
        console.error('Erro ao carregar moeda do usuário:', error);
        // Fallback para moeda baseada no idioma
        const defaultCurrency = getDefaultCurrency();
        setUserCurrency(defaultCurrency);
        localStorage.setItem('user_currency', defaultCurrency);
      } finally {
        setLoading(false);
      }
    };

    loadUserCurrency();
  }, [user?.id, language]);

  // Obter locale baseado no idioma
  const locale = useMemo(() => {
    return languageToLocale[language] || 'pt-BR';
  }, [language]);

  // Função de formatação de moeda
  const formatCurrency = useMemo(() => {
    return (value: number): string => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: userCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    };
  }, [locale, userCurrency]);

  // Função de formatação compacta para gráficos
  const formatCompactCurrency = useMemo(() => {
    return (value: number): string => {
      if (value >= 1000000) {
        return formatCurrency(value / 1000000) + 'M';
      }
      if (value >= 1000) {
        return formatCurrency(value / 1000) + 'k';
      }
      return formatCurrency(value);
    };
  }, [formatCurrency]);

  return {
    formatCurrency,
    formatCompactCurrency,
    currency: userCurrency,
    locale,
    loading,
  };
}
