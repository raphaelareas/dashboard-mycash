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

interface UpcomingExpensesWidgetProps {
  onAddTransaction?: () => void;
}

export function UpcomingExpensesWidget({ onAddTransaction }: UpcomingExpensesWidgetProps) {
  // TODO: Implementar lógica de despesas pendentes baseada em transações recorrentes
  // Por enquanto, sempre mostra empty state
  const expenses: any[] = [];

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
      {expenses.length === 0 ? (
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
      ) : null}
    </div>
  );
}
