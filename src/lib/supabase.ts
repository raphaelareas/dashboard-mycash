import { createClient } from '@supabase/supabase-js';

// Tipos para o Supabase (serão gerados automaticamente após migrations)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      family_members: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          role: string;
          avatar_url: string | null;
          monthly_income: number;
          color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          role: string;
          avatar_url?: string | null;
          monthly_income?: number;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          role?: string;
          avatar_url?: string | null;
          monthly_income?: number;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          type: 'INCOME' | 'EXPENSE';
          color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string;
          type: 'INCOME' | 'EXPENSE';
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string;
          type?: 'INCOME' | 'EXPENSE';
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD';
          name: string;
          bank: string;
          last_digits: string | null;
          holder_id: string;
          balance: number;
          credit_limit: number | null;
          current_bill: number;
          due_day: number | null;
          closing_day: number | null;
          theme: string | null;
          logo_url: string | null;
          color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD';
          name: string;
          bank: string;
          last_digits?: string | null;
          holder_id: string;
          balance?: number;
          credit_limit?: number | null;
          current_bill?: number;
          due_day?: number | null;
          closing_day?: number | null;
          theme?: string | null;
          logo_url?: string | null;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD';
          name?: string;
          bank?: string;
          last_digits?: string | null;
          holder_id?: string;
          balance?: number;
          credit_limit?: number | null;
          current_bill?: number;
          due_day?: number | null;
          closing_day?: number | null;
          theme?: string | null;
          logo_url?: string | null;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'INCOME' | 'EXPENSE';
          amount: number;
          description: string;
          date: string;
          category_id: string | null;
          account_id: string | null;
          member_id: string | null;
          installment_number: number | null;
          total_installments: number;
          parent_transaction_id: string | null;
          is_recurring: boolean;
          recurring_transaction_id: string | null;
          status: 'PENDING' | 'COMPLETED';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'INCOME' | 'EXPENSE';
          amount: number;
          description: string;
          date: string;
          category_id?: string | null;
          account_id?: string | null;
          member_id?: string | null;
          installment_number?: number | null;
          total_installments?: number;
          parent_transaction_id?: string | null;
          is_recurring?: boolean;
          recurring_transaction_id?: string | null;
          status?: 'PENDING' | 'COMPLETED';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'INCOME' | 'EXPENSE';
          amount?: number;
          description?: string;
          date?: string;
          category_id?: string | null;
          account_id?: string | null;
          member_id?: string | null;
          installment_number?: number | null;
          total_installments?: number;
          parent_transaction_id?: string | null;
          is_recurring?: boolean;
          recurring_transaction_id?: string | null;
          status?: 'PENDING' | 'COMPLETED';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      recurring_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'INCOME' | 'EXPENSE';
          amount: number;
          description: string;
          category_id: string | null;
          account_id: string | null;
          member_id: string | null;
          frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
          day_of_month: number | null;
          day_of_week: number | null;
          start_date: string;
          end_date: string | null;
          is_active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: 'INCOME' | 'EXPENSE';
          amount: number;
          description: string;
          category_id?: string | null;
          account_id?: string | null;
          member_id?: string | null;
          frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
          day_of_month?: number | null;
          day_of_week?: number | null;
          start_date: string;
          end_date?: string | null;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'INCOME' | 'EXPENSE';
          amount?: number;
          description?: string;
          category_id?: string | null;
          account_id?: string | null;
          member_id?: string | null;
          frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
          day_of_month?: number | null;
          day_of_week?: number | null;
          start_date?: string;
          end_date?: string | null;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const hasValidConfig = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseAnonKey.includes('placeholder');

if (!hasValidConfig) {
  console.warn(
    '⚠️ Supabase URL or Anon Key not found or invalid.\n' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.\n' +
    'Current values:', { url: supabaseUrl ? '***configured***' : 'missing', key: supabaseAnonKey ? '***configured***' : 'missing' }
  );
}

// @ts-ignore - Database types serão gerados depois das migrations
// Criar client mesmo sem credenciais para evitar erros (auth falhará mas não quebrará a app)
export const supabase = createClient<any>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
