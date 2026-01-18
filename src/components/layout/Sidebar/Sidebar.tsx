import { useSidebar } from '@/contexts/SidebarContext';
import { SidebarItem } from './SidebarItem';
import { Logo } from './Logo';

// Ícones SVG simples - serão substituídos por biblioteca de ícones depois
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 10L10 3L17 10M5 10V16.5H7.5V13.5C7.5 12.6716 8.17157 12 9 12H11C11.8284 12 12.5 12.6716 12.5 13.5V16.5H15V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CardsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M2 8H18" stroke="currentColor" strokeWidth="2"/>
    <circle cx="5" cy="12" r="1" fill="currentColor"/>
    <circle cx="8" cy="12" r="1" fill="currentColor"/>
  </svg>
);

const TransactionsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6H16M4 10H16M4 14H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M5 17C5 13.6863 7.68629 11 11 11H9C12.3137 11 15 13.6863 15 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const GoalsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2L12.5 7.5L18.5 8.5L14.5 12.5L15.5 18.5L10 15.5L4.5 18.5L5.5 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function Sidebar() {
  const { isExpanded, isDesktop, toggle } = useSidebar();

  // Não renderizar em mobile/tablet
  if (!isDesktop) {
    return null;
  }

  const sidebarWidth = isExpanded ? '280px' : '80px';

  return (
    <>
      <aside
        className="
          fixed left-0 top-0 h-screen 
          bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          flex flex-col z-40
          transition-all duration-300 ease-in-out
        "
        style={{ width: sidebarWidth }}
      >
        {/* Header com Logo - mesma altura da barra fixa */}
        <div className="relative flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700 h-20">
          <Logo isExpanded={isExpanded} />
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 pt-8">
          <div className="flex flex-col gap-3">
            <SidebarItem 
              to="/" 
              icon={<HomeIcon />} 
              label="Home" 
              isCollapsed={!isExpanded}
            />
            <SidebarItem 
              to="/cartoes" 
              icon={<CardsIcon />} 
              label="Cartões" 
              isCollapsed={!isExpanded}
            />
            <SidebarItem 
              to="/transacoes" 
              icon={<TransactionsIcon />} 
              label="Transações" 
              isCollapsed={!isExpanded}
            />
            <SidebarItem 
              to="/metas" 
              icon={<GoalsIcon />} 
              label="Metas" 
              isCollapsed={!isExpanded}
            />
            <SidebarItem 
              to="/perfil" 
              icon={<ProfileIcon />} 
              label="Perfil" 
              isCollapsed={!isExpanded}
            />
          </div>
        </nav>

        {/* Perfil do usuário */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {isExpanded ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">Raphael A.</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">raphaelareas@gmail.com</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
            </div>
          )}
        </div>

        {/* Botão de toggle - centralizado verticalmente no header da logo */}
        <button
          onClick={toggle}
          className="
            absolute -right-4
            w-8 h-8 rounded-full
            bg-white border-2 border-gray-200
            flex items-center justify-center
            shadow-md hover:shadow-lg
            transition-shadow duration-200
            z-50
          "
          style={{ top: '40px', transform: 'translateY(-50%)' }}
          aria-label={isExpanded ? 'Colapsar sidebar' : 'Expandir sidebar'}
        >
          {isExpanded ? (
            <ChevronLeftIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </button>
      </aside>

    </>
  );
}
