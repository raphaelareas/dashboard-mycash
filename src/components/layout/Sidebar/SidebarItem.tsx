import { Link, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface SidebarItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  isCollapsed: boolean;
  disabled?: boolean;
}

export function SidebarItem({ to, icon, label, isCollapsed, disabled = false }: SidebarItemProps) {
  const location = useLocation();
  const isActive = !disabled && (location.pathname === to || (to !== '/' && location.pathname.startsWith(to)));

  // Estados conforme Figma:
  // Default: sem fundo, ícone e texto em preto
  // Hover: fundo cinza claro (oval)
  // Active: fundo verde-limão (primary), ícone e texto em preto
  // Disabled: fundo cinza claro, ícone e texto em cinza claro

  const getButtonClasses = () => {
    if (disabled) {
      // Disabled: fundo cinza claro, ícone e texto em cinza claro
      return 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed';
    }

    if (isActive) {
      // Active: fundo verde-limão (primary), ícone e texto em preto
      return 'bg-primary text-gray-900 dark:text-gray-900';
    }

    // Default: sem fundo, ícone e texto em preto/cinza escuro
    // Hover será aplicado via grupo
    return 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700';
  };

  const content = (
    <div
      className={`
        flex items-center py-3 rounded-[40px] min-w-0
        transition-all duration-200 ease-in-out
        ${getButtonClasses()}
        ${isCollapsed ? 'justify-center px-2 gap-0' : 'px-4 gap-3'}
      `}
    >
      <span className="flex-shrink-0">
        {icon}
      </span>
      {!isCollapsed && (
        <span className="font-medium truncate">{label}</span>
      )}
    </div>
  );

  if (disabled) {
    return (
      <div className="relative group">
        {content}
      </div>
    );
  }

  return (
    <div className="relative group min-w-0 max-w-full">
      <Link to={to} className="min-w-0 max-w-full">
        {content}
      </Link>
      
      {/* Tooltip quando colapsado */}
      {isCollapsed && (
        <div className="
          absolute left-full ml-2 px-3 py-2 
          bg-gray-900 text-white text-sm rounded-md
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-opacity duration-200 delay-300
          whitespace-nowrap z-50
          pointer-events-none
        ">
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
        </div>
      )}
    </div>
  );
}
