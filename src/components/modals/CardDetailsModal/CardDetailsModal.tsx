import { useState, useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateShort } from '@/utils/formatDateShort';
import { formatInstallmentDisplay } from '@/utils/installmentUtils';
import { CreditCard } from '@/types';

interface CardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCard | null;
  onAddTransaction?: () => void;
  onEditCard?: (card: CreditCard) => void;
  onDeleteCard?: (cardId: string) => void;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export function CardDetailsModal({ isOpen, onClose, card, onAddTransaction, onEditCard, onDeleteCard }: CardDetailsModalProps) {
  const { transactions } = useFinance();
  const { t } = useI18n();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Obter nomes de categorias via tradução
  const categoryNames: Record<string, string> = {
    rent: t('categories.categoryNames.rent'),
    food: t('categories.categoryNames.food'),
    shopping: t('categories.categoryNames.shopping'),
    household: t('categories.categoryNames.household'),
    transport: t('categories.categoryNames.transport'),
    entertainment: t('categories.categoryNames.entertainment'),
    health: t('categories.categoryNames.health'),
    education: t('categories.categoryNames.education'),
    other: t('categories.categoryNames.other'),
  };
  const itemsPerPage = 10;

  if (!card) return null;

  // Filtrar despesas do cartão
  const cardExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense' && t.accountId === card.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, card.id]);

  const limit = card.limit || 0;
  const usagePercentage = limit > 0 ? (card.currentBalance / limit) * 100 : 0;
  const availableLimit = limit - card.currentBalance;

  // Paginação
  const totalPages = Math.ceil(cardExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = cardExpenses.slice(startIndex, startIndex + itemsPerPage);

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (usagePercentage / 100) * circumference;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-[16px]">
        <h2 className="text-xl font-bold text-gray-900">{card.name}</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
          <CloseIcon />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Informações do Cartão */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('modals.cardDetails.totalLimit')}</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(limit)}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('modals.cardDetails.currentBill')}</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(card.currentBalance)}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('modals.cardDetails.availableLimit')}</p>
            <p className="text-lg font-bold text-green-700">{formatCurrency(availableLimit)}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('modals.cardDetails.usage')}</p>
            <p className="text-lg font-bold text-gray-900">{usagePercentage.toFixed(1)}%</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('modals.cardDetails.closeDay')}</p>
            <p className="text-lg font-bold text-gray-900">{t('common.day')} {card.dueDay}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('modals.cardDetails.lastFourDigits') || 'Últimos 4 Dígitos'}</p>
            <p className="text-lg font-bold text-gray-900">•••• {card.lastFourDigits}</p>
          </div>
        </div>

        {/* Gráfico Donut */}
        <div className="flex justify-center py-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--gray-100)"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--lime-500)"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">
                {usagePercentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Tabela de Despesas */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t('modals.cardDetails.recentTransactions')}</h3>

          {cardExpenses.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              {t('modals.cardDetails.noTransactions')}
            </div>
          ) : (
            <>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 grid grid-cols-12 gap-4 px-4 py-3 text-sm font-semibold text-gray-600">
                  <div className="col-span-2">{t('transactions.date')}</div>
                  <div className="col-span-4">{t('transactions.description')}</div>
                  <div className="col-span-3">{t('transactions.category')}</div>
                  <div className="col-span-1">{t('transactions.installments')}</div>
                  <div className="col-span-2 text-right">{t('transactions.value')}</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {paginatedExpenses.map((expense) => (
                    <div key={expense.id} className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50">
                      <div className="col-span-2 text-sm text-gray-600">
                        {formatDateShort(new Date(expense.date))}
                      </div>
                      <div className="col-span-4 font-semibold text-gray-900">{expense.description}</div>
                      <div className="col-span-3">
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                          {categoryNames[expense.category] || expense.category}
                        </span>
                      </div>
                      <div className="col-span-1 text-sm text-gray-600">
                        {(() => {
                          const installmentDisplay = formatInstallmentDisplay(
                            expense.installmentNumber,
                            expense.installments
                          );
                          return installmentDisplay || '-';
                        })()}
                      </div>
                      <div className="col-span-2 text-right font-bold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-[40px] disabled:opacity-50 hover:bg-gray-100"
                  >
                    {t('transactions.previous')}
                  </button>
                  <span className="text-sm text-gray-600">
                    {t('transactions.page')} {currentPage} {t('common.of')} {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-[40px] disabled:opacity-50 hover:bg-gray-100"
                  >
                    {t('transactions.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-white rounded-b-[16px]">
        <button
          onClick={() => onDeleteCard?.(card.id)}
          className="px-4 py-2 rounded-[40px] border border-red-300 text-red-600 hover:bg-red-50 transition-colors font-semibold"
        >
          {t('common.delete') || 'Deletar Cartão'}
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => onEditCard?.(card)}
            className="px-4 py-2 rounded-[40px] border border-gray-200 hover:bg-gray-50"
          >
            {t('modals.cardDetails.edit')}
          </button>
          <button
            onClick={() => onAddTransaction?.()}
            className="px-4 py-2 rounded-[40px] border border-gray-200 hover:bg-gray-50"
          >
            {t('modals.cardDetails.addExpense')}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800"
          >
            {t('modals.cardDetails.close')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
