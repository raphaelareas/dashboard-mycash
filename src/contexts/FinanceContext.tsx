import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Transaction,
  Goal,
  CreditCard,
  BankAccount,
  FamilyMember,
} from '@/types';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface FinanceContextType {
  // Dados
  transactions: Transaction[];
  goals: Goal[];
  creditCards: CreditCard[];
  bankAccounts: BankAccount[];
  familyMembers: FamilyMember[];

  // Filtros
  selectedMember: string | null;
  dateRange: DateRange;
  transactionType: 'all' | 'income' | 'expense';
  searchText: string;

  // Setters de Filtros
  setSelectedMember: (memberId: string | null) => void;
  setDateRange: (range: DateRange) => void;
  setTransactionType: (type: 'all' | 'income' | 'expense') => void;
  setSearchText: (text: string) => void;

  // CRUD Transactions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // CRUD Goals
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // CRUD CreditCards
  addCreditCard: (card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCreditCard: (id: string, card: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;

  // CRUD BankAccounts
  addBankAccount: (account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBankAccount: (id: string, account: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;

  // CRUD FamilyMembers
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFamilyMember: (id: string, member: Partial<FamilyMember>) => void;
  deleteFamilyMember: (id: string) => void;

  // Funções de cálculo
  getFilteredTransactions: () => Transaction[];
  calculateTotalBalance: () => number;
  calculateIncomeForPeriod: () => number;
  calculateExpensesForPeriod: () => number;
  calculateExpensesByCategory: () => Array<{ category: string; amount: number }>;
  calculateCategoryPercentage: (category: string) => number;
  calculateSavingsRate: () => number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Função para gerar IDs únicos
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper para obter início/fim do mês atual
const getCurrentMonthRange = (): DateRange => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { startDate: start, endDate: end };
};

interface FinanceProviderProps {
  children: ReactNode;
}

export function FinanceProvider({ children }: FinanceProviderProps) {
  // Estado inicial dos dados (mock data)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // Filtros
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getCurrentMonthRange());
  const [transactionType, setTransactionType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchText, setSearchText] = useState('');

  // CRUD Transactions
  // TODO: integrar com Supabase - fazer insert/update/delete no banco via MCP
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setTransactions((prev) => [...prev, newTransaction]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // CRUD Goals
  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: new Date() } : g))
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // CRUD CreditCards
  const addCreditCard = (card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newCard: CreditCard = {
      ...card,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setCreditCards((prev) => [...prev, newCard]);
  };

  const updateCreditCard = (id: string, updates: Partial<CreditCard>) => {
    setCreditCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c))
    );
  };

  const deleteCreditCard = (id: string) => {
    setCreditCards((prev) => prev.filter((c) => c.id !== id));
  };

  // CRUD BankAccounts
  const addBankAccount = (account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newAccount: BankAccount = {
      ...account,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setBankAccounts((prev) => [...prev, newAccount]);
  };

  const updateBankAccount = (id: string, updates: Partial<BankAccount>) => {
    setBankAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a))
    );
  };

  const deleteBankAccount = (id: string) => {
    setBankAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  // CRUD FamilyMembers
  const addFamilyMember = (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newMember: FamilyMember = {
      ...member,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setFamilyMembers((prev) => [...prev, newMember]);
  };

  const updateFamilyMember = (id: string, updates: Partial<FamilyMember>) => {
    setFamilyMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m))
    );
  };

  const deleteFamilyMember = (id: string) => {
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // Funções de cálculo (com filtros aplicados)
  const getFilteredTransactions = (): Transaction[] => {
    let filtered = [...transactions];

    // Filtro por data
    filtered = filtered.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= dateRange.startDate && transactionDate <= dateRange.endDate;
    });

    // Filtro por tipo
    if (transactionType !== 'all') {
      filtered = filtered.filter((t) => t.type === transactionType);
    }

    // Filtro por membro
    if (selectedMember) {
      filtered = filtered.filter((t) => t.memberId === selectedMember);
    }

    // Filtro por busca
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(search) ||
          t.category.toLowerCase().includes(search)
      );
    }

    return filtered;
  };

  const calculateTotalBalance = (): number => {
    const accountsBalance = bankAccounts
      .filter((a) => a.isActive)
      .reduce((sum, a) => sum + a.balance, 0);

    const cardsBalance = creditCards
      .filter((c) => c.isActive)
      .reduce((sum, c) => sum + c.currentBalance, 0);

    return accountsBalance - cardsBalance;
  };

  const calculateIncomeForPeriod = (): number => {
    const filtered = getFilteredTransactions();
    return filtered
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateExpensesForPeriod = (): number => {
    const filtered = getFilteredTransactions();
    return filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateExpensesByCategory = (): Array<{ category: string; amount: number }> => {
    const filtered = getFilteredTransactions();
    const expenses = filtered.filter((t) => t.type === 'expense');
    const grouped = expenses.reduce((acc, t) => {
      const category = t.category;
      acc[category] = (acc[category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const calculateCategoryPercentage = (category: string): number => {
    const income = calculateIncomeForPeriod();
    if (income === 0) return 0;

    const filtered = getFilteredTransactions();
    const categoryExpenses = filtered
      .filter((t) => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);

    return (categoryExpenses / income) * 100;
  };

  const calculateSavingsRate = (): number => {
    const income = calculateIncomeForPeriod();
    if (income === 0) return 0;

    const expenses = calculateExpensesForPeriod();
    return ((income - expenses) / income) * 100;
  };

  // Inicialização de dados mock (uma vez ao montar)
  // TODO: integrar com Supabase - substituir por fetch de dados reais do backend
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized && transactions.length === 0 && familyMembers.length === 0) {
      initializeMockData();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  function initializeMockData() {
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    // Mock Family Members
    const mockMembers: FamilyMember[] = [
      {
        id: generateId(),
        userId: 'user-1',
        name: 'Raphael A.',
        email: 'raphaelareas@gmail.com',
        role: 'owner',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        userId: 'user-2',
        name: 'Maria Silva',
        email: 'maria@example.com',
        role: 'member',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        userId: 'user-3',
        name: 'João Santos',
        email: 'joao@example.com',
        role: 'member',
        createdAt: now,
        updatedAt: now,
      },
    ];
    setFamilyMembers(mockMembers);

    // Mock Bank Accounts
    const mockAccounts: BankAccount[] = [
      {
        id: generateId(),
        name: 'Conta Corrente',
        bankName: 'Nubank',
        accountNumber: '12345678',
        type: 'checking',
        balance: 5359.0,
        currency: 'BRL',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        name: 'Conta Poupança',
        bankName: 'Inter',
        accountNumber: '87654321',
        type: 'savings',
        balance: 12000.0,
        currency: 'BRL',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
    setBankAccounts(mockAccounts);

    // Mock Credit Cards
    const mockCards: CreditCard[] = [
      {
        id: generateId(),
        name: 'Cartão Nubank',
        type: 'credit',
        brand: 'mastercard',
        lastFourDigits: '1234',
        expirationMonth: 12,
        expirationYear: 2025,
        dueDay: 20,
        limit: 5000,
        currentBalance: 895.0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        name: 'Cartão Inter',
        type: 'credit',
        brand: 'visa',
        lastFourDigits: '5678',
        expirationMonth: 11,
        expirationYear: 2025,
        dueDay: 10,
        limit: 3000,
        currentBalance: 745.0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
    setCreditCards(mockCards);

    // Mock Transactions (25 transações nos últimos 3 meses)
    const mockTransactions: Transaction[] = [];
    const categories: Transaction['category'][] = ['rent', 'food', 'shopping', 'household', 'transport', 'entertainment', 'health'];
    const descriptions = [
      'Aluguel', 'Supermercado', 'Farmácia', 'Uber', 'Netflix',
      'Restaurante', 'Academia', 'Roupas', 'Conta de luz', 'Gás',
      'Internet', 'Celular', 'Padaria', 'Posto de gasolina', 'Cinema',
      'Salário', 'Freelance', 'Dividendos', 'Venda', 'Reembolso',
    ];

    for (let i = 0; i < 25; i++) {
      const isIncome = Math.random() > 0.7;
      const daysAgo = Math.floor(Math.random() * 90);
      const transactionDate = new Date(now);
      transactionDate.setDate(transactionDate.getDate() - daysAgo);

      mockTransactions.push({
        id: generateId(),
        type: isIncome ? 'income' : 'expense',
        category: categories[Math.floor(Math.random() * categories.length)],
        amount: isIncome 
          ? Math.floor(Math.random() * 5000) + 1000
          : Math.floor(Math.random() * 500) + 50,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        date: transactionDate,
        accountId: mockAccounts[0].id,
        createdAt: transactionDate,
        updatedAt: transactionDate,
      });
    }

    // Adicionar algumas transações do mês atual para garantir 4 categorias
    mockTransactions.push(
      {
        id: generateId(),
        type: 'income',
        category: 'other',
        amount: 23000,
        description: 'Salário',
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        accountId: mockAccounts[0].id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        type: 'expense',
        category: 'rent',
        amount: 4000,
        description: 'Aluguel',
        date: new Date(now.getFullYear(), now.getMonth(), 5),
        accountId: mockAccounts[0].id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        type: 'expense',
        category: 'food',
        amount: 2500,
        description: 'Supermercado',
        date: new Date(now.getFullYear(), now.getMonth(), 10),
        accountId: mockAccounts[0].id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        type: 'expense',
        category: 'shopping',
        amount: 1500,
        description: 'Compras',
        date: new Date(now.getFullYear(), now.getMonth(), 12),
        accountId: mockAccounts[0].id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        type: 'expense',
        category: 'household',
        amount: 1200,
        description: 'Contas de casa',
        date: new Date(now.getFullYear(), now.getMonth(), 15),
        accountId: mockAccounts[0].id,
        createdAt: now,
        updatedAt: now,
      }
    );

    setTransactions(mockTransactions);

    // Mock Goals
    const mockGoals: Goal[] = [
      {
        id: generateId(),
        title: 'Viagem para Europa',
        description: 'Economia para viagem de 15 dias',
        targetAmount: 15000,
        currentAmount: 8500,
        deadline: new Date(now.getFullYear(), now.getMonth() + 6, 1),
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        title: 'Reserva de Emergência',
        description: '6 meses de despesas',
        targetAmount: 50000,
        currentAmount: 25000,
        deadline: new Date(now.getFullYear() + 1, 0, 1),
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
    ];
    setGoals(mockGoals);
  }

  const value: FinanceContextType = {
    transactions,
    goals,
    creditCards,
    bankAccounts,
    familyMembers,
    selectedMember,
    dateRange,
    transactionType,
    searchText,
    setSelectedMember,
    setDateRange,
    setTransactionType,
    setSearchText,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    getFilteredTransactions,
    calculateTotalBalance,
    calculateIncomeForPeriod,
    calculateExpensesForPeriod,
    calculateExpensesByCategory,
    calculateCategoryPercentage,
    calculateSavingsRate,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
