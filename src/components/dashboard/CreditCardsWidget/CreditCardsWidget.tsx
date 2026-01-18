import { useFinance } from '@/contexts/FinanceContext';
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
  onCardClick?: (card: import('@/types').CreditCard) => void;
}

export function CreditCardsWidget({ onAddCard, onCardClick }: CreditCardsWidgetProps) {
  const { creditCards } = useFinance();

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
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Cartões</h3>
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
      <div className="space-y-3 flex-1">
        {creditCards.filter(c => c.isActive).map((card, index) => {
          const usage = calculateUsagePercentage(card.currentBalance, card.limit);
          const bgColor = getCardColor(index);
          const textColor = getTextColor(bgColor);

          return (
            <div
              key={card.id}
              onClick={() => onCardClick?.(card)}
              className="
                p-4 rounded-lg bg-white dark:bg-gray-700 shadow-sm
                hover:-translate-y-1 hover:shadow-md
                transition-all duration-200
                cursor-pointer
                flex items-center gap-4
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
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {formatCurrency(card.currentBalance)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
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
          );
        })}
      </div>
    </div>
  );
}
