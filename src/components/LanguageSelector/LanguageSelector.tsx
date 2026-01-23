import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { availableLanguages } from '@/utils/localeDetection';
import type { LanguageCode } from '@/i18n';

// Mapeamento de códigos de idioma para bandeiras e nomes nativos
const languageFlags: Record<LanguageCode, string> = {
  'pt-BR': '🇧🇷',
  'en-US': '🇺🇸',
  'es-ES': '🇪🇸',
  'fr-FR': '🇫🇷',
  'no-NO': '🇳🇴',
  'de-DE': '🇩🇪',
};

const languageNativeNames: Record<LanguageCode, string> = {
  'pt-BR': 'Português',
  'en-US': 'English',
  'es-ES': 'Español',
  'fr-FR': 'Français',
  'no-NO': 'Norsk',
  'de-DE': 'Deutsch',
};

const languageCodes: Record<LanguageCode, string> = {
  'pt-BR': 'BR',
  'en-US': 'EN',
  'es-ES': 'ES',
  'fr-FR': 'FR',
  'no-NO': 'NO',
  'de-DE': 'DE',
};

interface LanguageSelectorProps {
  onLanguageDetected?: (language: LanguageCode) => void;
}

export function LanguageSelector({ onLanguageDetected }: LanguageSelectorProps) {
  const { language, setLanguage } = useI18n();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // O idioma já é detectado pelo I18nContext, não precisamos fazer detecção aqui
  // Apenas usar o idioma do contexto

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = async (lang: LanguageCode) => {
    // Salvar idioma no localStorage
    localStorage.setItem('language', lang);
    localStorage.setItem('language_manually_set', 'true');
    
    // Atualizar contexto
    setLanguage(lang);
    setIsOpen(false);
    onLanguageDetected?.(lang);
    
    // Se usuário está logado, salvar no banco de dados também
    if (user?.id) {
      try {
        console.log('💾 Salvando idioma no perfil do usuário:', lang);
        await userService.updateProfile(user.id, {
          language: lang,
        });
        console.log('✅ Idioma salvo no banco de dados com sucesso');
      } catch (error) {
        console.error('❌ Erro ao salvar idioma no banco:', error);
        // Não bloquear o fluxo se falhar ao salvar no banco
      }
    }
    
    // Recarregar página para aplicar o idioma em todo o fluxo
    // Pequeno delay para garantir que o localStorage foi salvo
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Sempre usar o idioma do contexto (já detectado por IP no I18nContext)
  const currentLanguage = language || 'pt-BR';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-[40px] border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
      >
        <span className="text-lg">{languageFlags[currentLanguage]}</span>
        <span>{languageCodes[currentLanguage]} - {languageNativeNames[currentLanguage]}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          {availableLanguages.map((lang) => {
            const langCode = lang.code as LanguageCode;
            const isSelected = currentLanguage === langCode;
            
            return (
              <button
                key={langCode}
                type="button"
                onClick={() => handleLanguageChange(langCode)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-gray-100 font-semibold' : ''
                }`}
              >
                <span className="text-xl">{languageFlags[langCode]}</span>
                <span className="flex-1 text-sm text-gray-700">
                  {languageCodes[langCode]} - {languageNativeNames[langCode]}
                </span>
                {isSelected && (
                  <svg
                    className="w-5 h-5 text-gray-900"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
