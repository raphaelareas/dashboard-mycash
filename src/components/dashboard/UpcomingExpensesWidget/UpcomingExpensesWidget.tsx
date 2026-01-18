import { useState } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';

const WalletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M14 8H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Mock data de despesas futuras (simulando contas a pagar)
const mockUpcomingExpenses = [
  {
    id: 'exp-1',
    description: 'Conta de luz',
    dueDate: new Date(2025, 1, 15),
    amount: 385.72,
    accountType: 'credit',
    bankName: 'Nubank',
    lastFourDigits: '1234',
  },
  {
    id: 'exp-2',
    description: 'Gás',
    dueDate: new Date(2025, 1, 21),
    amount: 95.0,
    accountType: 'credit',
    bankName: 'Nubank',
    lastFourDigits: '1234',
  },
  {
    id: 'exp-3',
    description: 'Netflix',
    dueDate: new Date(2025, 1, 20),
    amount: 60.0,
    accountType: 'credit',
    bankName: 'Nubank',
    lastFourDigits: '1234',
  },
  {
    id: 'exp-4',
    description: 'Wellhub',
    dueDate: new Date(2025, 1, 10),
    amount: 89.9,
    accountType: 'credit',
    bankName: 'Nubank',
    lastFourDigits: '1234',
  },
];

function formatDueDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `Vence dia ${day}/${month}`;
}

function getAccountLabel(accountType: string, bankName: string, lastFourDigits?: string): string {
  if (accountType === 'checking') {
    return `${bankName} conta`;
  }
  if (accountType === 'credit' && lastFourDigits) {
    return `Crédito ${bankName} **** ${lastFourDigits}`;
  }
  return bankName;
}

interface UpcomingExpensesWidgetProps {
  onAddTransaction?: () => void;
}

export function UpcomingExpensesWidget({ onAddTransaction }: UpcomingExpensesWidgetProps) {
  const [expenses, setExpenses] = useState(mockUpcomingExpenses);

  const sortedExpenses = [...expenses].sort((a, b) => 
    a.dueDate.getTime() - b.dueDate.getTime()
  );

  const handleMarkAsPaid = (id: string) => {
    // Animação e remoção
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    // Aqui você pode adicionar lógica para criar transação paga, criar próxima recorrência, etc.
  };

  return (
    <div className="
      w-full p-6 rounded-lg
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700
      h-full flex flex-col
    ">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <WalletIcon />
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Próximas despesas</h3>
        </div>

        <button
          onClick={onAddTransaction}
          className="
            w-10 h-10 rounded-full
            border border-gray-200 dark:border-gray-600
            bg-white dark:bg-gray-700
            flex items-center justify-center
            hover:bg-gray-50 dark:hover:bg-gray-600
            transition-colors duration-200
            text-gray-700 dark:text-gray-300
          "
        >
          <PlusIcon />
        </button>
      </div>

      {/* Expenses List */}
      {sortedExpenses.length === 0 ? (
        <div className="
          py-12 px-4
          flex flex-col items-center justify-center
          border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg
        ">
          <div className="
            w-16 h-16 rounded-full
            bg-success-light dark:bg-success/20
            flex items-center justify-center mb-3
            text-success-dark dark:text-success
          ">
            <CheckIcon />
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">Nenhuma despesa pendente</p>
        </div>
      ) : (
        <div className="space-y-0 flex-1">
          {sortedExpenses.map((expense, index) => (
            <div
              key={expense.id}
              className={`
                py-4 ${index < sortedExpenses.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}
                flex items-center justify-between
              `}
            >
              {/* Left side - Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {expense.description}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {formatDueDate(expense.dueDate)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {getAccountLabel(expense.accountType, expense.bankName, expense.lastFourDigits)}
                </p>
              </div>

              {/* Right side - Amount and button */}
              <div className="flex items-center gap-3 ml-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>

                <button
                  onClick={() => handleMarkAsPaid(expense.id)}
                  className="
                    w-8 h-8 rounded-full
                    border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-700
                    flex items-center justify-center
                    hover:bg-success-light dark:hover:bg-success/20 
                    hover:border-success dark:hover:border-success 
                    hover:text-success-dark dark:hover:text-success
                    transition-colors duration-200
                    flex-shrink-0
                  "
                  aria-label="Marcar como paga"
                >
                  <CheckIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
