import { supabase } from '@/lib/supabase';
import { Transaction, TransactionType, TransactionCategory } from '@/types';

// Converter enum do banco para tipo da aplicação
const mapTransactionType = (type: string): TransactionType => {
  return type === 'INCOME' ? 'income' : 'expense';
};

const mapTransactionTypeToDb = (type: TransactionType): 'INCOME' | 'EXPENSE' => {
  return type === 'income' ? 'INCOME' : 'EXPENSE';
};

// Mapear nome de categoria do banco para TransactionCategory
// Se for categoria padrão, retorna o enum. Se for customizada, retorna o nome diretamente.
const mapCategoryName = (categoryName: string | null | undefined): TransactionCategory | string => {
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

  // Se está no mapeamento, retorna o enum
  if (categoryMap[categoryName]) {
    return categoryMap[categoryName];
  }
  
  // Caso contrário, é uma categoria customizada - retorna o nome diretamente
  return categoryName;
};

// Mapear enum de categoria para nome em português (para buscar no banco)
const mapCategoryEnumToName = (category: TransactionCategory | string): string => {
  // Se já é uma string (categoria customizada), retorna direto
  if (typeof category === 'string' && !['rent', 'food', 'shopping', 'household', 'transport', 'entertainment', 'health', 'education', 'other'].includes(category)) {
    return category;
  }
  
  // Mapear enum para nome em português
  const enumToNameMap: Record<TransactionCategory, string> = {
    'rent': 'Aluguel',
    'food': 'Alimentação',
    'shopping': 'Compras',
    'household': 'Contas de casa',
    'transport': 'Transporte',
    'entertainment': 'Entretenimento',
    'health': 'Saúde',
    'education': 'Educação',
    'other': 'Outros',
  };

  return enumToNameMap[category as TransactionCategory] || category;
};

// Converter dados do banco para formato da aplicação
const mapTransactionFromDb = (row: any): Transaction => {
  // Se row.category é um objeto (join), usar row.category.name
  // Se é string ou null, tratar adequadamente
  let categoryName: string | null = null;
  
  if (row.category) {
    if (typeof row.category === 'object' && row.category !== null) {
      categoryName = row.category.name || null;
    } else if (typeof row.category === 'string') {
      categoryName = row.category;
    }
  }
  
  // Se não tem categoria, retornar 'other'
  const mappedCategory = categoryName ? mapCategoryName(categoryName) : 'other';
  
  return {
    id: row.id,
    type: mapTransactionType(row.type),
    category: mappedCategory,
    amount: parseFloat(row.amount.toString()),
    description: row.description,
    date: new Date(row.date),
    accountId: row.account_id || '',
    memberId: row.member_id || null,
    installments: row.total_installments || 1,
    installmentNumber: row.installment_number || 1,
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
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    // Buscar category_id pela categoria
    let categoryId: string | null = null;
    if (transaction.category && transaction.category !== 'other') {
      // Converter enum para nome em português antes de buscar no banco
      const categoryName = mapCategoryEnumToName(transaction.category);
      
      // @ts-ignore - Database types serão gerados depois das migrations
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryName)
        .eq('user_id', userId)
        .single();
      
      categoryId = (category as any)?.id || null;
      
      // Se não encontrou a categoria e é uma categoria padrão, criar ela
      if (!categoryId && ['rent', 'food', 'shopping', 'household', 'transport', 'entertainment', 'health', 'education'].includes(transaction.category as string)) {
        const defaultCategoryColors: Record<string, string> = {
          'rent': '#EF4444',
          'food': '#F59E0B',
          'shopping': '#8B5CF6',
          'household': '#10B981',
          'transport': '#3B82F6',
          'entertainment': '#EC4899',
          'health': '#06B6D4',
          'education': '#6366F1',
        };
        
        const categoryType = transaction.type === 'income' ? 'INCOME' : 'EXPENSE';
        
        // @ts-ignore
        const { data: newCategory, error: createError } = await supabase
          .from('categories')
          .insert({
            user_id: userId,
            name: categoryName,
            type: categoryType,
            color: defaultCategoryColors[transaction.category as string] || '#3247FF',
            is_active: true,
          })
          .select('id')
          .single();
        
        if (!createError && newCategory) {
          categoryId = (newCategory as any)?.id;
        }
      }
    }

    const totalInstallments = transaction.installments || 1;
    const currentInstallment = transaction.installmentNumber || 1;
    const isInstallment = totalInstallments > 1 && currentInstallment > 0;
    
    // Calcular quantas parcelas restam (ex: 7/12 = 6 parcelas restantes)
    const remainingInstallments = isInstallment 
      ? totalInstallments - currentInstallment + 1 
      : totalInstallments;
    
    // Determinar recorrência baseada no installmentRecurrence
    const recurrence = (transaction as any).installmentRecurrence || 'monthly';

    // Criar a primeira transação (a que o usuário está registrando)
    const firstTransactionData = {
      user_id: userId,
      type: mapTransactionTypeToDb(transaction.type),
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date.toISOString().split('T')[0],
      category_id: categoryId,
      account_id: transaction.accountId || null,
      member_id: transaction.memberId || null,
      total_installments: totalInstallments,
      installment_number: currentInstallment,
      is_recurring: false,
      status: transaction.isPaid ? 'COMPLETED' : 'PENDING',
    };

    // @ts-ignore - Database types serão gerados depois das migrations
    const { data: firstTransaction, error: firstError } = await supabase
      .from('transactions')
      .insert(firstTransactionData)
      .select(`
        *,
        category:categories(*),
        account:accounts(*),
        member:family_members(*)
      `)
      .single();

    if (firstError) throw firstError;

    // Se há parcelas restantes, criar as próximas transações automaticamente
    if (isInstallment && remainingInstallments > 1) {
      const futureTransactions = [];
      let currentDate = new Date(transaction.date);
      
      // Criar as próximas parcelas (ex: se é 7/12, criar 8, 9, 10, 11, 12)
      for (let i = 1; i < remainingInstallments; i++) {
        // Avançar data conforme recorrência
        currentDate = new Date(currentDate);
        
        // Calcular próxima data baseado na recorrência
        switch (recurrence) {
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case 'biweekly':
            currentDate.setDate(currentDate.getDate() + 14);
            break;
          case 'monthly':
            // Usar setMonth para manter o dia do mês (ex: 28/01 -> 28/02)
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
          case 'semiannual':
            currentDate.setMonth(currentDate.getMonth() + 6);
            break;
          case 'yearly':
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            break;
          case 'fixed':
          default:
            // Mensal como padrão
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
        }
        
        futureTransactions.push({
          user_id: userId,
          type: mapTransactionTypeToDb(transaction.type),
          amount: transaction.amount,
          description: transaction.description,
          date: currentDate.toISOString().split('T')[0],
          category_id: categoryId,
          account_id: transaction.accountId || null,
          member_id: transaction.memberId || null,
          total_installments: totalInstallments,
          installment_number: currentInstallment + i, // 8, 9, 10, 11, 12
          is_recurring: false,
          status: 'PENDING', // Futuras parcelas começam como pendentes
        });
      }

      // Inserir todas as parcelas futuras de uma vez
      if (futureTransactions.length > 0) {
        // @ts-ignore - Database types serão gerados depois das migrations
        const { error: futureError } = await supabase
          .from('transactions')
          .insert(futureTransactions);

        if (futureError) {
          console.error('Erro ao criar parcelas futuras:', futureError);
          // Não lançar erro aqui para não quebrar a criação da primeira transação
        }
      }
    }

    return mapTransactionFromDb(firstTransaction);
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
      // Converter enum para nome em português antes de buscar no banco
      const categoryName = mapCategoryEnumToName(updates.category);
      
      const userId = (await supabase.auth.getUser()).data.user?.id;
      // @ts-ignore - Database types serão gerados depois das migrations
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryName)
        .eq('user_id', userId || '')
        .single();
      updateData.category_id = (category as any)?.id || null;
    }

    // @ts-ignore - Database types serão gerados depois das migrations
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
