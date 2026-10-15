import React, { useState } from 'react';
import { History as HistoryIcon, ArrowUpRight, ArrowDownLeft, Calendar, User, Search, FilterX, Download } from 'lucide-react';
import { WalletTransaction } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { exportToCSV } from '../utils/exportUtils';

interface TransactionHistoryProps {
  transactions: WalletTransaction[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = (transaction.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.walletNumber || '').includes(searchTerm);
    
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    let matchesDate = true;
    if (startDate || endDate) {
      const txDate = new Date(transaction.timestamp?.toDate?.() || transaction.timestamp);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (txDate < start) matchesDate = false;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (txDate > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesDate && matchesType;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setTypeFilter('all');
  };

  const handleExport = () => {
    const exportData = filteredTransactions.map(t => ({
      'التاريخ والوقت': new Date(t.timestamp?.toDate?.() || t.timestamp).toLocaleString('ar-EG'),
      'العميل': t.customerName || 'عميل',
      'النوع': t.type === 'deposit' ? 'إيداع' : 'سحب',
      'المبلغ': t.amount,
      'رقم المحفظة': t.walletNumber || '',
      'الرصيد السابق': t.previousBalance,
      'الرصيد الجديد': t.newBalance
    }));
    exportToCSV(exportData, 'العمليات');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-emerald-500" />
          حسابات العملاء
        </h2>
        <button
          onClick={handleExport}
          className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
        >
          <Download className="w-5 h-5" />
          تصدير CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
        <div className="w-full">
          <label className="block text-sm font-bold text-slate-700 mb-2">بحث (عميل/محفظة)</label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث هنا..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="w-full">
          <label className="block text-sm font-bold text-slate-700 mb-2">نوع العملية</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          >
            <option value="all">الكل</option>
            <option value="deposit">إيداع</option>
            <option value="withdrawal">سحب</option>
          </select>
        </div>
        
        <div className="w-full">
          <label className="block text-sm font-bold text-slate-700 mb-2">من تاريخ</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
        </div>

        <div className="w-full">
          <label className="block text-sm font-bold text-slate-700 mb-2">إلى تاريخ</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
        </div>

        {(searchTerm || startDate || endDate || typeFilter !== 'all') && (
          <button
            onClick={clearFilters}
            className="px-6 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold transition-all flex items-center gap-2 h-[50px] justify-center"
          >
            <FilterX className="w-5 h-5" />
            مسح
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-bold text-slate-500">التاريخ والوقت</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500">العميل</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500">النوع</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500">المبلغ</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500">رقم المحفظة</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500">الرصيد السابق</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500">الرصيد الجديد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.map((transaction, idx) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    key={transaction.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(transaction.timestamp?.toDate?.() || transaction.timestamp).toLocaleString('ar-EG')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <User className="w-4 h-4 text-emerald-500" />
                      {transaction.customerName || 'عميل'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                      transaction.type === 'deposit' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {transaction.type === 'deposit' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                      {transaction.type === 'deposit' ? 'إيداع' : 'سحب'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-mono font-bold text-lg ${transaction.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toLocaleString()} ج.م
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 font-mono">{transaction.walletNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-mono text-sm ${transaction.previousBalance < 0 ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>{transaction.previousBalance.toLocaleString()} ج.م</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-mono font-bold ${transaction.newBalance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>{transaction.newBalance.toLocaleString()} ج.م</p>
                  </td>
                </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <HistoryIcon className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">لا يوجد عمليات مسجلة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
