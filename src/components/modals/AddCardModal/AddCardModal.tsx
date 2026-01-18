import { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Modal } from '@/components/ui/Modal';
import { BankAccountType } from '@/types';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export function AddCardModal({ isOpen, onClose }: AddCardModalProps) {
  const { addBankAccount, addCreditCard, familyMembers } = useFinance();
  const [type, setType] = useState<'account' | 'card'>('account');
  const [name, setName] = useState('');
  const [holderId, setHolderId] = useState('');
  const [balance, setBalance] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [limit, setLimit] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [theme, setTheme] = useState<'black' | 'lime' | 'white'>('black');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setType('account');
      setName('');
      setHolderId('');
      setBalance('');
      setClosingDay('');
      setDueDay('');
      setLimit('');
      setLastFourDigits('');
      setTheme('black');
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!name || name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!holderId) {
      newErrors.holderId = 'Selecione um titular';
    }

    if (type === 'account') {
      if (!balance || parseFloat(balance) <= 0) {
        newErrors.balance = 'Saldo inicial obrigatório';
      }
    } else {
      const closing = parseInt(closingDay);
      const due = parseInt(dueDay);
      const limitValue = parseFloat(limit);

      if (!closingDay || closing < 1 || closing > 31) {
        newErrors.closingDay = 'Dia de fechamento deve ser entre 1 e 31';
      }

      if (!dueDay || due < 1 || due > 31) {
        newErrors.dueDay = 'Dia de vencimento deve ser entre 1 e 31';
      }

      if (!limit || limitValue <= 0) {
        newErrors.limit = 'Limite deve ser maior que zero';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (type === 'account') {
      addBankAccount({
        name,
        bankName: name.split(' ')[0] || 'Banco',
        accountNumber: Math.random().toString().slice(2, 10),
        type: 'checking' as BankAccountType,
        balance: parseFloat(balance),
        currency: 'BRL',
        isActive: true,
      });
    } else {
      addCreditCard({
        name,
        type: 'credit',
        brand: 'other',
        lastFourDigits: lastFourDigits || '0000',
        expirationMonth: 12,
        expirationYear: new Date().getFullYear() + 1,
        dueDay: parseInt(dueDay),
        limit: parseFloat(limit),
        currentBalance: 0,
        isActive: true,
      });
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Adicionar Conta/Cartão</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
          <CloseIcon />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Type Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setType('account')}
            className={`
              flex-1 py-3 px-4 rounded-lg font-semibold transition-all
              ${type === 'account' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}
            `}
          >
            Conta Bancária
          </button>
          <button
            onClick={() => setType('card')}
            className={`
              flex-1 py-3 px-4 rounded-lg font-semibold transition-all
              ${type === 'card' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}
            `}
          >
            Cartão de Crédito
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {type === 'account' ? 'Nome da Conta' : 'Nome do Cartão'}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === 'account' ? 'Ex: Nubank Conta' : 'Ex: Nubank Mastercard'}
            className={`
              w-full h-12 px-4 rounded-lg border
              ${errors.name ? 'border-red-500' : 'border-gray-200'}
              focus:outline-none focus:ring-2 focus:ring-primary
            `}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Holder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titular
          </label>
          <select
            value={holderId}
            onChange={(e) => setHolderId(e.target.value)}
            className={`
              w-full h-12 px-4 rounded-lg border
              ${errors.holderId ? 'border-red-500' : 'border-gray-200'}
              focus:outline-none focus:ring-2 focus:ring-primary
            `}
          >
            <option value="">Selecione um titular</option>
            {familyMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          {errors.holderId && <p className="mt-1 text-sm text-red-600">{errors.holderId}</p>}
        </div>

        {/* Account fields */}
        {type === 'account' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Saldo Inicial
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">R$</span>
              <input
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className={`
                  w-full h-12 pl-12 pr-4 rounded-lg border
                  ${errors.balance ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
              />
            </div>
            {errors.balance && <p className="mt-1 text-sm text-red-600">{errors.balance}</p>}
          </div>
        )}

        {/* Card fields */}
        {type === 'card' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dia de Fechamento
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={closingDay}
                  onChange={(e) => setClosingDay(e.target.value)}
                  placeholder="1 a 31"
                  className={`
                    w-full h-12 px-4 rounded-lg border
                    ${errors.closingDay ? 'border-red-500' : 'border-gray-200'}
                    focus:outline-none focus:ring-2 focus:ring-primary
                  `}
                />
                {errors.closingDay && <p className="mt-1 text-sm text-red-600">{errors.closingDay}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dia de Vencimento
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  placeholder="1 a 31"
                  className={`
                    w-full h-12 px-4 rounded-lg border
                    ${errors.dueDay ? 'border-red-500' : 'border-gray-200'}
                    focus:outline-none focus:ring-2 focus:ring-primary
                  `}
                />
                {errors.dueDay && <p className="mt-1 text-sm text-red-600">{errors.dueDay}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limite Total
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className={`
                    w-full h-12 pl-12 pr-4 rounded-lg border
                    ${errors.limit ? 'border-red-500' : 'border-gray-200'}
                    focus:outline-none focus:ring-2 focus:ring-primary
                  `}
                />
              </div>
              {errors.limit && <p className="mt-1 text-sm text-red-600">{errors.limit}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Últimos 4 Dígitos (opcional)
              </label>
              <input
                type="text"
                maxLength={4}
                value={lastFourDigits}
                onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, ''))}
                placeholder="1234"
                className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tema Visual
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['black', 'lime', 'white'] as const).map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => setTheme(themeOption)}
                    className={`
                      h-16 rounded-lg border-2 transition-all
                      ${theme === themeOption ? 'border-blue-500' : 'border-gray-200'}
                      ${themeOption === 'black' ? 'bg-gray-900' : ''}
                      ${themeOption === 'lime' ? 'bg-lime-500' : ''}
                      ${themeOption === 'white' ? 'bg-white' : ''}
                    `}
                  >
                    <span className={`
                      text-sm font-semibold
                      ${themeOption === 'black' || themeOption === 'lime' ? 'text-white' : 'text-gray-900'}
                    `}>
                      {themeOption === 'black' ? 'Black' : themeOption === 'lime' ? 'Lime' : 'White'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold"
        >
          Adicionar
        </button>
      </div>
    </Modal>
  );
}
