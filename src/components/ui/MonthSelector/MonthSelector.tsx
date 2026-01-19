import { useI18n } from '@/contexts/I18nContext';

interface MonthSelectorProps {
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
}

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function MonthSelector({ currentMonth, onMonthChange }: MonthSelectorProps) {
  const { t } = useI18n();

  const monthNames = [
    t('common.months.january'),
    t('common.months.february'),
    t('common.months.march'),
    t('common.months.april'),
    t('common.months.may'),
    t('common.months.june'),
    t('common.months.july'),
    t('common.months.august'),
    t('common.months.september'),
    t('common.months.october'),
    t('common.months.november'),
    t('common.months.december'),
  ];

  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    onMonthChange(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    onMonthChange(newMonth);
  };

  const monthName = monthNames[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePreviousMonth}
        className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 transition-colors"
        aria-label="Mês anterior"
      >
        <ChevronLeftIcon />
      </button>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px] text-center">
        {monthName} {year}
      </span>
      <button
        onClick={handleNextMonth}
        className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 transition-colors"
        aria-label="Próximo mês"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}
