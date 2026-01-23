import { useEffect, useState } from 'react';

interface ErrorToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function ErrorToast({ 
  message, 
  isVisible, 
  onClose, 
  duration = 4000
}: ErrorToastProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [opacity, setOpacity] = useState(0);

  // Controlar renderização e animação de entrada
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Pequeno delay para garantir que o DOM está pronto antes de animar
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setOpacity(1);
        });
      });
    } else {
      setOpacity(0);
      // Aguardar animação de saída antes de remover do DOM
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Timer para fechar automaticamente
  useEffect(() => {
    if (isVisible && opacity === 1) {
      // Iniciar fade out 600ms antes do fim
      const fadeOutTimer = setTimeout(() => {
        setOpacity(0);
      }, duration - 600);

      // Fechar completamente após fade out
      const closeTimer = setTimeout(() => {
        onClose();
      }, duration);

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [isVisible, opacity, duration, onClose]);

  if (!shouldRender) return null;

  return (
    <div 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999]"
      style={{ 
        opacity,
        transform: `translateX(-50%) translateY(${opacity === 1 ? '0' : '-10px'})`,
        transition: 'opacity 600ms ease-in-out, transform 600ms ease-in-out',
        pointerEvents: opacity > 0 ? 'auto' : 'none'
      }}
    >
      <div className="
        px-6 py-4 rounded-lg
        bg-red-50 border border-red-200
        shadow-lg
        flex items-center gap-3
        min-w-[300px] max-w-[500px]
      ">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0"
        >
          <path
            d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 6V10"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 14H10.01"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-sm font-medium flex-1 text-red-800">{message}</p>
      </div>
    </div>
  );
}
