import { useEffect, useState } from 'react';

interface SuccessToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function SuccessToast({ 
  message, 
  isVisible, 
  onClose, 
  duration = 4000
}: SuccessToastProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (isVisible && !isFadingOut) {
      // Iniciar fade out antes de fechar
      const fadeOutTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, duration - 600); // Começar fade out 600ms antes do fim

      // Fechar completamente após fade out
      const closeTimer = setTimeout(() => {
        onClose();
        setIsFadingOut(false);
      }, duration);

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [isVisible, duration, onClose, isFadingOut]);

  // Reset fade out quando toast é mostrado novamente
  useEffect(() => {
    if (isVisible) {
      setIsFadingOut(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] ${
        isFadingOut ? 'animate-fade-out' : 'animate-fade-in'
      }`}
      style={{ 
        animationDuration: '600ms'
      }}
    >
      <div className="
        px-6 py-4 rounded-lg
        bg-green-50 border border-green-200
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
            stroke="#10B981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 10L9 12L13 8"
            stroke="#10B981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-sm font-medium flex-1 text-green-800">{message}</p>
      </div>
    </div>
  );
}
