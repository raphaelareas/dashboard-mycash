import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { CategoryDonutCard } from '../CategoryDonutCard';
import { defaultCategoryColors } from '@/utils/categoryColors';

export function ExpensesByCategoryGrid() {
  const { calculateExpensesByCategory, calculateCategoryPercentage, categories } = useFinance();
  const { t } = useI18n();
  const expensesByCategory = calculateExpensesByCategory();
  const [currentPage, setCurrentPage] = useState(0);
  
  const cardsPerPage = 4;
  const totalPages = Math.ceil(expensesByCategory.length / cardsPerPage);

  // Função para obter a cor da categoria
  const getCategoryColor = (categoryName: string): string => {
    // Verificar se é categoria padrão
    if (defaultCategoryColors[categoryName]) {
      return defaultCategoryColors[categoryName];
    }
    
    // Verificar se é categoria customizada
    const customCategory = categories.find(c => c.name === categoryName);
    if (customCategory) {
      return customCategory.color;
    }
    
    // Fallback
    return '#6B7280';
  };

  if (expensesByCategory.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('dashboard.noExpensesYet') || 'Nenhuma despesa registrada ainda'}</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{t('dashboard.addTransactionsToSee') || 'Adicione transações para ver os gastos por categoria'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Scroll Container */}
      <div className="flex-1 overflow-hidden relative">
        <div 
          className="flex h-full transition-transform duration-300 ease-in-out gap-6"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => {
            const pageCategories = expensesByCategory.slice(
              pageIndex * cardsPerPage,
              (pageIndex + 1) * cardsPerPage
            );
            
            return (
              <div key={pageIndex} className="w-full flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-6">
                {pageCategories.map((item) => (
                  <CategoryDonutCard
                    key={item.category}
                    category={item.category}
                    amount={item.amount}
                    percentage={calculateCategoryPercentage(item.category)}
                    color={getCategoryColor(item.category)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Paginadores */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`
                w-2 h-2 rounded-full transition-all
                ${currentPage === index 
                  ? 'bg-gray-900 dark:bg-gray-100 w-6' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }
              `}
              aria-label={`Página ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
