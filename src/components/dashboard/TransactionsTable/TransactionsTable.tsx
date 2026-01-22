import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateShort } from '@/utils/formatDateShort';
import { formatInstallmentDisplay } from '@/utils/installmentUtils';
import { Transaction } from '@/types';
import { EditTransactionModal } from '@/components/modals/EditTransactionModal';
import './TransactionsTable.css';

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.trim().replace('#', '');
  const isShort = normalized.length === 3;
  const isFull = normalized.length === 6;
  if (!isShort && !isFull) return `rgba(0, 0, 0, ${alpha})`;

  const full = isShort
    ? normalized
        .split('')
        .map((c) => c + c)
        .join('')
    : normalized;

  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2"/>
    <path d="M15 15L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IncomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2V14M4 6L8 2L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ExpenseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 14V2M4 10L8 14L12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M6 21C6 17.6863 8.68629 15 12 15C15.3137 15 18 17.6863 18 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.333 2.00001C11.5084 1.82465 11.7163 1.68606 11.9447 1.59229C12.1731 1.49852 12.4173 1.45166 12.6637 1.45468C12.9101 1.4577 13.1533 1.51054 13.3788 1.61001C13.6043 1.70948 13.8074 1.85358 13.9773 2.03368C14.1472 2.21378 14.2803 2.42601 14.3691 2.65812C14.4579 2.89023 14.5004 3.13748 14.494 3.38585C14.4876 3.63422 14.4324 3.87888 14.3317 4.10601C14.231 4.33314 14.0869 4.53819 13.9073 4.71001L13.333 5.28334L10.6667 2.61668L11.241 2.04134L11.333 2.00001ZM9.33333 4.00001L2.66667 10.6667V13.3333H5.33333L12 6.66668L9.33333 4.00001Z" fill="currentColor"/>
  </svg>
);

export function TransactionsTable() {
  const { getFilteredTransactions, bankAccounts, creditCards, familyMembers, categories: customCategories } = useFinance();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
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
  const [localType, setLocalType] = useState<'all' | 'income' | 'expense'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Aplicar filtros locais
  const filteredTransactions = useMemo(() => {
    let transactions = getFilteredTransactions();

    // Filtro por tipo local
    if (localType !== 'all') {
      transactions = transactions.filter((t) => t.type === localType);
    }

    // Filtro por busca local
    if (localSearch) {
      const search = localSearch.toLowerCase();
      transactions = transactions.filter(
        (t) =>
          t.description.toLowerCase().includes(search) ||
          categoryNames[t.category]?.toLowerCase().includes(search)
      );
    }

    // Ordenar por data (mais recente primeiro)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return transactions;
  }, [getFilteredTransactions, localType, localSearch]);

  // Paginação
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Resetar página quando filtros mudam
  useMemo(() => {
    setCurrentPage(1);
  }, [localSearch, localType]);

  const getAccountName = (accountId: string): string => {
    const account = bankAccounts.find((a) => a.id === accountId);
    if (account) return account.name;

    const card = creditCards.find((c) => c.id === accountId);
    if (card) return card.name;

    return t('transactions.unknown');
  };

  const getMemberAvatar = (memberId?: string | null) => {
    if (!memberId) return null;
    const member = familyMembers.find((m) => m.id === memberId);
    return member?.avatarUrl;
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages - 1, totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, 2, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, 2, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages - 1, totalPages];
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  const StatementIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4H16V16H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 8H16M4 12H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div className="
      w-full p-6 rounded-lg
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700
    ">
      {/* Header - padronizado com outros cards */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <StatementIcon />
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{t('dashboard.detailedStatement') || 'Extrato detalhado'}</h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search - Ícone dentro do input */}
          <div className="relative w-full md:w-64">
            <div className="flex items-center gap-2 pl-3 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-[40px] bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary">
              <div className="text-gray-400 flex-shrink-0 pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder={t('transactions.search')}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="flex-1 min-w-0 bg-transparent border-0 outline-none p-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 [&::-webkit-input-placeholder]:opacity-100"
                style={{ border: 'none', borderRadius: 0, padding: 0 }}
              />
            </div>
          </div>

          {/* Type Select */}
          <select
            value={localType}
            onChange={(e) => setLocalType(e.target.value as 'all' | 'income' | 'expense')}
            className="
              w-full sm:w-40 px-4 py-2
              border border-gray-200 dark:border-gray-700 rounded-[40px]
              bg-white dark:bg-gray-800 
              text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-primary
            "
          >
            <option value="all">{t('transactions.all')}</option>
            <option value="income">{t('transactions.income')}</option>
            <option value="expense">{t('transactions.expense')}</option>
          </select>
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:flex md:flex-col border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Scroll container - sempre mostrar scrollbar */}
        <div className="transactions-table-scroll">
          {/* Table Header */}
          <div className="bg-gray-50 dark:bg-gray-700 grid grid-cols-[48px_120px_minmax(320px,1.6fr)_minmax(200px,1fr)_minmax(150px,0.8fr)_80px_140px_80px] gap-x-3 px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 min-w-max">
            <div>{t('transactions.avatar')}</div>
            <div className="whitespace-nowrap">{t('transactions.date')}</div>
            <div>{t('transactions.description')}</div>
            <div>{t('transactions.category')}</div>
            <div>{t('transactions.account')}</div>
            <div>{t('transactions.installments')}</div>
            <div className="text-right whitespace-nowrap">{t('transactions.value')}</div>
            <div className="text-center whitespace-nowrap">Editar</div>
          </div>

          {/* Table Body */}
          {paginatedTransactions.length === 0 ? (
            <div className="py-24 text-center text-gray-500 dark:text-gray-400">
              {t('dashboard.noTransactionsFound') || 'Nenhum lançamento encontrado.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700 min-h-[280px]">
              {paginatedTransactions.map((transaction, index) => {
                const isEven = index % 2 === 0;
                const avatarUrl = getMemberAvatar(transaction.memberId);

                return (
                  <div
                    key={transaction.id}
                    className={`
                      grid grid-cols-[48px_120px_minmax(320px,1.6fr)_minmax(200px,1fr)_minmax(150px,0.8fr)_80px_140px_80px] gap-x-3 px-4 py-3 min-w-max
                      ${isEven ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}
                      hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150
                    `}
                  >
                  {/* Avatar */}
                  <div className="flex items-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        className="w-6 h-6 rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                        <UserIcon />
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formatDateShort(new Date(transaction.date))}
                  </div>

                  {/* Description */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                      ${transaction.type === 'income' 
                        ? 'bg-success-light dark:bg-success/20 text-success-dark dark:text-success' 
                        : 'bg-error-light dark:bg-error/20 text-error-dark dark:text-error'}
                    `}>
                      {transaction.type === 'income' ? (
                        <IncomeIcon />
                      ) : (
                        <ExpenseIcon />
                      )}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{transaction.description}</span>
                  </div>

                  {/* Category */}
                  <div className="flex items-center gap-2 min-w-0">
                    {(() => {
                      // Buscar cor da categoria
                      let categoryColor = '#3247FF'; // Cor padrão
                      const categoryName = categoryNames[transaction.category] || transaction.category;
                      const categoryData = customCategories.find(c => 
                        c.name.toLowerCase() === categoryName.toLowerCase() && c.type === transaction.type
                      );
                      if (categoryData) {
                        categoryColor = categoryData.color;
                      }
                      return (
                        <>
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0 border border-gray-200 dark:border-gray-600"
                            style={{ backgroundColor: categoryColor }}
                            title={categoryColor}
                          />
                          <span
                            className="px-2 py-1 rounded-full text-xs truncate border"
                            style={{
                              backgroundColor: hexToRgba(categoryColor, 0.05),
                              borderColor: hexToRgba(categoryColor, 0.15),
                              color: categoryColor,
                            }}
                          >
                            {categoryName}
                          </span>
                        </>
                      );
                    })()}
                  </div>

                  {/* Account */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 min-w-0">
                    <span className="truncate">{getAccountName(transaction.accountId)}</span>
                  </div>

                  {/* Installments */}
                  <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {(() => {
                      const installmentDisplay = formatInstallmentDisplay(
                        transaction.installmentNumber,
                        transaction.installments
                      );
                      return installmentDisplay || '-';
                    })()}
                  </div>

                  {/* Value */}
                  <div className="flex items-center justify-end">
                    <span className={`
                      font-bold whitespace-nowrap
                      ${transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'}
                    `}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>

                  {/* Actions - Edit Button */}
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => handleEditTransaction(transaction)}
                      className="
                        w-8 h-8 rounded-full
                        flex items-center justify-center
                        hover:bg-gray-200 dark:hover:bg-gray-600
                        transition-colors duration-150
                        text-gray-600 dark:text-gray-400
                        hover:text-gray-900 dark:hover:text-gray-100
                      "
                      title={t('transactions.edit') || 'Editar'}
                    >
                      <EditIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 mt-4">
        {paginatedTransactions.length === 0 ? (
          <div className="py-24 text-center text-gray-500 dark:text-gray-400">
            {t('dashboard.noTransactionsFound') || 'Nenhum lançamento encontrado.'}
          </div>
        ) : (
          paginatedTransactions.map((transaction) => {
            const avatarUrl = getMemberAvatar(transaction.memberId);
            return (
              <div
                key={transaction.id}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3"
              >
                {/* Header do Card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <UserIcon />
                        </div>
                      )}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{transaction.description}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{formatDateShort(new Date(transaction.date))}</p>
                    </div>
                  </div>
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${transaction.type === 'income' ? 'bg-success-light text-success-dark dark:bg-success/20 dark:text-success' : 'bg-error-light text-error-dark dark:bg-error/20 dark:text-error'}
                  `}>
                    {transaction.type === 'income' ? <IncomeIcon /> : <ExpenseIcon />}
                  </div>
                </div>

                {/* Detalhes */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('transactions.category')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {categoryNames[transaction.category] || transaction.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('transactions.account')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{getAccountName(transaction.accountId)}</p>
                  </div>
                  {(() => {
                    const installmentDisplay = formatInstallmentDisplay(
                      transaction.installmentNumber,
                      transaction.installments
                    );
                    return installmentDisplay ? (
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('transactions.installments')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {installmentDisplay}
                        </p>
                      </div>
                    ) : null;
                  })()}
                  <div className="text-right">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('transactions.value')}</p>
                    <p className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination + CTA (mesma faixa, sem aumentar altura) */}
      {filteredTransactions.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 items-center gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 md:justify-self-start">
            {t('dashboard.showing') || 'Mostrando'} {startIndex + 1} {t('common.to') || 'a'} {Math.min(endIndex, filteredTransactions.length)} {t('common.of')} {filteredTransactions.length}
          </div>

          <div className="flex justify-center md:justify-self-center">
            <button
              type="button"
              onClick={() => navigate('/transacoes')}
              className="
                flex items-center justify-center
                py-2 rounded-[40px]
                transition-all duration-200 ease-in-out
                text-gray-900 dark:text-gray-100
                hover:bg-gray-100 dark:hover:bg-gray-700
                px-4
              "
            >
              <span className="font-medium truncate">Ver todas transações</span>
            </button>
          </div>

          <div className="flex items-center justify-center md:justify-self-end gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="
                w-8 h-8 rounded
                flex items-center justify-center
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:bg-gray-100 dark:hover:bg-gray-700
                transition-colors duration-150
                text-gray-600 dark:text-gray-400
              "
            >
              <ChevronLeftIcon />
            </button>

            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                disabled={page === '...'}
                className={`
                  min-w-8 h-8 px-2 rounded
                  flex items-center justify-center text-sm
                  ${currentPage === page
                    ? 'bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                  ${page === '...' ? 'cursor-default' : 'cursor-pointer'}
                  transition-colors duration-150
                `}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="
                w-8 h-8 rounded
                flex items-center justify-center
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:bg-gray-100 dark:hover:bg-gray-700
                transition-colors duration-150
                text-gray-600 dark:text-gray-400
              "
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          transaction={editingTransaction}
        />
      )}
    </div>
  );
}
