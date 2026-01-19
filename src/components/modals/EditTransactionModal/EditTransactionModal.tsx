import { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { Modal } from '@/components/ui/Modal';
import { CreateCategoryModal } from '@/components/modals/CreateCategoryModal';
import { AddMemberModal } from '@/components/modals/AddMemberModal';
import { CreateMethodModal } from '@/components/modals/CreateMethodModal';
import { TransactionCategory, Transaction } from '@/types';
import { formatCurrencyInput } from '@/utils/currency.utils';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);


const ExpenseArrowIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20V4M6 14L12 20L18 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const defaultCategories: TransactionCategory[] = ['rent', 'food', 'shopping', 'household', 'transport', 'entertainment', 'health', 'education', 'other'];

export function EditTransactionModal({ isOpen, onClose, transaction }: EditTransactionModalProps) {
  const { updateTransaction, bankAccounts, creditCards, familyMembers, categories: customCategories } = useFinance();
  const { t } = useI18n();
  
  // Obter nomes de categorias via tradução
  const categoryNames: Record<string, string> = {
    rent: t('categories.categoryNames.rent'),
    food: t('categories.categoryNames.food'),
    shopping: t('categories.categoryNames.shopping'),
    household: t('categories.categoryNames.household'),
    transport: t('categories.categoryNames.transport'),
    entertainment: t('categories.categoryNames.entertainment'),
    health: t('categories.categoryNames.health'),
    education: t('categories.categoryNames.education'),
    other: t('categories.categoryNames.other'),
  };

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TransactionCategory | ''>('');
  const [customCategory, setCustomCategory] = useState('');
  const [memberId, setMemberId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState('');
  const [installments, setInstallments] = useState(1);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<'weekly' | 'biweekly' | 'monthly' | 'yearly'>('monthly');
  const [recurrenceCount, setRecurrenceCount] = useState(1);
  const [transactionDate, setTransactionDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isCreateMethodModalOpen, setIsCreateMethodModalOpen] = useState(false);
  const [createMethodTab, setCreateMethodTab] = useState<'account' | 'card'>('account');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isCreditCard = creditCards.some(c => c.id === accountId);

  // Carregar dados da transação quando modal abrir
  useEffect(() => {
    if (isOpen && transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setAmountDisplay(formatCurrencyInput(transaction.amount.toString()).display);
      setDescription(transaction.description);
      setCategory(transaction.category as TransactionCategory);
      setMemberId(transaction.memberId || null);
      setAccountId(transaction.accountId || '');
      setInstallments(transaction.installments || 1);
      setIsRecurring(transaction.isRecurring || false);
      setRecurrenceFrequency('monthly'); // Default, pode ser ajustado se houver campo
      setRecurrenceCount(1); // Default
      setTransactionDate(new Date(transaction.date).toISOString().split('T')[0]);
      setErrors({});
    }
  }, [isOpen, transaction]);

  useEffect(() => {
    if (!isOpen) {
      // Reset form
      const today = new Date();
      setType('expense');
      setAmount('');
      setAmountDisplay('');
      setDescription('');
      setCategory('');
      setCustomCategory('');
      setMemberId(null);
      setAccountId('');
      setInstallments(1);
      setIsRecurring(false);
      setRecurrenceFrequency('monthly');
      setRecurrenceCount(1);
      setTransactionDate(today.toISOString().split('T')[0]);
      setIsCreateCategoryModalOpen(false);
      setIsAddMemberModalOpen(false);
      setIsCreateMethodModalOpen(false);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (category !== 'other') {
      setCustomCategory('');
    }
  }, [category]);

  useEffect(() => {
    if (isRecurring) {
      setInstallments(1);
    }
  }, [isRecurring]);

  const handleAmountChange = (value: string) => {
    const { display, numeric } = formatCurrencyInput(value);
    setAmountDisplay(display);
    setAmount(numeric.toString());
  };

  const handleSubmit = async () => {
    if (!transaction) return;

    const newErrors: Record<string, string> = {};

    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      newErrors.amount = t('modals.newTransaction.amountError') || 'Valor deve ser maior que zero';
    }

    if (!description || description.length < 3) {
      newErrors.description = t('modals.newTransaction.descriptionError') || 'Descrição deve ter pelo menos 3 caracteres';
    }

    if (!category) {
      newErrors.category = 'Selecione uma categoria';
    }

    if (category === 'other' && !customCategory.trim()) {
      newErrors.customCategory = 'Informe o nome da categoria';
    }

    if (!accountId) {
      newErrors.accountId = 'Selecione uma conta ou cartão';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updateTransaction(transaction.id, {
        type,
        category: category as TransactionCategory,
        amount: numericAmount,
        description: category === 'other' && customCategory ? `${customCategory}: ${description}` : description,
        date: new Date(transactionDate),
        accountId,
        memberId,
        installments: isCreditCard && type === 'expense' ? installments : 1,
        isRecurring: type === 'expense' ? isRecurring : false,
      });
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      setErrors({ submit: 'Erro ao atualizar transação. Tente novamente.' });
    }
  };

  if (!transaction) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-[16px]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setType('expense')}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-colors
              ${type === 'expense' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400'}
            `}
          >
            <ExpenseArrowIcon color={type === 'expense' ? 'currentColor' : 'currentColor'} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('modals.newTransaction.title')}</h2>
            <p className="text-sm text-gray-600">
              {type === 'expense' ? t('modals.newTransaction.registerExpense') : t('modals.newTransaction.registerIncome')}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
          <CloseIcon />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Type Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-[40px]">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 px-4 rounded-[40px] font-medium transition-colors ${
              type === 'expense' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            {t('modals.newTransaction.expense')}
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 px-4 rounded-[40px] font-medium transition-colors ${
              type === 'income' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            {t('modals.newTransaction.income')}
          </button>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('modals.newTransaction.description')}
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Supermercado Semanal"
            className={`
              w-full h-14 px-4 rounded-[40px] border
              ${errors.description ? 'border-red-500' : 'border-gray-200'}
              focus:outline-none focus:ring-2 focus:ring-primary
            `}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('modals.newTransaction.category')}
          </label>
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative" style={{ width: '420px' }}>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className={`
                  w-full h-14 px-4 rounded-[40px] border min-w-0
                  ${errors.category ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
                style={{ paddingRight: category ? '48px' : '24px' }}
              >
                <option value="">{t('modals.newTransaction.selectCategory') || 'Selecione uma categoria'}</option>
                {defaultCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryNames[cat] || cat}
                  </option>
                ))}
                {customCategories
                  .filter(c => c.type === type)
                  .map((customCat) => (
                    <option key={customCat.id} value={customCat.name}>
                      {customCat.name}
                    </option>
                  ))}
              </select>
              {category && (() => {
                let categoryColor = '#3247FF';
                if (defaultCategories.includes(category as TransactionCategory)) {
                  categoryColor = '#3247FF';
                } else {
                  const selectedCategoryData = customCategories.find(c => 
                    c.name.toLowerCase() === category.toLowerCase() && c.type === type
                  );
                  if (selectedCategoryData) {
                    categoryColor = selectedCategoryData.color;
                  }
                }
                return (
                  <div
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex-shrink-0 pointer-events-none border border-gray-200"
                    style={{ backgroundColor: categoryColor }}
                    title={categoryColor}
                  />
                );
              })()}
            </div>
            <button
              type="button"
              onClick={() => setIsCreateCategoryModalOpen(true)}
              className="px-6 h-14 rounded-[40px] border hover:bg-gray-50 transition-colors font-medium text-gray-700 whitespace-nowrap flex-shrink-0"
              style={{ borderColor: '#1F2937', minWidth: '180px' }}
            >
              {t('modals.newTransaction.addCategory') || 'Adicionar categoria'}
            </button>
          </div>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          
          {category === 'other' && (
            <div className="mt-3 animate-fade-in">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder={t('modals.newTransaction.newCategoryName') || 'Nome da nova categoria'}
                className={`
                  w-full h-14 px-4 rounded-[40px] border
                  ${errors.customCategory ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
              />
              {errors.customCategory && <p className="mt-1 text-sm text-red-600">{errors.customCategory}</p>}
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('modals.newTransaction.amount')}
          </label>
          <input
            type="text"
            value={amountDisplay}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0,00"
            className={`
              w-full h-14 px-4 rounded-[40px] border
              ${errors.amount ? 'border-red-500' : 'border-gray-200'}
              focus:outline-none focus:ring-2 focus:ring-primary
            `}
          />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('modals.newTransaction.transactionDate')}
          </label>
          <input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full h-14 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Member */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('modals.newTransaction.member')} ({t('common.optional') || 'opcional'})
          </label>
          <div className="flex gap-3">
            <select
              value={memberId || ''}
              onChange={(e) => setMemberId(e.target.value || null)}
              className="flex-1 h-14 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ paddingRight: '24px' }}
            >
              <option value="">{t('modals.newTransaction.familyGeneral') || 'Família (Geral)'}</option>
              {familyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.role === 'owner' ? 'Owner' : member.role}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsAddMemberModalOpen(true)}
              className="px-6 h-14 rounded-[40px] border hover:bg-gray-50 transition-colors font-medium text-gray-700 whitespace-nowrap flex-shrink-0"
              style={{ borderColor: '#1F2937', minWidth: '180px' }}
            >
              {t('modals.newTransaction.addMember') || 'Adicionar membro'}
            </button>
          </div>
        </div>

        {/* Account/Card */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('modals.newTransaction.account')}
          </label>
          <div className="flex gap-3">
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className={`
                flex-1 h-14 px-4 rounded-[40px] border min-w-0
                ${errors.accountId ? 'border-red-500' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-primary
              `}
              style={{ paddingRight: '24px', width: '420px' }}
            >
              <option value="">Selecione</option>
              {bankAccounts.filter(a => a.isActive).map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
              {creditCards.filter(c => c.isActive).map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setIsCreateMethodModalOpen(true);
                setCreateMethodTab('account');
              }}
              className="px-6 h-14 rounded-[40px] border hover:bg-gray-50 transition-colors font-medium text-gray-700 whitespace-nowrap flex-shrink-0"
              style={{ borderColor: '#1F2937', minWidth: '180px' }}
            >
              Criar novo método
            </button>
          </div>
          {errors.accountId && <p className="mt-1 text-sm text-red-600">{errors.accountId}</p>}
        </div>

        {/* Installments */}
        {isCreditCard && type === 'expense' && (
          <div className="animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('modals.newTransaction.installments') || 'Quantidade de Parcelas'}
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="12"
                value={installments}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  const clampedValue = Math.max(1, Math.min(12, value));
                  setInstallments(clampedValue);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setInstallments(prev => Math.min(12, prev + 1));
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setInstallments(prev => Math.max(1, prev - 1));
                  }
                }}
                disabled={isRecurring}
                className="w-full h-14 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setInstallments(prev => Math.min(12, prev + 1))}
                  disabled={isRecurring || installments >= 12}
                  className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 3V9M3 6H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setInstallments(prev => Math.max(1, prev - 1))}
                  disabled={isRecurring || installments <= 1}
                  className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
            {isRecurring && (
              <p className="mt-1 text-sm italic text-gray-500">
                {t('modals.newTransaction.installmentsDisabledForRecurring') || 'Parcelamento desabilitado para despesas recorrentes'}
              </p>
            )}
          </div>
        )}

        {/* Recurring */}
        {type === 'expense' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                disabled={installments > 1}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="recurring" className="font-semibold text-gray-900 block">
                  {t('modals.newTransaction.recurringExpense') || 'Despesa Recorrente'}
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  {installments > 1
                    ? (t('modals.newTransaction.notAvailableForInstallments') || 'Não disponível para compras parceladas')
                    : (t('modals.newTransaction.willRepeatAutomatically') || 'Esta despesa será repetida automaticamente')
                  }
                </p>
                {isRecurring && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('modals.newTransaction.frequency')}
                      </label>
                      <select
                        value={recurrenceFrequency}
                        onChange={(e) => setRecurrenceFrequency(e.target.value as any)}
                        className="w-full h-12 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="weekly">{t('modals.newTransaction.weekly')}</option>
                        <option value="biweekly">{t('modals.newTransaction.biweekly')}</option>
                        <option value="monthly">{t('modals.newTransaction.monthly')}</option>
                        <option value="yearly">{t('modals.newTransaction.yearly')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('modals.newTransaction.timesCount')}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          value={recurrenceCount}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            setRecurrenceCount(Math.max(1, value));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setRecurrenceCount(prev => prev + 1);
                            } else if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setRecurrenceCount(prev => Math.max(1, prev - 1));
                            }
                          }}
                          className="w-full h-12 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => setRecurrenceCount(prev => prev + 1)}
                            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 3V9M3 6H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecurrenceCount(prev => Math.max(1, prev - 1))}
                            disabled={recurrenceCount <= 1}
                            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 rounded-b-[16px]">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-[40px] border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {t('modals.newTransaction.cancel') || 'Cancelar'}
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold"
        >
          {t('modals.newTransaction.saveTransaction') || 'Salvar Alterações'}
        </button>
      </div>

      {/* Modals */}
      <CreateCategoryModal
        isOpen={isCreateCategoryModalOpen}
        onClose={() => setIsCreateCategoryModalOpen(false)}
        onSave={(categoryName, _color) => {
          setCategory('other');
          setCustomCategory(categoryName);
          setIsCreateCategoryModalOpen(false);
        }}
      />
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
      />
      <CreateMethodModal
        isOpen={isCreateMethodModalOpen}
        onClose={() => setIsCreateMethodModalOpen(false)}
        initialTab={createMethodTab}
        onAccountCreated={(accountId) => {
          setAccountId(accountId);
        }}
        onCardCreated={(cardId) => {
          setAccountId(cardId);
        }}
      />
    </Modal>
  );
}
