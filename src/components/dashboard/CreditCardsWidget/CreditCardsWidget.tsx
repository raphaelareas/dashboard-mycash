import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { formatCurrency } from '@/utils/formatCurrency';

const CardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M2 8H18" stroke="currentColor" strokeWidth="2"/>
    <circle cx="5" cy="12" r="1" fill="currentColor"/>
    <circle cx="8" cy="12" r="1" fill="currentColor"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CreditCardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

interface CreditCardsWidgetProps {
  onAddCard?: () => void;
}

export function CreditCardsWidget({ onAddCard }: CreditCardsWidgetProps) {
  const { creditCards } = useFinance();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const activeCards = creditCards.filter(c => c.isActive);
  const cardsPerPage = 1; // Mostrar 1 cartão por vez
  const totalPages = Math.ceil(activeCards.length / cardsPerPage);

  // Handlers para drag/swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (!scrollRef.current) return;
    
    // Calcular qual página está visível após o drag
    const cardWidth = scrollRef.current.offsetWidth;
    const newPage = Math.round(scrollRef.current.scrollLeft / cardWidth);
    const clampedPage = Math.max(0, Math.min(newPage, totalPages - 1));
    setCurrentPage(clampedPage);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers para mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (!scrollRef.current) return;
    
    const cardWidth = scrollRef.current.offsetWidth;
    const newPage = Math.round(scrollRef.current.scrollLeft / cardWidth);
    const clampedPage = Math.max(0, Math.min(newPage, totalPages - 1));
    setCurrentPage(clampedPage);
  };

  // Sincronizar scroll com página atual
  useEffect(() => {
    if (scrollRef.current && !isDragging) {
      const cardWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollLeft = currentPage * cardWidth;
    }
  }, [currentPage, isDragging]);

  const calculateUsagePercentage = (current: number, limit?: number): number => {
    if (!limit || limit === 0) return 0;
    return Math.round((current / limit) * 100);
  };

  const getCardColor = (index: number): string => {
    const colors = ['bg-gray-900', 'bg-primary', 'bg-white border-2 border-gray-300'];
    return colors[index % colors.length];
  };

  const getTextColor = (bgColor: string): string => {
    if (bgColor.includes('gray-900')) return 'text-white';
    if (bgColor.includes('primary')) return 'text-white';
    return 'text-gray-900';
  };

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
          <CardIcon />
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{t('dashboard.creditCards')}</h3>
        </div>

        <button
          onClick={onAddCard}
          className="
            w-10 h-10 rounded-full
            border border-gray-200 dark:border-gray-600
            bg-white dark:bg-gray-700
            flex items-center justify-center
            hover:bg-gray-50 dark:hover:bg-gray-600
            transition-colors duration-200
            text-gray-700 dark:text-gray-300
          "
        >
          <PlusIcon />
        </button>
      </div>

      {/* Cards List */}
      <div className="flex-1 flex flex-col">
        {activeCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
              <CreditCardIcon />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{t('cards.noCards')}</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">{t('dashboard.clickToAdd') || 'Clique no botão + para adicionar'}</p>
          </div>
        ) : (
          <>
            {/* Scroll Container */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-x-auto overflow-y-hidden relative cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <div 
                className="flex h-full"
                style={{ 
                  width: `${totalPages * 100}%`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease-in-out'
                }}
              >
                {activeCards.map((card, index) => {
                  const usage = calculateUsagePercentage(card.currentBalance, card.limit);
                  const bgColor = getCardColor(index);
                  const textColor = getTextColor(bgColor);
                  const availableLimit = (card.limit || 0) - card.currentBalance;

                  return (
                    <div
                      key={card.id}
                      className="flex-shrink-0 px-1"
                      style={{ width: `${100 / totalPages}%` }}
                    >
                      <div
                        onClick={() => navigate(`/cartoes/${card.id}`)}
                        className="
                          p-4 rounded-lg bg-white dark:bg-gray-700 shadow-sm
                          hover:-translate-y-1 hover:shadow-md
                          transition-all duration-200
                          cursor-pointer
                          flex items-center gap-4
                          h-full
                        "
                      >
                        {/* Icon */}
                        <div className={`
                          w-12 h-12 rounded-lg ${bgColor} ${textColor}
                          flex items-center justify-center flex-shrink-0
                        `}>
                          <CreditCardIcon />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{card.name}</p>
                          <div className="space-y-1">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Saldo disponível</p>
                              <p className="text-lg font-bold text-green-700 dark:text-green-400">
                                {formatCurrency(availableLimit)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Saldo gasto</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {formatCurrency(card.currentBalance)}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            •••• {card.lastFourDigits}
                          </p>
                        </div>

                        {/* Usage Badge */}
                        <div className={`
                          px-3 py-1 rounded-full text-sm font-semibold
                          ${usage > 80 ? 'bg-error-light dark:bg-error/20 text-error-dark dark:text-error' : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}
                        `}>
                          {usage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <style>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
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
          </>
        )}
      </div>
    </div>
  );
}
