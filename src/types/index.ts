// Base transaction interface
export interface BaseTransaction {
  userId: string;
  driverId: number;
  orderTotal: number;
  amountReceived: number;
  changeAmount: number;
  date: string;
  timestamp: number;
}

// Application transaction shape
export interface Transaction extends BaseTransaction {
  id?: string;
  isPending?: boolean;
}

// Custom error types
export class TransactionError extends Error {
  constructor(message: string, public code: string, public originalError?: unknown) {
    super(message);
    this.name = 'TransactionError';
  }
}

export class NetworkError extends TransactionError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'NETWORK_ERROR', originalError);
    this.name = 'NetworkError';
  }
}

export class DatabaseError extends TransactionError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'DATABASE_ERROR', originalError);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends TransactionError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'VALIDATION_ERROR', originalError);
    this.name = 'ValidationError';
  }
}

export interface Driver {
  id: number;
  totalTransactions: number;
  totalAmount: number;
} 