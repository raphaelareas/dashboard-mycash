import { useState, useEffect } from 'react';

export function useDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => {
    setIsOpen(true);
    // Previne scroll do body quando o menu está aberto
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    setIsOpen(false);
    document.body.style.overflow = 'unset';
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  };

  useEffect(() => {
    return () => {
      // Limpa o overflow ao desmontar
      document.body.style.overflow = 'unset';
    };
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
