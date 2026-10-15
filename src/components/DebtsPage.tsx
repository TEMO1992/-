import React, { useState } from 'react';
import { Users, Plus, Trash2, CheckCircle, Clock, ArrowUpRight, ArrowDownLeft, User, Download } from 'lucide-react';
import { Debt } from '../types';
import { motion } from 'motion/react';
import { exportToCSV } from '../utils/exportUtils';

interface DebtsPageProps {
  debts: Debt[];
  onAddDebt: (debt: Omit<Debt, 'id' | 'timestamp'>) => Promise<void>;
  onUpdateDebtStatus: (id: string, status: 'pending' | 'paid') => Promise<void>;
  onDeleteDebt: (id: string) => Promise<void>;
}

export const DebtsPage: React.FC<DebtsPageProps> = ({ debts, onAddDebt, onUpdateDebtStatus, onDeleteDebt }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    personName: '',
    amount: 0,
    type: 'owed' as 'owe' | 'owed',
    description: '',
    status: 'pending' as 'pending' | 'paid'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddDebt(formData);
    setIsModalOpen(false);
    setFormData({ personName: '', amount: 0, type: 'owed', description: '', status: 'pending' });
  };

  const handleExport = () => {
    const exportData = debts.map(d => ({
      'الاسم': d.personName,
      'المبلغ': d.amount,
      'النوع': d.type === 'owed' ? 'لنا عنده (آجل)' : 'علينا له (دين)',
      'الحالة': d.status === 'paid' ? 'تم السداد' : 'قيد الانتظار',
      'التاريخ': d.timestamp?.toDate ? d.timestamp.toDate().toLocaleDateString('ar-EG') : 'قيد المعالجة...',
      'الوصف': d.description || '-'
    }));
    exportToCSV(exportData, 'المستحقات_والديون');
  };

  const totalOwedToUs = debts.filter(d => d.type === 'owed' && d.status === 'pending').reduce((sum, d) => sum + d.amount, 0);
  const totalWeOwe = debts.filter(d => d.type === 'owe' && d.status === 'pending').reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Users className="w-8 h-8 text-indigo-500" />
          المستحقات والآجل
        </h2>
        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">لنا عند الناس</p>
            <p className="text-xl font-mono font-bold text-emerald-600">{totalOwedToUs.toLocaleString()} ج.م</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">علينا للناس</p>
            <p className="text-xl font-mono font-bold text-rose-600">{totalWeOwe.toLocaleString()} ج.م</p>
          </div>
          <button
            onClick={handleExport}
            className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
          >
            <Download className="w-5 h-5" />
            تصدير CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-5 h-5" /> إضافة سجل
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Owed to us (Receivables) */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-emerald-500" />
            مستحقات لنا (آجل)
          </h3>
          <div className="space-y-3">
            {debts.filter(d => d.type === 'owed').map(debt => (
              <motion.div
                key={debt.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-2xl border ${debt.status === 'paid' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-emerald-100 shadow-sm'} transition-all`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${debt.status === 'paid' ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                      {debt.personName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{debt.personName}</p>
                      <p className="text-xs text-slate-500">{debt.timestamp?.toDate ? debt.timestamp.toDate().toLocaleDateString('ar-EG') : 'قيد المعالجة...'}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className={`text-lg font-mono font-bold ${debt.status === 'paid' ? 'text-slate-400' : 'text-emerald-600'}`}>{debt.amount.toLocaleString()} ج.م</p>
                    <div className="flex gap-2 mt-2 justify-end">
                      {debt.status === 'pending' && (
                        <button 
                          onClick={() => onUpdateDebtStatus(debt.id, 'paid')}
                          className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-500 transition-colors"
                          title="تم السداد"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => onDeleteDebt(debt.id)}
                        className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {debt.description && <p className="mt-3 text-sm text-slate-500 border-t border-slate-50 pt-2">{debt.description}</p>}
              </motion.div>
            ))}
          </div>
        </div>

        {/* We owe (Payables) */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-rose-500" />
            ديون علينا
          </h3>
          <div className="space-y-3">
            {debts.filter(d => d.type === 'owe').map(debt => (
              <motion.div
                key={debt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-2xl border ${debt.status === 'paid' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-rose-100 shadow-sm'} transition-all`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${debt.status === 'paid' ? 'bg-slate-200 text-slate-500' : 'bg-rose-100 text-rose-600'}`}>
                      {debt.personName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{debt.personName}</p>
                      <p className="text-xs text-slate-500">{debt.timestamp?.toDate ? debt.timestamp.toDate().toLocaleDateString('ar-EG') : 'قيد المعالجة...'}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className={`text-lg font-mono font-bold ${debt.status === 'paid' ? 'text-slate-400' : 'text-rose-600'}`}>{debt.amount.toLocaleString()} ج.م</p>
                    <div className="flex gap-2 mt-2 justify-end">
                      {debt.status === 'pending' && (
                        <button 
                          onClick={() => onUpdateDebtStatus(debt.id, 'paid')}
                          className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-500 transition-colors"
                          title="تم السداد"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => onDeleteDebt(debt.id)}
                        className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {debt.description && <p className="mt-3 text-sm text-slate-500 border-t border-slate-50 pt-2">{debt.description}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50">
              <h3 className="text-xl font-bold text-slate-900">إضافة سجل جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <Plus className="w-5 h-5 text-slate-500 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الاسم</label>
                <input
                  type="text"
                  required
                  value={formData.personName}
                  onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="اسم الشخص أو الجهة..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">المبلغ</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono text-xl text-center"
                    placeholder="0.00"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">ج.م</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">النوع</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'owed' })}
                    className={`py-3 rounded-xl font-bold border transition-all ${formData.type === 'owed' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'}`}
                  >
                    لنا عنده (آجل)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'owe' })}
                    className={`py-3 rounded-xl font-bold border transition-all ${formData.type === 'owe' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'}`}
                  >
                    علينا له (دين)
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all h-24 resize-none"
                  placeholder="أي تفاصيل إضافية..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/20 mt-4"
              >
                حفظ السجل
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
