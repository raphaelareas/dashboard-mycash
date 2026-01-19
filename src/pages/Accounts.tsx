import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { formatCurrency } from '@/utils/formatCurrency';
// import { BankAccount } from '@/types';
import { AddAccountModal } from '@/components/modals/AddAccountModal';

const BankAccountIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M2 10H22M6 14H18" stroke="currentColor" strokeWidth="2"/>
    <circle cx="7" cy="16" r="1" fill="currentColor"/>
    <circle cx="17" cy="16" r="1" fill="currentColor"/>
  </svg>
);

export default function Accounts() {
  const { bankAccounts } = useFinance();
  const { t } = useI18n();
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  const sortedAccounts = [...bankAccounts.filter(a => a.isActive)].sort((a, b) => 
    b.balance - a.balance
  );

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
                  {/* Nome da Conta */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{account.name}</h3>
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

                  {/* Status */}
                  <div className="pt-4 border-t border-gray-100">
                    <span className={`text-xs px-2 py-1 rounded-full ${account.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {account.isActive ? t('accounts.active') : t('accounts.inactive')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Adicionar Conta */}
      <AddAccountModal isOpen={isAddAccountOpen} onClose={() => setIsAddAccountOpen(false)} />
    </>
  );
}