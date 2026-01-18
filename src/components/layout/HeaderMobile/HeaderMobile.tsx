import { useDrawer } from '@/hooks/useDrawer';
import { MenuDropdown } from './MenuDropdown';

const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12L10 17L19 6" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function HeaderMobile() {
  const { isOpen, toggle, close } = useDrawer();

  return (
    <>
      <header className="
        fixed top-0 left-0 right-0 h-16
        bg-white dark:bg-gray-800 
        border-b border-gray-200 dark:border-gray-700
        flex items-center justify-between px-4
        z-50 lg:hidden
      ">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <LogoIcon />
          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">mycash+</span>
        </div>

        {/* Avatar clicável */}
        <button
          onClick={toggle}
          className="
            w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600
            flex-shrink-0
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          "
          aria-label="Abrir menu"
        >
          {/* Avatar placeholder - será substituído por imagem real */}
        </button>
      </header>

      {/* Menu Dropdown */}
      <MenuDropdown isOpen={isOpen} onClose={close} />
    </>
  );
}
