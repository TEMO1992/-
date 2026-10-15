import React, { useState } from 'react';
import { Settings, AlertTriangle, Trash2, ShieldAlert, Loader2, Users, Shield, Check, X, UserPlus, Mail, ShieldCheck, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { AppUser } from '../types';

interface SettingsPageProps {
  users: AppUser[];
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ users }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ 
    email: '', 
    username: '', 
    password: '', 
    displayName: '', 
    role: 'viewer' as const 
  });
  const [isSavingUser, setIsSavingUser] = useState(false);

  const handleResetSystem = async () => {
    if (confirmText !== 'تأكيد') return;
    
    setIsDeleting(true);
    setSuccessMessage('');

    try {
      const collectionsToClear = [
        'customers',
        'transactions',
        'expenses',
        'debts',
        'walletAccounts',
        'machines'
      ];

      for (const colName of collectionsToClear) {
        const querySnapshot = await getDocs(collection(db, colName));
        const deletePromises = querySnapshot.docs.map(document => 
          deleteDoc(doc(db, colName, document.id))
        );
        await Promise.all(deletePromises);
      }

      setSuccessMessage('تمت تهيئة النظام ومسح جميع البيانات بنجاح.');
      setIsConfirmOpen(false);
      setConfirmText('');
    } catch (error) {
      console.error('Error resetting system:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUser(true);
    try {
      await addDoc(collection(db, 'users'), {
        ...newUser,
        permissions: [],
        createdAt: serverTimestamp()
      });
      setIsAddUserOpen(false);
      setNewUser({ 
        email: '', 
        username: '', 
        password: '', 
        displayName: '', 
        role: 'viewer' 
      });
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-emerald-500" />
          الإعدادات
        </h2>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            إدارة المستخدمين والصلاحيات
          </h3>
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            <UserPlus className="w-5 h-5" /> إضافة مستخدم
          </button>
        </div>

        <div className="space-y-4">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {u.displayName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{u.displayName}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="bg-slate-200 px-1.5 py-0.5 rounded">@{u.username}</span>
                    <span>{u.email}</span>
                    {u.password && (
                      <span className="text-slate-300">| كلمة المرور: {u.password}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                  {(['admin', 'editor', 'viewer'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => handleUpdateRole(u.id, role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        u.role === role 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {role === 'admin' ? 'مدير' : role === 'editor' ? 'محرر' : 'مشاهد'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setUserToDelete(u.id)}
                  className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>لا يوجد مستخدمين مضافين حالياً</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-8">
        <div className="flex items-start gap-6 border-b border-slate-100 pb-8 mb-8">
          <div className="bg-rose-50 p-4 rounded-2xl text-rose-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2">تهيئة النظام (مسح جميع البيانات)</h3>
            <p className="text-slate-500 mb-4 leading-relaxed">
              هذا الإجراء سيقوم بمسح جميع البيانات المسجلة في النظام بشكل نهائي ولا يمكن التراجع عنه. 
              يشمل ذلك: العملاء، العمليات، المصروفات، المديونيات، المحافظ، والمكن.
            </p>
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-rose-500/20"
            >
              <Trash2 className="w-5 h-5" /> بدء تهيئة النظام
            </button>
            
            {successMessage && (
              <div className="mt-4 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-bold">
                {successMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAddUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-50">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-bold text-blue-700">إضافة مستخدم جديد</h3>
                </div>
                <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 block">الاسم</label>
                  <div className="relative">
                    <Users className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      value={newUser.displayName}
                      onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                      className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="اسم المستخدم"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 block">اسم المستخدم</label>
                  <div className="relative">
                    <UserPlus className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="اسم المستخدم للدخول"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 block">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="password"
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 block">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="example@mail.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 block">الصلاحية</label>
                  <div className="relative">
                    <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                      className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
                    >
                      <option value="viewer">مشاهد (عرض فقط)</option>
                      <option value="editor">محرر (إضافة وتعديل)</option>
                      <option value="admin">مدير (صلاحيات كاملة)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingUser}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    {isSavingUser ? <Loader2 className="w-5 h-5 animate-spin" /> : 'حفظ المستخدم'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-rose-50">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
                <h3 className="text-xl font-bold text-rose-700">تحذير خطير</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <p className="text-slate-700 font-bold">
                  أنت على وشك مسح <span className="text-rose-600">جميع بيانات النظام</span>.
                </p>
                <p className="text-sm text-slate-500">
                  يرجى كتابة كلمة <strong className="text-slate-900 bg-slate-100 px-2 py-1 rounded">تأكيد</strong> في الحقل أدناه للمتابعة.
                </p>
                
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all text-center font-bold"
                  placeholder="اكتب كلمة تأكيد هنا"
                  disabled={isDeleting}
                />
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsConfirmOpen(false);
                      setConfirmText('');
                    }}
                    disabled={isDeleting}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleResetSystem}
                    disabled={confirmText !== 'تأكيد' || isDeleting}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
                  >
                    {isDeleting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> جاري المسح...</>
                    ) : (
                      <><Trash2 className="w-5 h-5" /> مسح نهائي</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-rose-50">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
                <h3 className="text-xl font-bold text-rose-700">تأكيد الحذف</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <p className="text-slate-700 font-bold text-center">
                  هل أنت متأكد من حذف هذا المستخدم؟
                </p>
                <p className="text-sm text-slate-500 text-center">
                  لا يمكن التراجع عن هذا الإجراء بعد إتمامه.
                </p>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setUserToDelete(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => handleDeleteUser(userToDelete)}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20"
                  >
                    حذف المستخدم
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
