export type BankAccountType = 'checking' | 'savings' | 'investment';

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  agency?: string;
  type: BankAccountType;
  balance: number;
  currency: string;
  holderId?: string;
  holderName?: string;
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
