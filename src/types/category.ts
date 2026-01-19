import { TransactionType } from './transaction';

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  type: TransactionType;
  color: string;
  accountId?: string | null; // Link opcional para conta ou cartão
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}