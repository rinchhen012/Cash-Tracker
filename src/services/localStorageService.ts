import { Transaction } from '../types';

const PENDING_TRANSACTIONS_KEY = 'pendingTransactions';

export const getPendingTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(PENDING_TRANSACTIONS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error getting pending transactions:', error);
    return [];
  }
};

export const addPendingTransaction = (transaction: Transaction): void => {
  try {
    const pending = getPendingTransactions();
    transaction.isPending = true; // Ensure isPending flag is set
    pending.push(transaction);
    localStorage.setItem(PENDING_TRANSACTIONS_KEY, JSON.stringify(pending));
  } catch (error) {
    console.error('Error adding pending transaction:', error);
    throw new Error('Failed to save pending transaction');
  }
};

export const removePendingTransaction = (transaction: Transaction): void => {
  try {
    const pending = getPendingTransactions();
    // Use timestamp and driverId to identify transactions since pending ones might not have an id
    const filtered = pending.filter(t => 
      !(t.timestamp === transaction.timestamp && t.driverId === transaction.driverId)
    );
    localStorage.setItem(PENDING_TRANSACTIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing pending transaction:', error);
    throw new Error('Failed to remove pending transaction');
  }
};

export const clearPendingTransactions = (): void => {
  try {
    localStorage.removeItem(PENDING_TRANSACTIONS_KEY);
  } catch (error) {
    console.error('Error clearing pending transactions:', error);
    throw new Error('Failed to clear pending transactions');
  }
}; 