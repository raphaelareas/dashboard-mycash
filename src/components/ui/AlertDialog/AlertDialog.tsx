import { Modal } from '@/components/ui/Modal';
import { useI18n } from '@/contexts/I18nContext';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'confirm';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  onConfirm,
  confirmText,
  cancelText,
}: AlertDialogProps) {
  const { t } = useI18n();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'confirm':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getIconTextColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'confirm':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-[16px]">
        {title && (
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        )}
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor()}`}>
            {type === 'error' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={getIconTextColor()}>
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {type === 'warning' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={getIconTextColor()}>
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {(type === 'info' || type === 'confirm') && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={getIconTextColor()}>
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>

          {/* Message */}
          <div className="flex-1">
            <p className="text-gray-900">{message}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 rounded-b-[16px]">
        {type === 'confirm' && (
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-[40px] border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {cancelText || t('common.cancel')}
          </button>
        )}
        <button
          onClick={type === 'confirm' ? handleConfirm : onClose}
          className={`px-6 py-3 rounded-[40px] transition-colors font-semibold ${
            type === 'error'
              ? 'bg-red-600 text-white hover:bg-red-700'
              : type === 'warning'
              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {confirmText || (type === 'confirm' ? t('common.confirm') : t('common.ok'))}
        </button>
      </div>
    </Modal>
  );
}
