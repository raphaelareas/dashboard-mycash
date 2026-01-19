import { supabase } from '@/lib/supabase';
import { FamilyMember } from '@/types';

// Paleta de cores pastéis (equivalente a ~15% de opacidade sobre branco)
const PASTEL_COLORS = [
  '#DBEAFE', // azul claro (blue-100)
  '#FCE7F3', // rosa claro (pink-100)
  '#DCFCE7', // verde claro (green-100)
  '#FEF3C7', // amarelo/âmbar claro (amber-100)
  '#E0E7FF', // índigo claro (indigo-100)
  '#F3E8FF', // roxo claro (purple-100)
  '#F1F5F9', // cinza azulado claro (slate-100)
  '#E0F2FE', // ciano claro (cyan-100)
  '#FED7AA', // laranja claro (orange-100)
];

// Cores fortes legadas que queremos substituir por versões pastéis
const LEGACY_STRONG_COLORS = [
  '#3247FF',
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F97316',
  '#F59E0B',
  '#6366F1',
];

// Função para obter cor pastel determinística baseada em um ID/string
const getPastelColorForId = (id: string): string => {
  const hash = id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return PASTEL_COLORS[hash % PASTEL_COLORS.length];
};

const getRandomPastelColor = (): string => {
  // Para novos membros, usar cor baseada em timestamp + random para variar
  const random = Math.random() * 1000;
  const hash = Math.floor(random);
  return PASTEL_COLORS[hash % PASTEL_COLORS.length];
};

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
  
  // Garantir que membros antigos também usem paleta pastel
  // Se não tem cor, ou se a cor é forte (legada), substituir por pastel determinístico
  let color: string;
  if (!row.color || LEGACY_STRONG_COLORS.includes(row.color)) {
    // Usar cor determinística baseada no ID para manter consistência
    color = getPastelColorForId(row.id);
  } else if (PASTEL_COLORS.includes(row.color)) {
    // Se já é uma cor pastel, manter
    color = row.color;
  } else {
    // Se é uma cor que não conhecemos, verificar se é forte (hex escuro)
    // Cores fortes geralmente têm valores RGB altos em pelo menos um canal
    const hex = row.color.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      // Se algum canal RGB > 200, provavelmente é uma cor forte
      if (r > 200 || g > 200 || b > 200) {
        // Substituir por pastel determinístico
        color = getPastelColorForId(row.id);
      } else {
        color = row.color;
      }
    } else {
      // Cor inválida ou formato desconhecido, usar pastel determinístico
      color = getPastelColorForId(row.id);
    }
  }

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: '', // Email não está no schema atual
    avatarUrl: row.avatar_url || undefined,
    role,
    color,
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

    // Definir cor do avatar (pastel aleatória se não vier do front)
    const color = member.color || getRandomPastelColor();

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
        color,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    
    const newMember = mapFamilyMemberFromDb(data);
    
    // Se for owner e tem avatar, sincronizar com users.avatar_url
    if (roleForDb === 'Owner' && member.avatarUrl) {
      await supabase
        .from('users')
        .update({ avatar_url: member.avatarUrl })
        .eq('id', userId);
    }
    
    return newMember;
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
    
    const updatedMember = mapFamilyMemberFromDb(data as any);
    
    // Se for owner e o avatar foi atualizado, sincronizar com users.avatar_url
    // Verificar se é owner pelo role original do banco
    const originalRole = originalRoles.get(id);
    if (originalRole && originalRole.toLowerCase() === 'owner' && updates.avatarUrl !== undefined) {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (userId) {
        // Atualizar avatar do usuário na tabela users
        await supabase
          .from('users')
          .update({ avatar_url: updates.avatarUrl || null })
          .eq('id', userId);
      }
    }
    
    // Atualizar cache de role original
    if (data) {
      originalRoles.set(id, data.role);
    }
    
    return updatedMember;
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
