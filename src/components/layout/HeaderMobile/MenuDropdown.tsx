import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// Ícones SVG simples
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

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface MenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { to: '/', icon: <HomeIcon />, label: 'Home' },
  { to: '/cartoes', icon: <CardsIcon />, label: 'Cartões' },
  { to: '/transacoes', icon: <TransactionsIcon />, label: 'Transações' },
  { to: '/metas', icon: <GoalsIcon />, label: 'Metas' },
  { to: '/perfil', icon: <ProfileIcon />, label: 'Perfil' },
];

export function MenuDropdown({ isOpen, onClose }: MenuDropdownProps) {
  const location = useLocation();

  // Fechar ao clicar fora
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-menu-dropdown]')) {
        onClose();
      }
    };

    // Delay para evitar fechar imediatamente ao abrir
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay escuro */}
      <div
        className="
          fixed inset-0 bg-black/50
          z-40 lg:hidden
          animate-fade-in
        "
        onClick={onClose}
      />

      {/* Menu Dropdown */}
      <div
        data-menu-dropdown
        className="
          fixed top-16 left-0 right-0
          bg-white dark:bg-gray-800 
          border-b border-gray-200 dark:border-gray-700
          shadow-lg z-50 lg:hidden
          animate-slide-in-from-top
        "
      >
        {/* Header do menu com botão fechar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            <div>
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">Raphael A.</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">raphaelareas@gmail.com</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="
              w-8 h-8 rounded-full
              flex items-center justify-center
              text-gray-600 dark:text-gray-400 
              hover:bg-gray-100 dark:hover:bg-gray-700
              transition-colors duration-200
            "
            aria-label="Fechar menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Itens de navegação */}
        <nav className="py-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.to || 
                           (item.to !== '/' && location.pathname.startsWith(item.to));

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3
                  transition-colors duration-200
                  ${isActive 
                    ? 'bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className={isActive ? 'text-primary' : ''}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Botão Sair */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            className="
              w-full flex items-center justify-center gap-2
              px-4 py-3 rounded-lg
              bg-error text-white
              font-medium
              hover:bg-error-dark
              transition-colors duration-200
            "
            onClick={onClose}
          >
            Sair
          </button>
        </div>
      </div>
    </>
  );
}
