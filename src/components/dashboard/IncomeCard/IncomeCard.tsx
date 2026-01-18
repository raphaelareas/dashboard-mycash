import { useFinance } from '@/contexts/FinanceContext';
import { useCountAnimation } from '@/hooks/useCountAnimation';
import { formatCurrency } from '@/utils/formatCurrency';

const IncomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3V17M5 8L10 3L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function IncomeCard() {
  const { calculateIncomeForPeriod } = useFinance();
  const income = calculateIncomeForPeriod();
  const animatedIncome = useCountAnimation(income);

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
          bg-gray-100 dark:bg-gray-700
          flex items-center justify-center
          text-gray-900 dark:text-gray-100
        ">
          <IncomeIcon />
        </div>
      </div>

      {/* Título (menor) */}
      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Receitas</h3>

      {/* Valor (maior) */}
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {formatCurrency(animatedIncome)}
      </p>
    </div>
  );
}
