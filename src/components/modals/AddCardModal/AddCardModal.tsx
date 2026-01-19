import { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { Modal } from '@/components/ui/Modal';
import { formatCurrencyInput } from '@/utils/currency.utils';

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
  const { addCreditCard, familyMembers } = useFinance();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [holderId, setHolderId] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [limit, setLimit] = useState('');
  const [limitDisplay, setLimitDisplay] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [theme, setTheme] = useState<string>('#111827'); // gray-900 como padrão
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cores disponíveis para o tema do cartão - sequência horizontal com 4 tons de cada cor (escuro → claro)
  const cardColors = [
    // Vermelho - 4 tons (escuro → claro)
    { color: '#991B1B', name: 'Vermelho Muito Escuro' }, // red-800
    { color: '#B91C1C', name: 'Vermelho Mais Escuro' }, // red-700
    { color: '#DC2626', name: 'Vermelho Escuro' }, // red-600
    { color: '#EF4444', name: 'Vermelho' }, // red-500
    
    // Roxo/Violeta - 4 tons (escuro → claro)
    { color: '#5B21B6', name: 'Roxo Muito Escuro' }, // violet-800
    { color: '#6D28D9', name: 'Roxo Mais Escuro' }, // violet-700
    { color: '#7C3AED', name: 'Roxo Escuro' }, // violet-600
    { color: '#8B5CF6', name: 'Roxo' }, // violet-500
    
    // Azul - 4 tons (escuro → claro)
    { color: '#1E40AF', name: 'Azul Muito Escuro' }, // blue-800
    { color: '#1D4ED8', name: 'Azul Mais Escuro' }, // blue-700
    { color: '#2563EB', name: 'Azul Escuro' }, // blue-600
    { color: '#3B82F6', name: 'Azul' }, // blue-500
    
    // Verde Esmeralda - 4 tons (escuro → claro)
    { color: '#065F46', name: 'Verde Esmeralda Muito Escuro' }, // emerald-800
    { color: '#047857', name: 'Verde Esmeralda Mais Escuro' }, // emerald-700
    { color: '#059669', name: 'Verde Esmeralda Escuro' }, // emerald-600
    { color: '#10B981', name: 'Verde Esmeralda' }, // emerald-500
    
    // Rosa/Pink - 4 tons (escuro → claro)
    { color: '#9F1239', name: 'Rosa Muito Escuro' }, // pink-800
    { color: '#BE185D', name: 'Rosa Mais Escuro' }, // pink-700
    { color: '#DB2777', name: 'Rosa Escuro' }, // pink-600
    { color: '#EC4899', name: 'Rosa' }, // pink-500
    
    // Laranja/Âmbar - 4 tons (escuro → claro)
    { color: '#92400E', name: 'Laranja Muito Escuro' }, // amber-800
    { color: '#B45309', name: 'Laranja Mais Escuro' }, // amber-700
    { color: '#D97706', name: 'Laranja Escuro' }, // amber-600
    { color: '#F59E0B', name: 'Laranja' }, // amber-500
    
    // Verde Limão - 4 tons (escuro → claro)
    { color: '#4D7C0F', name: 'Verde Limão Muito Escuro' }, // lime-700
    { color: '#65A30D', name: 'Verde Limão Mais Escuro' }, // lime-600
    { color: '#84CC16', name: 'Verde Limão Escuro' }, // lime-500
    { color: '#A3E635', name: 'Verde Limão' }, // lime-400
    
    // Índigo - 4 tons (escuro → claro)
    { color: '#3730A3', name: 'Índigo Muito Escuro' }, // indigo-800
    { color: '#4338CA', name: 'Índigo Mais Escuro' }, // indigo-700
    { color: '#4F46E5', name: 'Índigo Escuro' }, // indigo-600
    { color: '#6366F1', name: 'Índigo' }, // indigo-500
    
    // Ciano/Teal - 4 tons (escuro → claro)
    { color: '#0F766E', name: 'Teal Muito Escuro' }, // teal-700
    { color: '#0D9488', name: 'Teal Escuro' }, // teal-600
    { color: '#0891B2', name: 'Ciano Escuro' }, // cyan-600
    { color: '#06B6D4', name: 'Ciano' }, // cyan-500
    
    // Cinzas/Pretos - 4 tons (escuro → claro)
    { color: '#000000', name: 'Preto' },
    { color: '#111827', name: 'Cinza Muito Escuro' }, // gray-900
    { color: '#1F2937', name: 'Cinza Escuro' }, // gray-800
    { color: '#374151', name: 'Cinza' }, // gray-700
    
    // Brancos/Cinzas Claros - 4 tons
    { color: '#FFFFFF', name: 'Branco' },
    { color: '#F9FAFB', name: 'Cinza Muito Claro' }, // gray-50
    { color: '#F3F4F6', name: 'Cinza Claro' }, // gray-100
    { color: '#E5E7EB', name: 'Cinza' }, // gray-200
  ];

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setHolderId('');
      setClosingDay('');
      setDueDay('');
      setLimit('');
      setLimitDisplay('');
      setLastFourDigits('');
      setTheme('#111827');
      setErrors({});
    }
  }, [isOpen]);

  const handleLimitChange = (value: string) => {
    const { display, numeric } = formatCurrencyInput(value);
    setLimitDisplay(display);
    setLimit(numeric.toString());
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!name || name.length < 3) {
      newErrors.name = t('modals.addCard.nameError');
    }

    if (!holderId) {
      newErrors.holderId = t('modals.addCard.holderError');
    }

    const closing = parseInt(closingDay);
    const due = parseInt(dueDay);
    const limitValue = parseFloat(limit);

    if (!closingDay || closing < 1 || closing > 31) {
      newErrors.closingDay = t('modals.addCard.closingDayError');
    }

    if (!dueDay || due < 1 || due > 31) {
      newErrors.dueDay = t('modals.addCard.dueDayError');
    }

    if (!limit || limitValue <= 0) {
      newErrors.limit = t('modals.addCard.limitError');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-[16px]">
        <h2 className="text-xl font-bold text-gray-900">{t('modals.addCard.title')}</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
          <CloseIcon />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('modals.addCard.name')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('modals.addCard.namePlaceholder')}
            className={`
              w-full h-12 px-4 rounded-[40px] border
              ${errors.name ? 'border-red-500' : 'border-gray-200'}
              focus:outline-none focus:ring-2 focus:ring-primary
            `}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Holder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('modals.addCard.holder')}
          </label>
          <select
            value={holderId}
            onChange={(e) => setHolderId(e.target.value)}
            className={`
              w-full h-12 px-4 rounded-[40px] border
              ${errors.holderId ? 'border-red-500' : 'border-gray-200'}
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
          {errors.holderId && <p className="mt-1 text-sm text-red-600">{errors.holderId}</p>}
        </div>

        {/* Campo de cor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('modals.addCard.theme')}
          </label>
          <div className="flex flex-wrap gap-2">
            {cardColors.map((colorOption) => (
              <button
                key={colorOption.color}
                onClick={() => setTheme(colorOption.color)}
                type="button"
                className={`
                  w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 flex-shrink-0
                  ${theme === colorOption.color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
                `}
                style={{ backgroundColor: colorOption.color }}
                title={colorOption.name}
                aria-label={colorOption.name}
              />
            ))}
          </div>
        </div>

        {/* Card fields */}
        <div className="grid grid-cols-2 gap-4">
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
              placeholder="1 a 31"
              className={`
                w-full h-12 px-4 rounded-[40px] border
                ${errors.closingDay ? 'border-red-500' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-primary
              `}
            />
            {errors.closingDay && <p className="mt-1 text-sm text-red-600">{errors.closingDay}</p>}
          </div>

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
              placeholder="1 a 31"
              className={`
                w-full h-12 px-4 rounded-[40px] border
                ${errors.dueDay ? 'border-red-500' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-primary
              `}
            />
            {errors.dueDay && <p className="mt-1 text-sm text-red-600">{errors.dueDay}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('modals.addCard.limit')}
          </label>
          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium">R$</span>
            <input
              type="text"
              inputMode="numeric"
              value={limitDisplay}
              onChange={(e) => handleLimitChange(e.target.value)}
              className={`
                flex-1 h-12 px-4 rounded-[40px] border
                ${errors.limit ? 'border-red-500' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-primary
              `}
              placeholder="0,00"
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
            className="w-full h-12 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 rounded-b-[16px]">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-[40px] border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold"
        >
          {t('modals.addCard.save')}
        </button>
      </div>
    </Modal>
  );
}
