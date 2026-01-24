import { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { Modal } from '@/components/ui/Modal';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { DatePicker } from '@/components/ui/DatePicker';
import { CreateCategoryModal } from '@/components/modals/CreateCategoryModal';
import { AddMemberModal } from '@/components/modals/AddMemberModal';
import { CreateMethodModal } from '@/components/modals/CreateMethodModal';
import { TransactionCategory, Transaction } from '@/types';
import { formatCurrencyInput } from '@/utils/currency.utils';
import { defaultCategoryColors } from '@/utils/categoryColors';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
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

const defaultCategories: TransactionCategory[] = ['rent', 'food', 'shopping', 'household', 'transport', 'entertainment', 'health', 'education', 'other'];

export function EditTransactionModal({ isOpen, onClose, transaction }: EditTransactionModalProps) {
  const { updateTransaction, bankAccounts, creditCards, familyMembers, categories: customCategories, addCategory } = useFinance();
  const { t } = useI18n();
  const { currency } = useCurrencyFormat();
  
  // Obter símbolo da moeda
  const getCurrencySymbol = (currencyCode: string): string => {
    try {
      const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      const formatted = formatter.format(0);
      // Extrair apenas o símbolo (remove números e espaços)
      return formatted.replace(/[\d\s,.-]/g, '').trim();
    } catch {
      // Fallback para moedas comuns
      const symbols: Record<string, string> = {
        'BRL': 'R$',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'NOK': 'kr',
        'SEK': 'kr',
        'DKK': 'kr',
      };
      return symbols[currencyCode] || currencyCode;
    }
  };
  
  const currencySymbol = getCurrencySymbol(currency);
  const [type, setType] = useState<'income' | 'expense'>(transaction.type);
  
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
  const [description, setDescription] = useState(transaction.description);
  const [category, setCategory] = useState<TransactionCategory | string | ''>(transaction.category);
  const [memberId, setMemberId] = useState<string | null>(transaction.memberId || null);
  const [accountId, setAccountId] = useState(transaction.accountId);
  // Determinar tipo de pagamento baseado na transação
  const getPaymentType = (installments: number | undefined): 'total' | 'installment' | 'fixed' => {
    if (!installments || installments <= 1) return 'total';
    if (installments >= 999) return 'fixed';
    return 'installment';
  };
  
  const [paymentType, setPaymentType] = useState<'total' | 'installment' | 'fixed'>(() => 
    getPaymentType(transaction.installments)
  );
  const [totalInstallments, setTotalInstallments] = useState<string>((transaction.installments || 1).toString());
  const [installmentNumber, setInstallmentNumber] = useState<string>((transaction.installmentNumber || 1).toString());
  const [fixedRecurrence, setFixedRecurrence] = useState<'weekly' | 'biweekly' | 'monthly' | 'semiannual' | 'yearly'>('monthly');
  const [installmentRecurrence, setInstallmentRecurrence] = useState<'weekly' | 'biweekly' | 'monthly' | 'semiannual' | 'yearly'>('monthly');
  const [transactionDate, setTransactionDate] = useState<Date | null>(() => new Date(transaction.date));
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isCreateMethodModalOpen, setIsCreateMethodModalOpen] = useState(false);
  const [createMethodTab, setCreateMethodTab] = useState<'account' | 'card'>('account');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar valores quando o modal abrir ou a transação mudar
  useEffect(() => {
    if (isOpen && transaction) {
      setType(transaction.type);
      setDescription(transaction.description);
      setCategory(transaction.category);
      setMemberId(transaction.memberId || null);
      setAccountId(transaction.accountId);
      setPaymentType(getPaymentType(transaction.installments));
      setTotalInstallments((transaction.installments || 1).toString());
      setInstallmentNumber((transaction.installmentNumber || 1).toString());
      setTransactionDate(new Date(transaction.date));
      
      // Formatar valor para exibição - transaction.amount já está em reais (ex: 70.00)
      // Precisamos converter para centavos para o formatCurrencyInput funcionar corretamente
      // Exemplo: 70.00 -> 7000 centavos -> "70,00"
      const amountInCents = Math.round(transaction.amount * 100);
      const formatted = formatCurrencyInput(amountInCents.toString());
      setAmountDisplay(formatted.display);
      // Manter o valor numérico original para não perder precisão
      setAmount(transaction.amount.toString());
      setErrors({});
    }
  }, [isOpen, transaction]);

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
      newErrors.category = t('modals.newTransaction.categoryError') || 'Selecione uma categoria';
    }

    if (paymentType === 'installment') {
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

    if (!transactionDate) {
      newErrors.date = t('modals.newTransaction.dateError') ?? 'Selecione a data da transação';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    updateTransaction(transaction.id, {
      type,
      category: category as TransactionCategory | string,
      amount: numericAmount,
      description,
      date: transactionDate,
      accountId,
      memberId,
      installments: paymentType === 'installment' ? parseInt(totalInstallments) : (paymentType === 'fixed' ? 999 : 1),
      installmentNumber: paymentType === 'installment' ? parseInt(installmentNumber) : (paymentType === 'fixed' ? 1 : undefined),
      installmentRecurrence: paymentType === 'fixed' ? fixedRecurrence : (paymentType === 'installment' ? installmentRecurrence : undefined),
      isRecurring: paymentType === 'fixed',
      isPaid: transaction.isPaid,
    } as any);

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
            <h2 className="text-2xl font-bold text-gray-900">{t('modals.newTransaction.editTitle') || 'Editar Transação'}</h2>
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
                  w-full h-14 px-4 rounded-[40px] border bg-white
                  ${errors.description ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('modals.newTransaction.date')}
              </label>
              <DatePicker
                value={transactionDate}
                onChange={(d) => {
                  setTransactionDate(d);
                  if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
                }}
                placeholder={t('datePicker.selectDate')}
                error={!!errors.date}
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>
          </div>

          {/* Amount and Installment Toggle (same line) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('modals.newTransaction.amount')}
            </label>
            <div className="flex items-center gap-3">
              <div className={`flex-1 flex items-center gap-2 h-14 px-4 rounded-[40px] border bg-white ${errors.amount ? 'border-red-500' : 'border-gray-200'} focus-within:ring-2 focus-within:ring-primary`}>
                <span className="text-gray-600 font-medium whitespace-nowrap">{currencySymbol}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amountDisplay}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="flex-1 h-full border-0 outline-none bg-transparent p-0 focus:ring-0 focus:border-0"
                  style={{ border: 'none', boxShadow: 'none' }}
                  placeholder="0,00"
                />
              </div>
              {/* Toggle Total/Parcela/Fixa */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-[40px] h-14 items-center">
                <button
                  type="button"
                  onClick={() => setPaymentType('total')}
                  className={`
                    h-full px-4 rounded-[40px] font-medium transition-all text-sm flex items-center
                    ${paymentType === 'total' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}
                  `}
                >
                  {t('modals.newTransaction.total') || 'Total'}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('installment')}
                  className={`
                    h-full px-4 rounded-[40px] font-medium transition-all text-sm flex items-center
                    ${paymentType === 'installment' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}
                  `}
                >
                  {t('modals.newTransaction.installment') || 'Parcela'}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('fixed')}
                  className={`
                    h-full px-4 rounded-[40px] font-medium transition-all text-sm flex items-center
                    ${paymentType === 'fixed' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}
                  `}
                >
                  {t('modals.newTransaction.fixed') || 'Fixa'}
                </button>
              </div>
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
            
            {/* Campos de Parcelas (aparecem quando Parcela está selecionado) */}
            {paymentType === 'installment' && (
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
                      className="w-full h-14 px-4 rounded-[40px] border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                      className="w-full h-14 px-4 rounded-[40px] border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                    onChange={(e) => setInstallmentRecurrence(e.target.value as 'weekly' | 'biweekly' | 'monthly' | 'semiannual' | 'yearly')}
                    className="w-full h-14 px-4 rounded-[40px] border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="weekly">{t('modals.newTransaction.weekly') || 'Semanal'}</option>
                    <option value="biweekly">{t('modals.newTransaction.biweekly') || 'Quinzenal'}</option>
                    <option value="monthly">{t('modals.newTransaction.monthly') || 'Mensal'}</option>
                    <option value="semiannual">{t('modals.newTransaction.semiannual') || 'Semestral'}</option>
                    <option value="yearly">{t('modals.newTransaction.yearly') || 'Anual'}</option>
                  </select>
                </div>
              </div>
            )}
            {/* Campo de Recorrência quando é Fixa (sem campos de parcela) */}
            {paymentType === 'fixed' && (
              <div className="mt-4 space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('modals.newTransaction.recurrence') || 'Recorrência'}
                  </label>
                  <select
                    value={fixedRecurrence}
                    onChange={(e) => setFixedRecurrence(e.target.value as 'weekly' | 'biweekly' | 'monthly' | 'semiannual' | 'yearly')}
                    className="w-full h-14 px-4 rounded-[40px] border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="weekly">{t('modals.newTransaction.weekly') || 'Semanal'}</option>
                    <option value="biweekly">{t('modals.newTransaction.biweekly') || 'Quinzenal'}</option>
                    <option value="monthly">{t('modals.newTransaction.monthly') || 'Mensal'}</option>
                    <option value="semiannual">{t('modals.newTransaction.semiannual') || 'Semestral'}</option>
                    <option value="yearly">{t('modals.newTransaction.yearly') || 'Anual'}</option>
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
          </div>

          {/* Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('modals.newTransaction.account')}
            </label>
            <div className="flex gap-3">
              <div className="flex-1" style={{ width: '420px' }}>
                <CustomSelect
                  value={accountId}
                  onChange={(value) => setAccountId(value)}
                  placeholder={t('common.select') || 'Selecione'}
                  className={errors.accountId ? 'border-red-500' : ''}
                  error={!!errors.accountId}
                  options={[
                    // Contas bancárias
                    ...bankAccounts
                      .filter(a => a.isActive)
                      .map((account) => ({
                        value: account.id,
                        label: account.name,
                        color: account.color || '#3247FF',
                      })),
                    // Cartões de crédito
                    ...creditCards
                      .filter(c => c.isActive)
                      .map((card) => ({
                        value: card.id,
                        label: card.name,
                        color: card.color || '#3247FF',
                      })),
                  ]}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateMethodModalOpen(true);
                  setCreateMethodTab('account');
                }}
                className="px-6 h-14 rounded-[40px] border hover:bg-gray-50 transition-colors font-medium text-gray-700 whitespace-nowrap flex-shrink-0"
                style={{ borderColor: '#1F2937', minWidth: '180px' }}
              >
                {t('modals.newTransaction.createNewMethod')}
              </button>
            </div>
            {errors.accountId && <p className="mt-1 text-sm text-red-600">{errors.accountId}</p>}
          </div>

          {/* Member */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('modals.newTransaction.member')} ({t('common.optional')})
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <CustomSelect
                  value={memberId || ''}
                  onChange={(value) => setMemberId(value || null)}
                  placeholder={t('common.select') || 'Selecionar'}
                  options={[
                    ...familyMembers.map((member) => {
                      const roleDisplay = member.role.toLowerCase() === 'owner' ? 'Owner' : member.role;
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
        initialType={type}
        onSave={async (categoryName, categoryType, color, accountId) => {
          try {
            await addCategory({
              name: categoryName,
              type: categoryType,
              color: color || '#111827',
              accountId: accountId || null,
            });
            
            setCategory(categoryName);
            setIsCreateCategoryModalOpen(false);
          } catch (error) {
            console.error('Erro ao criar categoria:', error);
          }
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
