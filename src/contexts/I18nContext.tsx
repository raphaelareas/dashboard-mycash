import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, LanguageCode, defaultLanguage } from '@/i18n';
import { detectUserLocale } from '@/utils/localeDetection';
import { detectCountryByIPWithFallback } from '@/services/ipLocationService';
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
    // Verificar se há mudança manual primeiro
    const hasManualChange = localStorage.getItem('language_manually_set') === 'true';
    const saved = localStorage.getItem('language') as LanguageCode;
    
    // Se foi mudança manual E o idioma salvo é válido, usar o salvo
    if (hasManualChange && saved && translations[saved]) {
      return saved;
    }
    
    // Caso contrário, usar fallback do navegador (será atualizado por IP depois)
    try {
      const detected = detectUserLocale();
      return (detected.language as LanguageCode) || defaultLanguage;
    } catch (error) {
      console.error('Erro ao detectar locale:', error);
      return defaultLanguage;
    }
  });

  // Detectar idioma por IP na inicialização (apenas uma vez, se não houver mudança manual)
  useEffect(() => {
    let isMounted = true;
    
    const detectLanguageByIP = async () => {
      // Verificar se há mudança manual - se sim, não detectar por IP
      const hasManualChange = localStorage.getItem('language_manually_set') === 'true';
      if (hasManualChange) {
        console.log('✅ Idioma já foi definido manualmente, mantendo escolha do usuário');
        return;
      }

      try {
        console.log('🌍 Detectando idioma por IP no I18nContext...');
        const country = await detectCountryByIPWithFallback();
        const locale = detectUserLocale(country);
        const detectedLang = (locale.language as LanguageCode) || defaultLanguage;
        
        if (!isMounted) return;
        
        console.log('✅ Idioma detectado por IP:', detectedLang, 'País:', country || 'não detectado');
        
        // Limpar localStorage se tiver valor diferente (pode ser de teste anterior)
        const saved = localStorage.getItem('language') as LanguageCode;
        if (saved && saved !== detectedLang) {
          console.log('🔄 Limpando idioma salvo antigo:', saved, '→ usando:', detectedLang);
          localStorage.removeItem('language');
          localStorage.removeItem('language_manually_set');
        }
        
        // Atualizar idioma se ainda não foi definido manualmente
        if (!localStorage.getItem('language_manually_set')) {
          setLanguageState(detectedLang);
          localStorage.setItem('language', detectedLang);
        }
      } catch (error) {
        if (!isMounted) return;
        console.warn('⚠️ Erro ao detectar idioma por IP, usando fallback do navegador:', error);
        // Usar fallback do navegador
        const locale = detectUserLocale();
        const fallbackLang = (locale.language as LanguageCode) || defaultLanguage;
        if (!localStorage.getItem('language_manually_set')) {
          // Limpar localStorage se tiver valor diferente
          const saved = localStorage.getItem('language') as LanguageCode;
          if (saved && saved !== fallbackLang) {
            console.log('🔄 Limpando idioma salvo antigo:', saved, '→ usando fallback:', fallbackLang);
            localStorage.removeItem('language');
            localStorage.removeItem('language_manually_set');
          }
          setLanguageState(fallbackLang);
          localStorage.setItem('language', fallbackLang);
        }
      }
    };

    detectLanguageByIP();
    
    return () => {
      isMounted = false;
    };
  }, []); // Executar apenas uma vez na montagem

  // Carregar idioma do perfil do usuário quando disponível (após login)
  useEffect(() => {
    const loadUserLanguage = async () => {
      if (!user?.id) {
        // Se não há usuário, não fazer nada (já foi detectado por IP na inicialização)
        return;
      }

      try {
        const profile = await userService.getProfile(user.id);
        
        // Verificar se foi mudança manual no localStorage (escolha recente do usuário)
        const hasManualLanguageChange = localStorage.getItem('language_manually_set') === 'true';
        const savedLanguage = localStorage.getItem('language') as LanguageCode;
        
        // Prioridade 1: Idioma escolhido manualmente no localStorage (escolha recente)
        if (hasManualLanguageChange && savedLanguage && translations[savedLanguage]) {
          console.log('✅ Usando idioma escolhido manualmente:', savedLanguage);
          setLanguageState(savedLanguage);
          localStorage.setItem('language', savedLanguage);
          
          // Atualizar perfil do usuário para manter sincronizado
          if (profile?.language !== savedLanguage) {
            try {
              await userService.updateProfile(user.id, {
                language: savedLanguage,
              });
            } catch (updateError) {
              console.error('Erro ao atualizar idioma no perfil:', updateError);
            }
          }
        }
        // Prioridade 2: Idioma do perfil do usuário (salvo no banco)
        else if (profile?.language && translations[profile.language as LanguageCode]) {
          console.log('✅ Usando idioma do perfil do usuário:', profile.language);
          setLanguageState(profile.language as LanguageCode);
          localStorage.setItem('language', profile.language);
          // Não marcar como manual se veio do perfil
        }
        // Prioridade 3: Manter o idioma atual (já detectado por IP)
        else {
          console.log('✅ Mantendo idioma atual detectado por IP');
        }
      } catch (error) {
        console.error('Erro ao carregar idioma do perfil:', error);
        // Em caso de erro, manter o idioma atual
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
