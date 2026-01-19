import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { NewTransactionModal } from '@/components/modals/NewTransactionModal';
import { FiltersModal } from '@/components/modals/FiltersModal';
import { MonthSelector } from '@/components/ui/MonthSelector';

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


// Função helper para extrair iniciais de nomes completos
// Ex: "Raphael Areas" → "RA", "Bruna Machado" → "BM"
const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  // Pegar primeira letra do primeiro e último nome
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export function DashboardHeader() {
  const { searchText, setSearchText, currentMonth, setCurrentMonth, familyMembers, selectedMember, setSelectedMember, getActiveFiltersCount } = useFinance();
  const { isDesktop, isExpanded } = useSidebar();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  
  const activeFiltersCount = getActiveFiltersCount();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" style={{ marginLeft: isDesktop ? (isExpanded ? '280px' : '80px') : '0' }}>
        <div className="w-full px-4 md:px-6 lg:px-8 h-20 flex items-center">
          {/* Barra dividida em 2 blocos: Esquerda (Pesquisa + Filtros + Data + Membros) | Direita (Nova Transação) */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center w-full">
          {/* BLOCO ESQUERDO: Pesquisa + Seletor de Mês + Filtros + Membros */}
          <div className="flex flex-col sm:flex-row flex-1 w-full items-start sm:items-center" style={{ gap: '16px' }}>
            {/* Campo de Busca - Máximo 600px - Ícone dentro do input */}
            <div className="relative flex-1 w-full min-w-0 max-w-[600px]">
              <div className="flex items-center gap-2 pl-3 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-[40px] bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary">
                <div className="text-gray-400 flex-shrink-0 pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder={t('transactions.search')}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent border-0 outline-none p-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 [&::-webkit-input-placeholder]:opacity-100"
                  style={{ border: 'none', borderRadius: 0, padding: 0 }}
                />
              </div>
            </div>

            {/* Month Selector */}
            <div className="flex-shrink-0">
              <div className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-[40px] bg-white dark:bg-gray-800">
                <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
              </div>
            </div>

            {/* Botão Filtros */}
            <button
              onClick={() => setIsFiltersOpen(true)}
              className="relative flex-shrink-0 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-[40px] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 whitespace-nowrap"
            >
              <FilterIcon />
              <span>{t('dashboard.filters') || 'Filtros'}</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Widget Membros da Família - avatares sobrepostos (apenas desktop, apenas quando há membros) */}
            {isDesktop && familyMembers.length > 0 && (
              <div className="flex items-center flex-shrink-0" style={{ marginLeft: '-10px' }}>
                {familyMembers.map((member, index) => {
                  const isSelected = selectedMember === member.id;
                  return (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(isSelected ? null : member.id)}
                      className={`
                        w-8 h-8 rounded-full border-2 transition-colors overflow-hidden relative
                        ${isSelected 
                          ? 'border-primary ring-2 ring-primary ring-offset-2' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary'
                        }
                      `}
                      style={{ 
                        marginLeft: index > 0 ? '-10px' : '0',
                        zIndex: index + 1 // Da esquerda para direita: fundo (1) → frente (último)
                      }}
                      title={member.name}
                      aria-label={`Filtrar por ${member.name}`}
                    >
                      {member.avatarUrl ? (
                        <div
                          className="w-full h-full rounded-full border overflow-hidden"
                          style={{ borderColor: '#FFFFFF', borderWidth: '1.2px' }}
                        >
                          <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div
                          className="w-full h-full rounded-full border flex items-center justify-center text-xs font-medium"
                          style={{
                            borderColor: '#FFFFFF',
                            borderWidth: '1.2px',
                            backgroundColor: member.color,
                            color: '#111827',
                          }}
                        >
                          {getInitials(member.name)}
                        </div>
                      )}
                    </button>
                  );
                })}
                {/* Botão adicionar membro - navega para People */}
                <button 
                  onClick={() => navigate('/pessoas')}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-primary hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative"
                  style={{ 
                    marginLeft: '-10px',
                    zIndex: familyMembers.length + 1
                  }}
                  title={t('people.addMember')}
                >
                  <span className="text-lg font-semibold">+</span>
                </button>
              </div>
            )}
          </div>

          {/* BLOCO DIREITO: Botão Nova Transação (fixo à direita) */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <button
              onClick={() => setIsNewTransactionOpen(true)}
              className="w-full lg:w-auto pl-4 pr-6 py-2 bg-gray-900 dark:bg-primary text-white dark:text-gray-900 rounded-[40px] hover:bg-gray-800 dark:hover:bg-lime-600 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>+</span>
              <span>{t('transactions.newTransaction')}</span>
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Modals */}
      <NewTransactionModal isOpen={isNewTransactionOpen} onClose={() => setIsNewTransactionOpen(false)} />
      <FiltersModal isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} />
    </>
  );
}
