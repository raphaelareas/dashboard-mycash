import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateShort } from '@/utils/formatDateShort';

const WalletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M14 8H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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

export function UpcomingExpensesWidget({}: UpcomingExpensesWidgetProps) {
  const { transactions, dateRange } = useFinance();
  const { t } = useI18n();
  
  // Buscar despesas próximas (próximos 30 dias a partir de hoje)
  const today = new Date();
  const next30Days = new Date();
  next30Days.setDate(today.getDate() + 30);
  
  const upcomingExpenses = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return t.type === 'expense' && 
             transactionDate >= today && 
             transactionDate <= next30Days &&
             transactionDate >= dateRange.startDate &&
             transactionDate <= dateRange.endDate;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5); // Limitar a 5 despesas

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
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{t('dashboard.upcomingExpenses')}</h3>
        </div>
      </div>

      {/* Expenses List */}
      {upcomingExpenses.length === 0 ? (
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
          <p className="text-sm text-gray-400 dark:text-gray-500">{t('dashboard.noPendingExpenses') || 'Nenhuma despesa pendente'}</p>
        </div>
      ) : (
        <div className="space-y-2 flex-1 overflow-y-auto">
          {upcomingExpenses.map((expense) => (
            <div
              key={expense.id}
              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {expense.description}
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 ml-2 flex-shrink-0">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDateShort(new Date(expense.date))}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
