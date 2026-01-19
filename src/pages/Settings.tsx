import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { userService } from '@/services/userService';
import { availableCurrencies, availableDateFormats, availableLanguages, detectUserLocale } from '@/utils/localeDetection';
import { Modal } from '@/components/ui/Modal';
import { LanguageCode } from '@/i18n';

// Ícones SVG
const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_2064_1041)">
      <path d="M11.0068 2.57812L10.9998 18.0161C10.9998 18.2813 11.1052 18.5357 11.2927 18.7232C11.4803 18.9108 11.7346 19.0161 11.9998 19.0161C12.265 19.0161 12.5194 18.9108 12.7069 18.7232C12.8945 18.5357 12.9998 18.2813 12.9998 18.0161L13.0068 2.59512L15.9188 5.50812C16.1064 5.69559 16.3607 5.8009 16.6258 5.8009C16.891 5.8009 17.1453 5.69559 17.3328 5.50812C17.5203 5.32059 17.6256 5.06628 17.6256 4.80112C17.6256 4.53595 17.5203 4.28164 17.3328 4.09412L14.1218 0.879115C13.8432 0.600336 13.5124 0.379186 13.1483 0.228301C12.7842 0.0774169 12.394 -0.000244141 11.9998 -0.000244141C11.6057 -0.000244141 11.2154 0.0774169 10.8513 0.228301C10.4872 0.379186 10.1564 0.600336 9.87783 0.879115L6.66683 4.09112C6.47936 4.27864 6.37405 4.53295 6.37405 4.79812C6.37405 5.06328 6.47936 5.31759 6.66683 5.50512C6.85436 5.69259 7.10867 5.7979 7.37383 5.7979C7.639 5.7979 7.89331 5.69259 8.08083 5.50512L11.0068 2.57812Z" fill="currentColor"/>
      <path d="M22 16.9994V20.9994C22 21.2646 21.8946 21.5189 21.7071 21.7065C21.5196 21.894 21.2652 21.9994 21 21.9994H3C2.73478 21.9994 2.48043 21.894 2.29289 21.7065C2.10536 21.5189 2 21.2646 2 20.9994V16.9994C2 16.7342 1.89464 16.4798 1.70711 16.2923C1.51957 16.1047 1.26522 15.9994 1 15.9994C0.734784 15.9994 0.48043 16.1047 0.292893 16.2923C0.105357 16.4798 0 16.7342 0 16.9994V20.9994C0 21.795 0.31607 22.5581 0.87868 23.1207C1.44129 23.6833 2.20435 23.9994 3 23.9994H21C21.7956 23.9994 22.5587 23.6833 23.1213 23.1207C23.6839 22.5581 24 21.795 24 20.9994V16.9994C24 16.7342 23.8946 16.4798 23.7071 16.2923C23.5196 16.1047 23.2652 15.9994 23 15.9994C22.7348 15.9994 22.4804 16.1047 22.2929 16.2923C22.1054 16.4798 22 16.7342 22 16.9994Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0_2064_1041">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 4H17.9C17.6679 2.87141 17.0538 1.85735 16.1613 1.12872C15.2687 0.40009 14.1522 0.00145452 13 0H11C9.8478 0.00145452 8.73132 0.40009 7.83875 1.12872C6.94618 1.85735 6.3321 2.87141 6.1 4H3C2.73478 4 2.48043 4.10536 2.29289 4.29289C2.10536 4.48043 2 4.73478 2 5C2 5.26522 2.10536 5.51957 2.29289 5.70711C2.48043 5.89464 2.73478 6 3 6H4V19C4.00159 20.3256 4.52888 21.5964 5.46622 22.5338C6.40356 23.4711 7.6744 23.9984 9 24H15C16.3256 23.9984 17.5964 23.4711 18.5338 22.5338C19.4711 21.5964 19.9984 20.3256 20 19V6H21C21.2652 6 21.5196 5.89464 21.7071 5.70711C21.8946 5.51957 22 5.26522 22 5C22 4.73478 21.8946 4.48043 21.7071 4.29289C21.5196 4.10536 21.2652 4 21 4ZM11 2H13C13.6203 2.00076 14.2251 2.19338 14.7316 2.55144C15.2381 2.90951 15.6214 3.41549 15.829 4H8.171C8.37858 3.41549 8.7619 2.90951 9.26839 2.55144C9.77487 2.19338 10.3797 2.00076 11 2ZM18 19C18 19.7956 17.6839 20.5587 17.1213 21.1213C16.5587 21.6839 15.7956 22 15 22H9C8.20435 22 7.44129 21.6839 6.87868 21.1213C6.31607 20.5587 6 19.7956 6 19V6H18V19Z" fill="currentColor"/>
    <path d="M10.0001 17.9994C10.2653 17.9994 10.5197 17.894 10.7072 17.7065C10.8947 17.5189 11.0001 17.2646 11.0001 16.9994V10.9994C11.0001 10.7342 10.8947 10.4798 10.7072 10.2923C10.5197 10.1047 10.2653 9.99938 10.0001 9.99938C9.73487 9.99938 9.48051 10.1047 9.29298 10.2923C9.10544 10.4798 9.00008 10.7342 9.00008 10.9994V16.9994C9.00008 17.2646 9.10544 17.5189 9.29298 17.7065C9.48051 17.894 9.73487 17.9994 10.0001 17.9994Z" fill="currentColor"/>
    <path d="M13.9999 17.9994C14.2652 17.9994 14.5195 17.894 14.7071 17.7065C14.8946 17.5189 15 17.2646 15 16.9994V10.9994C15 10.7342 14.8946 10.4798 14.7071 10.2923C14.5195 10.1047 14.2652 9.99938 13.9999 9.99938C13.7347 9.99938 13.4804 10.1047 13.2928 10.2923C13.1053 10.4798 12.9999 10.7342 12.9999 10.9994V16.9994C12.9999 17.2646 13.1053 17.5189 13.2928 17.7065C13.4804 17.894 13.7347 17.9994 13.9999 17.9994Z" fill="currentColor"/>
  </svg>
);

export default function Settings() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const [currency, setCurrency] = useState<string>('BRL');
  const [dateFormat, setDateFormat] = useState<string>('DD/MM/YYYY');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estados das notificações
  const [notifications, setNotifications] = useState({
    billReminder: false,
    cardLimitAlert: false,
    monthlyEmail: false,
  });

  // Estados do resumo mensal por email
  const [emailSummary, setEmailSummary] = useState({
    email: '',
    dayOfMonth: 1,
  });

  // Estados do modal de limpar dados
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // Texto de confirmação baseado no idioma
  const getRequiredConfirmationText = (): string => {
    const confirmations: Record<LanguageCode, string> = {
      'pt-BR': 'Sim, quero limpar meus dados',
      'en-US': 'Yes, I want to clear my data',
      'es-ES': 'Sí, quiero eliminar mis datos',
      'fr-FR': 'Oui, je veux supprimer mes données',
      'no-NO': 'Ja, jeg vil slette mine data',
      'de-DE': 'Ja, ich möchte meine Daten löschen',
    };
    return confirmations[language] || confirmations['pt-BR'];
  };
  const requiredConfirmationText = getRequiredConfirmationText();

  // Carregar preferências do usuário
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const profile = await userService.getProfile(user.id);
        
        if (profile) {
          if (profile.currency) {
            setCurrency(profile.currency);
          } else {
            const detected = detectUserLocale();
            setCurrency(detected.currency);
          }

          if (profile.dateFormat) {
            setDateFormat(profile.dateFormat);
          } else {
            const detected = detectUserLocale();
            setDateFormat(detected.dateFormat);
          }

          // Sincronizar idioma do perfil com o contexto
          if (profile.language) {
            setLanguage(profile.language as LanguageCode);
          } else {
            const detected = detectUserLocale();
            setLanguage((detected.language as LanguageCode) || 'pt-BR');
          }
        } else {
          const detected = detectUserLocale();
          setCurrency(detected.currency);
          setDateFormat(detected.dateFormat);
          setLanguage((detected.language as LanguageCode) || 'pt-BR');
        }
      } catch (error) {
        console.error('Erro ao carregar preferências:', error);
        const detected = detectUserLocale();
        setCurrency(detected.currency);
        setDateFormat(detected.dateFormat);
        setLanguage((detected.language as LanguageCode) || 'pt-BR');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user?.id, setLanguage]);

  // Solicitar permissão de notificações
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      alert('As notificações foram bloqueadas. Por favor, permita notificações nas configurações do navegador.');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  // Handler para toggle de notificações
  const handleNotificationToggle = async (key: 'billReminder' | 'cardLimitAlert', value: boolean) => {
    if (value) {
      // Se está ativando, solicitar permissão
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        return; // Não atualiza o estado se não tiver permissão
      }
    }

    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handler para toggle de resumo mensal
  const handleMonthlyEmailToggle = async (value: boolean) => {
    if (value) {
      // Se está ativando, não precisa de permissão de notificação (é email)
      setNotifications((prev) => ({
        ...prev,
        monthlyEmail: true,
      }));
    } else {
      setNotifications((prev) => ({
        ...prev,
        monthlyEmail: false,
      }));
    }
  };

  // Handler para mudança de idioma
  const handleLanguageChange = async (newLanguage: LanguageCode) => {
    setLanguage(newLanguage);
    if (user?.id) {
      try {
        await userService.updateProfile(user.id, {
          language: newLanguage,
        });
      } catch (error) {
        console.error('Erro ao salvar idioma:', error);
      }
    }
  };

  // Salvar preferências
  const handleSavePreferences = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      await userService.updateProfile(user.id, {
        currency,
        dateFormat,
        language,
      });
      alert(t('common.success') + ': ' + t('settings.savePreferences'));
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      alert(t('common.error') + ': ' + t('settings.savePreferences'));
    } finally {
      setIsSaving(false);
    }
  };

  // Salvar configurações de email do resumo mensal
  const handleSaveEmailSummary = async () => {
    if (!emailSummary.email || !emailSummary.email.includes('@')) {
      alert('Por favor, insira um email válido.');
      return;
    }

    if (emailSummary.dayOfMonth < 1 || emailSummary.dayOfMonth > 28) {
      alert('Por favor, escolha um dia entre 1 e 28.');
      return;
    }

    // TODO: Salvar no backend quando implementar
    alert(`Resumo mensal configurado para o email ${emailSummary.email} no dia ${emailSummary.dayOfMonth} de cada mês.`);
  };

  return (
    <div className="w-full py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('settings.title')}</h1>

      <div className="space-y-6">
        {/* Preferências de Exibição */}
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t('settings.displayPreferences')}</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-900">{t('settings.darkMode')}</label>
              <div className="flex items-center gap-2 relative group">
                <span className="text-xs px-2 py-1 rounded bg-[#f4f4f4] text-gray-900">{t('settings.comingSoon')}</span>
                <div className="w-10 h-6 bg-gray-200 rounded-full opacity-50 cursor-not-allowed" />
                {/* Tooltip */}
                <div className="absolute right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                    {t('settings.comingSoon')}
                    <div className="absolute right-4 bottom-full -mb-1 border-4 border-transparent border-b-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.language')}</label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-200 rounded-[40px] focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.defaultCurrency')}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-200 rounded-[40px] focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {availableCurrencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.name} ({curr.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.dateFormat')}</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-200 rounded-[40px] focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {availableDateFormats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSavePreferences}
                disabled={isLoading || isSaving}
                className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? t('common.saving') : t('settings.savePreferences')}
              </button>
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t('settings.notifications')}</h3>
          
          <div className="space-y-4">
            {/* Lembrete de vencimento de contas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-gray-900">{t('settings.billReminder')}</label>
                <button
                  onClick={() => handleNotificationToggle('billReminder', !notifications.billReminder)}
                  className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${notifications.billReminder ? 'bg-[#3DCE8F]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications.billReminder ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Alerta de aproximação do limite de cartão */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-gray-900">{t('settings.cardLimitAlert')}</label>
                <button
                  onClick={() => handleNotificationToggle('cardLimitAlert', !notifications.cardLimitAlert)}
                  className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${notifications.cardLimitAlert ? 'bg-[#3DCE8F]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications.cardLimitAlert ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Resumo mensal por email */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-gray-900">{t('settings.monthlyEmail')}</label>
                <button
                  onClick={() => handleMonthlyEmailToggle(!notifications.monthlyEmail)}
                  className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${notifications.monthlyEmail ? 'bg-[#3DCE8F]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications.monthlyEmail ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
              
              {notifications.monthlyEmail && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.emailForSummary')}
                    </label>
                    <input
                      type="email"
                      value={emailSummary.email}
                      onChange={(e) => setEmailSummary((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-2 border border-gray-200 rounded-[40px] focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.dayOfMonth')}
                    </label>
                    <select
                      value={emailSummary.dayOfMonth}
                      onChange={(e) => setEmailSummary((prev) => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-[40px] focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          Dia {day}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleSaveEmailSummary}
                    className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold"
                  >
                    {t('settings.confirmConfiguration')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dados e Privacidade */}
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t('settings.dataAndPrivacy')}</h3>
          
          <div className="flex gap-4 items-start">
            <div className="flex flex-col items-center">
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-3 text-left rounded-[40px] border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-3"
              >
                <div className="text-red-600">
                  <TrashIcon />
                </div>
                <span>{t('settings.clearAllData')}</span>
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">{t('settings.irreversibleAction')}</p>
            </div>
            <button className="px-4 py-3 text-left rounded-[40px] border border-gray-200 hover:bg-gray-50 flex items-center gap-3">
              <ExportIcon />
              <span>{t('settings.exportAllData')}</span>
            </button>
          </div>
        </div>

        {/* Sobre */}
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t('settings.about')}</h3>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p>{t('settings.version')}: {t('settings.versionNumber')}</p>
            <p>{t('settings.description')}</p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="underline transition-colors hover:[color:#99B402]" style={{ color: '#080B12' }}>{t('settings.termsOfUse')}</a>
              <a href="#" className="underline transition-colors hover:[color:#99B402]" style={{ color: '#080B12' }}>{t('settings.privacyPolicy')}</a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação para Limpar Dados */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => {
        setIsDeleteModalOpen(false);
        setDeleteConfirmation('');
      }}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('deleteModal.title')}</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              {t('deleteModal.warning')}
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>{t('deleteModal.transactions')}</li>
              <li>{t('deleteModal.accounts')}</li>
              <li>{t('deleteModal.categories')}</li>
              <li>{t('deleteModal.familyMembers')}</li>
              <li>{t('deleteModal.profile')}</li>
            </ul>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('deleteModal.typeToConfirm', { text: requiredConfirmationText })}
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={requiredConfirmationText}
                className="w-full px-4 py-2 border border-gray-200 rounded-[40px] focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmation('');
                }}
                className="flex-1 px-6 py-3 rounded-[40px] border border-gray-200 hover:bg-gray-50 transition-colors font-semibold"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={async () => {
                  // TODO: Implementar lógica de deletar dados
                  alert(t('common.error') + ': Funcionalidade de limpar dados será implementada em breve.');
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmation('');
                }}
                disabled={deleteConfirmation !== requiredConfirmationText}
                className="flex-1 px-6 py-3 rounded-[40px] bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('deleteModal.deleteAllData')}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
