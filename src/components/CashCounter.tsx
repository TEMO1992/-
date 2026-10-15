import React, { useState } from 'react';
import { Calculator, RefreshCw, DollarSign, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { CashCount } from '../types';

interface CashCounterProps {
  onSave?: (data: Omit<CashCount, 'id' | 'timestamp'>) => void;
}

export const CashCounter: React.FC<CashCounterProps> = ({ onSave }) => {
  const denominations = [200, 100, 50, 20, 10, 5, 1];
  const [counts, setCounts] = useState<{ [key: number]: number }>(
    denominations.reduce((acc, d) => ({ ...acc, [d]: 0 }), {})
  );
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCountChange = (denom: number, value: string) => {
    const count = parseInt(value) || 0;
    setCounts({ ...counts, [denom]: count });
  };

  const total = denominations.reduce((sum, d) => sum + d * counts[d], 0);

  const reset = () => {
    setCounts(denominations.reduce((acc, d) => ({ ...acc, [d]: 0 }), {}));
    setNotes('');
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave({
        counts,
        total,
        notes
      });
      reset();
      alert('تم حفظ الجرد بنجاح');
    } catch (error) {
      console.error('Error saving cash count:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto space-y-3" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-500" />
          عداد النقدية
        </h2>
        <button
          onClick={reset}
          className="text-slate-400 hover:text-rose-500 flex items-center gap-1.5 text-xs font-bold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> تصفير
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-emerald-500 p-4 text-white text-center">
          <p className="text-emerald-100 text-[10px] font-bold mb-0.5">إجمالي المبلغ في الدرج</p>
          <h3 className="text-3xl font-mono font-bold">{total.toLocaleString()} <span className="text-sm">ج.م</span></h3>
        </div>

        <div className="p-3 space-y-1.5">
          {denominations.map((denom) => (
            <div key={denom} className="flex items-center gap-3 p-2 rounded-xl border border-slate-50 hover:bg-slate-50 transition-all">
              <div className="w-12 text-center">
                <span className="text-lg font-mono font-bold text-slate-700">{denom}</span>
              </div>
              
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  value={counts[denom] || ''}
                  onChange={(e) => handleCountChange(denom, e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-center font-mono text-base font-bold"
                  placeholder="0"
                />
              </div>

              <div className="w-20 text-left">
                <p className="text-sm font-mono font-bold text-emerald-600">{(denom * counts[denom]).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-100 space-y-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظات الجرد..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm resize-none"
            rows={2}
          />
          <button
            onClick={handleSave}
            disabled={isSaving || total === 0}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'جاري الحفظ...' : 'حفظ الجرد'}
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex gap-2.5 items-start">
        <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600">
          <DollarSign className="w-3.5 h-3.5" />
        </div>
        <div>
          <h4 className="font-bold text-xs text-amber-900 mb-0.5">نصيحة الجرد</h4>
          <p className="text-[10px] text-amber-800 leading-relaxed">
            تأكد من مطابقة إجمالي المبلغ في الدرج مع الرصيد الافتتاحي مضافاً إليه الإيداعات النقدية ومخصوماً منه السحوبات النقدية والمصروفات خلال اليوم.
          </p>
        </div>
      </div>
    </div>
  );
};
