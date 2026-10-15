import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Phone, Hash, CreditCard, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Customer } from '../types';

const customerSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  phone: z.string().min(8, 'رقم الهاتف غير صحيح'),
  type: z.enum(['regular', 'premium', 'vip']),
  description: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface EditCustomerModalProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => Promise<void>;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ isOpen, customer, onClose, onSubmit }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        phone: customer.phone,
        type: customer.type || 'regular',
        description: customer.description || '',
      });
    }
  }, [customer, reset]);

  if (!isOpen || !customer) return null;

  const handleFormSubmit: SubmitHandler<CustomerFormData> = async (data) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-900">تعديل بيانات العميل</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" /> الاسم بالكامل
            </label>
            <input
              {...register('name')}
              className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-rose-500' : 'border-slate-200'} focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all`}
              placeholder="أدخل اسم العميل"
            />
            {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-500" /> رقم الهاتف
            </label>
            <input
              {...register('phone')}
              className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-rose-500' : 'border-slate-200'} focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all`}
              placeholder="01xxxxxxxxx"
            />
            {errors.phone && <p className="text-xs text-rose-500 font-medium">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              نوع العميل
            </label>
            <select
              {...register('type')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            >
              <option value="regular">عادي</option>
              <option value="premium">مميز</option>
              <option value="vip">VIP</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              وصف إضافي (اختياري)
            </label>
            <textarea
              {...register('description')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all h-24 resize-none"
              placeholder="أدخل أي ملاحظات عن العميل..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'تحديث البيانات'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
