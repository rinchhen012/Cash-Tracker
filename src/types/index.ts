export interface Transaction {
  id: string;
  driverId: number;
  orderTotal: number;
  amountReceived: number;
  changeAmount: number;
  date: string;
  timestamp: number;
}

export interface Driver {
  id: number;
  totalTransactions: number;
  totalAmount: number;
} 