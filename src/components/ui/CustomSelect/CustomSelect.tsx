import { useState, useRef, useEffect } from 'react';

export interface CustomSelectOption {
  value: string;
  label: string;
  avatar?: string;
  color?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  className = '',
  error = false,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getInitials = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full h-14 px-4 rounded-[40px] border text-left flex items-center gap-3 bg-white
          ${error ? 'border-red-500' : 'border-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-primary
          ${isOpen ? 'ring-2 ring-primary' : ''}
        `}
      >
        {selectedOption ? (
          <>
            {selectedOption.avatar ? (
              <img
                src={selectedOption.avatar}
                alt={selectedOption.label}
                className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
              />
            ) : selectedOption.color ? (
              <div
                className="w-6 h-6 rounded-lg flex-shrink-0 border border-gray-200"
                style={{ backgroundColor: selectedOption.color }}
              />
            ) : selectedOption.icon ? (
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                {selectedOption.icon}
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium flex-shrink-0">
                {getInitials(selectedOption.label)}
              </div>
            )}
            <span className="flex-1 truncate">{selectedOption.label}</span>
          </>
        ) : (
          <span className="flex-1 text-gray-500">{placeholder}</span>
        )}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left
                ${value === option.value ? 'bg-gray-50' : ''}
              `}
            >
              {option.avatar ? (
                <img
                  src={option.avatar}
                  alt={option.label}
                  className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
                />
              ) : option.color ? (
                <div
                  className="w-6 h-6 rounded-lg flex-shrink-0 border border-gray-200"
                  style={{ backgroundColor: option.color }}
                />
              ) : option.icon ? (
                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                  {option.icon}
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium flex-shrink-0">
                  {getInitials(option.label)}
                </div>
              )}
              <span className="flex-1 truncate">{option.label}</span>
              {value === option.value && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                  <path d="M13 4L6 11L3 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
