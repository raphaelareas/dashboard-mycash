import { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { Modal } from '@/components/ui/Modal';
import { CustomSelect } from '@/components/ui/CustomSelect';
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
            <div className="flex-1" style={{ width: '420px' }}>
              <CustomSelect
                value={category}
                onChange={(value) => setCategory(value as TransactionCategory)}
                placeholder={t('modals.newTransaction.selectCategory') || 'Selecione uma categoria'}
                className={errors.category ? 'border-red-500' : ''}
                error={!!errors.category}
                options={[
                  // Categorias padrão
                  ...defaultCategories.map((cat) => ({
                    value: cat,
                    label: categoryNames[cat] || cat,
                    color: '#3247FF', // Cor padrão para categorias padrão
                  })),
                  // Categorias customizadas
                  ...customCategories
                    .filter(c => c.type === type)
                    .map((customCat) => ({
                      value: customCat.name,
                      label: customCat.name,
                      color: customCat.color,
                    })),
                ]}
              />
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
            <div className="flex-1">
              <CustomSelect
                value={memberId || ''}
                onChange={(value) => setMemberId(value || null)}
                placeholder={t('modals.newTransaction.familyGeneral') || 'Família (Geral)'}
                options={[
                  { value: '', label: t('modals.newTransaction.familyGeneral') || 'Família (Geral)' },
                  ...familyMembers.map((member) => {
                    const roleDisplay = member.role === 'owner' ? 'Owner' : member.role;
                    return {
                      value: member.id,
                      label: `${member.name} - ${roleDisplay}`,
                      avatar: member.avatarUrl || undefined,
                    };
                  }),
                ]}
              />
            </div>
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
            <input
              type="text"
              value={installments}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value === '') {
                  setInstallments(1);
                } else {
                  const numValue = parseInt(value);
                  if (!isNaN(numValue) && numValue >= 1 && numValue <= 12) {
                    setInstallments(numValue);
                  }
                }
              }}
              onBlur={(e) => {
                if (e.target.value === '' || parseInt(e.target.value) < 1) {
                  setInstallments(1);
                } else {
                  const numValue = parseInt(e.target.value);
                  if (numValue > 12) {
                    setInstallments(12);
                  }
                }
              }}
              disabled={isRecurring}
              className="w-full h-14 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              placeholder="1"
              inputMode="numeric"
            />
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
                      <input
                        type="text"
                        value={recurrenceCount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value === '') {
                            setRecurrenceCount(1);
                          } else {
                            const numValue = parseInt(value);
                            if (!isNaN(numValue) && numValue >= 1) {
                              setRecurrenceCount(numValue);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '' || parseInt(e.target.value) < 1) {
                            setRecurrenceCount(1);
                          }
                        }}
                        className="w-full h-12 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ex: 12"
                        inputMode="numeric"
                      />
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
