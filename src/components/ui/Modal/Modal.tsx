import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  fullScreen?: boolean;
}

export function Modal({ isOpen, onClose, children, fullScreen = false }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`
        fixed inset-0 z-50
        flex items-center justify-center
        p-4
        ${fullScreen ? 'p-0' : ''}
      `}>
        <div
          className={`
            bg-white rounded-lg shadow-xl
            w-full max-w-2xl max-h-[90vh]
            flex flex-col
            ${fullScreen ? 'w-full h-full max-w-none max-h-none rounded-none' : ''}
            animate-slide-in-from-top
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  );
}
