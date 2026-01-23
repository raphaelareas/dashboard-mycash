import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { userService } from '@/services/userService';
import { format, parse } from 'date-fns';
import type { Locale } from 'date-fns';
import { enUS, ptBR, es, fr, de, nb } from 'date-fns/locale';

const languageToLocale: Record<string, Locale> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': es,
  'fr-FR': fr,
  'no-NO': nb,
  'de-DE': de,
};

export type DateFormatValue = 'DD/MM/YYYY' | 'MM/DD/YYYY';

/**
 * Hook para formato de data baseado nas preferências do usuário.
 * DD/MM/YYYY (brasileiro) ou MM/DD/YYYY (americano).
 */
export function useDateFormat() {
  const { user } = useAuth();
  const { language } = useI18n();
  const [dateFormat, setDateFormat] = useState<DateFormatValue>('DD/MM/YYYY');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const fromStorage = () => {
        const saved = localStorage.getItem('user_date_format') as DateFormatValue | null;
        return (saved === 'MM/DD/YYYY' ? 'MM/DD/YYYY' : 'DD/MM/YYYY') as DateFormatValue;
      };
      if (!user?.id) {
        setDateFormat(fromStorage());
        setLoading(false);
        return;
      }
      setDateFormat(fromStorage());
      try {
        const profile = await userService.getProfile(user.id);
        const fmt = (profile?.dateFormat === 'MM/DD/YYYY' ? 'MM/DD/YYYY' : 'DD/MM/YYYY') as DateFormatValue;
        setDateFormat(fmt);
        localStorage.setItem('user_date_format', fmt);
      } catch {
        setDateFormat(fromStorage());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const locale = useMemo(() => languageToLocale[language] ?? ptBR, [language]);

  /** Exibe data no formato do usuário (DD/MM/YYYY ou MM/DD/YYYY) */
  const formatForDisplay = useMemo(() => {
    return (date: Date): string => {
      return dateFormat === 'MM/DD/YYYY'
        ? format(date, 'MM/dd/yyyy')
        : format(date, 'dd/MM/yyyy');
    };
  }, [dateFormat]);

  /** Converte string no formato do usuário para Date */
  const parseFromDisplay = useMemo(() => {
    return (str: string): Date | null => {
      const trimmed = str.trim();
      if (!trimmed) return null;
      try {
        if (dateFormat === 'MM/DD/YYYY') {
          return parse(trimmed, 'MM/dd/yyyy', new Date());
        }
        return parse(trimmed, 'dd/MM/yyyy', new Date());
      } catch {
        return null;
      }
    };
  }, [dateFormat]);

  /** "Mon, Aug 17" para header do calendário */
  const formatHeaderShort = useMemo(() => {
    return (date: Date): string => format(date, 'EEE, MMM d', { locale });
  }, [locale]);

  /** "August 2025" para seletor de mês */
  const formatMonthYear = useMemo(() => {
    return (date: Date): string => format(date, 'MMMM yyyy', { locale });
  }, [locale]);

  /** YYYY-MM-DD para valor de input type="date" / armazenamento interno */
  const toISOYearMonthDay = (date: Date): string => format(date, 'yyyy-MM-dd');

  /** De YYYY-MM-DD para Date */
  const fromISOYearMonthDay = (str: string): Date => {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  return {
    dateFormat,
    loading,
    locale,
    formatForDisplay,
    parseFromDisplay,
    formatHeaderShort,
    formatMonthYear,
    toISOYearMonthDay,
    fromISOYearMonthDay,
  };
}
