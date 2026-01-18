import { useFinance } from '@/contexts/FinanceContext';
import { CategoryDonutCard } from '../CategoryDonutCard';

const colors = [
  'var(--lime-500)', // verde-limão
  'var(--gray-900)', // preto
  'var(--gray-600)', // cinza médio
  'var(--lime-600)', // verde-limão escuro
];

export function ExpensesByCategoryGrid() {
  const { calculateExpensesByCategory, calculateCategoryPercentage } = useFinance();
  const expensesByCategory = calculateExpensesByCategory();

  // Pegar apenas os top 4 para o grid
  const topCategories = expensesByCategory.slice(0, 4);

  if (topCategories.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
      {topCategories.map((item, index) => (
        <CategoryDonutCard
          key={item.category}
          category={item.category}
          amount={item.amount}
          percentage={calculateCategoryPercentage(item.category)}
          color={colors[index % colors.length]}
        />
      ))}
    </div>
  );
}
