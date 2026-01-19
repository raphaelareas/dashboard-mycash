import { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { Modal } from '@/components/ui/Modal';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CreateCategoryModal } from '@/components/modals/CreateCategoryModal';
import { AddMemberModal } from '@/components/modals/AddMemberModal';
import { CreateMethodModal } from '@/components/modals/CreateMethodModal';
import { TransactionCategory } from '@/types';
import { formatCurrencyInput } from '@/utils/currency.utils';
import { defaultCategoryColors } from '@/utils/categoryColors';

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

const defaultCategories: TransactionCategory[] = ['rent', 'food', 'shopping', 'household', 'transport', 'entertainment', 'health', 'education', 'other'];

export function NewTransactionModal({ isOpen, onClose }: NewTransactionModalProps) {
  const { addTransaction, bankAccounts, creditCards, familyMembers, categories: customCategories, addCategory } = useFinance();
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
  const [category, setCategory] = useState<TransactionCategory | string | ''>('');
  const [customCategory, setCustomCategory] = useState('');
  // Membro é opcional, então não pré-selecionar ninguém
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


  // Removido: Membro é opcional, não pré-selecionar owner

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
      // Membro é opcional, não pré-selecionar
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
  }, [isOpen, familyMembers]);

  useEffect(() => {
    if (category !== 'other') {
      setCustomCategory('');
    }
  }, [category]);

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

    if (isInstallment) {
      const totalNum = parseInt(totalInstallments);
      const currentNum = parseInt(installmentNumber);
      
      if (!totalInstallments || isNaN(totalNum) || totalNum < 1 || totalNum > 360) {
        newErrors.installments = 'Total de parcelas deve ser entre 1 e 360';
      }
      
      if (!installmentNumber || isNaN(currentNum) || currentNum < 1 || currentNum > 360) {
        newErrors.installmentNumber = 'Parcela atual deve ser entre 1 e 360';
      }
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
      category: category as TransactionCategory | string,
      amount: numericAmount,
      description: category === 'other' && customCategory ? `${customCategory}: ${description}` : description,
      date: new Date(transactionDate),
      accountId,
      memberId,
      installments: isInstallment ? parseInt(totalInstallments) : 1,
      installmentNumber: isInstallment ? parseInt(installmentNumber) : undefined,
      isRecurring: false,
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
                  Total
                </button>
                <button
                  type="button"
                  onClick={() => setIsInstallment(true)}
                  className={`
                    px-4 py-2 rounded-[40px] font-medium transition-all text-sm
                    ${isInstallment ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}
                  `}
                >
                  Parcela
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
                      Parcela Atual
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
                      Total de Parcelas
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

          {/* Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('modals.newTransaction.account')}
            </label>
            {/* Sempre mostrar dropdown + botão adicionar método */}
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
            // Salvar a categoria permanentemente no banco de dados
            await addCategory({
              name: categoryName,
              type: categoryType,
              color: color || '#111827',
              accountId: accountId || null,
            });
            
            // Selecionar automaticamente a categoria recém-criada
            setCategory(categoryName);
            setIsCreateCategoryModalOpen(false);
          } catch (error) {
            console.error('Erro ao criar categoria:', error);
            // Manter o modal aberto em caso de erro para o usuário tentar novamente
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
          // Selecionar automaticamente a conta criada
          setAccountId(accountId);
        }}
        onCardCreated={(cardId) => {
          // Selecionar automaticamente o cartão criado
          setAccountId(cardId);
        }}
      />
    </Modal>
  );
}
