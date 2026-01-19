import { useRef, useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { CategoryDonutCard } from '../CategoryDonutCard';

const colors = [
  'var(--lime-500)', // verde-limão
  'var(--gray-900)', // preto
  'var(--gray-600)', // cinza médio
  'var(--lime-600)', // verde-limão escuro
  'var(--gray-500)', // cinza
  'var(--lime-400)', // verde-limão claro
];

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function ExpensesByCategoryCarousel() {
  const { calculateExpensesByCategory, calculateCategoryPercentage } = useFinance();
  const expensesByCategory = calculateExpensesByCategory();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const cardWidth = 280; // Largura aproximada de cada card + gap
  const cardsPerView = 4; // Quantos cards visíveis por vez

  const totalPages = Math.ceil(expensesByCategory.length / cardsPerView);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    if (direction === 'left' && currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      scrollRef.current.scrollTo({
        left: newPage * cardWidth * cardsPerView,
        behavior: 'smooth',
      });
    } else if (direction === 'right' && currentPage < totalPages - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      scrollRef.current.scrollTo({
        left: newPage * cardWidth * cardsPerView,
        behavior: 'smooth',
      });
    }
  };

  // Atualizar página atual baseado no scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const newPage = Math.round(scrollLeft / (cardWidth * cardsPerView));
      setCurrentPage(Math.max(0, Math.min(newPage, totalPages - 1)));
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [totalPages]);

  // Horizontal scroll com mouse wheel
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  if (expensesByCategory.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Fade gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-800 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-800 to-transparent z-10 pointer-events-none" />

      {/* Navigation arrows - sempre visíveis */}
      <button
        onClick={() => scroll('left')}
        disabled={currentPage === 0}
        className="
          absolute left-2 top-1/2 -translate-y-1/2
          w-10 h-10 rounded-full
          bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600
          flex items-center justify-center
          text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100
          disabled:opacity-50 disabled:cursor-not-allowed
          z-20 transition-all
        "
        aria-label="Rolar para esquerda"
      >
        <ArrowLeftIcon />
      </button>
      <button
        onClick={() => scroll('right')}
        disabled={currentPage >= totalPages - 1}
        className="
          absolute right-2 top-1/2 -translate-y-1/2
          w-10 h-10 rounded-full
          bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600
          flex items-center justify-center
          text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100
          disabled:opacity-50 disabled:cursor-not-allowed
          z-20 transition-all
        "
        aria-label="Rolar para direita"
      >
        <ArrowRightIcon />
      </button>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="
          flex gap-4 overflow-x-auto
          scrollbar-hide
          pb-2
          lg:px-12
        "
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {expensesByCategory.map((item, index) => (
          <CategoryDonutCard
            key={item.category}
            category={item.category}
            amount={item.amount}
            percentage={calculateCategoryPercentage(item.category)}
            color={colors[index % colors.length]}
          />
        ))}
      </div>

      {/* Paginador à direita */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4 pr-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentPage(index);
                if (scrollRef.current) {
                  scrollRef.current.scrollTo({
                    left: index * cardWidth * cardsPerView,
                    behavior: 'smooth',
                  });
                }
              }}
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

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
