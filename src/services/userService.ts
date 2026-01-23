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

    // Verificar se há algo para atualizar
    if (Object.keys(updateData).length === 0) {
      // Se não há nada para atualizar, apenas retornar o perfil atual
      return await this.getProfile(userId) || { id: userId, email: '', name: '' } as UserProfile;
    }

    // @ts-ignore - Database types serão gerados depois das migrations
    // Fazer o update e verificar se alguma linha foi afetada
    console.log('🔄 Atualizando perfil:', { userId, updateData });
    
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, avatar_url');

    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError);
      throw updateError;
    }

    // Verificar se alguma linha foi atualizada
    if (!updateResult || updateResult.length === 0) {
      console.error('❌ Nenhuma linha foi atualizada. Possíveis causas:');
      console.error('   - RLS policy bloqueando o update');
      console.error('   - userId não corresponde ao auth.uid()');
      console.error('   - Usuário não encontrado');
      
      // Tentar buscar o perfil atual para verificar se existe
      const currentProfile = await this.getProfile(userId);
      if (!currentProfile) {
        // Se não conseguiu buscar, verificar diretamente no banco
        const { data: directCheck, error: directError } = await supabase
          .from('users')
          .select('id, email, name')
          .eq('id', userId)
          .single();
        
        if (directError) {
          console.error('❌ Erro ao verificar perfil diretamente:', directError);
          throw new Error(`Erro ao verificar perfil: ${directError.message}. Verifique se o usuário está autenticado corretamente.`);
        }
        
        if (!directCheck) {
          throw new Error('Perfil não encontrado no banco de dados. Verifique se o usuário está autenticado corretamente.');
        }
        
        // Se encontrou diretamente mas getProfile não retornou, pode ser problema de RLS no getProfile
        console.warn('⚠️ Perfil encontrado diretamente mas getProfile retornou null. Pode ser problema de RLS.');
        // Retornar um perfil básico baseado nos dados diretos
        return {
          id: directCheck.id,
          email: directCheck.email,
          name: directCheck.name,
          avatarUrl: updateData.avatar_url || null,
          phone: null,
          address: null,
          currency: 'BRL',
          dateFormat: 'DD/MM/YYYY',
          language: 'pt-BR',
        };
      }
      
      // Se o perfil existe mas não foi atualizado, pode ser problema de RLS
      throw new Error('Falha ao atualizar perfil. Verifique as políticas RLS e a autenticação.');
    }

    console.log('✅ Perfil atualizado com sucesso:', { 
      rowsAffected: updateResult.length,
      newAvatarUrl: updateResult[0]?.avatar_url 
    });

    // Aguardar um pouco para garantir que o commit foi feito
    await new Promise(resolve => setTimeout(resolve, 100));

    // Depois buscar o perfil atualizado completo para garantir que temos os dados corretos
    // Tentar até 3 vezes com delay crescente caso falhe
    let updatedProfile: UserProfile | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      updatedProfile = await this.getProfile(userId);
      if (updatedProfile) break;
      
      if (attempt < 2) {
        console.warn(`⚠️ Tentativa ${attempt + 1} de buscar perfil falhou, tentando novamente...`);
        await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
      }
    }
    
    if (!updatedProfile) {
      // Se ainda não conseguiu, usar os dados do updateResult
      console.warn('⚠️ Não foi possível buscar perfil completo após update, usando dados do updateResult');
      const { data: fallbackData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (fallbackData) {
        return mapUserFromDb(fallbackData);
      }
      
      throw new Error('Perfil não encontrado após atualização. O update pode ter sido bem-sucedido, mas não foi possível recuperar os dados atualizados.');
    }

    // Usar os dados do perfil atualizado
    const data = {
      id: updatedProfile.id,
      email: updatedProfile.email,
      name: updatedProfile.name,
      avatar_url: updatedProfile.avatarUrl,
      phone: updatedProfile.phone,
      address: updatedProfile.address,
      currency: updatedProfile.currency,
      date_format: updatedProfile.dateFormat,
      language: updatedProfile.language,
    };

    // Se o nome foi atualizado, sincronizar com o owner
    if (updates.name) {
      try {
        // Atualizar o nome do owner para corresponder ao nome do usuário
        // Usar .limit(1) para garantir que apenas um owner seja atualizado
        const { error: ownerError } = await supabase
          .from('family_members')
          .update({ name: updates.name })
          .eq('user_id', userId)
          .ilike('role', 'owner')
          .eq('is_active', true)
          .limit(1);
        
        if (ownerError) {
          console.error('Erro ao sincronizar nome do owner:', ownerError);
        }
      } catch (ownerError) {
        // Logar erro mas não bloquear a atualização do perfil
        console.error('Erro ao sincronizar nome do owner:', ownerError);
      }
    }

    // Se o avatar foi atualizado, sincronizar com o owner
    if (updates.avatarUrl !== undefined) {
      try {
        // Atualizar o avatar do owner para corresponder ao avatar do usuário
        // Usar .limit(1) para garantir que apenas um owner seja atualizado
        const { error: ownerError } = await supabase
          .from('family_members')
          .update({ avatar_url: updates.avatarUrl })
          .eq('user_id', userId)
          .ilike('role', 'owner')
          .eq('is_active', true)
          .limit(1);
        
        if (ownerError) {
          console.error('Erro ao sincronizar avatar do owner:', ownerError);
        }
      } catch (ownerError) {
        // Logar erro mas não bloquear a atualização do perfil
        console.error('Erro ao sincronizar avatar do owner:', ownerError);
      }
    }

    return mapUserFromDb(data);
  },
};