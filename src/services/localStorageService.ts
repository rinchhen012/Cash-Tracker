import { Transaction } from '../types';

const PENDING_TRANSACTIONS_KEY = 'pending_transactions';

export const getPendingTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(PENDING_TRANSACTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting pending transactions:', error);
    return [];
  }
};

export const addPendingTransaction = (transaction: Transaction) => {
  try {
    const pending = getPendingTransactions();
    pending.push({ ...transaction, isPending: true });
    localStorage.setItem(PENDING_TRANSACTIONS_KEY, JSON.stringify(pending));
  } catch (error) {
    console.error('Error saving pending transaction:', error);
    throw new Error('Failed to save transaction offline');
  }
};

export const removePendingTransaction = (transaction: Transaction) => {
  try {
    const pending = getPendingTransactions();
    const filtered = pending.filter(t => 
      t.timestamp !== transaction.timestamp || 
      t.driverId !== transaction.driverId
    );
    localStorage.setItem(PENDING_TRANSACTIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing pending transaction:', error);
  }
};

export const clearPendingTransactions = () => {
  try {
    localStorage.removeItem(PENDING_TRANSACTIONS_KEY);
  } catch (error) {
    console.error('Error clearing pending transactions:', error);
  }
}; 