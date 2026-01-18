import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isExpanded: boolean;
  isDesktop: boolean;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      const desktop = window.innerWidth >= 1280;
      setIsDesktop(desktop);
      // Em mobile/tablet, sempre colapsado
      if (!desktop) {
        setIsExpanded(false);
      }
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);

    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const toggle = () => {
    setIsExpanded((prev) => !prev);
  };

  const collapse = () => {
    setIsExpanded(false);
  };

  const expand = () => {
    setIsExpanded(true);
  };

  return (
    <SidebarContext.Provider value={{ isExpanded, isDesktop, toggle, collapse, expand }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
