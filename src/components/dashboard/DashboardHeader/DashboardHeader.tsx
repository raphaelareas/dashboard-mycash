import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { formatDateShort } from '@/utils/formatDateShort';
import { NewTransactionModal } from '@/components/modals/NewTransactionModal';
import { FiltersMobileModal } from '@/components/modals/FiltersMobileModal';
import { AddMemberModal } from '@/components/modals/AddMemberModal';

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2"/>
    <path d="M15 15L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 5H17M5 10H15M7 15H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M3 9H17M6 3V7M14 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function DashboardHeader() {
  const { searchText, setSearchText, dateRange, familyMembers, selectedMember, setSelectedMember } = useFinance();
  const { isDesktop, isExpanded } = useSidebar();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const formatPeriod = () => {
    return `${formatDateShort(dateRange.startDate)} - ${formatDateShort(dateRange.endDate)}`;
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" style={{ marginLeft: isDesktop ? (isExpanded ? '280px' : '80px') : '0' }}>
        <div className="w-full px-4 md:px-6 lg:px-8 h-20 flex items-center">
          {/* Barra dividida em 2 blocos: Esquerda (Pesquisa + Filtros + Data + Membros) | Direita (Nova Transação) */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center w-full">
          {/* BLOCO ESQUERDO: Pesquisa + Filtros + Date Picker + Membros */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full items-start sm:items-center">
            {/* Campo de Busca - Fill Container - Ícone dentro do input */}
            <div className="relative flex-1 w-full min-w-0">
              <div className="flex items-center gap-2 pl-3 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-[40px] bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary">
                <div className="text-gray-400 flex-shrink-0 pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent border-0 outline-none p-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 [&::-webkit-input-placeholder]:opacity-100"
                  style={{ border: 'none', borderRadius: 0, padding: 0 }}
                />
              </div>
            </div>

            {/* Botão Filtros */}
            <button
              onClick={() => setIsFiltersOpen(true)}
              className="flex-shrink-0 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-[40px] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 whitespace-nowrap"
            >
              <FilterIcon />
              <span>Filtros</span>
            </button>

            {/* Date Picker */}
            <div className="relative flex-shrink-0">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                <CalendarIcon />
              </div>
              <button className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-[40px] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-left min-w-[200px]">
                <span className="text-sm text-gray-700 dark:text-gray-300">{formatPeriod()}</span>
                <ChevronDownIcon />
              </button>
            </div>

            {/* Widget Membros da Família - avatares em linha (apenas desktop) */}
            {isDesktop && (
              <>
                {familyMembers.length > 0 ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {familyMembers.map((member) => {
                      const isSelected = selectedMember === member.id;
                      return (
                        <button
                          key={member.id}
                          onClick={() => setSelectedMember(isSelected ? null : member.id)}
                          className={`
                            w-8 h-8 rounded-full border-2 transition-colors overflow-hidden
                            ${isSelected 
                              ? 'border-primary ring-2 ring-primary ring-offset-2' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary'
                            }
                          `}
                          title={member.name}
                          aria-label={`Filtrar por ${member.name}`}
                        >
                          {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </button>
                      );
                    })}
                    {/* Botão adicionar membro */}
                    <button 
                      onClick={() => setIsAddMemberOpen(true)}
                      className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
                      title="Adicionar membro da família"
                    >
                      <span className="text-lg">+</span>
                    </button>
                  </div>
                ) : (
                  /* Empty state - botão para adicionar membros (outline) */
                  <button
                    onClick={() => setIsAddMemberOpen(true)}
                    className="flex-shrink-0 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-[40px] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 whitespace-nowrap"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>Adicionar membros</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* BLOCO DIREITO: Botão Nova Transação (fixo à direita) */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <button
              onClick={() => setIsNewTransactionOpen(true)}
              className="w-full lg:w-auto pl-4 pr-6 py-2 bg-gray-900 dark:bg-primary text-white dark:text-gray-900 rounded-[40px] hover:bg-gray-800 dark:hover:bg-lime-600 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>+</span>
              <span>Nova Transação</span>
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Modals */}
      <NewTransactionModal isOpen={isNewTransactionOpen} onClose={() => setIsNewTransactionOpen(false)} />
      <FiltersMobileModal isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} />
      <AddMemberModal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} />
    </>
  );
}
