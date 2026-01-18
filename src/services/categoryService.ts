import { supabase } from '@/lib/supabase';
import { TransactionCategory, TransactionType } from '@/types';

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
  async create(name: string, type: TransactionType, icon?: string, color?: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase.from('categories').insert({
      user_id: userId,
      name,
      type: type.toUpperCase() as 'INCOME' | 'EXPENSE',
      icon: icon || '📌',
      color: color || '#3247FF',
      is_active: true,
    });

    if (error) throw error;
  },

  // Atualizar categoria
  async update(id: string, updates: { name?: string; icon?: string; color?: string }): Promise<void> {
    const updateData: any = {};

    if (updates.name) updateData.name = updates.name;
    if (updates.icon) updateData.icon = updates.icon;
    if (updates.color) updateData.color = updates.color;

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
};
