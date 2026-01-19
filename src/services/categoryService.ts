import { supabase } from '@/lib/supabase';
import { TransactionCategory, TransactionType } from '@/types';
import { Category } from '@/types/category';
import { defaultCategoryColors } from '@/utils/categoryColors';

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

// Mapear enum de categoria para nome em português
const mapCategoryEnumToName = (category: TransactionCategory): string => {
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
  return enumToNameMap[category] || 'Outros';
};

// Criar objetos Category para categorias padrão
const createDefaultCategories = (userId: string): Category[] => {
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

  return defaultCategories.map((cat) => ({
    id: `default_${cat}`, // ID virtual para categorias padrão
    userId,
    name: mapCategoryEnumToName(cat),
    icon: '📌',
    type: (cat === 'rent' || cat === 'food' || cat === 'shopping' || cat === 'household' || cat === 'transport' || cat === 'entertainment' || cat === 'health' || cat === 'education' || cat === 'other') ? 'expense' : 'expense', // Todas padrão são expense por enquanto
    color: defaultCategoryColors[cat] || '#6B7280',
    accountId: null,
    isActive: true,
    createdAt: new Date(0), // Data antiga para indicar que é padrão
    updatedAt: new Date(0),
  }));
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
  // Se for categoria padrão (id começa com "default_"), cria uma nova categoria customizada
  async update(id: string, updates: { name?: string; type?: TransactionType; icon?: string; color?: string; accountId?: string | null }): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    // Se for categoria padrão, criar como customizada
    if (id.startsWith('default_')) {
      const categoryEnum = id.replace('default_', '') as TransactionCategory;
      const defaultName = mapCategoryEnumToName(categoryEnum);
      
      const insertData: any = {
        user_id: userId,
        name: updates.name || defaultName,
        type: (updates.type || 'expense').toUpperCase() as 'INCOME' | 'EXPENSE',
        icon: updates.icon || '📌',
        color: updates.color || defaultCategoryColors[categoryEnum] || '#6B7280',
        is_active: true,
      };

      if (updates.accountId !== undefined) {
        insertData.account_id = updates.accountId;
      }

      // @ts-ignore - Database types serão gerados depois das migrations
      const { error } = await supabase.from('categories').insert(insertData);
      if (error) throw error;
      return;
    }

    // Atualizar categoria customizada existente
    const updateData: any = {};

    if (updates.name) updateData.name = updates.name;
    if (updates.type) updateData.type = updates.type.toUpperCase() as 'INCOME' | 'EXPENSE';
    if (updates.icon) updateData.icon = updates.icon;
    if (updates.color) updateData.color = updates.color;
    if (updates.accountId !== undefined) updateData.account_id = updates.accountId;

    // @ts-ignore - Database types serão gerados depois das migrations
    const { error } = await supabase.from('categories').update(updateData).eq('id', id);
    if (error) throw error;
  },

  // Deletar categoria (soft delete)
  // Se for categoria padrão (id começa com "default_"), cria uma categoria customizada desativada
  // para "esconder" a padrão do usuário
  async delete(id: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    // Se for categoria padrão, criar como customizada desativada para escondê-la
    if (id.startsWith('default_')) {
      const categoryEnum = id.replace('default_', '') as TransactionCategory;
      const defaultName = mapCategoryEnumToName(categoryEnum);
      
      const insertData: any = {
        user_id: userId,
        name: defaultName,
        type: 'EXPENSE',
        icon: '📌',
        color: defaultCategoryColors[categoryEnum] || '#6B7280',
        is_active: false, // Desativada para esconder
      };

      // @ts-ignore - Database types serão gerados depois das migrations
      const { error } = await supabase.from('categories').insert(insertData);
      if (error) throw error;
      return;
    }

    // Deletar categoria customizada (soft delete)
    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  // Buscar todas as categorias personalizadas completas (com id, cor, etc)
  // Inclui também as categorias padrão do sistema
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

    const customCategories = (data || []).map(mapFullCategoryFromDb);
    
    // Obter nomes das categorias customizadas para evitar duplicatas
    const customCategoryNames = new Set(customCategories.map(c => c.name));
    
    // Criar categorias padrão
    const defaultCategories = createDefaultCategories(userId);
    
    // Filtrar categorias padrão que já existem como customizadas
    const defaultCategoriesFiltered = defaultCategories.filter(
      (defaultCat) => !customCategoryNames.has(defaultCat.name)
    );
    
    // Filtrar por tipo se necessário
    const filteredDefaults = type 
      ? defaultCategoriesFiltered.filter(cat => cat.type === type)
      : defaultCategoriesFiltered;
    
    // Retornar categorias padrão primeiro, depois as customizadas
    return [...filteredDefaults, ...customCategories];
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
