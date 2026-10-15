import React, { useState } from 'react';
import { Wallet, Plus, Trash2, Edit2, DollarSign, Smartphone } from 'lucide-react';
import { WalletAccount } from '../types';
import { motion } from 'motion/react';

interface WalletsPageProps {
  wallets: WalletAccount[];
  onAddWallet: (wallet: Omit<WalletAccount, 'id'>) => Promise<void>;
  onUpdateWallet: (id: string, wallet: Partial<WalletAccount>) => Promise<void>;
  onDeleteWallet: (id: string) => Promise<void>;
}

export const WalletsPage: React.FC<WalletsPageProps> = ({ wallets, onAddWallet, onUpdateWallet, onDeleteWallet }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletAccount | null>(null);
  const [formData, setFormData] = useState({
    provider: 'فودافون كاش',
    walletNumber: '',
    serial: '',
    balance: 0,
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWallet) {
      await onUpdateWallet(editingWallet.id, formData);
    } else {
      await onAddWallet(formData);
    }
    setIsModalOpen(false);
    setEditingWallet(null);
    setFormData({ provider: 'فودافون كاش', walletNumber: '', serial: '', balance: 0, description: '' });
  };

  const openEdit = (wallet: WalletAccount) => {
    setEditingWallet(wallet);
    setFormData({
      provider: wallet.provider,
      walletNumber: wallet.walletNumber,
      serial: wallet.serial,
      balance: wallet.balance,
      description: wallet.description
    });
    setIsModalOpen(true);
  };

  const providers = ['فودافون كاش', 'اتصالات كاش', 'أورنج كاش', 'وي باي', 'فوري', 'أمان', 'أخرى'];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Wallet className="w-8 h-8 text-emerald-500" />
          إدارة المحافظ الخاصة
        </h2>
        <button
          onClick={() => {
            setEditingWallet(null);
            setFormData({ provider: 'فودافون كاش', walletNumber: '', serial: '', balance: 0, description: '' });
            setIsModalOpen(true);
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" /> إضافة محفظة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <motion.div
            key={wallet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(wallet)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => onDeleteWallet(wallet.id)} className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">{wallet.provider}</h3>
            <div className="flex flex-col gap-1 mb-4">
              <p className="text-sm text-slate-500 font-mono flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> {wallet.walletNumber}
              </p>
              <p className="text-xs text-slate-400 font-mono">سيريال: {wallet.serial}</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">الرصيد الحالي</p>
              <p className="text-2xl font-mono font-bold text-emerald-600">{wallet.balance.toLocaleString()} ج.م</p>
            </div>
            
            {wallet.description && (
              <p className="mt-4 text-sm text-slate-500 italic">"{wallet.description}"</p>
            )}
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">{editingWallet ? 'تعديل محفظة' : 'إضافة محفظة جديدة'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <Plus className="w-5 h-5 text-slate-500 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">نوع المحفظة / الشركة</label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                >
                  {providers.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">رقم المحفظة</label>
                <input
                  type="text"
                  required
                  value={formData.walletNumber}
                  onChange={(e) => setFormData({ ...formData, walletNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono"
                  placeholder="01xxxxxxxxx"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">السيريال</label>
                <input
                  type="text"
                  required
                  value={formData.serial}
                  onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono"
                  placeholder="رقم السيريال"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الرصيد الافتتاحي</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">ج.م</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">ملاحظات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all h-24 resize-none"
                  placeholder="أي تفاصيل إضافية..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/20 mt-4"
              >
                {editingWallet ? 'حفظ التعديلات' : 'إضافة المحفظة'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
