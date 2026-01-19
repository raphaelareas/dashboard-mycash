import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';
import esES from './locales/es-ES.json';
import frFR from './locales/fr-FR.json';
import noNO from './locales/no-NO.json';
import deDE from './locales/de-DE.json';

export type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'no-NO' | 'de-DE';

export const translations: Record<LanguageCode, any> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
  'fr-FR': frFR,
  'no-NO': noNO,
  'de-DE': deDE,
};

export const defaultLanguage: LanguageCode = 'pt-BR';
