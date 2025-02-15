export type { Transaction } from '../services/transactionService';

export interface Driver {
  id: number;
  totalTransactions: number;
  totalAmount: number;
} 