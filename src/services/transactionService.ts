import { db } from '../config/firebase';
import { collection, addDoc, DocumentReference, DocumentSnapshot, DocumentData, query, where, orderBy, getDocs, QuerySnapshot, QueryDocumentSnapshot, QueryConstraint, writeBatch, doc } from 'firebase/firestore';
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

const transformToFirestore = (transaction: BaseTransaction | Transaction): Omit<Transaction, 'id' | 'isPending'> => {
  return {
    userId: transaction.userId,
    driverId: Number(transaction.driverId),
    orderTotal: Number(transaction.orderTotal),
    amountReceived: Number(transaction.amountReceived),
    changeAmount: Number(transaction.changeAmount),
    date: transaction.date || new Date().toISOString().split('T')[0],
    timestamp: transaction.timestamp || Date.now(),
  };
};

const transformFromFirestore = (docSnap: DocumentSnapshot<DocumentData>): Transaction => {
  const data = docSnap.data();
  if (!data) {
    throw new DatabaseError('Document data is undefined for document ID: ' + docSnap.id); 
  }
  return {
    id: docSnap.id,
    driverId: data.driverId,
    orderTotal: data.orderTotal,
    amountReceived: data.amountReceived,
    changeAmount: data.changeAmount,
    date: data.date,
    timestamp: data.timestamp,
    isPending: false, 
  };
};

export const addTransaction = async (transaction: BaseTransaction, userId: string): Promise<Transaction> => {
  try {
    const transactionWithUser = { ...transaction, userId };
    validateTransaction(transactionWithUser);

    if (!navigator.onLine) {
      addPendingTransaction(transactionWithUser);
      return { ...transactionWithUser, id: `pending_${Date.now()}`, isPending: true };
    }

    const firestoreTransactionData = transformToFirestore(transactionWithUser);
    
    const docRef: DocumentReference = await addDoc(collection(db, "transactions"), firestoreTransactionData);

    return {
      userId: firestoreTransactionData.userId,
      driverId: firestoreTransactionData.driverId,
      orderTotal: firestoreTransactionData.orderTotal,
      amountReceived: firestoreTransactionData.amountReceived,
      changeAmount: firestoreTransactionData.changeAmount,
      date: firestoreTransactionData.date,
      timestamp: firestoreTransactionData.timestamp,
      id: docRef.id,
      isPending: false,
    };

  } catch (error) {
    if (error instanceof ValidationError) throw error;
    
    console.error('Error adding transaction to Firestore:', error);
    addPendingTransaction(transactionWithUser);
    return { ...transactionWithUser, id: `pending_${Date.now()}`, isPending: true };
  }
};

export const getTodayTransactions = async (userId: string, retryAttempt = 0): Promise<Transaction[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const transactionsCollection = collection(db, "transactions");
    const q = query(
      transactionsCollection, 
      where("userId", "==", userId),
      where("date", "==", today), 
      orderBy("timestamp", "desc")
    );

    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    
    const onlineTransactions: Transaction[] = querySnapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => transformFromFirestore(doc)
    );
    
    const pendingTransactions = getPendingTransactions().filter(t => t.date === today && t.userId === userId);

    return [...pendingTransactions, ...onlineTransactions]
      .sort((a, b) => b.timestamp - a.timestamp);

  } catch (error) {
    if (retryAttempt < MAX_RETRY_ATTEMPTS && navigator.onLine) {
      await sleep(RETRY_DELAY * (retryAttempt + 1));
      return getTodayTransactions(userId, retryAttempt + 1);
    }

    console.error('Error getting today\'s transactions from Firestore:', error);
    return getPendingTransactions().filter(t => t.date === new Date().toISOString().split('T')[0] && t.userId === userId);
  }
};

export const getAllTransactions = async (userId: string, startDate?: string, endDate?: string, retryAttempt = 0): Promise<Transaction[]> => {
  try {
    const transactionsCollection = collection(db, "transactions");
    const queryConstraints: QueryConstraint[] = [];

    queryConstraints.push(where("userId", "==", userId));
    queryConstraints.push(orderBy("timestamp", "desc"));

    if (startDate) {
      queryConstraints.push(where("date", ">=", startDate));
    }
    if (endDate) {
      queryConstraints.push(where("date", "<=", endDate));
    }
    
    const q = query(transactionsCollection, ...queryConstraints);
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

    const onlineTransactions: Transaction[] = querySnapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => transformFromFirestore(doc)
    );
    
    const pendingTransactions = getPendingTransactions().filter(t => {
      if (t.userId !== userId) return false;
      if (!startDate && !endDate) return true;
      const transactionDate = new Date(t.date); // Assuming t.date is YYYY-MM-DD
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      let matches = true;
      if (start) matches = matches && transactionDate >= start;
      if (end) matches = matches && transactionDate <= end;
      return matches;
    });

    return [...pendingTransactions, ...onlineTransactions]
      .sort((a, b) => b.timestamp - a.timestamp);

  } catch (error) {
    if (retryAttempt < MAX_RETRY_ATTEMPTS && navigator.onLine) {
      await sleep(RETRY_DELAY * (retryAttempt + 1));
      return getAllTransactions(userId, startDate, endDate, retryAttempt + 1);
    }

    console.error('Error getting all transactions from Firestore:', error);
    const allPending = getPendingTransactions().filter(t => t.userId === userId);
    if (!startDate && !endDate) return allPending;
    
    return allPending.filter(t => {
        const transactionDate = new Date(t.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        let matches = true;
        if (start) matches = matches && transactionDate >= start;
        if (end) matches = matches && transactionDate <= end;
        return matches;
    });
  }
};

export const getTransactionsByDate = async (userId: string, date: string): Promise<Transaction[]> => {
  try {
    const transactionsCollection = collection(db, "transactions");
    const q = query(
      transactionsCollection,
      where("userId", "==", userId),
      where("date", "==", date),
      orderBy("timestamp", "desc")
    );

    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

    return querySnapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => transformFromFirestore(doc)
    );
  } catch (error) {
    console.error(`Error fetching transactions for date ${date} from Firestore:`, error);
    throw new NetworkError(`Failed to fetch transactions for date ${date}. Check console for details.`);
  }
};

export const getDriverTransactions = async (userId: string, driverId: number): Promise<Transaction[]> => {
  try {
    if (driverId < 1 || driverId > 6) {
      throw new ValidationError('Invalid driver ID');
    }

    const transactionsCollection = collection(db, "transactions");
    const q = query(
      transactionsCollection,
      where("userId", "==", userId),
      where("driverId", "==", driverId),
      orderBy("timestamp", "desc")
    );

    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

    return querySnapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => transformFromFirestore(doc)
    );
  } catch (error) {
    if (error instanceof ValidationError || error instanceof DatabaseError) throw error;
    console.error(`Error fetching transactions for driver ${driverId} from Firestore:`, error);
    throw new NetworkError(`Failed to fetch transactions for driver ${driverId}. Check console for details.`);
  }
};

export const syncPendingTransactions = async (userId: string): Promise<void> => {
  if (!navigator.onLine) {
    console.warn('Cannot sync while offline.'); 
    return; 
  }

  // Get only pending transactions for the current user
  const allPending = getPendingTransactions();
  const userPending = allPending.filter(p => p.userId === userId);

  console.log(`Pending transactions for user ${userId} to sync with Firestore:`, userPending.length);

  if (userPending.length === 0) {
    console.log('No pending transactions for this user to sync.');
    return;
  }

  const batch = writeBatch(db);
  const transactionsCollectionRef = collection(db, "transactions");

  userPending.forEach(p => {
    const newDocRef = doc(transactionsCollectionRef);
    // Ensure the transaction being transformed and batched includes the correct userId
    const transactionToSync = { ...p, userId }; 
    const firestoreData = transformToFirestore(transactionToSync as BaseTransaction);
    batch.set(newDocRef, firestoreData);
  });
  
  try {
    await batch.commit();
    console.log(`Successfully synced pending transactions for user ${userId} to Firestore.`);
    
    userPending.forEach(p => {
      if (typeof p.id === 'string' && p.id.startsWith('pending_')) { 
        removePendingTransaction(p.id); // removePendingTransaction uses ID, which is fine
      } else {
        console.warn('Pending transaction found without a valid string pending_ ID during removal:', p);
      }
    });

  } catch (error) {
    console.error('Error syncing pending transactions to Firestore:', error);
    throw new DatabaseError('Failed to sync some pending transactions to Firestore', error);
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