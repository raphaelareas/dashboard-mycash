import { supabase } from '@/lib/supabase';
import { CreditCard, BankAccount } from '@/types';

// Mapear Account do banco para CreditCard ou BankAccount
const mapAccountToCreditCard = (account: any): CreditCard => {
  return {
    id: account.id,
    name: account.name,
    type: 'credit' as const,
    brand: 'other' as const,
    lastFourDigits: account.last_digits || '',
    expirationMonth: 12,
    expirationYear: new Date().getFullYear() + 5,
    dueDay: account.due_day || 10,
    limit: account.credit_limit ? parseFloat(account.credit_limit.toString()) : undefined,
    currentBalance: parseFloat(account.current_bill.toString()),
    isActive: account.is_active,
    createdAt: new Date(account.created_at),
    updatedAt: new Date(account.updated_at),
  };
};

const mapAccountToBankAccount = (account: any): BankAccount => {
  return {
    id: account.id,
    name: account.name,
    bankName: account.bank,
    accountNumber: account.last_digits || '',
    type: account.type === 'CHECKING' ? 'checking' : 'savings',
    balance: parseFloat(account.balance.toString()),
    currency: 'BRL',
    isActive: account.is_active,
    createdAt: new Date(account.created_at),
    updatedAt: new Date(account.updated_at),
  };
};

export const accountService = {
  // Buscar todas as contas e cartões do usuário
  async getAll(userId: string): Promise<{ creditCards: CreditCard[]; bankAccounts: BankAccount[] }> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const creditCards: CreditCard[] = [];
    const bankAccounts: BankAccount[] = [];

    (data || []).forEach((account: any) => {
      if (account.type === 'CREDIT_CARD') {
        creditCards.push(mapAccountToCreditCard(account));
      } else {
        bankAccounts.push(mapAccountToBankAccount(account));
      }
    });

    return { creditCards, bankAccounts };
  },

  // Criar cartão de crédito
  async createCreditCard(card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>, holderId?: string): Promise<CreditCard> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    // Buscar holder: usar o fornecido ou buscar primeiro family member como padrão
    let finalHolderId = holderId;
    if (!finalHolderId) {
      const { data: members } = await supabase
        .from('family_members')
        .select('id')
        .eq('user_id', userId)
        .limit(1);
      finalHolderId = members?.[0]?.id;
    }

    if (!finalHolderId) {
      throw new Error('No family member found. Please create a family member first.');
    }

    // @ts-ignore - Database types serão gerados depois das migrations
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        type: 'CREDIT_CARD',
        name: card.name,
        bank: card.name,
        last_digits: card.lastFourDigits,
        holder_id: finalHolderId,
        credit_limit: card.limit || null,
        current_bill: card.currentBalance || 0,
        due_day: card.dueDay,
        is_active: card.isActive ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return mapAccountToCreditCard(data as any);
  },

  // Criar conta bancária
  async createBankAccount(account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>, holderId?: string): Promise<BankAccount> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    // Buscar holder: usar o fornecido ou buscar primeiro family member como padrão
    let finalHolderId = holderId;
    if (!finalHolderId) {
      const { data: members } = await supabase
        .from('family_members')
        .select('id')
        .eq('user_id', userId)
        .limit(1);
      finalHolderId = members?.[0]?.id;
    }

    if (!finalHolderId) {
      throw new Error('No family member found. Please create a family member first.');
    }

    // @ts-ignore - Database types serão gerados depois das migrations
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        type: account.type === 'checking' ? 'CHECKING' : 'SAVINGS',
        name: account.name,
        bank: account.bankName,
        last_digits: account.accountNumber.slice(-4),
        holder_id: finalHolderId,
        balance: account.balance || 0,
        is_active: account.isActive ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return mapAccountToBankAccount(data as any);
  },

  // Atualizar conta/cartão
  async update(id: string, updates: Partial<CreditCard | BankAccount>): Promise<void> {
    const updateData: any = {};

    if ('name' in updates) updateData.name = updates.name;
    if ('isActive' in updates) updateData.is_active = updates.isActive;

    // Campos específicos de cartão
    if ('limit' in updates) updateData.credit_limit = updates.limit;
    if ('currentBalance' in updates) updateData.current_bill = updates.currentBalance;
    if ('dueDay' in updates) updateData.due_day = updates.dueDay;
    if ('lastFourDigits' in updates) updateData.last_digits = updates.lastFourDigits;

    // Campos específicos de conta
    if ('balance' in updates) updateData.balance = updates.balance;
    if ('bankName' in updates) updateData.bank = updates.bankName;

    // @ts-ignore - Database types serão gerados depois das migrations
    const { error } = await supabase.from('accounts').update(updateData).eq('id', id);
    if (error) throw error;
  },

  // Deletar conta/cartão
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) throw error;
  },
};
