import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AddAccountModal } from '@/components/modals/AddAccountModal';
import { AddCardModal } from '@/components/modals/AddCardModal';

interface CreateMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'account' | 'card';
  onAccountCreated?: () => void;
  onCardCreated?: () => void;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export function CreateMethodModal({ 
  isOpen, 
  onClose, 
  initialTab = 'account',
  onAccountCreated,
  onCardCreated 
}: CreateMethodModalProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'card'>(initialTab);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleAccountCreated = () => {
    setIsAddAccountModalOpen(false);
    onAccountCreated?.();
    onClose();
  };

  const handleCardCreated = () => {
    setIsAddCardModalOpen(false);
    onCardCreated?.();
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-[16px]">
          <h2 className="text-xl font-bold text-gray-900">Criar novo método</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-[40px]">
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`flex-1 py-2 px-4 rounded-[40px] font-medium transition-colors ${
                activeTab === 'account'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Conta
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className={`flex-1 py-2 px-4 rounded-[40px] font-medium transition-colors ${
                activeTab === 'card'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cartão
            </button>
          </div>

          {/* Botão de criar */}
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'account') {
                setIsAddAccountModalOpen(true);
              } else {
                setIsAddCardModalOpen(true);
              }
            }}
            className="w-full h-14 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold"
          >
            Criar {activeTab === 'account' ? 'conta' : 'cartão'}
          </button>
        </div>
      </Modal>

      {/* Modais de criação */}
      <AddAccountModal
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
        onAccountCreated={handleAccountCreated}
      />
      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        onCardCreated={handleCardCreated}
      />
    </>
  );
}
