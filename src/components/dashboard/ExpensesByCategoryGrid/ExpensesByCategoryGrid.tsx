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
    return (
      <div className="w-full h-full flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma despesa registrada ainda</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Adicione transações para ver os gastos por categoria</p>
        </div>
      </div>
    );
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
