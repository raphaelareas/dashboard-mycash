import { useState, useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateShort } from '@/utils/formatDateShort';

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

export function TransactionsTable() {
  const { getFilteredTransactions, bankAccounts, creditCards, familyMembers } = useFinance();
  const { t } = useI18n();
  const [localSearch, setLocalSearch] = useState('');
  
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
  const itemsPerPage = 5;

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
      <div className="hidden md:block border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 dark:bg-gray-700 grid grid-cols-12 gap-4 px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
          <div className="col-span-1">{t('transactions.avatar')}</div>
          <div className="col-span-1">{t('transactions.date')}</div>
          <div className="col-span-3">{t('transactions.description')}</div>
          <div className="col-span-2">{t('transactions.category')}</div>
          <div className="col-span-2">{t('transactions.account')}</div>
          <div className="col-span-1">{t('transactions.installments')}</div>
          <div className="col-span-2 text-right">{t('transactions.value')}</div>
        </div>

        {/* Table Body */}
        {paginatedTransactions.length === 0 ? (
          <div className="py-24 text-center text-gray-500 dark:text-gray-400">
            {t('dashboard.noTransactionsFound') || 'Nenhum lançamento encontrado.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {paginatedTransactions.map((transaction, index) => {
              const isEven = index % 2 === 0;
              const avatarUrl = getMemberAvatar(transaction.memberId);

              return (
                <div
                  key={transaction.id}
                  className={`
                    grid grid-cols-12 gap-4 px-4 py-3
                    ${isEven ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}
                    hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150
                  `}
                >
                  {/* Avatar */}
                  <div className="col-span-1 flex items-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <UserIcon />
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="col-span-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                    {formatDateShort(new Date(transaction.date))}
                  </div>

                  {/* Description */}
                  <div className="col-span-3 flex items-center gap-2">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center
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
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{transaction.description}</span>
                  </div>

                  {/* Category */}
                  <div className="col-span-2 flex items-center">
                    <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs">
                      {categoryNames[transaction.category] || transaction.category}
                    </span>
                  </div>

                  {/* Account */}
                  <div className="col-span-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                    {getAccountName(transaction.accountId)}
                  </div>

                  {/* Installments */}
                  <div className="col-span-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                    {transaction.installments && transaction.installments > 1
                      ? `${transaction.installments}x`
                      : '-'
                    }
                  </div>

                  {/* Value */}
                  <div className="col-span-2 flex items-center justify-end">
                    <span className={`
                      font-bold
                      ${transaction.type === 'income' ? 'text-success-dark dark:text-success' : 'text-gray-900 dark:text-gray-100'}
                    `}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
                  {transaction.installments && transaction.installments > 1 && (
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('transactions.installments')}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{transaction.installments}x</p>
                    </div>
                  )}
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

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('dashboard.showing') || 'Mostrando'} {startIndex + 1} {t('common.to') || 'a'} {Math.min(endIndex, filteredTransactions.length)} {t('common.of')} {filteredTransactions.length}
          </div>

          <div className="flex items-center gap-2">
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
    </div>
  );
}
