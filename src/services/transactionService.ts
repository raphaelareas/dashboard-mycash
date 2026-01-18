import { supabase } from '@/lib/supabase';
import { Transaction, TransactionType, TransactionCategory } from '@/types';

// Converter enum do banco para tipo da aplicação
const mapTransactionType = (type: string): TransactionType => {
  return type === 'INCOME' ? 'income' : 'expense';
};

const mapTransactionTypeToDb = (type: TransactionType): 'INCOME' | 'EXPENSE' => {
  return type === 'income' ? 'INCOME' : 'EXPENSE';
};

const mapTransactionStatus = (status: string): 'PENDING' | 'COMPLETED' => {
  return status === 'PENDING' ? 'PENDING' : 'COMPLETED';
};

// Mapear nome de categoria do banco para TransactionCategory
const mapCategoryName = (categoryName: string | null | undefined): TransactionCategory => {
  if (!categoryName) return 'other';
  
  const categoryMap: Record<string, TransactionCategory> = {
    'Aluguel': 'rent',
    'Alimentação': 'food',
    'Compras': 'shopping',
    'Contas de casa': 'household',
    'Transporte': 'transport',
    'Entretenimento': 'entertainment',
    'Saúde': 'health',
    'Educação': 'education',
    'Outros': 'other',
  };

  return categoryMap[categoryName] || 'other';
};

// Converter dados do banco para formato da aplicação
const mapTransactionFromDb = (row: any): Transaction => {
  // Se row.category é um objeto (join), usar row.category.name
  // Se é string ou null, tratar adequadamente
  const categoryName = typeof row.category === 'object' ? row.category?.name : null;
  
  return {
    id: row.id,
    type: mapTransactionType(row.type),
    category: mapCategoryName(categoryName),
    amount: parseFloat(row.amount.toString()),
    description: row.description,
    date: new Date(row.date),
    accountId: row.account_id || '',
    memberId: row.member_id || null,
    installments: row.total_installments || 1,
    isRecurring: row.is_recurring || false,
    isPaid: row.status === 'COMPLETED',
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
};

export const transactionService = {
  // Buscar todas as transações do usuário
  async getAll(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(*),
        account:accounts(*),
        member:family_members(*)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapTransactionFromDb);
  },

  // Buscar transação por ID
  async getById(id: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(*),
        account:accounts(*),
        member:family_members(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? mapTransactionFromDb(data) : null;
  },

  // Criar nova transação
  async create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    // Buscar category_id pela categoria
    let categoryId: string | null = null;
    if (transaction.category && transaction.category !== 'other') {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('name', transaction.category)
        .single();
      categoryId = category?.id || null;
    }

    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: mapTransactionTypeToDb(transaction.type),
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date.toISOString().split('T')[0],
        category_id: categoryId,
        account_id: transaction.accountId || null,
        member_id: transaction.memberId || null,
        total_installments: transaction.installments || 1,
        installment_number: transaction.installments && transaction.installments > 1 ? 1 : null,
        is_recurring: transaction.isRecurring || false,
        status: transaction.isPaid ? 'COMPLETED' : 'PENDING',
      })
      .select(`
        *,
        category:categories(*),
        account:accounts(*),
        member:family_members(*)
      `)
      .single();

    if (error) throw error;
    return mapTransactionFromDb(data);
  },

  // Atualizar transação
  async update(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const updateData: any = {};

    if (updates.type) updateData.type = mapTransactionTypeToDb(updates.type);
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.description) updateData.description = updates.description;
    if (updates.date) updateData.date = updates.date.toISOString().split('T')[0];
    if (updates.accountId !== undefined) updateData.account_id = updates.accountId || null;
    if (updates.memberId !== undefined) updateData.member_id = updates.memberId || null;
    if (updates.installments) updateData.total_installments = updates.installments;
    if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring;
    if (updates.isPaid !== undefined) updateData.status = updates.isPaid ? 'COMPLETED' : 'PENDING';

    // Buscar category_id se categoria foi alterada
    if (updates.category) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('name', updates.category)
        .single();
      updateData.category_id = category?.id || null;
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        category:categories(*),
        account:accounts(*),
        member:family_members(*)
      `)
      .single();

    if (error) throw error;
    return mapTransactionFromDb(data);
  },

  // Deletar transação
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
  },
};
