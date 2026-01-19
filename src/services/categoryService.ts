import { supabase } from '@/lib/supabase';
import { TransactionCategory, TransactionType } from '@/types';
import { Category } from '@/types/category';

const mapCategoryFromDb = (row: any): TransactionCategory => {
  // Mapear nome do banco para categoria da aplicação
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

  return (categoryMap[row.name] || 'other') as TransactionCategory;
};

const mapFullCategoryFromDb = (row: any): Category => {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    icon: row.icon || '📌',
    type: (row.type?.toLowerCase() || 'expense') as TransactionType,
    color: row.color || '#3247FF',
    accountId: row.account_id || null,
    isActive: row.is_active !== false,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
};

export const categoryService = {
  // Buscar todas as categorias do usuário
  async getAll(userId: string, type?: TransactionType): Promise<TransactionCategory[]> {
    let query = supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (type) {
      query = query.eq('type', type.toUpperCase());
    }

    const { data, error } = await query;

    if (error) throw error;

    // Retornar categorias padrão + personalizadas
    const defaultCategories: TransactionCategory[] = [
      'rent',
      'food',
      'shopping',
      'household',
      'transport',
      'entertainment',
      'health',
      'education',
      'other',
    ];

    const customCategories = (data || []).map(mapCategoryFromDb);
    return [...new Set([...defaultCategories, ...customCategories])];
  },

  // Criar nova categoria
  async create(name: string, type: TransactionType, icon?: string, color?: string, accountId?: string | null): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const insertData: any = {
      user_id: userId,
      name,
      type: type.toUpperCase() as 'INCOME' | 'EXPENSE',
      icon: icon || '📌',
      color: color || '#3247FF',
      is_active: true,
    };

    if (accountId) {
      insertData.account_id = accountId;
    }

    // @ts-ignore - Database types serão gerados depois das migrations
    const { error } = await supabase.from('categories').insert(insertData);

    if (error) throw error;
  },

  // Atualizar categoria
  async update(id: string, updates: { name?: string; icon?: string; color?: string; accountId?: string | null }): Promise<void> {
    const updateData: any = {};

    if (updates.name) updateData.name = updates.name;
    if (updates.icon) updateData.icon = updates.icon;
    if (updates.color) updateData.color = updates.color;
    if (updates.accountId !== undefined) updateData.account_id = updates.accountId;

    // @ts-ignore - Database types serão gerados depois das migrations
    const { error } = await supabase.from('categories').update(updateData).eq('id', id);
    if (error) throw error;
  },

  // Deletar categoria (soft delete)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  // Buscar todas as categorias personalizadas completas (com id, cor, etc)
  async getAllCustom(userId: string, type?: TransactionType): Promise<Category[]> {
    let query = supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type.toUpperCase());
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(mapFullCategoryFromDb);
  },

  // Buscar categoria por ID
  async getById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data ? mapFullCategoryFromDb(data) : null;
  },
};
