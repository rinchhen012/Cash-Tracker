import { supabase } from '../config/supabase';

export interface Transaction {
  id?: string;
  driverId: number;
  orderTotal: number;
  amountReceived: number;
  changeAmount: number;
  date: string;
  timestamp: number;
}

export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  try {
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
    throw new Error('Failed to add transaction. Please try again.');
  }
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      driverId: item.driver_id,
      orderTotal: item.order_total,
      amountReceived: item.amount_received,
      changeAmount: item.change_amount,
      date: item.date,
      timestamp: item.timestamp
    }));
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw new Error('Failed to fetch transactions. Please try again.');
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
    
    return data.map(item => ({
      id: item.id,
      driverId: item.driver_id,
      orderTotal: item.order_total,
      amountReceived: item.amount_received,
      changeAmount: item.change_amount,
      date: item.date,
      timestamp: item.timestamp
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
    
    return data.map(item => ({
      id: item.id,
      driverId: item.driver_id,
      orderTotal: item.order_total,
      amountReceived: item.amount_received,
      changeAmount: item.change_amount,
      date: item.date,
      timestamp: item.timestamp
    }));
  } catch (error) {
    console.error('Error getting driver transactions:', error);
    throw new Error(`Failed to fetch transactions for driver ${driverId}. Please try again.`);
  }
};