import { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Modal } from '@/components/ui/Modal';
import { CreateCategoryModal } from '@/components/modals/CreateCategoryModal';
import { AddMemberModal } from '@/components/modals/AddMemberModal';
import { AddCardModal } from '@/components/modals/AddCardModal';
import { TransactionCategory } from '@/types';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IncomeArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4V20M6 10L12 4L18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ExpenseArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20V4M6 14L12 20L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const categories: TransactionCategory[] = ['rent', 'food', 'shopping', 'household', 'transport', 'entertainment', 'health', 'education', 'other'];

export function NewTransactionModal({ isOpen, onClose }: NewTransactionModalProps) {
  const { addTransaction, bankAccounts, creditCards, familyMembers } = useFinance();
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
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isCreditCard = creditCards.some(c => c.id === accountId);

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
      setIsAddCardModalOpen(false);
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

  // Função para formatar valor automaticamente conforme o usuário digita
  const handleAmountChange = (value: string) => {
    // Remove tudo exceto números
    const numbersOnly = value.replace(/\D/g, '');
    
    if (!numbersOnly) {
      setAmountDisplay('');
      setAmount('');
      return;
    }

    // Se tiver mais de 2 dígitos, os últimos 2 são centavos
    // Caso contrário, todos são centavos
    let reais = '0';
    let centavos = '00';

    if (numbersOnly.length <= 2) {
      // Apenas centavos (ex: "89" → "0,89")
      centavos = numbersOnly.padStart(2, '0');
    } else {
      // Reais + centavos (ex: "8000" → "80,00" mas precisamos "8.000,00")
      // ou "75689" → "756,89"
      centavos = numbersOnly.slice(-2);
      reais = numbersOnly.slice(0, -2);
    }

    // Formata reais com pontos de milhar
    const reaisFormatted = parseInt(reais || '0').toLocaleString('pt-BR');
    
    // Monta o valor formatado
    const formatted = `${reaisFormatted},${centavos}`;
    
    setAmountDisplay(formatted);
    
    // Salva o valor numérico (reais + centavos como número decimal)
    const numericValue = parseFloat(reais || '0') + (parseInt(centavos) / 100);
    setAmount(numericValue.toString());
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!description || description.length < 3) {
      newErrors.description = 'Descrição deve ter pelo menos 3 caracteres';
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
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${type === 'income' ? 'bg-lime-500' : 'bg-gray-900'}
            text-white
          `}>
            {type === 'income' ? <IncomeArrowIcon /> : <ExpenseArrowIcon />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nova Transação</h2>
            <p className="text-sm text-gray-600">
              {type === 'income' ? 'Registre uma nova receita' : 'Registre uma nova despesa'}
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
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setType('income')}
              className={`
                flex-1 py-3 px-4 rounded-md font-semibold transition-all
                ${type === 'income' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}
              `}
            >
              Receita
            </button>
            <button
              onClick={() => setType('expense')}
              className={`
                flex-1 py-3 px-4 rounded-md font-semibold transition-all
                ${type === 'expense' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}
              `}
            >
              Despesa
            </button>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data da Transação
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full h-14 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Transação
            </label>
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium">R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={amountDisplay}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={`
                  flex-1 h-14 px-4 rounded-lg border
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
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Supermercado Semanal"
              className={`
                w-full h-14 px-4 rounded-lg border
                ${errors.description ? 'border-red-500' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-primary
              `}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <div className="flex gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className={`
                  flex-1 h-14 px-4 rounded-lg border
                  ${errors.category ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
                style={{ paddingRight: '1rem' }}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'rent' ? 'Aluguel' :
                     cat === 'food' ? 'Alimentação' :
                     cat === 'shopping' ? 'Compras' :
                     cat === 'household' ? 'Contas de casa' :
                     cat === 'transport' ? 'Transporte' :
                     cat === 'entertainment' ? 'Entretenimento' :
                     cat === 'health' ? 'Saúde' :
                     cat === 'education' ? 'Educação' : 'Outros'}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsCreateCategoryModalOpen(true)}
                className="px-6 h-14 rounded-full border hover:bg-gray-50 transition-colors font-medium text-gray-700 whitespace-nowrap"
                style={{ borderColor: '#1F2937' }}
              >
                Adicionar categoria
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
                  placeholder="Nome da nova categoria"
                  className={`
                    w-full h-14 px-4 rounded-lg border
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
              Membro (opcional)
            </label>
            <div className="flex gap-3">
              <select
                value={memberId || ''}
                onChange={(e) => setMemberId(e.target.value || null)}
                className="flex-1 h-14 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ paddingRight: '1rem' }}
              >
                <option value="">Família (Geral)</option>
                {familyMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsAddMemberModalOpen(true)}
                className="px-6 h-14 rounded-full border hover:bg-gray-50 transition-colors font-medium text-gray-700 whitespace-nowrap"
                style={{ borderColor: '#1F2937' }}
              >
                Adicionar membro
              </button>
            </div>
          </div>

          {/* Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conta / Cartão
            </label>
            <div className="flex gap-3">
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className={`
                  flex-1 h-14 px-4 rounded-lg border
                  ${errors.accountId ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
                style={{ paddingRight: '1rem' }}
              >
                <option value="">Selecione</option>
                <optgroup label="Contas Bancárias">
                  {bankAccounts.filter(a => a.isActive).map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Cartões de Crédito">
                  {creditCards.filter(c => c.isActive).map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              <button
                type="button"
                onClick={() => setIsAddCardModalOpen(true)}
                className="px-6 h-14 rounded-full border hover:bg-gray-50 transition-colors font-medium text-gray-700 whitespace-nowrap"
                style={{ borderColor: '#1F2937' }}
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
                Parcelamento
              </label>
              <select
                value={installments}
                onChange={(e) => setInstallments(parseInt(e.target.value))}
                disabled={isRecurring}
                className="w-full h-14 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                style={{ paddingRight: '1rem' }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num === 1 ? 'À vista (1x)' : `${num}x`}
                  </option>
                ))}
              </select>
              {isRecurring && (
                <p className="mt-1 text-sm italic text-gray-500">
                  Parcelamento desabilitado para despesas recorrentes
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
                    Despesa Recorrente
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    {installments > 1
                      ? 'Não disponível para compras parceladas'
                      : 'Esta despesa será repetida automaticamente'
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
                        Frequência
                      </label>
                      <select
                        value={recurrenceFrequency}
                        onChange={(e) => setRecurrenceFrequency(e.target.value as 'weekly' | 'biweekly' | 'monthly' | 'yearly')}
                        className="w-full h-14 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{ paddingRight: '1rem' }}
                      >
                        <option value="weekly">Semanal</option>
                        <option value="biweekly">Quinzenal</option>
                        <option value="monthly">Mensal</option>
                        <option value="yearly">Anual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantidade de Vezes
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={recurrenceCount}
                        onChange={(e) => setRecurrenceCount(parseInt(e.target.value) || 1)}
                        className="w-full h-14 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
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
          className="px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="px-8 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold"
        >
          Salvar Transação
        </button>
      </div>

      {/* Modal de Criar Categoria */}
      <CreateCategoryModal
        isOpen={isCreateCategoryModalOpen}
        onClose={() => setIsCreateCategoryModalOpen(false)}
        onSave={(categoryName) => {
          setCategory('other');
          setCustomCategory(categoryName);
          setIsCreateCategoryModalOpen(false);
        }}
      />

      {/* Modal de Adicionar Membro */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
      />

      {/* Modal de Adicionar Cartão/Conta */}
      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
      />
    </Modal>
  );
}
