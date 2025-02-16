import { supabase } from '../config/supabase';
import { 
  addPendingTransaction, 
  getPendingTransactions, 
  removePendingTransaction 
} from './localStorageService';
import {
  Transaction,
  DatabaseTransaction,
  BaseTransaction,
  NetworkError,
  DatabaseError,
  ValidationError
} from '../types';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const validateTransaction = (transaction: BaseTransaction): void => {
  if (transaction.orderTotal < 0) {
    throw new ValidationError('Order total cannot be negative');
  }
  if (transaction.amountReceived < 0) {
    throw new ValidationError('Amount received cannot be negative');
  }
  if (!transaction.driverId || transaction.driverId < 1 || transaction.driverId > 6) {
    throw new ValidationError('Invalid driver ID');
  }
};

const transformToDatabase = (transaction: BaseTransaction): Omit<DatabaseTransaction, 'id'> => ({
  ...transaction,
  driver_id: transaction.driverId,
  order_total: transaction.orderTotal,
  amount_received: transaction.amountReceived,
  change_amount: transaction.changeAmount,
});

const transformFromDatabase = (item: DatabaseTransaction): Transaction => ({
  id: item.id,
  driverId: item.driver_id,
  orderTotal: item.order_total,
  amountReceived: item.amount_received,
  changeAmount: item.change_amount,
  date: item.date,
  timestamp: item.timestamp,
  isPending: false,
});

export const addTransaction = async (transaction: BaseTransaction): Promise<Transaction> => {
  try {
    validateTransaction(transaction);

    if (!navigator.onLine) {
      addPendingTransaction(transaction);
      return { ...transaction, id: `pending_${Date.now()}`, isPending: true };
    }

    const dbTransaction = transformToDatabase(transaction);
    const { data, error } = await supabase
      .from('transactions')
      .insert([dbTransaction])
      .select()
      .single();

    if (error) throw new DatabaseError('Failed to save transaction', error);
    if (!data) throw new DatabaseError('No data returned after saving');

    return transformFromDatabase(data as DatabaseTransaction);
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    
    console.error('Error adding transaction:', error);
    addPendingTransaction(transaction);
    return { ...transaction, id: `pending_${Date.now()}`, isPending: true };
  }
};

export const getAllTransactions = async (retryAttempt = 0): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw new DatabaseError('Failed to fetch transactions', error);
    
    const onlineTransactions = (data as DatabaseTransaction[]).map(transformFromDatabase);
    const pendingTransactions = getPendingTransactions();

    return [...pendingTransactions, ...onlineTransactions]
      .sort((a, b) => b.timestamp - a.timestamp);

  } catch (error) {
    if (retryAttempt < MAX_RETRY_ATTEMPTS && navigator.onLine) {
      await sleep(RETRY_DELAY * (retryAttempt + 1));
      return getAllTransactions(retryAttempt + 1);
    }

    console.error('Error getting transactions:', error);
    return getPendingTransactions();
  }
};

export const getTransactionsByDate = async (date: string): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('date', date)
      .order('timestamp', { ascending: false });

    if (error) throw new DatabaseError(`Failed to fetch transactions for date ${date}`, error);
    
    return (data as DatabaseTransaction[]).map(transformFromDatabase);
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new NetworkError(`Failed to fetch transactions for date ${date}`);
  }
};

export const getDriverTransactions = async (driverId: number): Promise<Transaction[]> => {
  try {
    if (driverId < 1 || driverId > 6) {
      throw new ValidationError('Invalid driver ID');
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('driver_id', driverId)
      .order('timestamp', { ascending: false });

    if (error) throw new DatabaseError(`Failed to fetch transactions for driver ${driverId}`, error);
    
    return (data as DatabaseTransaction[]).map(transformFromDatabase);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof DatabaseError) throw error;
    throw new NetworkError(`Failed to fetch transactions for driver ${driverId}`);
  }
};

export const syncPendingTransactions = async (): Promise<void> => {
  if (!navigator.onLine) return;

  const pending = getPendingTransactions();
  const results: { success: boolean; transaction: Transaction; error?: Error }[] = [];
  
  for (const transaction of pending) {
    try {
      const dbTransaction = transformToDatabase(transaction);
      const { error } = await supabase
        .from('transactions')
        .insert([dbTransaction]);

      if (error) throw new DatabaseError('Failed to sync transaction', error);

      removePendingTransaction(transaction);
      results.push({ success: true, transaction });
    } catch (error) {
      console.error('Error syncing transaction:', error);
      results.push({ 
        success: false, 
        transaction, 
        error: error instanceof Error ? error : new Error('Unknown error occurred') 
      });
    }
  }

  // Log sync results
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
  console.log(`Sync completed: ${successCount} succeeded, ${failureCount} failed`);
  
  if (failureCount > 0) {
    const failedTransactions = results.filter(r => !r.success);
    console.error('Failed transactions:', failedTransactions);
  }
};

// Add online/offline sync handlers with debouncing
if (typeof window !== 'undefined') {
  let syncTimeout: NodeJS.Timeout;
  
  window.addEventListener('online', () => {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      console.log('Back online, syncing pending transactions...');
      syncPendingTransactions();
    }, 1000);
  });
}