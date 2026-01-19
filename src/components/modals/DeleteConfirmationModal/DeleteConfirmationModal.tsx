import { Modal } from '@/components/ui/Modal';
import { useI18n } from '@/contexts/I18nContext';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
}: DeleteConfirmationModalProps) {
  const { t } = useI18n();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 mb-2">{message}</p>
          {itemName && (
            <p className="text-sm text-gray-600 font-medium mt-2">
              <span className="font-semibold">{itemName}</span>
            </p>
          )}
          <p className="text-sm text-red-600 font-semibold mt-4">
            Esta ação é irreversível e não pode ser desfeita.
          </p>
        </div>

        {/* Footer - Botão Cancelar é o principal (à direita) */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleConfirm}
            className="px-6 py-3 rounded-[40px] border border-red-300 text-red-600 hover:bg-red-50 transition-colors font-semibold"
          >
            {t('common.delete') || 'Deletar'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold"
          >
            {t('common.cancel') || 'Cancelar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
