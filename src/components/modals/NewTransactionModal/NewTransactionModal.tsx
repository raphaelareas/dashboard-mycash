import { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { Modal } from '@/components/ui/Modal';
import { CreateCategoryModal } from '@/components/modals/CreateCategoryModal';
import { AddMemberModal } from '@/components/modals/AddMemberModal';
import { CreateMethodModal } from '@/components/modals/CreateMethodModal';
import { TransactionCategory } from '@/types';
import { formatCurrencyInput } from '@/utils/currency.utils';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IncomeArrowIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4V20M6 10L12 4L18 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ExpenseArrowIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20V4M6 14L12 20L18 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const categories: TransactionCategory[] = ['rent', 'food', 'shopping', 'household', 'transport', 'entertainment', 'health', 'education', 'other'];

export function NewTransactionModal({ isOpen, onClose }: NewTransactionModalProps) {
  const { addTransaction, bankAccounts, creditCards, familyMembers } = useFinance();
  const { t } = useI18n();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  
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
  const [amount, setAmount] = useState('');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TransactionCategory | ''>('');
  const [customCategory, setCustomCategory] = useState('');
  // Inicializar com owner se existir
  const getInitialMemberId = () => {
    const owner = familyMembers.find(m => m.role.toLowerCase() === 'owner');
    return owner?.id || null;
  };
  const [memberId, setMemberId] = useState<string | null>(getInitialMemberId());
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

  useEffect(() => {
    // Sempre atualizar memberId quando familyMembers mudar ou modal abrir
    const owner = familyMembers.find(m => m.role.toLowerCase() === 'owner');
    if (owner) {
      setMemberId(owner.id);
    }
  }, [familyMembers, isOpen]);

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
      // Resetar para owner por padrão
      const owner = familyMembers.find(m => m.role.toLowerCase() === 'owner');
      setMemberId(owner?.id || null);
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
  }, [isOpen, familyMembers]);

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

  // Função para formatar valor automaticamente conforme o usuário digita
  const handleAmountChange = (value: string) => {
    const { display, numeric } = formatCurrencyInput(value);
    setAmountDisplay(display);
    setAmount(numeric.toString());
  };

  const handleSubmit = () => {
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
    addTransaction({
      type,
      category: category as TransactionCategory,
      amount: numericAmount,
      description: category === 'other' && customCategory ? `${customCategory}: ${description}` : description,
      date: new Date(transactionDate),
      accountId,
      memberId,
      installments: isCreditCard && type === 'expense' ? installments : 1,
      isRecurring: type === 'expense' ? isRecurring : false,
      isPaid: false,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-[16px]">
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: type === 'income' ? '#A1E5C9' : '#FAD2D6'
            }}
          >
            {type === 'income' ? (
              <IncomeArrowIcon color="#0D7248" />
            ) : (
              <ExpenseArrowIcon color="#B81828" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('modals.newTransaction.title')}</h2>
            <p className="text-sm text-gray-600">
              {type === 'income' ? (t('modals.newTransaction.registerIncome') || 'Registre uma nova receita') : (t('modals.newTransaction.registerExpense') || 'Registre uma nova despesa')}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-[40px]">
            <button
              onClick={() => setType('income')}
              className={`
                flex-1 py-3 px-4 rounded-[40px] font-semibold transition-all
                ${type === 'income' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}
              `}
            >
              {t('modals.newTransaction.income')}
            </button>
            <button
              onClick={() => setType('expense')}
              className={`
                flex-1 py-3 px-4 rounded-[40px] font-semibold transition-all
                ${type === 'expense' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}
              `}
            >
              {t('modals.newTransaction.expense')}
            </button>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('modals.newTransaction.date')}
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full h-14 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('modals.newTransaction.amount')}
            </label>
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium">R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={amountDisplay}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={`
                  flex-1 h-14 px-4 rounded-[40px] border
                  ${errors.amount ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
                placeholder="0,00"
              />
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
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
            <div className="flex gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className={`
                  flex-1 h-14 px-4 rounded-[40px] border min-w-0
                  ${errors.category ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
                style={{ paddingRight: '24px', width: '420px' }}
              >
                <option value="">{t('modals.newTransaction.selectCategory') || 'Selecione uma categoria'}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryNames[cat] || cat}
                  </option>
                ))}
              </select>
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
            
            {/* Campo para categoria customizada quando "Outros" é selecionado */}
            {category === 'other' && (
              <div className="mt-3 animate-fade-in">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    if (errors.customCategory) {
                      setErrors({ ...errors, customCategory: '' });
                    }
                  }}
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

          {/* Member */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('modals.newTransaction.member')} ({t('common.optional')})
            </label>
            <div className="flex gap-3">
              <select
                value={memberId || ''}
                onChange={(e) => setMemberId(e.target.value || null)}
                className="flex-1 h-14 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary min-w-0"
                style={{ paddingRight: '24px' }}
              >
                <option value="">{t('modals.newTransaction.familyGeneral') || 'Família (Geral)'}</option>
                {familyMembers.map((member) => {
                  const roleDisplay = member.role.toLowerCase() === 'owner' ? 'Owner' : member.role;
                  return (
                    <option key={member.id} value={member.id}>
                      {member.name} - {roleDisplay}
                    </option>
                  );
                })}
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

          {/* Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('modals.newTransaction.account')}
            </label>
            {/* Sempre mostrar dropdown + botão adicionar método */}
            <div className="flex gap-3">
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className={`
                  flex-1 h-14 px-4 rounded-[40px] border min-w-0
                  ${errors.accountId ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
                style={{ paddingRight: '24px' }}
              >
                <option value="">{t('common.select') || 'Selecione'}</option>
                {bankAccounts.filter(a => a.isActive).length > 0 && (
                  <optgroup label={t('transactions.bankAccounts')}>
                    {bankAccounts.filter(a => a.isActive).map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {creditCards.filter(c => c.isActive).length > 0 && (
                  <optgroup label={t('transactions.creditCards')}>
                    {creditCards.filter(c => c.isActive).map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.name}
                      </option>
                    ))}
                  </optgroup>
                )}
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

          {/* Installments (only for credit card expenses) */}
          {isCreditCard && type === 'expense' && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('modals.newTransaction.installments')}
              </label>
              <select
                value={installments}
                onChange={(e) => setInstallments(parseInt(e.target.value))}
                disabled={isRecurring}
                className="w-full h-14 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                style={{ paddingRight: '1rem' }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num === 1 ? (t('modals.newTransaction.cash') || 'À vista (1x)') : `${num}x`}
                  </option>
                ))}
              </select>
              {isRecurring && (
                <p className="mt-1 text-sm italic text-gray-500">
                  {t('modals.newTransaction.installmentsDisabledForRecurring') || 'Parcelamento desabilitado para despesas recorrentes'}
                </p>
              )}
            </div>
          )}

          {/* Recurring (only for expenses) */}
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
                </div>
              </div>

              {/* Campos de recorrência quando marcado */}
              {isRecurring && installments === 1 && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('modals.newTransaction.frequency') || 'Frequência'}
                      </label>
                      <select
                        value={recurrenceFrequency}
                        onChange={(e) => setRecurrenceFrequency(e.target.value as 'weekly' | 'biweekly' | 'monthly' | 'yearly')}
                        className="w-full h-14 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{ paddingRight: '1rem' }}
                      >
                        <option value="weekly">{t('modals.newTransaction.weekly') || 'Semanal'}</option>
                        <option value="biweekly">{t('modals.newTransaction.biweekly') || 'Quinzenal'}</option>
                        <option value="monthly">{t('modals.newTransaction.monthly') || 'Mensal'}</option>
                        <option value="yearly">{t('modals.newTransaction.yearly') || 'Anual'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('modals.newTransaction.timesCount') || 'Quantidade de Vezes'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={recurrenceCount}
                        onChange={(e) => setRecurrenceCount(parseInt(e.target.value) || 1)}
                        className="w-full h-14 px-4 rounded-[40px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ex: 12"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-white rounded-b-[16px]">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-[40px] border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={handleSubmit}
          className="px-8 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold"
        >
          {t('modals.newTransaction.saveTransaction')}
        </button>
      </div>

      {/* Modal de Criar Categoria */}
      <CreateCategoryModal
        isOpen={isCreateCategoryModalOpen}
        onClose={() => setIsCreateCategoryModalOpen(false)}
        onSave={(categoryName, _color) => {
          setCategory('other');
          setCustomCategory(categoryName);
          setIsCreateCategoryModalOpen(false);
          // A cor será salva quando a transação for criada (através do categoryService)
        }}
      />

      {/* Modal de Adicionar Membro */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
      />

      {/* Modal de Criar Método (Conta/Cartão) */}
      <CreateMethodModal
        isOpen={isCreateMethodModalOpen}
        onClose={() => setIsCreateMethodModalOpen(false)}
        initialTab={createMethodTab}
        onAccountCreated={() => {
          // Recarregar contas após criar
        }}
        onCardCreated={() => {
          // Recarregar cartões após criar
        }}
      />
    </Modal>
  );
}
