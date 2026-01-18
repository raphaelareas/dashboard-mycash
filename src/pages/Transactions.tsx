import { useState, useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateShort } from '@/utils/formatDateShort';
import { NewTransactionModal } from '@/components/modals/NewTransactionModal';
import { TransactionCategory } from '@/types';

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

const categoryNames: Record<string, string> = {
  rent: 'Aluguel',
  food: 'Alimentação',
  shopping: 'Compras',
  household: 'Contas de casa',
  transport: 'Transporte',
  entertainment: 'Entretenimento',
  health: 'Saúde',
  education: 'Educação',
  other: 'Outros',
};

type SortField = 'date' | 'value' | 'description';
type SortOrder = 'asc' | 'desc';

export default function Transactions() {
  const { getFilteredTransactions, bankAccounts, creditCards, familyMembers } = useFinance();
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [localType, setLocalType] = useState<'all' | 'income' | 'expense'>('all');
  const [localCategory, setLocalCategory] = useState<TransactionCategory | 'all'>('all');
  const [localAccount, setLocalAccount] = useState<string>('all');
  const [localMember, setLocalMember] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtros avançados
  const filteredTransactions = useMemo(() => {
    let transactions = getFilteredTransactions();

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
  }, [getFilteredTransactions, localType, localCategory, localAccount, localMember, localSearch, sortField, sortOrder]);

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

  // Paginação
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

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
    return 'Desconhecido';
  };

  const getMemberAvatar = (memberId?: string | null) => {
    if (!memberId) return null;
    const member = familyMembers.find((m) => m.id === memberId);
    return member?.avatarUrl;
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
    const rows = filteredTransactions.map((t) => [
      formatDateShort(new Date(t.date)),
      t.description,
      categoryNames[t.category] || t.category,
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.amount.toString(),
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
          <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
          <button
            onClick={() => setIsNewTransactionOpen(true)}
            className="px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2"
          >
            <span>+</span>
            <span>Nova Transação</span>
          </button>
        </div>

        {/* Filtros Avançados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {/* Busca */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Buscar lançamentos..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Tipo */}
          <select
            value={localType}
            onChange={(e) => setLocalType(e.target.value as 'all' | 'income' | 'expense')}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>

          {/* Categoria */}
          <select
            value={localCategory}
            onChange={(e) => setLocalCategory(e.target.value as TransactionCategory | 'all')}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas as categorias</option>
            {Object.entries(categoryNames).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>

          {/* Conta/Cartão */}
          <select
            value={localAccount}
            onChange={(e) => setLocalAccount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas as contas</option>
            <optgroup label="Contas Bancárias">
              {bankAccounts.filter(a => a.isActive).map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </optgroup>
            <optgroup label="Cartões">
              {creditCards.filter(c => c.isActive).map((card) => (
                <option key={card.id} value={card.id}>{card.name}</option>
              ))}
            </optgroup>
          </select>

          {/* Membro */}
          <select
            value={localMember}
            onChange={(e) => setLocalMember(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos os membros</option>
            {familyMembers.map((member) => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>

          {/* Exportar */}
          <button
            onClick={exportToCSV}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Exportar CSV
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Receitas</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(stats.income)}</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Despesas</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.expenses)}</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Diferença</p>
            <p className={`text-xl font-bold ${stats.difference >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              {formatCurrency(stats.difference)}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Quantidade</p>
            <p className="text-xl font-bold text-gray-900">{stats.count}</p>
          </div>
        </div>

        {/* Tabela */}
        {filteredTransactions.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-gray-500 mb-4">Nenhuma transação registrada ainda</p>
            <button
              onClick={() => setIsNewTransactionOpen(true)}
              className="px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
            >
              Adicionar Primeira Transação
            </button>
          </div>
        ) : (
          <>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-50 grid grid-cols-12 gap-4 px-4 py-3 text-sm font-semibold text-gray-600">
                <div className="col-span-1">Avatar</div>
                <button
                  onClick={() => handleSort('date')}
                  className="col-span-1 text-left flex items-center gap-1 hover:text-gray-900"
                >
                  Data
                  {sortField === 'date' && (sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                </button>
                <button
                  onClick={() => handleSort('description')}
                  className="col-span-3 text-left flex items-center gap-1 hover:text-gray-900"
                >
                  Descrição
                  {sortField === 'description' && (sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                </button>
                <div className="col-span-2">Categoria</div>
                <div className="col-span-2">Conta/Cartão</div>
                <div className="col-span-1">Parcelas</div>
                <button
                  onClick={() => handleSort('value')}
                  className="col-span-2 text-right flex items-center justify-end gap-1 hover:text-gray-900"
                >
                  Valor
                  {sortField === 'value' && (sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                </button>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {paginatedTransactions.map((transaction, index) => {
                  const isEven = index % 2 === 0;
                  const avatarUrl = getMemberAvatar(transaction.memberId);

                  return (
                    <div
                      key={transaction.id}
                      className={`grid grid-cols-12 gap-4 px-4 py-3 ${isEven ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                    >
                      <div className="col-span-1 flex items-center">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon />
                          </div>
                        )}
                      </div>
                      <div className="col-span-1 flex items-center text-sm text-gray-600">
                        {formatDateShort(new Date(transaction.date))}
                      </div>
                      <div className="col-span-3 flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {transaction.type === 'income' ? <IncomeIcon /> : <ExpenseIcon />}
                        </div>
                        <span className="font-semibold text-gray-900">{transaction.description}</span>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                          {categoryNames[transaction.category] || transaction.category}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center text-sm text-gray-600">
                        {getAccountName(transaction.accountId)}
                      </div>
                      <div className="col-span-1 flex items-center text-sm text-gray-600">
                        {transaction.installments && transaction.installments > 1 ? `${transaction.installments}x` : '-'}
                      </div>
                      <div className="col-span-2 flex items-center justify-end">
                        <span className={`font-bold ${transaction.type === 'income' ? 'text-green-700' : 'text-gray-900'}`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded disabled:opacity-50 hover:bg-gray-100"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded disabled:opacity-50 hover:bg-gray-100"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <NewTransactionModal isOpen={isNewTransactionOpen} onClose={() => setIsNewTransactionOpen(false)} />
    </>
  );
}
