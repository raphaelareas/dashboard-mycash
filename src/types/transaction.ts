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
  category: TransactionCategory;
  amount: number;
  description: string;
  date: Date;
  accountId: string;
  memberId?: string | null;
  installments?: number; // número de parcelas (1 = à vista)
  isRecurring?: boolean;
  isPaid?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
