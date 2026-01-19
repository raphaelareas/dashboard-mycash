import { supabase } from '@/lib/supabase';
import { FamilyMember } from '@/types';

// Armazenar role original do banco para exibição
const originalRoles = new Map<string, string>();

const mapFamilyMemberFromDb = (row: any): FamilyMember => {
  // Armazenar role original do banco
  originalRoles.set(row.id, row.role);
  
  // Mapear role do banco para o tipo TypeScript
  // Banco pode ter: 'Owner', 'Filho', 'Pai', etc.
  // TypeScript espera: 'owner' | 'member' | 'viewer'
  let role: 'owner' | 'member' | 'viewer' = 'member';
  const roleLower = (row.role || '').toLowerCase();
  if (roleLower === 'owner') {
    role = 'owner';
  } else if (roleLower === 'viewer') {
    role = 'viewer';
  } else {
    role = 'member'; // Qualquer outro role (Filho, Pai, etc.) é tratado como member
  }
  
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: '', // Email não está no schema atual
    avatarUrl: row.avatar_url || undefined,
    role,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
};

// Função helper para obter role original
export const getOriginalRole = (memberId: string): string | undefined => {
  return originalRoles.get(memberId);
};

export const familyMemberService = {
  // Buscar todos os membros da família do usuário
  async getAll(userId: string): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Limpar cache de roles originais antes de mapear
    originalRoles.clear();
    
    const members = (data || []).map(mapFamilyMemberFromDb);
    return members;
  },


  // Buscar membro por ID
  async getById(id: string): Promise<FamilyMember | null> {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? mapFamilyMemberFromDb(data) : null;
  },

  // Criar novo membro
  async create(member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>, customRole?: string): Promise<FamilyMember> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    // Mapear role: se tiver customRole, usar ele; senão mapear do TypeScript
    let roleForDb: string;
    if (customRole) {
      // Role customizado (Filho, Pai, etc.) - usar diretamente
      roleForDb = customRole;
    } else if (member.role === 'owner') {
      roleForDb = 'Owner';
    } else {
      // Para outros roles TypeScript, salvar como 'Member'
      roleForDb = 'Member';
    }

    // @ts-ignore - Database types serão gerados depois das migrations
    const { data, error } = await supabase
      .from('family_members')
      .insert({
        user_id: userId,
        name: member.name,
        role: roleForDb,
        avatar_url: member.avatarUrl || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return mapFamilyMemberFromDb(data);
  },

  // Atualizar membro
  async update(id: string, updates: Partial<FamilyMember>, customRole?: string): Promise<FamilyMember> {
    const updateData: any = {};

    if (updates.name) updateData.name = updates.name;
    if (updates.role !== undefined || customRole) {
      // Se tiver customRole, usar ele; senão mapear do TypeScript
      if (customRole) {
        updateData.role = customRole;
      } else if (updates.role === 'owner') {
        updateData.role = 'Owner';
      } else {
        // Para outros roles TypeScript, manter como está (será mapeado de volta)
        // Mas na prática, vamos buscar o role atual do banco e manter
        updateData.role = updates.role;
      }
    }
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl || null;

    // @ts-ignore - Database types serão gerados depois das migrations
    const { data, error } = await supabase
      .from('family_members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapFamilyMemberFromDb(data as any);
  },

  // Deletar membro (soft delete - marca como inativo)
  async delete(id: string): Promise<void> {
    // @ts-ignore - Database types serão gerados depois das migrations
    const { error } = await supabase
      .from('family_members')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },
};
