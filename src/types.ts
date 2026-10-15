export interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number;
  type: 'regular' | 'premium' | 'vip';
  description?: string;
  createdAt: any;
}

export interface WalletTransaction {
  id: string;
  customerId: string;
  customerName?: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  walletNumber: string;
  timestamp: any;
  description: string;
  previousBalance: number;
  newBalance: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  timestamp: any;
}

export interface Debt {
  id: string;
  personName: string;
  amount: number;
  type: 'owe' | 'owed'; // owe: we owe them, owed: they owe us
  description: string;
  status: 'pending' | 'paid';
  timestamp: any;
}

export interface WalletAccount {
  id: string;
  provider: string; // Vodafone, Etisalat, Orange, WE, etc.
  walletNumber: string;
  serial: string;
  balance: number;
  description: string;
}

export interface Machine {
  id: string;
  name: string; // Fawry, Aman, Bee, etc.
  terminalId: string;
  balance: number;
  description: string;
}

export interface AppUser {
  id: string;
  email: string;
  username: string;
  password?: string;
  displayName: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
  createdAt: any;
}

export interface CashCount {
  id: string;
  counts: { [key: number]: number };
  total: number;
  timestamp: any;
  notes?: string;
}

export type OperationType = 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}
