import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ArrowUpRight, ArrowDownLeft, Loader2, DollarSign, FileText, Search, User, Smartphone, Hash, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer, WalletAccount } from '../types';

const transactionSchema = z.object({
  customerId: z.string().min(1, 'يجب اختيار عميل'),
  amount: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
  description: z.string().optional(),
  walletId: z.string().min(1, 'يجب اختيار المحفظة'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface QuickTransactionModalProps {
  isOpen: boolean;
  type: 'deposit' | 'withdrawal' | null;
  initialCustomerId?: string | null;
  customers: Customer[];
  wallets: WalletAccount[];
  onClose: () => void;
  onSubmit: (customerId: string, data: TransactionFormData & { walletNumber: string }) => Promise<void>;
}

export const QuickTransactionModal: React.FC<QuickTransactionModalProps> = ({ isOpen, type, initialCustomerId, customers, wallets, onClose, onSubmit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue, getValues } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      customerId: initialCustomerId || '',
      amount: 0,
      description: '',
      walletId: '',
    }
  });

  React.useEffect(() => {
    if (isOpen && initialCustomerId) {
      setValue('customerId', initialCustomerId);
    } else if (!isOpen) {
      reset();
      setSearchTerm('');
      setShowSummary(false);
    }
  }, [isOpen, initialCustomerId, setValue, reset]);

  if (!isOpen || !type) return null;

  const selectedCustomerId = watch('customerId');
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  ).slice(0, 5);

  const handleFormSubmit: SubmitHandler<TransactionFormData> = async (data) => {
    if (!showSummary) {
      setShowSummary(true);
      return;
    }
    
    const { customerId, ...rest } = data;
    const selectedWallet = wallets.find(w => w.id === data.walletId);
    await onSubmit(customerId, { ...rest, walletNumber: selectedWallet?.walletNumber || '' });
    reset();
    setSearchTerm('');
    setShowSummary(false);
    onClose();
  };

  const isDeposit = type === 'deposit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className={`p-6 border-b border-slate-100 flex items-center justify-between ${isDeposit ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDeposit ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
              {isDeposit ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{isDeposit ? 'إيداع سريع' : 'سحب سريع'}</h3>
              <p className="text-xs text-slate-500 font-medium">اختر العميل وأدخل المبلغ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          <AnimatePresence mode="wait">
            {!showSummary ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                {!selectedCustomer ? (
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-500" /> ابحث عن العميل
                    </label>
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        placeholder="اسم العميل أو رقم الهاتف..."
                      />
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filteredCustomers.map(customer => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => setValue('customerId', customer.id)}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-right"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{customer.name}</p>
                            <p className="text-xs text-slate-500">{customer.phone}</p>
                          </div>
                          <p className={`font-mono font-bold ${customer.balance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{customer.balance.toLocaleString()} ج.م</p>
                        </button>
                      ))}
                      {searchTerm && filteredCustomers.length === 0 && (
                        <p className="text-center text-slate-400 py-4 text-sm">لا يوجد نتائج للبحث</p>
                      )}
                    </div>
                    {errors.customerId && <p className="text-xs text-rose-500 font-medium">{errors.customerId.message}</p>}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                        {selectedCustomer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{selectedCustomer.name}</p>
                        <p className={`text-xs font-bold ${selectedCustomer.balance < 0 ? 'text-rose-600' : 'text-slate-500'}`}>الرصيد: {selectedCustomer.balance.toLocaleString()} ج.م</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setValue('customerId', '')}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      تغيير العميل
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-500" /> اختيار المحفظة
                  </label>
                  <select
                    {...register('walletId')}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.walletId ? 'border-rose-500' : 'border-slate-200'} focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all`}
                  >
                    <option value="">اختر محفظة...</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.provider} - {w.walletNumber} ({w.balance.toLocaleString()} ج.م)</option>
                    ))}
                  </select>
                  {errors.walletId && <p className="text-xs text-rose-500 font-medium">{errors.walletId.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" /> المبلغ
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      {...register('amount', { valueAsNumber: true })}
                      className={`w-full px-4 py-4 rounded-xl border ${errors.amount ? 'border-rose-500' : 'border-slate-200'} focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-2xl font-mono font-bold text-center`}
                      placeholder="0.00"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">ج.م</span>
                  </div>
                  {errors.amount && <p className="text-xs text-rose-500 font-medium">{errors.amount.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-500" /> ملاحظات (اختياري)
                  </label>
                  <textarea
                    {...register('description')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none h-20"
                    placeholder="أدخل أي ملاحظات إضافية هنا..."
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                  <h4 className="text-center font-bold text-slate-900 border-b border-slate-200 pb-3">ملخص العملية السريعة</h4>
                  
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <span className="text-slate-500">نوع العملية:</span>
                    <span className={`font-bold text-left ${isDeposit ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isDeposit ? 'إيداع رصيد' : 'سحب رصيد'}
                    </span>
                    
                    <span className="text-slate-500">العميل:</span>
                    <span className="font-bold text-left text-slate-900">{selectedCustomer?.name}</span>
                    
                    <span className="text-slate-500">المحفظة المستخدمة:</span>
                    <span className="font-bold text-left text-slate-900">
                      {wallets.find(w => w.id === getValues('walletId'))?.provider} ({wallets.find(w => w.id === getValues('walletId'))?.walletNumber})
                    </span>
                    
                    <span className="text-slate-500">المبلغ:</span>
                    <span className="font-bold text-left text-emerald-600 text-lg font-mono">{getValues('amount').toLocaleString()} ج.م</span>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-500 text-xs">رصيد العميل بعد العملية:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {selectedCustomer ? (isDeposit ? selectedCustomer.balance + getValues('amount') : selectedCustomer.balance - getValues('amount')).toLocaleString() : 0} ج.م
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>يرجى التأكد من صحة البيانات قبل التأكيد النهائي.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 mt-4">
            {showSummary && (
              <button
                type="button"
                onClick={() => setShowSummary(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-bold text-lg transition-all"
              >
                تعديل
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || (!selectedCustomerId && !showSummary)}
              className={`flex-[2] ${isDeposit ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'} disabled:bg-slate-300 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {showSummary ? <CheckCircle2 className="w-6 h-6" /> : null}
                  {showSummary ? 'تأكيد نهائي' : 'مراجعة العملية'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
