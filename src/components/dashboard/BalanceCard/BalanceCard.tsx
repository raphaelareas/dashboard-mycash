import { useFinance } from '@/contexts/FinanceContext';
import { useCountAnimation } from '@/hooks/useCountAnimation';
import { formatCurrency } from '@/utils/formatCurrency';

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2V18M13 6C13 7.10457 12.1046 8 11 8H9C7.89543 8 7 8.89543 7 10C7 11.1046 7.89543 12 9 12H11C12.1046 12 13 12.8954 13 14C13 15.1046 12.1046 16 11 16H7M7 4H11C12.1046 4 13 4.89543 13 6C13 7.10457 12.1046 8 11 8H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export function BalanceCard() {
  const { calculateTotalBalance } = useFinance();
  const balance = calculateTotalBalance();
  const animatedBalance = useCountAnimation(balance);

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
          flex items-center justify-center
          text-white
        " style={{ backgroundColor: '#2A89EF' }}>
          <DollarIcon />
        </div>
      </div>

      {/* Título (menor) - mesmo estilo para todos os cards */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Saldo total</p>

      {/* Valor (maior) */}
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {formatCurrency(animatedBalance)}
      </p>
    </div>
  );
}
