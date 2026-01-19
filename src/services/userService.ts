import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  phone?: string | null;
  address?: string | null;
  currency?: string | null;
  dateFormat?: string | null;
  language?: string | null;
}

const mapUserFromDb = (row: any): UserProfile => {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url || null,
    phone: row.phone || null,
    address: row.address || null,
    currency: row.currency || 'BRL',
    dateFormat: row.date_format || 'DD/MM/YYYY',
    language: row.language || 'pt-BR',
  };
};

export const userService = {
  // Buscar perfil do usuário
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data ? mapUserFromDb(data) : null;
  },

  // Atualizar perfil do usuário
  async updateProfile(userId: string, updates: Partial<{ name: string; avatarUrl: string | null; phone: string | null; address: string | null; currency: string; dateFormat: string; language: string }>): Promise<UserProfile> {
    const updateData: any = {};

    if (updates.name) updateData.name = updates.name;
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.dateFormat !== undefined) updateData.date_format = updates.dateFormat;
    if (updates.language !== undefined) updateData.language = updates.language;
    // TODO: Adicionar phone e address ao schema antes de habilitar
    // if (updates.phone !== undefined) updateData.phone = updates.phone;
    // if (updates.address !== undefined) updateData.address = updates.address;

    // @ts-ignore - Database types serão gerados depois das migrations
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return mapUserFromDb(data);
  },
};