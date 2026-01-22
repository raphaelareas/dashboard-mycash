import { useState, useMemo, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useI18n } from '@/contexts/I18nContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateShort } from '@/utils/formatDateShort';
import { NewTransactionModal } from '@/components/modals/NewTransactionModal';
import { EditTransactionModal } from '@/components/modals/EditTransactionModal';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { TransactionCategory, Transaction } from '@/types';

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

const ArrowUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 4V12M4 8L8 4L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 12V4M4 8L8 12L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// categoryNames será obtido via tradução

type SortField = 'date' | 'value' | 'description';
type SortOrder = 'asc' | 'desc';

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

export default function Transactions() {
  const { getFilteredTransactions, bankAccounts, creditCards, familyMembers, categories: customCategories } = useFinance();
  const { t } = useI18n();
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
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
  const [localSearch, setLocalSearch] = useState('');
  const [localType, setLocalType] = useState<'all' | 'income' | 'expense'>('all');
  const [localCategory, setLocalCategory] = useState<TransactionCategory | 'all'>('all');
  const [localAccount, setLocalAccount] = useState<string>('all');
  const [localMember, setLocalMember] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [itemsToShow, setItemsToShow] = useState(10);
  const itemsPerLoad = 10;

  // Filtros avançados
  const filteredTransactions = useMemo(() => {
    let transactions = getFilteredTransactions();

    // Filtro por mês/ano
    const selectedYear = selectedMonth.getFullYear();
    const selectedMonthIndex = selectedMonth.getMonth();
    transactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate.getFullYear() === selectedYear && transactionDate.getMonth() === selectedMonthIndex;
    });

    if (localType !== 'all') {
      transactions = transactions.filter((t) => t.type === localType);
    }

    if (localCategory !== 'all') {
      transactions = transactions.filter((t) => t.category === localCategory);
    }

    if (localAccount !== 'all') {
      transactions = transactions.filter((t) => t.accountId === localAccount);
    }

    if (localMember !== 'all') {
      transactions = transactions.filter((t) => t.memberId === localMember);
    }

    if (localSearch) {
      const search = localSearch.toLowerCase();
      transactions = transactions.filter(
        (t) =>
          t.description.toLowerCase().includes(search) ||
          categoryNames[t.category]?.toLowerCase().includes(search)
      );
    }

    // Ordenação
    transactions.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      } else if (sortField === 'value') {
        aValue = a.amount;
        bValue = b.amount;
      } else {
        aValue = a.description.toLowerCase();
        bValue = b.description.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return transactions;
  }, [getFilteredTransactions, selectedMonth, localType, localCategory, localAccount, localMember, localSearch, sortField, sortOrder, categoryNames]);

  // Estatísticas
  const stats = useMemo(() => {
    const income = filteredTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const difference = income - expenses;

    return {
      income,
      expenses,
      difference,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Loading infinito - mostrar apenas os primeiros itemsToShow itens
  const displayedTransactions = filteredTransactions.slice(0, itemsToShow);
  const hasMore = filteredTransactions.length > itemsToShow;

  // Resetar itemsToShow quando filtros mudam
  useEffect(() => {
    setItemsToShow(itemsPerLoad);
  }, [selectedMonth, localType, localCategory, localAccount, localMember, localSearch, sortField, sortOrder]);

  const handleLoadMore = () => {
    setItemsToShow((prev) => prev + itemsPerLoad);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

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

  const exportToCSV = () => {
    const headers = [t('transactions.date'), t('transactions.description'), t('transactions.category'), t('transactions.type'), t('transactions.value')];
    const rows = filteredTransactions.map((transaction) => [
      formatDateShort(new Date(transaction.date)),
      transaction.description,
      categoryNames[transaction.category] || transaction.category,
      transaction.type === 'income' ? t('transactions.incomeType') : t('transactions.expenseType'),
      transaction.amount.toString(),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transacoes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <>
      <div className="w-full py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{t('transactions.title')}</h1>
            {/* Seletor de Mês */}
            <div className="flex items-center">
              <MonthSelector currentMonth={selectedMonth} onMonthChange={setSelectedMonth} />
            </div>
          </div>
          <button
            onClick={() => setIsNewTransactionOpen(true)}
            className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2"
          >
            <span>+</span>
            <span>{t('transactions.newTransaction')}</span>
          </button>
        </div>

        {/* Barra Superior com Filtros e Navegação */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          {/* Primeira Linha: Busca e Tabs de Tipo */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Busca */}
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder={t('transactions.search')}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pr-4 py-2 border border-gray-200 rounded-[40px] focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ paddingLeft: '48px' }}
              />
            </div>

            {/* Tabs de Tipo (Todos, Entrada, Saída) */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-[40px]">
              <button
                onClick={() => setLocalType('all')}
                className={`
                  px-4 py-2 rounded-[40px] font-medium transition-all text-sm whitespace-nowrap
                  ${localType === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}
                `}
              >
                {t('transactions.all')}
              </button>
              <button
                onClick={() => setLocalType('income')}
                className={`
                  px-4 py-2 rounded-[40px] font-medium transition-all text-sm whitespace-nowrap
                  ${localType === 'income' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}
                `}
              >
                {t('transactions.income')}
              </button>
              <button
                onClick={() => setLocalType('expense')}
                className={`
                  px-4 py-2 rounded-[40px] font-medium transition-all text-sm whitespace-nowrap
                  ${localType === 'expense' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}
                `}
              >
                {t('transactions.expense')}
              </button>
            </div>
          </div>

          {/* Segunda Linha: Filtros e Exportar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Filtros: Categoria, Conta, Membro - Aproveitando melhor o espaço */}
            <div className="flex flex-wrap gap-3 flex-1">
              {/* Categoria */}
              <select
                value={localCategory}
                onChange={(e) => setLocalCategory(e.target.value as TransactionCategory | 'all')}
                className="flex-1 min-w-[180px] px-4 py-2 border border-gray-200 rounded-[40px] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="all">{t('transactions.allCategories')}</option>
                {Object.entries(categoryNames).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>

              {/* Conta/Cartão */}
              <select
                value={localAccount}
                onChange={(e) => setLocalAccount(e.target.value)}
                className="flex-1 min-w-[180px] px-4 py-2 border border-gray-200 rounded-[40px] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="all">{t('transactions.allAccounts')}</option>
                <optgroup label={t('transactions.bankAccounts')}>
                  {bankAccounts.filter(a => a.isActive).map((account) => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </optgroup>
                <optgroup label={t('transactions.creditCards')}>
                  {creditCards.filter(c => c.isActive).map((card) => (
                    <option key={card.id} value={card.id}>{card.name}</option>
                  ))}
                </optgroup>
              </select>

              {/* Membro */}
              <select
                value={localMember}
                onChange={(e) => setLocalMember(e.target.value)}
                className="flex-1 min-w-[180px] px-4 py-2 border border-gray-200 rounded-[40px] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="all">{t('transactions.allMembers')}</option>
                {familyMembers.map((member) => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>

            {/* Exportar CSV - No final da segunda linha */}
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-white border rounded-[40px] text-gray-900 hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center whitespace-nowrap"
              style={{ borderColor: '#0D0F03', borderWidth: '1px' }}
            >
              {t('transactions.exportCSV')}
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">{t('transactions.totalIncome')}</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(stats.income)}</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">{t('transactions.totalExpenses')}</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.expenses)}</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">{t('transactions.difference')}</p>
            <p className={`text-xl font-bold ${stats.difference >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              {formatCurrency(stats.difference)}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">{t('transactions.quantity')}</p>
            <p className="text-xl font-bold text-gray-900">{stats.count}</p>
          </div>
        </div>

        {/* Tabela */}
        {filteredTransactions.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-gray-500 mb-4">{t('transactions.noTransactions')}</p>
            <button
              onClick={() => setIsNewTransactionOpen(true)}
              className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800"
            >
              {t('transactions.addFirstTransaction')}
            </button>
          </div>
        ) : (
          <>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-50 grid grid-cols-[48px_120px_minmax(320px,1.6fr)_minmax(200px,1fr)_minmax(220px,1fr)_96px_140px_48px] gap-x-3 px-4 py-3 text-sm font-semibold text-gray-600">
                <div>{t('transactions.avatar')}</div>
                <button
                  onClick={() => handleSort('date')}
                  className="text-left flex items-center gap-1 hover:text-gray-900 whitespace-nowrap"
                >
                  {t('transactions.date')}
                  {sortField === 'date' && (sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                </button>
                <button
                  onClick={() => handleSort('description')}
                  className="text-left flex items-center gap-1 hover:text-gray-900"
                >
                  {t('transactions.description')}
                  {sortField === 'description' && (sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                </button>
                <div>{t('transactions.category')}</div>
                <div>{t('transactions.account')}</div>
                <div className="pl-8">{t('transactions.installments')}</div>
                <button
                  onClick={() => handleSort('value')}
                  className="text-right flex items-center justify-end gap-1 hover:text-gray-900 whitespace-nowrap"
                >
                  {t('transactions.value')}
                  {sortField === 'value' && (sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                </button>
                <div aria-hidden="true" />
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {displayedTransactions.map((transaction, index) => {
                  const isEven = index % 2 === 0;
                  const avatarUrl = getMemberAvatar(transaction.memberId);

                  return (
                    <div
                      key={transaction.id}
                      className={`grid grid-cols-[48px_120px_minmax(320px,1.6fr)_minmax(200px,1fr)_minmax(220px,1fr)_96px_140px_48px] gap-x-3 px-4 py-3 ${isEven ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                    >
                      <div className="flex items-center">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className="w-6 h-6 rounded-full flex-shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <UserIcon />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 whitespace-nowrap">
                        {formatDateShort(new Date(transaction.date))}
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {transaction.type === 'income' ? <IncomeIcon /> : <ExpenseIcon />}
                        </div>
                        <span className="font-semibold text-gray-900 truncate">{transaction.description}</span>
                      </div>
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
                                className="w-3 h-3 rounded-full flex-shrink-0 border border-gray-200"
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
                      <div className="flex items-center text-sm text-gray-600 min-w-0">
                        <span className="truncate">{getAccountName(transaction.accountId)}</span>
                      </div>
                      <div className="pl-8 flex items-center justify-center text-sm text-gray-600 whitespace-nowrap">
                        {transaction.installments && transaction.installments > 1 
                          ? `${transaction.installmentNumber || 1}/${transaction.installments}` 
                          : '-'
                        }
                      </div>
                      <div className="flex items-center justify-end">
                        <span className={`font-bold whitespace-nowrap ${transaction.type === 'income' ? 'text-green-700' : 'text-gray-900'}`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-start">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTransaction(transaction);
                            setIsEditTransactionOpen(true);
                          }}
                          className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
                          title="Editar transação"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.333 2.00001C11.5084 1.82445 11.7163 1.68606 11.9439 1.59331C12.1715 1.50056 12.4142 1.45557 12.6587 1.46131C12.9031 1.46706 13.1441 1.5234 13.3671 1.62669C13.5901 1.72998 13.7906 1.87797 13.9573 2.06268C14.124 2.24738 14.2534 2.46499 14.3378 2.7019C14.4222 2.9388 14.4598 3.19047 14.4482 3.44195C14.4366 3.69342 14.376 3.93963 14.2699 4.16618C14.1638 4.39273 14.0144 4.59504 13.8313 4.76001L13.106 5.48668L10.5133 2.89334L11.2387 2.16801C11.2387 2.16801 11.333 2.00001 11.333 2.00001ZM9.88667 3.44668L12.48 6.04001L5.83333 12.6867L3.24 10.0933L9.88667 3.44668ZM2.66667 11.3333L5.26 13.9267L2.66667 13.3333V11.3333Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botão Ver Mais - Loading Infinito */}
            {hasMore && (
              <div className="flex items-center justify-center mt-4">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 rounded-[40px] bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold"
                >
                  {t('transactions.loadMore') || 'Ver mais'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <NewTransactionModal isOpen={isNewTransactionOpen} onClose={() => setIsNewTransactionOpen(false)} />
      {selectedTransaction && (
        <EditTransactionModal
          isOpen={isEditTransactionOpen}
          onClose={() => {
            setIsEditTransactionOpen(false);
            setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
        />
      )}
    </>
  );
}
