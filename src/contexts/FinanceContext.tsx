import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Transaction,
  Goal,
  CreditCard,
  BankAccount,
  FamilyMember,
} from '@/types';
import { useAuth } from './AuthContext';
import { transactionService } from '@/services/transactionService';
import { accountService } from '@/services/accountService';
import { familyMemberService } from '@/services/familyMemberService';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface FinanceContextType {
  // Dados
  transactions: Transaction[];
  goals: Goal[]; // TODO: Implementar goals service quando necessário
  creditCards: CreditCard[];
  bankAccounts: BankAccount[];
  familyMembers: FamilyMember[];

  // Loading states
  loading: boolean;

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
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;

  // CRUD Goals (mantido para compatibilidade, implementar depois)
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // CRUD CreditCards
  addCreditCard: (card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCreditCard: (id: string, card: Partial<CreditCard>) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;

  // CRUD BankAccounts
  addBankAccount: (account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBankAccount: (id: string, account: Partial<BankAccount>) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;

  // CRUD FamilyMembers
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFamilyMember: (id: string, member: Partial<FamilyMember>) => Promise<void>;
  deleteFamilyMember: (id: string) => Promise<void>;

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
  const { user } = useAuth();

  // Estado dos dados
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]); // TODO: Implementar quando necessário
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getCurrentMonthRange());
  const [transactionType, setTransactionType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchText, setSearchText] = useState('');

  // Carregar dados do Supabase quando usuário estiver autenticado
  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      // Limpar dados quando usuário sair
      setTransactions([]);
      setCreditCards([]);
      setBankAccounts([]);
      setFamilyMembers([]);
      setGoals([]);
      setLoading(false);
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Carregar dados em paralelo
      const [transactionsData, accountsData, membersData] = await Promise.all([
        transactionService.getAll(user.id),
        accountService.getAll(user.id),
        familyMemberService.getAll(user.id),
      ]);

      setTransactions(transactionsData);
      setCreditCards(accountsData.creditCards);
      setBankAccounts(accountsData.bankAccounts);
      setFamilyMembers(membersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshTransactions = async () => {
    if (!user?.id) return;
    try {
      const data = await transactionService.getAll(user.id);
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao atualizar transações:', error);
    }
  };

  // CRUD Transactions
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTransaction = await transactionService.create(transaction);
      setTransactions((prev) => [newTransaction, ...prev]);
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const updated = await transactionService.update(id, updates);
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await transactionService.delete(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      throw error;
    }
  };

  // CRUD Goals (mantido para compatibilidade - TODO: implementar service)
  const addGoal = (_goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    // TODO: Implementar quando necessário
    console.warn('Goals service não implementado ainda');
  };

  const updateGoal = (_id: string, _goal: Partial<Goal>) => {
    // TODO: Implementar quando necessário
    console.warn('Goals service não implementado ainda');
  };

  const deleteGoal = (_id: string) => {
    // TODO: Implementar quando necessário
    console.warn('Goals service não implementado ainda');
  };

  // CRUD CreditCards
  const addCreditCard = async (card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCard = await accountService.createCreditCard(card);
      setCreditCards((prev) => [...prev, newCard]);
      // Recarregar todos os dados para sincronizar
      await loadAllData();
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
      throw error;
    }
  };

  const updateCreditCard = async (id: string, updates: Partial<CreditCard>) => {
    try {
      await accountService.update(id, updates);
      setCreditCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c))
      );
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
      throw error;
    }
  };

  const deleteCreditCard = async (id: string) => {
    try {
      await accountService.delete(id);
      setCreditCards((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Erro ao deletar cartão:', error);
      throw error;
    }
  };

  // CRUD BankAccounts
  const addBankAccount = async (account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newAccount = await accountService.createBankAccount(account);
      setBankAccounts((prev) => [...prev, newAccount]);
      // Recarregar todos os dados para sincronizar
      await loadAllData();
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      throw error;
    }
  };

  const updateBankAccount = async (id: string, updates: Partial<BankAccount>) => {
    try {
      await accountService.update(id, updates);
      setBankAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a))
      );
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      throw error;
    }
  };

  const deleteBankAccount = async (id: string) => {
    try {
      await accountService.delete(id);
      setBankAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      throw error;
    }
  };

  // CRUD FamilyMembers
  const addFamilyMember = async (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newMember = await familyMemberService.create(member);
      setFamilyMembers((prev) => [...prev, newMember]);
    } catch (error) {
      console.error('Erro ao criar membro:', error);
      throw error;
    }
  };

  const updateFamilyMember = async (id: string, updates: Partial<FamilyMember>) => {
    try {
      const updated = await familyMemberService.update(id, updates);
      setFamilyMembers((prev) =>
        prev.map((m) => (m.id === id ? updated : m))
      );
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      throw error;
    }
  };

  const deleteFamilyMember = async (id: string) => {
    try {
      await familyMemberService.delete(id);
      setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Erro ao deletar membro:', error);
      throw error;
    }
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

  const value: FinanceContextType = {
    transactions,
    goals,
    creditCards,
    bankAccounts,
    familyMembers,
    loading,
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
    refreshTransactions,
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
