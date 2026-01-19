export type CreditCardType = 'credit' | 'debit' | 'prepaid';

export type CreditCardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'other';

export interface CreditCard {
  id: string;
  name: string;
  type: CreditCardType;
  brand: CreditCardBrand;
  lastFourDigits: string;
  expirationMonth: number;
  expirationYear: number;
  dueDay: number;
  limit?: number;
  currentBalance: number;
  bankAccountId?: string;
  holderId?: string;
  holderName?: string;
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
