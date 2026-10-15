import React, { useState } from 'react';
import { Search, Plus, UserPlus, Phone, Hash, CreditCard, MoreVertical, ArrowUpRight, ArrowDownLeft, Trash2, AlertTriangle, X, Download } from 'lucide-react';
import { Customer } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { exportToCSV } from '../utils/exportUtils';

interface CustomerListProps {
  customers: Customer[];
  onAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onTransaction: (customer: Customer, type: 'deposit' | 'withdrawal') => void;
  onDeleteCustomer: (customerId: string) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ customers, onAddCustomer, onEditCustomer, onTransaction, onDeleteCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleExport = () => {
    const exportData = filteredCustomers.map(c => ({
      'الاسم': c.name,
      'الهاتف': c.phone,
      'النوع': c.type === 'vip' ? 'VIP' : c.type === 'premium' ? 'مميز' : 'عادي',
      'الرصيد': c.balance,
      'تاريخ الإضافة': new Date(c.createdAt?.toDate?.() || c.createdAt).toLocaleString('ar-EG')
    }));
    exportToCSV(exportData, 'العملاء');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الهاتف..."
            className="w-full pr-12 pl-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
          >
            <Download className="w-5 h-5" />
            تصدير CSV
          </button>
          <button
            onClick={onAddCustomer}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            إضافة عميل جديد
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-bold text-slate-500">العميل</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500">النوع</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500">الرصيد الحالي</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500 text-center">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredCustomers.map((customer) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={customer.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{customer.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {customer.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        customer.type === 'vip' ? 'bg-amber-100 text-amber-700' : 
                        customer.type === 'premium' ? 'bg-blue-100 text-blue-700' : 
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {customer.type === 'vip' ? 'VIP' : customer.type === 'premium' ? 'مميز' : 'عادي'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-mono font-bold text-lg ${customer.balance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {customer.balance.toLocaleString()} ج.م
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEditCustomer(customer)}
                          className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1 text-xs font-bold"
                          title="تعديل"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => onTransaction(customer, 'deposit')}
                          className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center gap-1 text-xs font-bold"
                          title="إيداع"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                          إيداع
                        </button>
                        <button
                          onClick={() => onTransaction(customer, 'withdrawal')}
                          className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center gap-1 text-xs font-bold"
                          title="سحب"
                        >
                          <ArrowDownLeft className="w-4 h-4" />
                          سحب
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(customer.id)}
                          className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center gap-1 text-xs font-bold"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">لم يتم العثور على نتائج</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="bg-rose-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">تأكيد الحذف</h3>
              <p className="text-slate-500 text-center mb-8">هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onDeleteCustomer(deleteConfirm);
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-bold transition-all active:scale-95"
                >
                  حذف
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold transition-all active:scale-95"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
