import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useI18n } from '@/contexts/I18nContext';
import { Transaction } from '@/types';

interface DeleteTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  onDelete: (scope: 'current' | 'currentAndFuture' | 'all') => Promise<void>;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 11V17M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function DeleteTransactionModal({ isOpen, onClose, transaction, onDelete }: DeleteTransactionModalProps) {
  const { t } = useI18n();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteScope, setDeleteScope] = useState<'current' | 'currentAndFuture' | 'all'>('current');

  // Verificar se é parcela única ou parcelada
  const isSingle = !transaction.installments || transaction.installments <= 1 || transaction.installments >= 999;
  const isFixed = transaction.installments && transaction.installments >= 999;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(isSingle ? 'current' : deleteScope);
      onClose();
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-[16px]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <TrashIcon className="text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('modals.deleteTransaction.title') || 'Deletar Transação'}
            </h2>
            <p className="text-sm text-gray-600">
              {t('modals.deleteTransaction.subtitle') || 'Esta ação não pode ser desfeita'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {isSingle ? (
          // Parcela única - confirmação simples
          <div className="space-y-4">
            <p className="text-gray-900">
              {t('modals.deleteTransaction.confirmSingle', { description: transaction.description }) || 
               `Você tem certeza que deseja deletar "${transaction.description}"?`}
            </p>
          </div>
        ) : (
          // Parcela parcelada ou fixa - opções de escopo
          <div className="space-y-6">
            <p className="text-gray-900">
              {t('modals.deleteTransaction.confirmInstallment', { description: transaction.description }) || 
               `Você tem certeza que deseja deletar "${transaction.description}"?`}
            </p>
            
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="deleteScope"
                  value="current"
                  checked={deleteScope === 'current'}
                  onChange={() => setDeleteScope('current')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {t('modals.deleteTransaction.currentOnly') || 'Deletar apenas esta transação'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {isFixed 
                      ? (t('modals.deleteTransaction.currentOnlyFixed') || 'Remove apenas esta ocorrência da despesa fixa')
                      : (t('modals.deleteTransaction.currentOnlyInstallment', { 
                          installmentNumber: String(transaction.installmentNumber || 1), 
                          totalInstallments: String(transaction.installments || 1) 
                        }) || `Remove apenas a parcela ${transaction.installmentNumber}/${transaction.installments}`)
                    }
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="deleteScope"
                  value="currentAndFuture"
                  checked={deleteScope === 'currentAndFuture'}
                  onChange={() => setDeleteScope('currentAndFuture')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {t('modals.deleteTransaction.currentAndFuture') || 'Deletar esta e as próximas'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {isFixed 
                      ? (t('modals.deleteTransaction.currentAndFutureFixed') || 'Remove esta e todas as ocorrências futuras da despesa fixa')
                      : (t('modals.deleteTransaction.currentAndFutureInstallment') || `Remove a parcela ${transaction.installmentNumber}/${transaction.installments} e todas as posteriores`)
                    }
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="deleteScope"
                  value="all"
                  checked={deleteScope === 'all'}
                  onChange={() => setDeleteScope('all')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {t('modals.deleteTransaction.all') || 'Deletar todas'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {isFixed 
                      ? (t('modals.deleteTransaction.allFixed') || 'Remove todas as ocorrências desta despesa fixa')
                      : (t('modals.deleteTransaction.allInstallment', { 
                          totalInstallments: String(transaction.installments || 1) 
                        }) || `Remove todas as ${transaction.installments} parcelas`)
                    }
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 rounded-b-[16px]">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="px-6 py-3 rounded-[40px] border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-8 py-3 rounded-[40px] bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting 
            ? (t('common.deleting') || 'Deletando...')
            : (t('common.delete') || 'Deletar')
          }
        </button>
      </div>
    </Modal>
  );
}
