import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, LanguageCode, defaultLanguage } from '@/i18n';
import { detectUserLocale } from '@/utils/localeDetection';
import { useAuth } from './AuthContext';
import { userService } from '@/services/userService';

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    // Tentar carregar do localStorage
    const saved = localStorage.getItem('language') as LanguageCode;
    if (saved && translations[saved]) {
      return saved;
    }
    // Detectar do navegador
    try {
      const detected = detectUserLocale();
      return (detected.language as LanguageCode) || defaultLanguage;
    } catch (error) {
      console.error('Erro ao detectar locale:', error);
      return defaultLanguage;
    }
  });

  // Carregar idioma do perfil do usuário quando disponível
  useEffect(() => {
    const loadUserLanguage = async () => {
      if (!user?.id) return;

      try {
        const profile = await userService.getProfile(user.id);
        if (profile?.language && translations[profile.language as LanguageCode]) {
          setLanguageState(profile.language as LanguageCode);
          localStorage.setItem('language', profile.language);
        }
      } catch (error) {
        console.error('Erro ao carregar idioma do perfil:', error);
      }
    };

    loadUserLanguage();
  }, [user?.id]);

  // Salvar no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
  };

  // Função de tradução com suporte a parâmetros
  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // Fallback para português se não encontrar
        value = translations[defaultLanguage];
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object') {
            value = value[fallbackKey];
          } else {
            return key; // Retorna a chave se não encontrar tradução
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Substituir parâmetros
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }

    return value;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
