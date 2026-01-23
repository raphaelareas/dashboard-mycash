import { useI18n } from '@/contexts/I18nContext';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';

interface CategoryDonutCardProps {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export function CategoryDonutCard({ category, amount, percentage, color }: CategoryDonutCardProps) {
  const { t } = useI18n();
  const { formatCurrency } = useCurrencyFormat();
  
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
  
  const categoryName = categoryNames[category] || category;
  const displayPercentage = Math.min(percentage, 100);
  const circumference = 2 * Math.PI * 28; // raio de 28px
  const offset = circumference - (displayPercentage / 100) * circumference;

  return (
    <div className="
      w-full p-4 h-full
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700 rounded-lg
      hover:border-primary transition-colors duration-200
      cursor-pointer
      flex flex-col items-center justify-center
    ">
      {/* Donut Chart */}
      <div className="relative w-16 h-16 mx-auto mb-3">
        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
          {/* Background circle */}
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="var(--gray-100)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        {/* Percentage text centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {displayPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Category name */}
      <p className="text-xs text-center text-gray-700 dark:text-gray-300 mb-2 truncate" title={categoryName}>
        {categoryName}
      </p>

      {/* Amount */}
      <p className="text-sm font-semibold text-center text-gray-900 dark:text-gray-100">
        {formatCurrency(amount)}
      </p>
    </div>
  );
}
