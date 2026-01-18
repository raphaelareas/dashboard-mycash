import { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Modal } from '@/components/ui/Modal';
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
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TransactionCategory | ''>('');
  const [memberId, setMemberId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState('');
  const [installments, setInstallments] = useState(1);
  const [isRecurring, setIsRecurring] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isCreditCard = creditCards.some(c => c.id === accountId);

  useEffect(() => {
    if (!isOpen) {
      // Reset form
      setType('expense');
      setAmount('');
      setDescription('');
      setCategory('');
      setMemberId(null);
      setAccountId('');
      setInstallments(1);
      setIsRecurring(false);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isRecurring) {
      setInstallments(1);
    }
  }, [isRecurring]);

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!description || description.length < 3) {
      newErrors.description = 'Descrição deve ter pelo menos 3 caracteres';
    }

    if (!category) {
      newErrors.category = 'Selecione uma categoria';
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
      amount: parseFloat(amount),
      description,
      date: new Date(),
      accountId,
      memberId,
      installments: isCreditCard && type === 'expense' ? installments : 1,
      isRecurring: type === 'expense' ? isRecurring : false,
      isPaid: false,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} fullScreen>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
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

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Transação
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">R$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`
                  w-full h-14 pl-12 pr-4 rounded-lg border
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
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className={`
                w-full h-14 px-4 rounded-lg border
                ${errors.category ? 'border-red-500' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-primary
              `}
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
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>

          {/* Member and Account Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Member */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Membro (opcional)
              </label>
              <select
                value={memberId || ''}
                onChange={(e) => setMemberId(e.target.value || null)}
                className="w-full h-14 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Família (Geral)</option>
                {familyMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conta / Cartão
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className={`
                  w-full h-14 px-4 rounded-lg border
                  ${errors.accountId ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
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
              {errors.accountId && <p className="mt-1 text-sm text-red-600">{errors.accountId}</p>}
            </div>
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
                      : 'Esta despesa será repetida automaticamente todo mês'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-white">
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
    </Modal>
  );
}
