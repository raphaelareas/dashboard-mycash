import { ReactNode } from 'react';
import { Sidebar } from '../Sidebar';
import { HeaderMobile } from '../HeaderMobile';
import { Container } from '../Container';
import { useSidebar } from '@/contexts/SidebarContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isExpanded, isDesktop } = useSidebar();
  const sidebarWidth = isDesktop ? (isExpanded ? '280px' : '80px') : '0px';

  return (
    <div className="min-h-screen w-full bg-bg dark:bg-gray-900">
      {/* Sidebar Desktop - apenas em >= 1280px */}
      <Sidebar />

      {/* Conteúdo principal com margem dinâmica */}
      <div 
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft: isDesktop ? sidebarWidth : '0' }}
      >
        {/* Header Mobile - apenas em < 1280px */}
        <HeaderMobile />

        {/* Container do conteúdo */}
        <Container>
          {children}
        </Container>
      </div>
    </div>
  );
}
