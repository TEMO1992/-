import React, { useState } from 'react';
import { FileText, Download, Search, Filter, Calendar, User, Smartphone, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Customer, WalletTransaction, Expense, CashCount } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { exportToCSV } from '../utils/exportUtils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ReportsPageProps {
  customers: Customer[];
  transactions: WalletTransaction[];
  expenses: Expense[];
  cashCounts: CashCount[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ customers, transactions, expenses, cashCounts }) => {
  const [reportType, setReportType] = useState<'transactions' | 'customers' | 'reconciliation'>('transactions');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerType, setCustomerType] = useState<'all' | 'regular' | 'premium' | 'vip'>('all');
  const [transactionType, setTransactionType] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(t => {
    const matchesType = transactionType === 'all' || t.type === transactionType;
    const matchesSearch = (t.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (t.walletNumber || '').includes(searchTerm);
    
    let matchesDate = true;
    if (startDate || endDate) {
      const txDate = new Date(t.timestamp?.toDate?.() || t.timestamp);
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

    return matchesType && matchesSearch && matchesDate;
  });

  const filteredCustomers = customers.filter(c => {
    const matchesType = customerType === 'all' || c.type === customerType;
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.phone.includes(searchTerm);
    
    let matchesDate = true;
    if (startDate || endDate) {
      const txDate = new Date(c.createdAt?.toDate?.() || c.createdAt);
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

    return matchesType && matchesSearch && matchesDate;
  });

  const handleExportCSV = () => {
    if (reportType === 'transactions') {
      const data = filteredTransactions.map(t => ({
        'التاريخ': new Date(t.timestamp?.toDate?.() || t.timestamp).toLocaleString('ar-EG'),
        'العميل': t.customerName || 'عميل',
        'النوع': t.type === 'deposit' ? 'إيداع' : 'سحب',
        'المبلغ': t.amount,
        'رقم المحفظة': t.walletNumber,
        'الرصيد السابق': t.previousBalance,
        'الرصيد الجديد': t.newBalance
      }));
      exportToCSV(data, 'تقرير_العمليات');
    } else {
      const data = filteredCustomers.map(c => ({
        'الاسم': c.name,
        'الهاتف': c.phone,
        'النوع': c.type,
        'الرصيد الحالي': c.balance,
        'تاريخ التسجيل': new Date(c.createdAt?.toDate?.() || c.createdAt).toLocaleDateString('ar-EG')
      }));
      exportToCSV(data, 'تقرير_العملاء');
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Note: Arabic support in jsPDF requires a font that supports it.
    // Since we can't easily load custom fonts here, we'll use English labels for the PDF
    // but try to keep the data as is.
    
    doc.setFontSize(18);
    doc.text(reportType === 'transactions' ? 'Transactions Report' : 'Customers Report', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });

    if (reportType === 'transactions') {
      const tableData = filteredTransactions.map(t => [
        new Date(t.timestamp?.toDate?.() || t.timestamp).toLocaleString(),
        t.customerName || 'N/A',
        t.type === 'deposit' ? 'Deposit' : 'Withdrawal',
        t.amount.toString(),
        t.walletNumber
      ]);

      (doc as any).autoTable({
        head: [['Date', 'Customer', 'Type', 'Amount', 'Wallet']],
        body: tableData,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }, // emerald-500
      });
    } else {
      const tableData = filteredCustomers.map(c => [
        c.name,
        c.phone,
        c.type,
        c.balance.toString(),
        new Date(c.createdAt?.toDate?.() || c.createdAt).toLocaleDateString()
      ]);

      (doc as any).autoTable({
        head: [['Name', 'Phone', 'Type', 'Balance', 'Joined']],
        body: tableData,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }, // emerald-500
      });
    }

    doc.save(reportType === 'transactions' ? 'transactions_report.pdf' : 'customers_report.pdf');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-emerald-500" />
          التقارير التفصيلية
        </h2>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
          >
            <Download className="w-5 h-5" />
            تصدير CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            <FileText className="w-5 h-5" />
            تصدير PDF
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex gap-4 border-b border-slate-100 pb-4">
          <button
            onClick={() => setReportType('transactions')}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${
              reportType === 'transactions' 
                ? 'bg-emerald-500 text-white' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            تقرير العمليات
          </button>
          <button
            onClick={() => setReportType('customers')}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${
              reportType === 'customers' 
                ? 'bg-emerald-500 text-white' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            تقرير العملاء
          </button>
          <button
            onClick={() => setReportType('reconciliation')}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${
              reportType === 'reconciliation' 
                ? 'bg-emerald-500 text-white' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            مطابقة النقدية
          </button>
        </div>

        {reportType === 'reconciliation' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <h4 className="text-emerald-900 font-bold mb-4 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5" />
                إجمالي الإيداعات (نقد داخل)
              </h4>
              <p className="text-3xl font-mono font-bold text-emerald-600">
                {filteredTransactions
                  .filter(t => t.type === 'deposit')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()} ج.م
              </p>
            </div>

            <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
              <h4 className="text-rose-900 font-bold mb-4 flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5" />
                إجمالي السحوبات والمصروفات (نقد خارج)
              </h4>
              <p className="text-3xl font-mono font-bold text-rose-600">
                {(
                  filteredTransactions
                    .filter(t => t.type === 'withdrawal')
                    .reduce((sum, t) => sum + t.amount, 0) +
                  expenses
                    .filter(e => {
                      const eDate = new Date(e.timestamp?.toDate?.() || e.timestamp);
                      if (startDate) {
                        const start = new Date(startDate);
                        start.setHours(0, 0, 0, 0);
                        if (eDate < start) return false;
                      }
                      if (endDate) {
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        if (eDate > end) return false;
                      }
                      return true;
                    })
                    .reduce((sum, e) => sum + e.amount, 0)
                ).toLocaleString()} ج.م
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                صافي الحركة في النظام
              </h4>
              <p className="text-3xl font-mono font-bold text-slate-600">
                {(
                  filteredTransactions
                    .filter(t => t.type === 'deposit')
                    .reduce((sum, t) => sum + t.amount, 0) -
                  (filteredTransactions
                    .filter(t => t.type === 'withdrawal')
                    .reduce((sum, t) => sum + t.amount, 0) +
                  expenses
                    .filter(e => {
                      const eDate = new Date(e.timestamp?.toDate?.() || e.timestamp);
                      if (startDate) {
                        const start = new Date(startDate);
                        start.setHours(0, 0, 0, 0);
                        if (eDate < start) return false;
                      }
                      if (endDate) {
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        if (eDate > end) return false;
                      }
                      return true;
                    })
                    .reduce((sum, e) => sum + e.amount, 0))
                ).toLocaleString()} ج.م
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Search className="w-4 h-4" />
              بحث عام
            </label>
            <input
              type="text"
              placeholder="ابحث هنا..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              من تاريخ
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              إلى تاريخ
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>

          {reportType === 'transactions' ? (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                نوع العملية
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              >
                <option value="all">الكل</option>
                <option value="deposit">إيداع</option>
                <option value="withdrawal">سحب</option>
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                نوع العميل
              </label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              >
                <option value="all">الكل</option>
                <option value="regular">عادي</option>
                <option value="premium">مميز</option>
                <option value="vip">VIP</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {reportType === 'reconciliation' ? (
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-sm font-bold text-slate-500">التاريخ</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500">المبلغ الفعلي (الجرد)</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cashCounts
                  .filter(c => {
                    const cDate = new Date(c.timestamp?.toDate?.() || c.timestamp);
                    if (startDate) {
                      const start = new Date(startDate);
                      start.setHours(0, 0, 0, 0);
                      if (cDate < start) return false;
                    }
                    if (endDate) {
                      const end = new Date(endDate);
                      end.setHours(23, 59, 59, 999);
                      if (cDate > end) return false;
                    }
                    return true;
                  })
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(c.timestamp?.toDate?.() || c.timestamp).toLocaleString('ar-EG')}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-600">{c.total.toLocaleString()} ج.م</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{c.notes || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : reportType === 'transactions' ? (
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-sm font-bold text-slate-500">التاريخ</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500">العميل</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500">النوع</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500">المبلغ</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500">رقم المحفظة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(t.timestamp?.toDate?.() || t.timestamp).toLocaleString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{t.customerName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        t.type === 'deposit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {t.type === 'deposit' ? 'إيداع' : 'سحب'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">{t.amount.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">{t.walletNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-sm font-bold text-slate-500">الاسم</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500">الهاتف</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500">النوع</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500">الرصيد</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500">تاريخ الانضمام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{c.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{c.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        c.type === 'vip' ? 'bg-amber-100 text-amber-700' : 
                        c.type === 'premium' ? 'bg-blue-100 text-blue-700' : 
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {c.type === 'vip' ? 'VIP' : c.type === 'premium' ? 'مميز' : 'عادي'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">{c.balance.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(c.createdAt?.toDate?.() || c.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
