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
import { defaultCategoryColors } from '@/utils/categoryColors';

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
  const {
    updateTransaction,
    bankAccounts,
    creditCards,
    familyMembers,
    categories: customCategories,
    transactions,
  } = useFinance();
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
  const [category, setCategory] = useState<TransactionCategory | string | ''>('');
  const [customCategory, setCustomCategory] = useState('');
  const [memberId, setMemberId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState('');
  // Toggle para escolher entre Total ou Parcela
  const [isInstallment, setIsInstallment] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState<string>('1');
  const [installmentNumber, setInstallmentNumber] = useState<string>('1');
  const [installmentRecurrence, setInstallmentRecurrence] = useState<'weekly' | 'biweekly' | 'monthly' | 'semiannual' | 'yearly' | 'fixed'>('monthly');
  const [transactionDate, setTransactionDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isCreateMethodModalOpen, setIsCreateMethodModalOpen] = useState(false);
  const [createMethodTab, setCreateMethodTab] = useState<'account' | 'card'>('account');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<Transaction> | null>(null);
  const [isSavingScope, setIsSavingScope] = useState(false);

  // Carregar dados da transação quando modal abrir
  useEffect(() => {
    if (isOpen && transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      // Exibir o valor original da transação formatado corretamente
      // Ex: 170 -> "170,00"
      const formattedAmount = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(transaction.amount);
      setAmountDisplay(formattedAmount);
      setDescription(transaction.description);
      setCategory(transaction.category as TransactionCategory | string);
      setMemberId(transaction.memberId || null);
      setAccountId(transaction.accountId || '');
      const installments = transaction.installments || 1;
      const installmentNum = transaction.installmentNumber || 1;
      setIsInstallment(installments > 1);
      setTotalInstallments(installments.toString());
      setInstallmentNumber(installmentNum.toString());
      // Recorrência padrão mensal, pode ser ajustado se houver campo no banco
      setInstallmentRecurrence('monthly');
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
      setIsInstallment(false);
      setTotalInstallments('1');
      setInstallmentNumber('1');
      setInstallmentRecurrence('monthly');
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
      newErrors.category = t('modals.newTransaction.categoryError') || 'Selecione uma categoria';
    }

    if (category === 'other' && !customCategory.trim()) {
      newErrors.customCategory = t('modals.newTransaction.customCategoryError') || 'Informe o nome da categoria';
    }

    if (isInstallment) {
      const totalNum = parseInt(totalInstallments);
      const currentNum = parseInt(installmentNumber);
      
      if (!totalInstallments || isNaN(totalNum) || totalNum < 1 || totalNum > 360) {
        newErrors.installments = t('modals.newTransaction.installmentsError') || 'Total de parcelas deve ser entre 1 e 360';
      }
      
      if (!installmentNumber || isNaN(currentNum) || currentNum < 1 || currentNum > 360) {
        newErrors.installmentNumber = t('modals.newTransaction.installmentNumberError') || 'Parcela atual deve ser entre 1 e 360';
      }
    }

    if (!accountId) {
      newErrors.accountId = t('modals.newTransaction.accountError') || 'Selecione uma conta ou cartão';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updates: Partial<Transaction> = {
      type,
      category: category as TransactionCategory | string,
      amount: numericAmount,
      description: category === 'other' && customCategory ? `${customCategory}: ${description}` : description,
      date: new Date(transactionDate),
      accountId,
      memberId,
      installments: isInstallment ? parseInt(totalInstallments) : 1,
      installmentNumber: isInstallment ? parseInt(installmentNumber) : undefined,
      isRecurring: false,
    };

    const hasInstallmentSeries = (transaction.installments || 1) > 1 && isInstallment;

    // Se for uma compra parcelada, perguntar o escopo da atualização
    if (hasInstallmentSeries) {
      setPendingUpdates(updates);
      setIsScopeModalOpen(true);
      return;
    }

    try {
      await updateTransaction(transaction.id, updates);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      setErrors({ submit: 'Erro ao atualizar transação. Tente novamente.' });
    }
  };

  const handleConfirmScope = async (scope: 'single' | 'all' | 'fromCurrent') => {
    if (!transaction || !pendingUpdates) return;

    setIsSavingScope(true);

    try {
      if (scope === 'single') {
        await updateTransaction(transaction.id, pendingUpdates);
      } else {
        const baseInstallments = transaction.installments || 1;
        const baseInstallmentNumber = transaction.installmentNumber || 1;

        // Encontrar todas as parcelas relacionadas a esta compra
        const seriesTransactions = transactions.filter((t) => {
          if ((t.installments || 1) !== baseInstallments) return false;

          const sameType = t.type === transaction.type;
          const sameDescription = t.description === transaction.description;
          const sameAccount = t.accountId === transaction.accountId;
          const sameMember = (t.memberId || null) === (transaction.memberId || null);
          const sameCategory = t.category === transaction.category;

          return sameType && sameDescription && sameAccount && sameMember && sameCategory;
        });

        const transactionsToUpdate =
          scope === 'all'
            ? seriesTransactions
            : seriesTransactions.filter(
                (t) => (t.installmentNumber || 1) >= baseInstallmentNumber
              );

        for (const tItem of transactionsToUpdate) {
          await updateTransaction(tItem.id, pendingUpdates);
        }
      }

      setIsScopeModalOpen(false);
      setPendingUpdates(null);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar parcelas da transação:', error);
      setErrors({ submit: 'Erro ao atualizar parcelas da transação. Tente novamente.' });
    } finally {
      setIsSavingScope(false);
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
            <h2 className="text-xl font-bold text-gray-900">{t('modals.newTransaction.editTitle') || 'Edição de transação'}</h2>
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

        {/* Description and Date (same line) */}
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        {/* Amount and Installment Toggle (same line) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('modals.newTransaction.amount')}
          </label>
          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium">R$</span>
            <input
              type="text"
              value={amountDisplay}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0,00"
              className={`
                flex-1 h-14 px-4 rounded-[40px] border
                ${errors.amount ? 'border-red-500' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-primary
              `}
            />
            {/* Toggle Total/Parcela */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-[40px]">
              <button
                type="button"
                onClick={() => setIsInstallment(false)}
                className={`
                  px-4 py-2 rounded-[40px] font-medium transition-all text-sm
                  ${!isInstallment ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}
                `}
              >
                {t('modals.newTransaction.total') || 'Total'}
              </button>
              <button
                type="button"
                onClick={() => setIsInstallment(true)}
                className={`
                  px-4 py-2 rounded-[40px] font-medium transition-all text-sm
                  ${isInstallment ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}
                `}
              >
                {t('modals.newTransaction.installment') || 'Parcela'}
              </button>
            </div>
          </div>
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          
          {/* Campos de Parcelas (aparecem quando Parcela está selecionado) */}
          {isInstallment && (
            <div className="mt-4 space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('modals.newTransaction.currentInstallment') || 'Parcela Atual'}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={installmentNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setInstallmentNumber(value);
                      if (errors.installmentNumber) {
                        setErrors({ ...errors, installmentNumber: '' });
                      }
                    }}
                    onBlur={(e) => {
                      const numValue = parseInt(e.target.value);
                      if (e.target.value === '' || isNaN(numValue) || numValue < 1) {
                        setInstallmentNumber('1');
                      } else if (numValue > 360) {
                        setInstallmentNumber('360');
                      }
                    }}
                    className="w-full h-14 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Ex: 7"
                  />
                  {errors.installmentNumber && <p className="mt-1 text-sm text-red-600">{errors.installmentNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('modals.newTransaction.totalInstallments') || 'Total de Parcelas'}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={totalInstallments}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setTotalInstallments(value);
                      if (errors.installments) {
                        setErrors({ ...errors, installments: '' });
                      }
                    }}
                    onBlur={(e) => {
                      const numValue = parseInt(e.target.value);
                      if (e.target.value === '' || isNaN(numValue) || numValue < 1) {
                        setTotalInstallments('1');
                      } else if (numValue > 360) {
                        setTotalInstallments('360');
                        const currentNum = parseInt(installmentNumber);
                        if (!isNaN(currentNum) && currentNum > 360) {
                          setInstallmentNumber('360');
                        }
                      }
                    }}
                    className="w-full h-14 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Ex: 48"
                  />
                  {errors.installments && <p className="mt-1 text-sm text-red-600">{errors.installments}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('modals.newTransaction.recurrence') || 'Recorrência'}
                </label>
                <select
                  value={installmentRecurrence}
                  onChange={(e) => setInstallmentRecurrence(e.target.value as 'weekly' | 'biweekly' | 'monthly' | 'semiannual' | 'yearly' | 'fixed')}
                  className="w-full h-14 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="weekly">{t('modals.newTransaction.weekly') || 'Semanal'}</option>
                  <option value="biweekly">{t('modals.newTransaction.biweekly') || 'Quinzenal'}</option>
                  <option value="monthly">{t('modals.newTransaction.monthly') || 'Mensal'}</option>
                  <option value="semiannual">{t('modals.newTransaction.semiannual') || 'Semestral'}</option>
                  <option value="yearly">{t('modals.newTransaction.yearly') || 'Anual'}</option>
                  <option value="fixed">{t('modals.newTransaction.fixed') || 'Fixa'}</option>
                </select>
              </div>
            </div>
          )}
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
                onChange={(value) => setCategory(value)}
                placeholder={t('modals.newTransaction.selectCategory') || 'Selecione uma categoria'}
                className={errors.category ? 'border-red-500' : ''}
                error={!!errors.category}
                options={[
                  // Categorias padrão
                  ...defaultCategories.map((cat) => ({
                    value: cat,
                    label: categoryNames[cat] || cat,
                    color: defaultCategoryColors[cat] || '#6B7280',
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
              <option value="">{t('common.select') || 'Selecione'}</option>
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
              {t('modals.createMethod.title') || 'Criar novo método'}
            </button>
          </div>
          {errors.accountId && <p className="mt-1 text-sm text-red-600">{errors.accountId}</p>}
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

      {/* Modal de escopo de atualização de parcelas */}
      <Modal isOpen={isScopeModalOpen} onClose={() => !isSavingScope && setIsScopeModalOpen(false)}>
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('modals.editInstallments.title') ||
                'Como você quer aplicar estas alterações?'}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {t('modals.editInstallments.description') ||
                'Esta despesa faz parte de uma compra parcelada. Escolha como deseja aplicar as alterações.'}
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              disabled={isSavingScope}
              onClick={() => handleConfirmScope('single')}
              className="w-full px-4 py-3 rounded-[40px] border border-gray-200 hover:bg-gray-50 text-left transition-colors"
            >
              <span className="block font-medium text-gray-900">
                {t('modals.editInstallments.onlyThis') || 'Somente esta parcela'}
              </span>
              <span className="block text-sm text-gray-600">
                {t('modals.editInstallments.onlyThisHint') ||
                  'Altera apenas este mês, mantendo as outras parcelas como estão.'}
              </span>
            </button>

            <button
              type="button"
              disabled={isSavingScope}
              onClick={() => handleConfirmScope('all')}
              className="w-full px-4 py-3 rounded-[40px] border border-gray-200 hover:bg-gray-50 text-left transition-colors"
            >
              <span className="block font-medium text-gray-900">
                {t('modals.editInstallments.all') ||
                  'Todas as parcelas (incluindo anteriores e futuras)'}
              </span>
              <span className="block text-sm text-gray-600">
                {t('modals.editInstallments.allHint') ||
                  'Altera esta e todas as outras parcelas desta compra.'}
              </span>
            </button>

            <button
              type="button"
              disabled={isSavingScope}
              onClick={() => handleConfirmScope('fromCurrent')}
              className="w-full px-4 py-3 rounded-[40px] border border-gray-200 hover:bg-gray-50 text-left transition-colors"
            >
              <span className="block font-medium text-gray-900">
                {t('modals.editInstallments.fromCurrent') ||
                  'Somente desta parcela em diante'}
              </span>
              <span className="block text-sm text-gray-600">
                {t('modals.editInstallments.fromCurrentHint') ||
                  'Altera este mês e todas as parcelas futuras, mantendo as anteriores como estão.'}
              </span>
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isSavingScope}
              onClick={() => setIsScopeModalOpen(false)}
              className="px-4 py-2 rounded-[40px] border border-gray-200 hover:bg-gray-50 text-sm transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
}
