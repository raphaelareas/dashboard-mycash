import { useState, useEffect, useRef } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isSameMonth,
  setMonth,
  setYear,
} from 'date-fns';
import { useI18n } from '@/contexts/I18nContext';
import { useDateFormat } from '@/hooks/useDateFormat';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-700">
    <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-700">
    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-500">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
    <path d="M6 2V4M14 2V4M3 6H17M4 4H16C17.1046 4 18 4.89543 18 6V16C18 17.1046 17.1046 18 16 18H4C2.89543 18 2 17.1046 2 16V6C2 4.89543 2.89543 4 4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function DatePicker({ value, onChange, placeholder, className = '', error }: DatePickerProps) {
  const { t } = useI18n();
  const {
    formatForDisplay,
    formatMonthYear,
    locale,
  } = useDateFormat();

  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(value ? new Date(value) : new Date());
  const [tempSelected, setTempSelected] = useState<Date | null>(value);
  const [isMonthYearDropdownOpen, setIsMonthYearDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const monthYearDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setViewMonth(new Date(value));
      setTempSelected(new Date(value));
    } else {
      const today = new Date();
      setViewMonth(today);
      setTempSelected(null);
    }
  }, [value, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (monthYearDropdownRef.current && !monthYearDropdownRef.current.contains(e.target as Node)) {
        setIsMonthYearDropdownOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMonthYearDropdownOpen]);

  const gridStart = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // Gerar letras iniciais dos dias da semana baseado no locale
  const getWeekdayLetters = (): string[] => {
    const weekdays: string[] = [];
    // Começar no domingo (0) e ir até sábado (6)
    for (let i = 0; i < 7; i++) {
      const date = new Date(2024, 0, 7 + i); // 7 de janeiro de 2024 é domingo
      const letter = format(date, 'EEEEE', { locale }); // 'EEEEE' retorna apenas a primeira letra
      weekdays.push(letter.toUpperCase());
    }
    return weekdays;
  };

  const weekdayLetters = getWeekdayLetters();

  const handleClear = () => {
    setTempSelected(null);
    onChange(null);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempSelected(value);
    setViewMonth(value ? new Date(value) : new Date());
    setIsOpen(false);
  };

  const handleOk = () => {
    if (tempSelected) onChange(tempSelected);
    setIsOpen(false);
  };

  const displayLabel = value ? formatForDisplay(value) : placeholder ?? t('datePicker.selectDate');

  // Meses e anos para o dropdown
  const currentYear = viewMonth.getFullYear();
  const currentMonth = viewMonth.getMonth();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  const handleMonthChange = (month: number) => {
    setViewMonth(setMonth(viewMonth, month));
    setIsMonthYearDropdownOpen(false);
  };

  const handleYearChange = (year: number) => {
    setViewMonth(setYear(viewMonth, year));
    setIsMonthYearDropdownOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full h-14 px-4 rounded-[40px] border text-left bg-white
          flex items-center justify-between gap-2
          focus:outline-none focus:ring-2 focus:ring-primary
          appearance-none cursor-pointer
          ${error ? 'border-red-500' : 'border-gray-200'}
        `}
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'none',
        }}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>{displayLabel}</span>
        <CalendarIcon />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 z-50 w-[320px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in"
          style={{ minWidth: '320px' }}
        >
          {/* Month/Year + arrows */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
            <div className="relative" ref={monthYearDropdownRef}>
              <button
                type="button"
                onClick={() => setIsMonthYearDropdownOpen(!isMonthYearDropdownOpen)}
                className="flex items-center gap-1 text-gray-700 font-medium hover:text-gray-900"
              >
                <span className="capitalize">{formatMonthYear(viewMonth)}</span>
                <ChevronDownIcon />
              </button>
              {isMonthYearDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50" style={{ minWidth: '320px' }}>
                  <div className="flex items-end justify-between gap-2 p-4">
                    <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                      <label className="block text-xs font-medium text-gray-500 mb-2">
                        {t('datePicker.month')}
                      </label>
                      <select
                        value={currentMonth}
                        onChange={(e) => handleMonthChange(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{ width: 'calc(100% - 24px)' }}
                      >
                        {months.map((month) => (
                          <option key={month} value={month}>
                            {format(new Date(2024, month, 1), 'MMMM', { locale })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: '0 0 auto', width: '80px' }}>
                      <label className="block text-xs font-medium text-gray-500 mb-2">
                        {t('datePicker.year')}
                      </label>
                      <select
                        value={currentYear}
                        onChange={(e) => handleYearChange(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMonth((m) => subMonths(m, 1))}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                aria-label="Previous month"
              >
                <ChevronLeftIcon />
              </button>
              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                aria-label="Next month"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>

          {/* Weekday row + calendar grid */}
          <div className="px-4 pt-3 pb-4">
            <div className="grid grid-cols-7 gap-1 justify-items-center">
              {weekdayLetters.map((letter, i) => (
                <div key={i} className="w-9 h-9 flex items-center justify-center text-xs font-medium text-gray-500">
                  {letter}
                </div>
              ))}
              {days.map((day) => {
                const sameMonth = isSameMonth(day, viewMonth);
                const selected = tempSelected && isSameDay(day, tempSelected);
                const today = isToday(day);
                return (
                  <button
                    key={day.getTime()}
                    type="button"
                    onClick={() => setTempSelected(day)}
                    className={`
                      w-9 h-9 rounded-full text-sm font-medium
                      flex items-center justify-center
                      ${!sameMonth ? 'text-gray-300' : 'text-gray-900'}
                      ${selected ? 'bg-[#3DCE8F] text-white' : ''}
                      ${!selected && today ? 'ring-1 ring-[#3DCE8F] ring-offset-1' : ''}
                      ${!selected && !today && sameMonth ? 'hover:bg-gray-100' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer: Clear | Cancel | OK */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between gap-2 bg-gray-50">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm font-medium text-[#3DCE8F] hover:underline"
            >
              {t('common.clear')}
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm font-medium text-[#3DCE8F] hover:underline"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleOk}
                className="text-sm font-medium text-[#3DCE8F] hover:underline"
              >
                {t('common.ok')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
