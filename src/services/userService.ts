import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  phone?: string | null;
  address?: string | null; // Mantido para compatibilidade
  cep?: string | null;
  street?: string | null;
  addressNumber?: string | null;
  city?: string | null;
  state?: string | null;
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
    address: row.address || null, // Mantido para compatibilidade
    cep: row.cep || null,
    street: row.street || null,
    addressNumber: row.address_number || null,
    city: row.city || null,
    state: row.state || null,
    currency: row.currency || 'BRL',
    dateFormat: row.date_format || 'DD/MM/YYYY',
    language: row.language || 'pt-BR',
  };
};

export const userService = {
  // Buscar perfil do usuário - versão simplificada
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Erro ao buscar perfil:', error);
        throw error;
      }

      if (!data) return null;

      return mapUserFromDb(data);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw error;
    }
  },

  // Atualizar avatar do usuário - versão simplificada e focada
  async updateAvatar(userId: string, avatarUrl: string): Promise<UserProfile> {
    console.log('🔄 Atualizando avatar:', { userId, avatarUrl: avatarUrl.substring(0, 50) + '...' });

    // Atualizar apenas o avatar_url
    const { data, error } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar avatar:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Perfil não encontrado após atualização');
    }

    console.log('✅ Avatar atualizado com sucesso');
    // O trigger no banco vai sincronizar automaticamente com o owner
    return mapUserFromDb(data);
  },

  // Deletar avatar do usuário
  async deleteAvatar(userId: string): Promise<UserProfile> {
    console.log('🗑️ Deletando avatar:', { userId });

    // Atualizar avatar_url para null
    const { data, error } = await supabase
      .from('users')
      .update({ avatar_url: null })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Erro ao deletar avatar:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Perfil não encontrado após deletar avatar');
    }

    console.log('✅ Avatar deletado com sucesso');
    return mapUserFromDb(data);
  },

  // Atualizar perfil do usuário (para outros campos)
  async updateProfile(
    userId: string, 
    updates: Partial<{ 
      name: string; 
      phone: string | null; 
      address: string | null; 
      cep: string | null;
      street: string | null;
      addressNumber: string | null;
      city: string | null;
      state: string | null;
      currency: string; 
      dateFormat: string; 
      language: string;
    }>
  ): Promise<UserProfile> {
    const updateData: any = {};

    if (updates.name) updateData.name = updates.name;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.address !== undefined) updateData.address = updates.address; // Mantido para compatibilidade
    if (updates.cep !== undefined) updateData.cep = updates.cep;
    if (updates.street !== undefined) updateData.street = updates.street;
    if (updates.addressNumber !== undefined) updateData.address_number = updates.addressNumber;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.state !== undefined) updateData.state = updates.state;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.dateFormat !== undefined) updateData.date_format = updates.dateFormat;
    if (updates.language !== undefined) updateData.language = updates.language;

    // Verificar se há algo para atualizar
    if (Object.keys(updateData).length === 0) {
      return await this.getProfile(userId) || { id: userId, email: '', name: '' } as UserProfile;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Perfil não encontrado após atualização');
    }

    // Se o nome foi atualizado, sincronizar com o owner
    if (updates.name) {
      try {
        await supabase
          .from('family_members')
          .update({ name: updates.name })
          .eq('user_id', userId)
          .ilike('role', 'owner')
          .eq('is_active', true);
      } catch (ownerError) {
        console.error('Erro ao sincronizar nome do owner:', ownerError);
      }
    }

    return mapUserFromDb(data);
  },
};
