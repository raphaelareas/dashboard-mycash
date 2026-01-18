import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryName: string) => void;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export function CreateCategoryModal({ isOpen, onClose, onSave }: CreateCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!categoryName.trim()) {
      setError('Nome da categoria é obrigatório');
      return;
    }

    if (categoryName.trim().length < 2) {
      setError('Nome da categoria deve ter pelo menos 2 caracteres');
      return;
    }

    onSave(categoryName.trim());
    setCategoryName('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setCategoryName('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-[16px]">
        <h2 className="text-xl font-bold text-gray-900">Crie uma nova categoria</h2>
        <button
          onClick={handleClose}
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Categoria
          </label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
              setError('');
            }}
            placeholder="Ex: Academia, Netflix, etc."
            className={`
              w-full h-14 px-4 rounded-lg border
              ${error ? 'border-red-500' : 'border-gray-200'}
              focus:outline-none focus:ring-2 focus:ring-primary
            `}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              }
            }}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 rounded-b-[16px]">
        <button
          onClick={handleClose}
          className="px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold"
        >
          Salvar
        </button>
      </div>
    </Modal>
  );
}
