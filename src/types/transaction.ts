export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'rent'
  | 'food'
  | 'shopping'
  | 'household'
  | 'transport'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory | string; // Pode ser enum ou nome de categoria customizada
  amount: number;
  description: string;
  date: Date;
  accountId: string;
  memberId?: string | null;
  installments?: number; // número total de parcelas (1 = à vista)
  installmentNumber?: number; // número da parcela atual (1, 2, 3...)
  installmentRecurrence?: 'weekly' | 'biweekly' | 'monthly' | 'semiannual' | 'yearly' | 'fixed';
  isRecurring?: boolean;
  isPaid?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
