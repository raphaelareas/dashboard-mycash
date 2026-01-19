import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { TransactionType } from '@/types';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryName: string, type: TransactionType, color?: string, accountId?: string | null) => void;
  initialName?: string;
  initialType?: TransactionType;
  initialColor?: string;
  initialAccountId?: string | null;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Cores disponíveis para categoria - mesma lista do AddCardModal
const categoryColors = [
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

export function CreateCategoryModal({ isOpen, onClose, onSave, initialName, initialType, initialColor, initialAccountId }: CreateCategoryModalProps) {
  const { bankAccounts, creditCards } = useFinance();
  const { t } = useI18n();
  const [categoryName, setCategoryName] = useState(initialName || '');
  const [categoryType, setCategoryType] = useState<TransactionType>(initialType || 'expense');
  const [selectedColor, setSelectedColor] = useState<string>(initialColor || '#111827'); // gray-900 como padrão
  const [connectToAccount, setConnectToAccount] = useState(!!initialAccountId);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(initialAccountId || '');
  const [error, setError] = useState('');

  // Atualizar quando initialName, initialType, initialColor ou initialAccountId mudarem (para edição)
  useEffect(() => {
    if (isOpen) {
      setCategoryName(initialName || '');
      setCategoryType(initialType || 'expense');
      setSelectedColor(initialColor || '#111827');
      setConnectToAccount(!!initialAccountId);
      setSelectedAccountId(initialAccountId || '');
      setError('');
    }
  }, [isOpen, initialName, initialType, initialColor, initialAccountId]);

  const handleSave = () => {
    if (!categoryName.trim()) {
      setError(t('modals.createCategory.nameError'));
      return;
    }

    if (categoryName.trim().length < 2) {
      setError(t('modals.createCategory.nameMinLengthError') || 'Nome da categoria deve ter pelo menos 2 caracteres');
      return;
    }

    onSave(
      categoryName.trim(),
      categoryType,
      selectedColor, 
      connectToAccount ? selectedAccountId || null : null
    );
    setCategoryName('');
    setSelectedColor('#111827');
    setConnectToAccount(false);
    setSelectedAccountId('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setCategoryName('');
    setSelectedColor('#111827');
    setConnectToAccount(false);
    setSelectedAccountId('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-[16px]">
        <h2 className="text-xl font-bold text-gray-900">{initialName ? t('modals.createCategory.editTitle') : t('modals.createCategory.title')}</h2>
        <button
          onClick={handleClose}
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Content - mesma estrutura do NewTransactionModal para ter mesma altura */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6" style={{ minHeight: 'calc(90vh - 200px)' }}>
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('modals.createCategory.name')}
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                setError('');
              }}
              placeholder={t('modals.createCategory.namePlaceholder')}
              className={`
                w-full h-14 px-4 rounded-[40px] border
                ${error ? 'border-red-500' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-primary
              `}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          {/* Tipo de Categoria (Despesa ou Entrada) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('modals.createCategory.type')}
            </label>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-[40px]">
              <button
                type="button"
                onClick={() => setCategoryType('expense')}
                className={`
                  flex-1 py-2 px-4 rounded-[40px] font-medium transition-colors
                  ${categoryType === 'expense' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}
                `}
              >
                {t('categories.expenses')}
              </button>
              <button
                type="button"
                onClick={() => setCategoryType('income')}
                className={`
                  flex-1 py-2 px-4 rounded-[40px] font-medium transition-colors
                  ${categoryType === 'income' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}
                `}
              >
                {t('categories.income')}
              </button>
            </div>
          </div>

          {/* Seletor de cores */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedColor }}
                title={selectedColor}
              />
              {t('modals.createCategory.color')}
            </label>
            <div className="flex flex-wrap gap-2">
              {categoryColors.map((colorOption) => (
                <button
                  key={colorOption.color}
                  onClick={() => setSelectedColor(colorOption.color)}
                  type="button"
                  className={`
                    w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 flex-shrink-0
                    ${selectedColor === colorOption.color ? 'border-black' : 'border-gray-200'}
                  `}
                  style={{ backgroundColor: colorOption.color }}
                  title={colorOption.name}
                  aria-label={colorOption.name}
                />
              ))}
            </div>
          </div>

          {/* Conectar categoria a uma conta ou cartão */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="connectAccount"
                checked={connectToAccount}
                onChange={(e) => {
                  setConnectToAccount(e.target.checked);
                  if (!e.target.checked) {
                    setSelectedAccountId('');
                  }
                }}
                className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary"
              />
              <label htmlFor="connectAccount" className="text-sm font-medium text-gray-700 cursor-pointer">
                {t('modals.createCategory.connectAccount')} (opcional)
              </label>
            </div>

            {connectToAccount && (
              <div className="animate-fade-in">
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full h-14 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ paddingRight: '24px' }}
                >
                  <option value="">{t('modals.createCategory.selectAccount')}</option>
                  <optgroup label={t('transactions.bankAccounts')}>
                    {bankAccounts.filter(a => a.isActive).map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={t('transactions.creditCards')}>
                    {creditCards.filter(c => c.isActive).map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-white rounded-b-[16px]">
        <button
          onClick={handleClose}
          className="px-6 py-3 rounded-[40px] border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold"
        >
          {t('modals.createCategory.save')}
        </button>
      </div>
    </Modal>
  );
}
