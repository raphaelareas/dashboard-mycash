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
  const [showArrows, setShowArrows] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

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
    <div
      className="relative"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      {/* Fade gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />

      {/* Navigation arrows (hidden on mobile) */}
      {showArrows && (
        <>
          <button
            onClick={() => scroll('left')}
            className="
              absolute left-2 top-1/2 -translate-y-1/2
              w-10 h-10 rounded-full
              bg-white shadow-lg
              flex items-center justify-center
              text-gray-600 hover:text-gray-900
              z-20 hidden lg:flex
            "
            aria-label="Rolar para esquerda"
          >
            <ArrowLeftIcon />
          </button>
          <button
            onClick={() => scroll('right')}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              w-10 h-10 rounded-full
              bg-white shadow-lg
              flex items-center justify-center
              text-gray-600 hover:text-gray-900
              z-20 hidden lg:flex
            "
            aria-label="Rolar para direita"
          >
            <ArrowRightIcon />
          </button>
        </>
      )}

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

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
