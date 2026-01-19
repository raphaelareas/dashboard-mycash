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
    // Tentar carregar do localStorage primeiro
    const saved = localStorage.getItem('language') as LanguageCode;
    if (saved && translations[saved]) {
      return saved;
    }
    // Detectar do navegador
    try {
      const detected = detectUserLocale();
      const detectedLang = (detected.language as LanguageCode) || defaultLanguage;
      // Salvar no localStorage para manter consistência
      localStorage.setItem('language', detectedLang);
      return detectedLang;
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
        // Sempre detectar o idioma do navegador primeiro
        const detected = detectUserLocale();
        const detectedLang = (detected.language as LanguageCode) || defaultLanguage;
        
        const profile = await userService.getProfile(user.id);
        
        // Se o perfil tem idioma salvo E é diferente do detectado, verificar se foi mudança manual
        // Se o navegador está em português e o perfil tem outro idioma, pode ser que o usuário mudou manualmente
        // Mas na primeira vez (quando não há preferência salva), sempre usar o detectado
        const hasManualLanguageChange = localStorage.getItem('language_manually_set') === 'true';
        
        if (profile?.language && translations[profile.language as LanguageCode] && hasManualLanguageChange) {
          // Se o usuário mudou manualmente nas configurações, respeitar a escolha
          setLanguageState(profile.language as LanguageCode);
          localStorage.setItem('language', profile.language);
        } else {
          // Caso contrário, usar o idioma detectado do navegador
          setLanguageState(detectedLang);
          localStorage.setItem('language', detectedLang);
          // Atualizar no perfil do usuário para manter sincronizado
          if (!profile?.language || profile.language !== detectedLang) {
            try {
              await userService.updateProfile(user.id, {
                language: detectedLang,
              });
            } catch (updateError) {
              console.error('Erro ao atualizar idioma no perfil:', updateError);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar idioma do perfil:', error);
        // Em caso de erro, detectar do navegador
        const detected = detectUserLocale();
        const detectedLang = (detected.language as LanguageCode) || defaultLanguage;
        setLanguageState(detectedLang);
        localStorage.setItem('language', detectedLang);
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
