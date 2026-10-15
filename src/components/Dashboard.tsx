import React from 'react';
import { motion } from 'motion/react';
import { Users, ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, History as HistoryIcon, Download } from 'lucide-react';
import { Customer, WalletTransaction, Expense, Debt } from '../types';
import { exportToCSV } from '../utils/exportUtils';

interface DashboardProps {
  customers: Customer[];
  transactions: WalletTransaction[];
  expenses: Expense[];
  debts: Debt[];
}

export const Dashboard: React.FC<DashboardProps> = ({ customers, transactions, expenses, debts }) => {
  const totalBalance = customers.reduce((sum, c) => sum + c.balance, 0);
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalReceivables = debts
    .filter(d => d.type === 'owed' && d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);
  const totalPayables = debts
    .filter(d => d.type === 'owe' && d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  const stats = [
    { label: 'إجمالي رصيد العملاء', value: `${totalBalance.toLocaleString()} ج.م`, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'إجمالي المصروفات', value: `${totalExpenses.toLocaleString()} ج.م`, icon: ArrowDownLeft, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'إجمالي المستحقات (لنا)', value: `${totalReceivables.toLocaleString()} ج.م`, icon: ArrowUpRight, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'إجمالي الآجل (علينا)', value: `${totalPayables.toLocaleString()} ج.م`, icon: ArrowDownLeft, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  const handleExportSummary = () => {
    const summaryData = [
      { 'البند': 'إجمالي رصيد العملاء', 'القيمة': totalBalance },
      { 'البند': 'إجمالي المصروفات', 'القيمة': totalExpenses },
      { 'البند': 'إجمالي المستحقات (لنا)', 'القيمة': totalReceivables },
      { 'البند': 'إجمالي الآجل (علينا)', 'القيمة': totalPayables },
      { 'البند': 'إجمالي الإيداعات', 'القيمة': totalDeposits },
      { 'البند': 'إجمالي السحوبات', 'القيمة': totalWithdrawals },
      { 'البند': 'عدد العملاء', 'القيمة': customers.length },
      { 'البند': 'عدد العمليات', 'القيمة': transactions.length }
    ];
    exportToCSV(summaryData, 'ملخص_النظام');
  };

  return (
    <div className="space-y-8" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-500/20"
      >
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-4 tracking-tight">الشعراوي بلس - خدمتكم تسعدنا</h1>
          <p className="text-emerald-50 text-xl max-w-3xl leading-relaxed font-medium">
            مرحباً بك في منصتك الشاملة لإدارة المحافظ الإلكترونية والعمليات الحسابية. نحن هنا لخدمتكم وتسهيل أعمالكم المالية بكل احترافية وأمان.
          </p>
          <div className="mt-6 flex gap-4">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold cursor-default">
              تحديثات فورية
            </div>
            <button 
              onClick={handleExportSummary}
              className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/30 transition-colors active:scale-95 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              تقارير دقيقة
            </button>
          </div>
        </div>
        <TrendingUp className="absolute -bottom-12 -left-12 w-64 h-64 text-white/5 -rotate-12" />
        <Wallet className="absolute top-4 left-8 w-12 h-12 text-white/10" />
      </motion.div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">نظرة عامة</h2>
        <button
          onClick={handleExportSummary}
          className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
        >
          <Download className="w-5 h-5" />
          تصدير ملخص CSV
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            أحدث العملاء
          </h3>
          <div className="space-y-4">
            {customers.slice(0, 5).map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{customer.name}</p>
                    <p className="text-xs text-slate-500">{customer.phone}</p>
                  </div>
                </div>
                <p className="font-mono font-bold text-emerald-600">{customer.balance.toLocaleString()} ج.م</p>
              </div>
            ))}
            {customers.length === 0 && <p className="text-center text-slate-400 py-8">لا يوجد عملاء حالياً</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-emerald-500" />
            أحدث العمليات
          </h3>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${transaction.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {transaction.type === 'deposit' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{transaction.customerName || 'عميل'}</p>
                    <p className="text-xs text-slate-500">{new Date(transaction.timestamp?.toDate?.() || transaction.timestamp).toLocaleString('ar-EG')}</p>
                  </div>
                </div>
                <p className={`font-mono font-bold ${transaction.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toLocaleString()} ج.م
                </p>
              </div>
            ))}
            {transactions.length === 0 && <p className="text-center text-slate-400 py-8">لا يوجد عمليات حالياً</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
