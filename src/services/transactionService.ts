import { supabase } from '../config/supabase';
import { 
  addPendingTransaction, 
  getPendingTransactions, 
  removePendingTransaction 
} from './localStorageService';

interface DatabaseTransaction {
  id: string;
  driver_id: number;
  order_total: number;
  amount_received: number;
  change_amount: number;
  date: string;
  timestamp: number;
}

export interface Transaction {
  id?: string;
  driverId: number;
  orderTotal: number;
  amountReceived: number;
  changeAmount: number;
  date: string;
  timestamp: number;
  isPending?: boolean;
}

export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  try {
    // Check if we're online
    if (!navigator.onLine) {
      // Store transaction locally if offline
      addPendingTransaction(transaction);
      return { ...transaction, id: `pending_${Date.now()}`, isPending: true };
    }

    // If online, try to save to Supabase
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        driver_id: transaction.driverId,
        order_total: transaction.orderTotal,
        amount_received: transaction.amountReceived,
        change_amount: transaction.changeAmount,
        date: transaction.date,
        timestamp: transaction.timestamp
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding transaction:', error);
    // If online save fails, store locally
    addPendingTransaction(transaction);
    return { ...transaction, id: `pending_${Date.now()}`, isPending: true };
  }
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
  try {
    // Get online transactions
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    
    // Transform Supabase data
    const onlineTransactions = (data as DatabaseTransaction[]).map(item => ({
      id: item.id,
      driverId: item.driver_id,
      orderTotal: item.order_total,
      amountReceived: item.amount_received,
      changeAmount: item.change_amount,
      date: item.date,
      timestamp: item.timestamp,
      isPending: false
    }));

    // Get pending offline transactions
    const pendingTransactions = getPendingTransactions();

    // Combine and sort all transactions
    return [...pendingTransactions, ...onlineTransactions]
      .sort((a, b) => b.timestamp - a.timestamp);

  } catch (error) {
    console.error('Error getting transactions:', error);
    // If online fetch fails, return only pending transactions
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

    if (error) throw error;
    
    return (data as DatabaseTransaction[]).map(item => ({
      id: item.id,
      driverId: item.driver_id,
      orderTotal: item.order_total,
      amountReceived: item.amount_received,
      changeAmount: item.change_amount,
      date: item.date,
      timestamp: item.timestamp,
      isPending: false
    }));
  } catch (error) {
    console.error('Error getting transactions by date:', error);
    throw new Error(`Failed to fetch transactions for date ${date}. Please try again.`);
  }
};

export const getDriverTransactions = async (driverId: number): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('driver_id', driverId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    
    return (data as DatabaseTransaction[]).map(item => ({
      id: item.id,
      driverId: item.driver_id,
      orderTotal: item.order_total,
      amountReceived: item.amount_received,
      changeAmount: item.change_amount,
      date: item.date,
      timestamp: item.timestamp,
      isPending: false
    }));
  } catch (error) {
    console.error('Error getting driver transactions:', error);
    throw new Error(`Failed to fetch transactions for driver ${driverId}. Please try again.`);
  }
};

export const syncPendingTransactions = async () => {
  if (!navigator.onLine) return;

  const pending = getPendingTransactions();
  
  for (const transaction of pending) {
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([{
          driver_id: transaction.driverId,
          order_total: transaction.orderTotal,
          amount_received: transaction.amountReceived,
          change_amount: transaction.changeAmount,
          date: transaction.date,
          timestamp: transaction.timestamp
        }]);

      if (!error) {
        // Remove from pending if successfully synced
        removePendingTransaction(transaction);
      }
    } catch (error) {
      console.error('Error syncing transaction:', error);
    }
  }
};

// Add online/offline sync handlers
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online, syncing pending transactions...');
    syncPendingTransactions();
  });
}