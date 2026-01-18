import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';

interface FiltersMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function FiltersMobileModal({ isOpen, onClose }: FiltersMobileModalProps) {
  const { transactionType, selectedMember, dateRange, setTransactionType, setSelectedMember, setDateRange, familyMembers } = useFinance();

  // Estados temporários (não aplicados até clicar em "Aplicar")
  const [tempType, setTempType] = useState<'all' | 'income' | 'expense'>(transactionType);
  const [tempMember, setTempMember] = useState<string | null>(selectedMember);
  const [currentMonth, setCurrentMonth] = useState(new Date(dateRange.startDate));
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(dateRange.startDate);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(dateRange.endDate);

  const handleApply = () => {
    setTransactionType(tempType);
    setSelectedMember(tempMember);
    
    if (selectedStartDate && selectedEndDate) {
      setDateRange({
        startDate: selectedStartDate,
        endDate: selectedEndDate,
      });
    }

    onClose();
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Novo intervalo
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else if (selectedStartDate && !selectedEndDate) {
      // Completar intervalo
      if (date < selectedStartDate) {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
      } else {
        setSelectedEndDate(date);
      }
    }
  };

  const isDateInRange = (day: number): boolean => {
    if (!selectedStartDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (selectedStartDate && selectedEndDate) {
      return date >= selectedStartDate && date <= selectedEndDate;
    }
    
    return date.getTime() === selectedStartDate.getTime();
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex flex-col lg:hidden animate-slide-in-from-top">
        {/* Header Fixo */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="flex-1 overflow-y-auto bg-white p-4 space-y-6">
          {/* Tipo de Transação */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Tipo de Transação
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['all', 'income', 'expense'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTempType(type)}
                  className={`
                    h-12 rounded-lg font-semibold transition-all
                    ${tempType === type
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-200 text-gray-600'
                    }
                  `}
                >
                  {type === 'all' ? 'Todos' : type === 'income' ? 'Receitas' : 'Despesas'}
                </button>
              ))}
            </div>
          </div>

          {/* Membro da Família */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Membro da Família
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTempMember(null)}
                className={`
                  h-12 px-4 rounded-full font-semibold transition-all
                  ${!tempMember
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-600'
                  }
                `}
              >
                Todos
              </button>
              {familyMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setTempMember(member.id)}
                  className={`
                    h-12 px-4 rounded-full font-semibold transition-all flex items-center gap-2
                    ${tempMember === member.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-200 text-gray-600'
                    }
                  `}
                >
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                  )}
                  <span>{member.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Período - Calendário Simplificado */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Período
            </label>
            
            <div className="border border-gray-200 rounded-lg p-4">
              {/* Navegação do Mês */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setMonth(newMonth.getMonth() - 1);
                    setCurrentMonth(newMonth);
                  }}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <ChevronLeftIcon />
                </button>
                <h3 className="font-semibold text-gray-900">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                  onClick={() => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setMonth(newMonth.getMonth() + 1);
                    setCurrentMonth(newMonth);
                  }}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <ChevronRightIcon />
                </button>
              </div>

              {/* Grid do Calendário */}
              <div className="grid grid-cols-7 gap-1">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const isSelected = isDateInRange(day);
                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={`
                        aspect-square rounded-lg text-sm font-medium transition-all
                        ${isSelected
                          ? 'bg-gray-900 text-white'
                          : 'hover:bg-gray-100 text-gray-900'
                        }
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Fixo */}
        <div className="bg-white border-t border-gray-200 p-4">
          <button
            onClick={handleApply}
            className="w-full h-14 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </>
  );
}
