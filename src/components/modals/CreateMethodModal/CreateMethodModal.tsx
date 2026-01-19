import { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { Modal } from '@/components/ui/Modal';
import { BankAccountType } from '@/types';
import { formatCurrencyInput } from '@/utils/currency.utils';
import { getRandomColor } from '@/utils/colorUtils';

interface CreateMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'account' | 'card';
  onAccountCreated?: (accountId: string) => void;
  onCardCreated?: (cardId: string) => void;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Cores disponíveis - mesma lista dos modais originais
const accountColors = [
  { color: '#991B1B', name: 'Vermelho Muito Escuro' },
  { color: '#B91C1C', name: 'Vermelho Mais Escuro' },
  { color: '#DC2626', name: 'Vermelho Escuro' },
  { color: '#EF4444', name: 'Vermelho' },
  { color: '#5B21B6', name: 'Roxo Muito Escuro' },
  { color: '#6D28D9', name: 'Roxo Mais Escuro' },
  { color: '#7C3AED', name: 'Roxo Escuro' },
  { color: '#8B5CF6', name: 'Roxo' },
  { color: '#1E40AF', name: 'Azul Muito Escuro' },
  { color: '#1D4ED8', name: 'Azul Mais Escuro' },
  { color: '#2563EB', name: 'Azul Escuro' },
  { color: '#3B82F6', name: 'Azul' },
  { color: '#065F46', name: 'Verde Esmeralda Muito Escuro' },
  { color: '#047857', name: 'Verde Esmeralda Mais Escuro' },
  { color: '#059669', name: 'Verde Esmeralda Escuro' },
  { color: '#10B981', name: 'Verde Esmeralda' },
  { color: '#9F1239', name: 'Rosa Muito Escuro' },
  { color: '#BE185D', name: 'Rosa Mais Escuro' },
  { color: '#DB2777', name: 'Rosa Escuro' },
  { color: '#EC4899', name: 'Rosa' },
  { color: '#92400E', name: 'Laranja Muito Escuro' },
  { color: '#B45309', name: 'Laranja Mais Escuro' },
  { color: '#D97706', name: 'Laranja Escuro' },
  { color: '#F59E0B', name: 'Laranja' },
  { color: '#4D7C0F', name: 'Verde Limão Muito Escuro' },
  { color: '#65A30D', name: 'Verde Limão Mais Escuro' },
  { color: '#84CC16', name: 'Verde Limão Escuro' },
  { color: '#A3E635', name: 'Verde Limão' },
  { color: '#3730A3', name: 'Índigo Muito Escuro' },
  { color: '#4338CA', name: 'Índigo Mais Escuro' },
  { color: '#4F46E5', name: 'Índigo Escuro' },
  { color: '#6366F1', name: 'Índigo' },
  { color: '#0F766E', name: 'Teal Muito Escuro' },
  { color: '#0D9488', name: 'Teal Escuro' },
  { color: '#0891B2', name: 'Ciano Escuro' },
  { color: '#06B6D4', name: 'Ciano' },
  { color: '#000000', name: 'Preto' },
  { color: '#111827', name: 'Cinza Muito Escuro' },
  { color: '#1F2937', name: 'Cinza Escuro' },
  { color: '#374151', name: 'Cinza' },
  { color: '#FFFFFF', name: 'Branco' },
  { color: '#F9FAFB', name: 'Cinza Muito Claro' },
  { color: '#F3F4F6', name: 'Cinza Claro' },
  { color: '#E5E7EB', name: 'Cinza' },
];

const cardColors = accountColors; // Mesmas cores

export function CreateMethodModal({ 
  isOpen, 
  onClose, 
  initialTab = 'account',
  onAccountCreated,
  onCardCreated 
}: CreateMethodModalProps) {
  const { familyMembers, refreshAccounts } = useFinance();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'account' | 'card'>(initialTab);

  // Estados para Conta
  const [accountName, setAccountName] = useState('');
  const [accountHolderId, setAccountHolderId] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [accountBalanceDisplay, setAccountBalanceDisplay] = useState('');
  const [accountType, setAccountType] = useState<BankAccountType>('checking');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [agency, setAgency] = useState('');
  const [accountColor, setAccountColor] = useState<string>(() => getRandomColor());
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({});

  // Estados para Cartão
  const [cardName, setCardName] = useState('');
  const [cardHolderId, setCardHolderId] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [limit, setLimit] = useState('');
  const [limitDisplay, setLimitDisplay] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [cardTheme, setCardTheme] = useState<string>(() => getRandomColor());
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    } else {
      // Resetar todos os campos ao fechar
      setAccountName('');
      setAccountHolderId('');
      setAccountBalance('');
      setAccountBalanceDisplay('');
      setAccountType('checking');
      setBankName('');
      setAccountNumber('');
      setAgency('');
      setAccountColor(getRandomColor());
      setAccountErrors({});
      
      setCardName('');
      setCardHolderId('');
      setClosingDay('');
      setDueDay('');
      setLimit('');
      setLimitDisplay('');
      setLastFourDigits('');
      setCardTheme(getRandomColor());
      setCardErrors({});
    }
  }, [isOpen, initialTab]);

  const handleAccountBalanceChange = (value: string) => {
    const { display, numeric } = formatCurrencyInput(value);
    setAccountBalanceDisplay(display);
    setAccountBalance(numeric.toString());
  };

  const handleCardLimitChange = (value: string) => {
    const { display, numeric } = formatCurrencyInput(value);
    setLimitDisplay(display);
    setLimit(numeric.toString());
  };

  const handleAccountSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!accountName || accountName.length < 3) {
      newErrors.name = t('modals.addAccount.nameError') || 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!accountHolderId) {
      newErrors.holderId = t('modals.addAccount.selectHolder') || 'Selecione um titular';
    }

    if (accountBalance === '' || isNaN(parseFloat(accountBalance)) || parseFloat(accountBalance) < 0) {
      newErrors.balance = t('modals.addAccount.balanceError') || 'Saldo inicial inválido';
    }

    if (!bankName || bankName.length < 2) {
      newErrors.bankName = t('modals.addAccount.bankError') || 'Nome do banco obrigatório';
    }

    if (Object.keys(newErrors).length > 0) {
      setAccountErrors(newErrors);
      return;
    }

    try {
      // Usar accountService diretamente para passar holderId
      const { accountService } = await import('@/services/accountService');
      const newAccount = await accountService.createBankAccount({
        name: accountName,
        bankName,
        accountNumber: accountNumber || Math.random().toString().slice(2, 10),
        agency: agency || undefined,
        type: accountType,
        balance: parseFloat(accountBalance),
        currency: 'BRL',
        color: accountColor,
        isActive: true,
      }, accountHolderId);

      // Recarregar contas e cartões no contexto
      await refreshAccounts();

      // Chamar callback com o ID da conta criada
      if (onAccountCreated) {
        await onAccountCreated(newAccount.id);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      setAccountErrors({ submit: 'Erro ao criar conta. Tente novamente.' });
    }
  };

  const handleCardSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!cardName || cardName.length < 3) {
      newErrors.name = t('modals.addCard.nameError') || 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!cardHolderId) {
      newErrors.holderId = t('modals.addCard.holderError') || 'Selecione um titular';
    }

    const closing = parseInt(closingDay);
    const due = parseInt(dueDay);
    const limitValue = parseFloat(limit);

    if (!closingDay || closing < 1 || closing > 31) {
      newErrors.closingDay = t('modals.addCard.closingDayError') || 'Dia de fechamento inválido (1-31)';
    }

    if (!dueDay || due < 1 || due > 31) {
      newErrors.dueDay = t('modals.addCard.dueDayError') || 'Dia de vencimento inválido (1-31)';
    }

    if (!limit || limitValue <= 0) {
      newErrors.limit = t('modals.addCard.limitError') || 'Limite obrigatório';
    }

    if (Object.keys(newErrors).length > 0) {
      setCardErrors(newErrors);
      return;
    }

    try {
      // Usar accountService diretamente para passar holderId
      const { accountService } = await import('@/services/accountService');
      const newCard = await accountService.createCreditCard({
        name: cardName,
        type: 'credit',
        brand: 'other',
        lastFourDigits: lastFourDigits || '0000',
        expirationMonth: 12,
        expirationYear: new Date().getFullYear() + 1,
        dueDay: parseInt(dueDay),
        limit: parseFloat(limit),
        currentBalance: 0,
        color: cardTheme,
        isActive: true,
      }, cardHolderId);

      // Recarregar contas e cartões no contexto
      await refreshAccounts();

      // Chamar callback com o ID do cartão criado
      if (onCardCreated) {
        await onCardCreated(newCard.id);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
      setCardErrors({ submit: 'Erro ao criar cartão. Tente novamente.' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-[16px]">
        <h2 className="text-xl font-bold text-gray-900">{t('modals.createMethod.title') || 'Criar novo método'}</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
          <CloseIcon />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-[40px] mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-2 px-4 rounded-[40px] font-medium transition-colors ${
              activeTab === 'account'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('modals.createMethod.accountTab') || 'Conta'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-2 px-4 rounded-[40px] font-medium transition-colors ${
              activeTab === 'card'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('modals.createMethod.cardTab') || 'Cartão'}
          </button>
        </div>

        {/* Conteúdo da Tab Conta */}
        {activeTab === 'account' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('modals.addAccount.name')}
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder={t('modals.addAccount.namePlaceholder')}
                className={`
                  w-full h-12 px-4 rounded-[40px] border
                  ${accountErrors.name ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
              />
              {accountErrors.name && <p className="mt-1 text-sm text-red-600">{accountErrors.name}</p>}
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('modals.addAccount.bank')}
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder={t('modals.addAccount.bankPlaceholder')}
                className={`
                  w-full h-12 px-4 rounded-[40px] border
                  ${accountErrors.bankName ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
              />
              {accountErrors.bankName && <p className="mt-1 text-sm text-red-600">{accountErrors.bankName}</p>}
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('modals.addAccount.accountType')}
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as BankAccountType)}
                className="w-full h-12 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ paddingRight: '24px' }}
              >
                <option value="checking">{t('modals.addAccount.checking')}</option>
                <option value="savings">{t('modals.addAccount.savings')}</option>
              </select>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('modals.addAccount.accountNumber')}
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={t('modals.addAccount.accountNumberPlaceholder')}
                className="w-full h-12 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Agency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('modals.addAccount.agency')}
              </label>
              <input
                type="text"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                placeholder={t('modals.addAccount.agencyPlaceholder')}
                className="w-full h-12 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Holder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('modals.addAccount.holder')}
              </label>
              <select
                value={accountHolderId}
                onChange={(e) => setAccountHolderId(e.target.value)}
                className={`
                  w-full h-12 px-4 rounded-[40px] border
                  ${accountErrors.holderId ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
              >
                <option value="">{t('modals.addAccount.selectHolder')}</option>
                {familyMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              {accountErrors.holderId && <p className="mt-1 text-sm text-red-600">{accountErrors.holderId}</p>}
            </div>

            {/* Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('modals.addAccount.balance')}
              </label>
              <input
                type="text"
                value={accountBalanceDisplay}
                onChange={(e) => handleAccountBalanceChange(e.target.value)}
                placeholder={t('modals.addAccount.balancePlaceholder')}
                className={`
                  w-full h-12 px-4 rounded-[40px] border
                  ${accountErrors.balance ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
              />
              {accountErrors.balance && <p className="mt-1 text-sm text-red-600">{accountErrors.balance}</p>}
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('modals.addAccount.color')}
              </label>
              <div className="flex flex-wrap gap-2">
                {accountColors.map((colorOption) => (
                  <button
                    key={colorOption.color}
                    onClick={() => setAccountColor(colorOption.color)}
                    type="button"
                    className={`
                      w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 flex-shrink-0
                      ${accountColor === colorOption.color ? 'border-black' : 'border-gray-200'}
                    `}
                    style={{ backgroundColor: colorOption.color }}
                    title={colorOption.name}
                  />
                ))}
              </div>
            </div>

            {/* Botão Submit */}
            <button
              type="button"
              onClick={handleAccountSubmit}
              className="w-full h-14 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold mt-4"
            >
              {t('modals.addAccount.create') || 'Criar conta'}
            </button>
          </div>
        )}

        {/* Conteúdo da Tab Cartão */}
        {activeTab === 'card' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('modals.addCard.name')}
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder={t('modals.addCard.namePlaceholder')}
                className={`
                  w-full h-12 px-4 rounded-[40px] border
                  ${cardErrors.name ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
              />
              {cardErrors.name && <p className="mt-1 text-sm text-red-600">{cardErrors.name}</p>}
            </div>

            {/* Holder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('modals.addCard.holder')}
              </label>
              <select
                value={cardHolderId}
                onChange={(e) => setCardHolderId(e.target.value)}
                className={`
                  w-full h-12 px-4 rounded-[40px] border
                  ${cardErrors.holderId ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
              >
                <option value="">{t('modals.addCard.selectHolder')}</option>
                {familyMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              {cardErrors.holderId && <p className="mt-1 text-sm text-red-600">{cardErrors.holderId}</p>}
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('modals.addCard.theme')}
              </label>
              <div className="flex flex-wrap gap-2">
                {cardColors.map((colorOption) => (
                  <button
                    key={colorOption.color}
                    onClick={() => setCardTheme(colorOption.color)}
                    type="button"
                    className={`
                      w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 flex-shrink-0
                      ${cardTheme === colorOption.color ? 'border-black' : 'border-gray-200'}
                    `}
                    style={{ backgroundColor: colorOption.color }}
                    title={colorOption.name}
                  />
                ))}
              </div>
            </div>

            {/* Card fields grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Closing Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('modals.addCard.closingDay')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={closingDay}
                  onChange={(e) => setClosingDay(e.target.value)}
                  placeholder="15"
                  className={`
                    w-full h-12 px-4 rounded-[40px] border
                    ${cardErrors.closingDay ? 'border-red-500' : 'border-gray-200'}
                    focus:outline-none focus:ring-2 focus:ring-primary
                  `}
                />
                {cardErrors.closingDay && <p className="mt-1 text-sm text-red-600">{cardErrors.closingDay}</p>}
              </div>

              {/* Due Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('modals.addCard.dueDay')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  placeholder="20"
                  className={`
                    w-full h-12 px-4 rounded-[40px] border
                    ${cardErrors.dueDay ? 'border-red-500' : 'border-gray-200'}
                    focus:outline-none focus:ring-2 focus:ring-primary
                  `}
                />
                {cardErrors.dueDay && <p className="mt-1 text-sm text-red-600">{cardErrors.dueDay}</p>}
              </div>
            </div>

            {/* Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('modals.addCard.limit')}
              </label>
              <input
                type="text"
                value={limitDisplay}
                onChange={(e) => handleCardLimitChange(e.target.value)}
                placeholder={t('modals.addCard.limitPlaceholder')}
                className={`
                  w-full h-12 px-4 rounded-[40px] border
                  ${cardErrors.limit ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
              />
              {cardErrors.limit && <p className="mt-1 text-sm text-red-600">{cardErrors.limit}</p>}
            </div>

            {/* Last Four Digits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('modals.addCard.lastFourDigits')}
              </label>
              <input
                type="text"
                maxLength={4}
                value={lastFourDigits}
                onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="0000"
                className="w-full h-12 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Botão Submit */}
            <button
              type="button"
              onClick={handleCardSubmit}
              className="w-full h-14 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold mt-4"
            >
              {t('modals.addCard.create') || 'Criar cartão'}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
