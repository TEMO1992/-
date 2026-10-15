import React, { useState } from 'react';
import { DollarSign, Plus, Trash2, Calendar, Tag, FileText, Download } from 'lucide-react';
import { Expense } from '../types';
import { motion } from 'motion/react';
import { exportToCSV } from '../utils/exportUtils';

interface ExpensesPageProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'timestamp'>) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({ expenses, onAddExpense, onDeleteExpense }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: 0,
    category: 'إيجار',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddExpense(formData);
    setIsModalOpen(false);
    setFormData({ amount: 0, category: 'إيجار', description: '' });
  };

  const handleExport = () => {
    const exportData = expenses.map(e => ({
      'التاريخ': e.timestamp?.toDate ? e.timestamp.toDate().toLocaleDateString('ar-EG') : 'قيد المعالجة...',
      'الفئة': e.category,
      'المبلغ': e.amount,
      'الوصف': e.description || '-'
    }));
    exportToCSV(exportData, 'المصروفات');
  };

  const categories = ['إيجار', 'كهرباء', 'إنترنت', 'مرتبات', 'صيانة', 'أدوات مكتبية', 'أخرى'];

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-rose-500" />
          إدارة المصروفات
        </h2>
        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">إجمالي المصروفات</p>
            <p className="text-xl font-mono font-bold text-rose-600">{totalExpenses.toLocaleString()} ج.م</p>
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
            className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-rose-500/20"
          >
            <Plus className="w-5 h-5" /> إضافة مصروف
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-bold text-slate-500">التاريخ</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500">الفئة</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500">المبلغ</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500">الوصف</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {expense.timestamp?.toDate ? expense.timestamp.toDate().toLocaleDateString('ar-EG') : 'قيد المعالجة...'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-rose-600">
                    {expense.amount.toLocaleString()} ج.م
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm max-w-xs truncate">
                    {expense.description || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                    لا توجد مصروفات مسجلة حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-rose-50">
              <h3 className="text-xl font-bold text-slate-900">إضافة مصروف جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <Plus className="w-5 h-5 text-slate-500 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">المبلغ</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-mono text-xl text-center"
                    placeholder="0.00"
                    autoFocus
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">ج.م</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الفئة</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all h-24 resize-none"
                  placeholder="أي تفاصيل إضافية..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-rose-500/20 mt-4"
              >
                تأكيد المصروف
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
