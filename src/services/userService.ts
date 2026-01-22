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

    if (!data) return null;

    // Se há avatar_url salvo, gerar nova URL assinada para garantir que não expirou
    let avatarUrl = data.avatar_url;
    if (avatarUrl && avatarUrl.includes('/storage/v1/object/sign/avatars/')) {
      try {
        // Extrair o path do avatar_url antigo ou usar o padrão
        const fileExt = avatarUrl.split('.').pop()?.split('?')[0] || 'png';
        const fileName = `avatar.${fileExt}`;
        const fullPath = `${userId}/${fileName}`;
        
        // Gerar nova URL assinada
        const { data: signedData, error: urlError } = await supabase.storage
          .from('avatars')
          .createSignedUrl(fullPath, 31536000); // 1 ano de validade
        
        if (!urlError && signedData) {
          avatarUrl = signedData.signedUrl;
        }
      } catch (error) {
        console.error('Erro ao gerar nova URL assinada:', error);
        // Continuar com a URL antiga se houver erro
      }
    }

    return mapUserFromDb({ ...data, avatar_url: avatarUrl });
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

    // Se o nome foi atualizado, sincronizar com o owner
    if (updates.name) {
      try {
        // Atualizar o nome do owner para corresponder ao nome do usuário
        await supabase
          .from('family_members')
          .update({ name: updates.name })
          .eq('user_id', userId)
          .ilike('role', 'owner')
          .eq('is_active', true);
      } catch (ownerError) {
        // Logar erro mas não bloquear a atualização do perfil
        console.error('Erro ao sincronizar nome do owner:', ownerError);
      }
    }

    // Se o avatar foi atualizado, sincronizar com o owner
    if (updates.avatarUrl !== undefined) {
      try {
        // Atualizar o avatar do owner para corresponder ao avatar do usuário
        await supabase
          .from('family_members')
          .update({ avatar_url: updates.avatarUrl })
          .eq('user_id', userId)
          .ilike('role', 'owner')
          .eq('is_active', true);
      } catch (ownerError) {
        // Logar erro mas não bloquear a atualização do perfil
        console.error('Erro ao sincronizar avatar do owner:', ownerError);
      }
    }

    return mapUserFromDb(data);
  },
};