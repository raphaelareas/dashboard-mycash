import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { BankAccount } from '@/types';
import { AddAccountModal } from '@/components/modals/AddAccountModal';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';

const BankAccountIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M2 10H22M6 14H18" stroke="currentColor" strokeWidth="2"/>
    <circle cx="7" cy="16" r="1" fill="currentColor"/>
    <circle cx="17" cy="16" r="1" fill="currentColor"/>
  </svg>
);

export default function Accounts() {
  const { bankAccounts, deleteBankAccount } = useFinance();
  const { t } = useI18n();
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

  const sortedAccounts = [...bankAccounts.filter(a => a.isActive)].sort((a, b) => 
    b.balance - a.balance
  );

  const handleDeleteClick = (e: React.MouseEvent, account: BankAccount) => {
    e.stopPropagation();
    setAccountToDelete(account);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;
    try {
      await deleteBankAccount(accountToDelete.id);
      setIsDeleteModalOpen(false);
      setAccountToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      alert('Erro ao deletar conta. Tente novamente.');
    }
  };

  const handleViewDetails = (account: BankAccount) => {
    setSelectedAccount(account);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <div className="w-full py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{t('accounts.title')}</h1>
          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2"
          >
            <span>+</span>
            <span>{t('accounts.newAccount')}</span>
          </button>
        </div>

        {/* Accounts Grid */}
        {sortedAccounts.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <BankAccountIcon />
            </div>
            <h2 className="text-xl font-semibold text-gray-600 mb-4">{t('accounts.noAccounts')}</h2>
            <button
              onClick={() => setIsAddAccountOpen(true)}
              className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800"
            >
              {t('accounts.registerFirstAccount')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAccounts.map((account) => {
              const typeLabel = account.type === 'checking' ? t('accounts.checking') : t('accounts.savings');

              return (
                <div
                  key={account.id}
                  className="
                    p-6 bg-white border border-gray-200 rounded-lg
                    hover:shadow-lg hover:-translate-y-1
                    transition-all duration-200
                  "
                >
                  {/* Nome da Conta e Owner */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{account.name}</h3>
                      {account.holderName && (
                        <p className="text-sm text-gray-600 mt-1">Titular: {account.holderName}</p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {typeLabel}
                    </span>
                  </div>

                  {/* Banco */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">{t('accounts.bank')}</p>
                    <p className="text-base font-semibold text-gray-900">
                      {account.bankName}
                    </p>
                  </div>

                  {/* Saldo */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">{t('accounts.currentBalance')}</p>
                    <p className={`text-3xl font-bold ${account.balance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {formatCurrency(account.balance)}
                    </p>
                  </div>

                  {/* Número da Conta */}
                  {account.accountNumber && (
                    <div className="mb-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 mb-1">{t('accounts.accountNumber')}</p>
                      <p className="text-sm font-mono text-gray-900">
                        {account.accountNumber}
                      </p>
                    </div>
                  )}

                  {/* Agência (se houver) */}
                  {account.agency && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">{t('accounts.agency')}</p>
                      <p className="text-sm font-mono text-gray-900">
                        {account.agency}
                      </p>
                    </div>
                  )}

                  {/* Botões de Ação */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleViewDetails(account)}
                      className="flex-1 px-3 py-2 text-sm rounded-[40px] border border-gray-200 hover:bg-gray-50"
                    >
                      {t('cards.viewDetails') || 'Ver Detalhes'}
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, account)}
                      className="px-3 py-2 text-sm rounded-[40px] border border-red-300 text-red-600 hover:bg-red-50"
                    >
                      {t('common.delete') || 'Deletar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Adicionar Conta */}
      <AddAccountModal isOpen={isAddAccountOpen} onClose={() => setIsAddAccountOpen(false)} />
      
      {/* Modal de Confirmação de Deleção */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAccountToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Deletar Conta Bancária"
        message="Tem certeza que deseja deletar esta conta? Todas as transações associadas a esta conta serão mantidas, mas a conta será removida permanentemente."
        itemName={accountToDelete?.name}
      />
      
      {/* Modal de Detalhes da Conta (simples por enquanto) */}
      {isDetailsOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsDetailsOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedAccount.name}</h2>
              <button onClick={() => setIsDetailsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">{t('accounts.bank')}</p>
                <p className="text-base font-semibold text-gray-900">{selectedAccount.bankName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('accounts.currentBalance')}</p>
                <p className={`text-2xl font-bold ${selectedAccount.balance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {formatCurrency(selectedAccount.balance)}
                </p>
              </div>
              {selectedAccount.holderName && (
                <div>
                  <p className="text-sm text-gray-600">Titular</p>
                  <p className="text-base font-semibold text-gray-900">{selectedAccount.holderName}</p>
                </div>
              )}
              {selectedAccount.accountNumber && (
                <div>
                  <p className="text-sm text-gray-600">{t('accounts.accountNumber')}</p>
                  <p className="text-sm font-mono text-gray-900">{selectedAccount.accountNumber}</p>
                </div>
              )}
              {selectedAccount.agency && (
                <div>
                  <p className="text-sm text-gray-600">{t('accounts.agency')}</p>
                  <p className="text-sm font-mono text-gray-900">{selectedAccount.agency}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}