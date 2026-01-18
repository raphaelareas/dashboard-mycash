import { useFinance } from '@/contexts/FinanceContext';
import { useCountAnimation } from '@/hooks/useCountAnimation';
import { formatCurrency } from '@/utils/formatCurrency';

const ExpenseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 17V3M5 12L10 17L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function ExpenseCard() {
  const { calculateExpensesForPeriod } = useFinance();
  const expenses = calculateExpensesForPeriod();
  const animatedExpenses = useCountAnimation(expenses);

  return (
    <div className="
      w-full p-6 rounded-lg
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700
    ">
      {/* Estrutura: Ícone > Título > Valor */}
      {/* Ícone no topo */}
      <div className="mb-3">
        <div className="
          w-10 h-10 rounded-full
          bg-error-light dark:bg-error/20
          flex items-center justify-center
          text-error dark:text-error-dark
        ">
          <ExpenseIcon />
        </div>
      </div>

      {/* Título (menor) - mesmo estilo do "Saldo total" */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Despesas</p>

      {/* Valor (maior) */}
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {formatCurrency(animatedExpenses)}
      </p>
    </div>
  );
}
