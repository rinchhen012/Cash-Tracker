import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface Transaction {
  id: string;
  driver_id: number;
  bill_amount: number;
  amount_received: number;
  change_amount: number;
  created_at: string;
}

export const saveTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Transaction[];
};

export const getTransactionsByDriver = async (driverId: number) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('driver_id', driverId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Transaction[];
};

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
        timestamp: Date.now()
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw new Error('Failed to add transaction. Please try again.');
  }
};

export const getAllTransactions = async () => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    
    // Map the database column names to our TypeScript interface
    return data.map(item => ({
      id: item.id,
      driverId: item.driver_id,
      orderTotal: item.order_total,
      amountReceived: item.amount_received,
      changeAmount: item.change_amount,
      date: item.date,
      timestamp: item.timestamp
    })) as Transaction[];
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw new Error('Failed to fetch transactions. Please try again.');
  }
};

export const getTransactionsByDate = async (date: string) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('date', date)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    
    // Map the database column names to our TypeScript interface
    return data.map(item => ({
      id: item.id,
      driverId: item.driver_id,
      orderTotal: item.order_total,
      amountReceived: item.amount_received,
      changeAmount: item.change_amount,
      date: item.date,
      timestamp: item.timestamp
    })) as Transaction[];
  } catch (error) {
    console.error('Error getting transactions by date:', error);
    throw new Error(`Failed to fetch transactions for date ${date}. Please try again.`);
  }
}; 