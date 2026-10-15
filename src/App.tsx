import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  where,
  getDocs,
  writeBatch,
  serverTimestamp, 
  runTransaction,
  getDocFromServer
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { db, auth } from './firebase';
import { Customer, WalletTransaction, OperationType, Expense, Debt, WalletAccount, Machine, AppUser, CashCount } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CustomerList } from './components/CustomerList';
import { AddCustomerModal } from './components/AddCustomerModal';
import { EditCustomerModal } from './components/EditCustomerModal';
import { TransactionModal } from './components/TransactionModal';
import { QuickTransactionModal } from './components/QuickTransactionModal';
import { TransactionHistory } from './components/TransactionHistory';
import { ReportsPage } from './components/ReportsPage';
import { WalletsPage } from './components/WalletsPage';
import { MachinesPage } from './components/MachinesPage';
import { ExpensesPage } from './components/ExpensesPage';
import { DebtsPage } from './components/DebtsPage';
import { CashCounter } from './components/CashCounter';
import { SettingsPage } from './components/SettingsPage';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, Loader2, Wallet, AlertCircle, ArrowUpRight, ArrowDownLeft, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { deleteDoc } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [wallets, setWallets] = useState<WalletAccount[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [cashCounts, setCashCounts] = useState<CashCount[]>([]);

  const enrichedTransactions = useMemo(() => {
    return transactions.map(t => {
      const customer = customers.find(c => c.id === t.customerId);
      return { ...t, customerName: customer?.name || t.customerName || 'عميل' };
    });
  }, [transactions, customers]);

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editCustomerModal, setEditCustomerModal] = useState<{ isOpen: boolean; customer: Customer | null }>({
    isOpen: false,
    customer: null
  });
  const [transactionModal, setTransactionModal] = useState<{
    isOpen: boolean;
    type: 'deposit' | 'withdrawal' | null;
    customer: Customer | null;
  }>({ isOpen: false, type: null, customer: null });
  const [quickTransactionModal, setQuickTransactionModal] = useState<{
    isOpen: boolean;
    type: 'deposit' | 'withdrawal' | null;
  }>({ isOpen: false, type: null });

  // Error handling spec for Firestore permissions
  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    // We could show a toast here
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const customersQuery = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
    const unsubscribeCustomers = onSnapshot(customersQuery, (snapshot) => {
      const customerData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(customerData);
    }, (error) => handleFirestoreError(error, 'list', 'customers'));

    const transactionsQuery = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'));
    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WalletTransaction));
      setTransactions(transactionData);
    }, (error) => handleFirestoreError(error, 'list', 'transactions'));

    const expensesQuery = query(collection(db, 'expenses'), orderBy('timestamp', 'desc'));
    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const expenseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
      setExpenses(expenseData);
    }, (error) => handleFirestoreError(error, 'list', 'expenses'));

    const debtsQuery = query(collection(db, 'debts'), orderBy('timestamp', 'desc'));
    const unsubscribeDebts = onSnapshot(debtsQuery, (snapshot) => {
      const debtData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debt));
      setDebts(debtData);
    }, (error) => handleFirestoreError(error, 'list', 'debts'));

    const walletsQuery = query(collection(db, 'walletAccounts'));
    const unsubscribeWallets = onSnapshot(walletsQuery, (snapshot) => {
      const walletData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WalletAccount));
      setWallets(walletData);
    }, (error) => handleFirestoreError(error, 'list', 'walletAccounts'));

    const machinesQuery = query(collection(db, 'machines'));
    const unsubscribeMachines = onSnapshot(machinesQuery, (snapshot) => {
      const machineData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Machine));
      setMachines(machineData);
    }, (error) => handleFirestoreError(error, 'list', 'machines'));

    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const userData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppUser));
      setUsers(userData);
    }, (error) => handleFirestoreError(error, 'list', 'users'));

    const cashCountsQuery = query(collection(db, 'cashCounts'), orderBy('timestamp', 'desc'));
    const unsubscribeCashCounts = onSnapshot(cashCountsQuery, (snapshot) => {
      const cashCountData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CashCount));
      setCashCounts(cashCountData);
    }, (error) => handleFirestoreError(error, 'list', 'cashCounts'));

    return () => {
      unsubscribeCustomers();
      unsubscribeTransactions();
      unsubscribeExpenses();
      unsubscribeDebts();
      unsubscribeWallets();
      unsubscribeMachines();
      unsubscribeUsers();
      unsubscribeCashCounts();
    };
  }, [user]);

  // Validate connection to Firestore
  useEffect(() => {
    if (!user) return;
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, [user]);

  const handleLogin = async () => {
    setIsAuthLoading(true);
    setAuthError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login Error:', error);
      if (error.code === 'auth/operation-not-allowed') {
        setAuthError('تسجيل الدخول باستخدام جوجل غير مفعل في لوحة تحكم Firebase.');
      } else {
        setAuthError('حدث خطأ أثناء تسجيل الدخول باستخدام جوجل');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'login') {
        let loginEmail = email;
        
        // If the input doesn't look like an email, assume it's a username
        if (!email.includes('@')) {
          const usersQuery = query(collection(db, 'users'), where('username', '==', email));
          const usersSnapshot = await getDocs(usersQuery);
          
          if (usersSnapshot.empty) {
            throw new Error('اسم المستخدم غير موجود');
          }
          
          loginEmail = usersSnapshot.docs[0].data().email;
        }
        
        await signInWithEmailAndPassword(auth, loginEmail, password);
      } else {
        // For signup, we still need an email. 
        // If the user provided a username in the "email" field, we might need a separate field for email.
        // But the current UI uses the same field for both.
        // Let's assume for signup they must provide a valid email.
        if (!email.includes('@')) {
          throw new Error('يرجى إدخال بريد إلكتروني صحيح لإنشاء حساب');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        
        // Also create a user document in Firestore
        await addDoc(collection(db, 'users'), {
          uid: userCredential.user.uid,
          email: email,
          username: username || email.split('@')[0], // Use username if available, else derive from email
          displayName: displayName,
          role: 'viewer', // Default role
          permissions: ['view_dashboard', 'view_customers'],
          createdAt: serverTimestamp()
        });
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      if (error.message === 'اسم المستخدم غير موجود') {
        setAuthError(error.message);
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setAuthError('اسم المستخدم/البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else if (error.code === 'auth/email-already-in-use') {
        setAuthError('هذا البريد الإلكتروني مستخدم بالفعل');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('كلمة المرور ضعيفة جداً');
      } else if (error.code === 'auth/operation-not-allowed') {
        setAuthError('تسجيل الدخول بالبريد الإلكتروني غير مفعل في لوحة تحكم Firebase.');
      } else {
        setAuthError(error.message || 'حدث خطأ أثناء عملية المصادقة');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleAddCustomer = async (data: any) => {
    try {
      await addDoc(collection(db, 'customers'), {
        ...data,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, 'create', 'customers');
    }
  };

  const handleUpdateCustomer = async (data: any) => {
    if (!editCustomerModal.customer) return;
    try {
      const customerRef = doc(db, 'customers', editCustomerModal.customer.id);
      await updateDoc(customerRef, data);
    } catch (error) {
      handleFirestoreError(error, 'update', `customers/${editCustomerModal.customer.id}`);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const batch = writeBatch(db);
      
      // Delete all transactions for this customer
      const transactionsQuery = query(collection(db, 'transactions'), where('customerId', '==', customerId));
      const transactionsSnapshot = await getDocs(transactionsQuery);
      transactionsSnapshot.docs.forEach((transactionDoc) => {
        batch.delete(transactionDoc.ref);
      });
      
      // Delete the customer
      batch.delete(doc(db, 'customers', customerId));
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, 'delete', `customers/${customerId}`);
    }
  };

  const handleTransaction = async (data: { amount: number; description?: string; walletId: string; walletNumber: string }) => {
    if (!transactionModal.customer || !transactionModal.type) return;
    await performTransaction(transactionModal.customer, transactionModal.type, data);
  };

  const handleAddExpense = async (data: any) => {
    try {
      await addDoc(collection(db, 'expenses'), {
        ...data,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, 'create', 'expenses');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (error) {
      handleFirestoreError(error, 'delete', `expenses/${id}`);
    }
  };

  const handleAddDebt = async (data: any) => {
    try {
      await addDoc(collection(db, 'debts'), {
        ...data,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, 'create', 'debts');
    }
  };

  const handleUpdateDebtStatus = async (id: string, status: 'pending' | 'paid') => {
    try {
      await updateDoc(doc(db, 'debts', id), { status });
    } catch (error) {
      handleFirestoreError(error, 'update', `debts/${id}`);
    }
  };

  const handleDeleteDebt = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'debts', id));
    } catch (error) {
      handleFirestoreError(error, 'delete', `debts/${id}`);
    }
  };

  const handleAddWallet = async (data: any) => {
    try {
      await addDoc(collection(db, 'walletAccounts'), data);
    } catch (error) {
      handleFirestoreError(error, 'create', 'walletAccounts');
    }
  };

  const handleUpdateWallet = async (id: string, data: any) => {
    try {
      await updateDoc(doc(db, 'walletAccounts', id), data);
    } catch (error) {
      handleFirestoreError(error, 'update', `walletAccounts/${id}`);
    }
  };

  const handleDeleteWallet = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'walletAccounts', id));
    } catch (error) {
      handleFirestoreError(error, 'delete', `walletAccounts/${id}`);
    }
  };

  const handleAddMachine = async (data: any) => {
    try {
      await addDoc(collection(db, 'machines'), data);
    } catch (error) {
      handleFirestoreError(error, 'create', 'machines');
    }
  };

  const handleUpdateMachine = async (id: string, data: any) => {
    try {
      await updateDoc(doc(db, 'machines', id), data);
    } catch (error) {
      handleFirestoreError(error, 'update', `machines/${id}`);
    }
  };

  const handleSaveCashCount = async (data: Omit<CashCount, 'id' | 'timestamp'>) => {
    try {
      await addDoc(collection(db, 'cashCounts'), {
        ...data,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, 'create', 'cashCounts');
    }
  };

  const handleDeleteMachine = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'machines', id));
    } catch (error) {
      handleFirestoreError(error, 'delete', `machines/${id}`);
    }
  };

  const handleQuickTransaction = async (customerId: string, data: { amount: number; description?: string; walletId: string; walletNumber: string }) => {
    if (!quickTransactionModal.type) return;
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    await performTransaction(customer, quickTransactionModal.type, data);
  };

  const performTransaction = async (customer: Customer, type: 'deposit' | 'withdrawal', data: { amount: number; description?: string; walletId: string; walletNumber: string }) => {
    const amount = data.amount;
    const isDeposit = type === 'deposit';

    try {
      await runTransaction(db, async (transaction) => {
        const customerRef = doc(db, 'customers', customer.id);
        const walletRef = doc(db, 'walletAccounts', data.walletId);
        
        const customerDoc = await transaction.get(customerRef);
        const walletDoc = await transaction.get(walletRef);
        
        if (!customerDoc.exists()) {
          throw new Error("العميل غير موجود");
        }
        if (!walletDoc.exists()) {
          throw new Error("المحفظة غير موجودة");
        }

        const currentCustomerBalance = Number(customerDoc.data()?.balance) || 0;
        const currentWalletBalance = Number(walletDoc.data()?.balance) || 0;
        
        const newCustomerBalance = isDeposit ? currentCustomerBalance + amount : currentCustomerBalance - amount;
        const newWalletBalance = isDeposit ? currentWalletBalance - amount : currentWalletBalance + amount;

        // 1. Update customer balance
        transaction.update(customerRef, { balance: newCustomerBalance });
        
        // 2. Update wallet balance
        transaction.update(walletRef, { balance: newWalletBalance });

        // 3. Add transaction record
        const transactionRef = doc(collection(db, 'transactions'));
        transaction.set(transactionRef, {
          customerId: customer.id,
          customerName: customer.name,
          type,
          amount,
          timestamp: serverTimestamp(),
          description: data.description || '',
          previousBalance: currentCustomerBalance,
          newBalance: newCustomerBalance,
          walletNumber: data.walletNumber
        });
      });
    } catch (error) {
      handleFirestoreError(error, 'write', 'transactions/customers/wallets');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 p-4" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="bg-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">الشعراوي بلس</h1>
            <p className="text-slate-500 text-sm">إدارة المحافظ والعملاء بسهولة</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${authMode === 'login' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
            >
              تسجيل الدخول
            </button>
            <button 
              onClick={() => { setAuthMode('signup'); setAuthError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${authMode === 'signup' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
            >
              حساب جديد
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {authMode === 'signup' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block mr-1">الاسم بالكامل</label>
                  <div className="relative">
                    <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                      placeholder="أدخل اسمك"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block mr-1">اسم المستخدم</label>
                  <div className="relative">
                    <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                      placeholder="اختر اسم مستخدم"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block mr-1">
                {authMode === 'login' ? 'اسم المستخدم أو البريد الإلكتروني' : 'البريد الإلكتروني'}
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type={authMode === 'login' ? 'text' : 'email'} 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                  placeholder={authMode === 'login' ? "اسم المستخدم أو البريد" : "example@mail.com"}
                />
              </div>
              {authMode === 'login' && <p className="text-[10px] text-slate-400 mr-1">استخدم البريد الإلكتروني أو اسم المستخدم المسجل للدخول</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block mr-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {authError && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-300 shadow-lg shadow-emerald-500/20"
            >
              {isAuthLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (authMode === 'login' ? 'دخول' : 'إنشاء حساب')}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">أو</span>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isAuthLoading}
            className="w-full bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 py-3 rounded-xl font-bold text-slate-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
            الدخول باستخدام جوجل
          </button>
          
          <div className="mt-8 flex items-center gap-2 justify-center text-slate-400 text-[10px]">
            <AlertCircle className="w-3 h-3" />
            <span>نظام آمن ومشفر لإدارة بياناتك</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 mr-64 p-8">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {activeTab === 'dashboard' ? 'لوحة التحكم' : 
               activeTab === 'customers' ? 'إدارة العملاء' : 
               activeTab === 'transactions' ? 'حسابات العملاء' :
               activeTab === 'wallets' ? 'المحافظ الخاصة' :
               activeTab === 'machines' ? 'المكن' :
               activeTab === 'expenses' ? 'المصروفات' :
               activeTab === 'debts' ? 'المستحقات والآجل' :
               activeTab === 'reports' ? 'التقارير' :
               activeTab === 'cash-counter' ? 'عداد النقدية' :
               'الإعدادات'}
            </h2>
            <p className="text-slate-500 mt-1">مرحباً بك مجدداً، {user.displayName}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4">
              <button 
                onClick={() => setQuickTransactionModal({ isOpen: true, type: 'deposit' })}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                <ArrowUpRight className="w-4 h-4" /> إيداع سريع
              </button>
              <button 
                onClick={() => setQuickTransactionModal({ isOpen: true, type: 'withdrawal' })}
                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-rose-500/20"
              >
                <ArrowDownLeft className="w-4 h-4" /> سحب سريع
              </button>
            </div>
            
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
              <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-emerald-100" />
              <span className="text-sm font-bold text-slate-700">{user.displayName}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard customers={customers} transactions={enrichedTransactions} expenses={expenses} debts={debts} />}
            {activeTab === 'customers' && (
              <CustomerList 
                customers={customers} 
                onAddCustomer={() => setIsAddCustomerOpen(true)}
                onEditCustomer={(customer) => setEditCustomerModal({ isOpen: true, customer })}
                onTransaction={(customer, type) => setTransactionModal({ isOpen: true, type, customer })}
                onDeleteCustomer={handleDeleteCustomer}
              />
            )}
            {activeTab === 'transactions' && <TransactionHistory transactions={enrichedTransactions} />}
            {activeTab === 'wallets' && (
              <WalletsPage 
                wallets={wallets} 
                onAddWallet={handleAddWallet} 
                onUpdateWallet={handleUpdateWallet} 
                onDeleteWallet={handleDeleteWallet} 
              />
            )}
            {activeTab === 'machines' && (
              <MachinesPage 
                machines={machines} 
                onAddMachine={handleAddMachine} 
                onUpdateMachine={handleUpdateMachine} 
                onDeleteMachine={handleDeleteMachine} 
              />
            )}
            {activeTab === 'expenses' && (
              <ExpensesPage 
                expenses={expenses} 
                onAddExpense={handleAddExpense} 
                onDeleteExpense={handleDeleteExpense} 
              />
            )}
            {activeTab === 'debts' && (
              <DebtsPage 
                debts={debts} 
                onAddDebt={handleAddDebt} 
                onUpdateDebtStatus={handleUpdateDebtStatus} 
                onDeleteDebt={handleDeleteDebt} 
              />
            )}
            {activeTab === 'reports' && (
              <ReportsPage 
                customers={customers} 
                transactions={enrichedTransactions} 
                expenses={expenses}
                cashCounts={cashCounts}
              />
            )}
            {activeTab === 'cash-counter' && <CashCounter onSave={handleSaveCashCount} />}
            {activeTab === 'settings' && <SettingsPage users={users} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <AddCustomerModal 
        isOpen={isAddCustomerOpen} 
        onClose={() => setIsAddCustomerOpen(false)} 
        onSubmit={handleAddCustomer} 
      />

      <EditCustomerModal
        isOpen={editCustomerModal.isOpen}
        customer={editCustomerModal.customer}
        onClose={() => setEditCustomerModal({ isOpen: false, customer: null })}
        onSubmit={handleUpdateCustomer}
      />

      <TransactionModal 
        isOpen={transactionModal.isOpen}
        type={transactionModal.type}
        customer={transactionModal.customer}
        wallets={wallets}
        onClose={() => setTransactionModal({ isOpen: false, type: null, customer: null })}
        onSubmit={handleTransaction}
      />

      <QuickTransactionModal
        isOpen={quickTransactionModal.isOpen}
        type={quickTransactionModal.type}
        customers={customers}
        wallets={wallets}
        onClose={() => setQuickTransactionModal({ isOpen: false, type: null })}
        onSubmit={handleQuickTransaction}
      />
    </div>
  );
}
