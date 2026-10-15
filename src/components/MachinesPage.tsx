import React, { useState } from 'react';
import { Monitor, Plus, Trash2, Edit2, DollarSign, Hash } from 'lucide-react';
import { Machine } from '../types';
import { motion } from 'motion/react';

interface MachinesPageProps {
  machines: Machine[];
  onAddMachine: (machine: Omit<Machine, 'id'>) => Promise<void>;
  onUpdateMachine: (id: string, machine: Partial<Machine>) => Promise<void>;
  onDeleteMachine: (id: string) => Promise<void>;
}

export const MachinesPage: React.FC<MachinesPageProps> = ({ machines, onAddMachine, onUpdateMachine, onDeleteMachine }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [formData, setFormData] = useState({
    name: 'فوري',
    terminalId: '',
    balance: 0,
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMachine) {
      await onUpdateMachine(editingMachine.id, formData);
    } else {
      await onAddMachine(formData);
    }
    setIsModalOpen(false);
    setEditingMachine(null);
    setFormData({ name: 'فوري', terminalId: '', balance: 0, description: '' });
  };

  const openEdit = (machine: Machine) => {
    setEditingMachine(machine);
    setFormData({
      name: machine.name,
      terminalId: machine.terminalId,
      balance: machine.balance,
      description: machine.description
    });
    setIsModalOpen(true);
  };

  const machineNames = ['فوري', 'أمان', 'بي (Bee)', 'مصاري', 'خالص', 'ممكن', 'أخرى'];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Monitor className="w-8 h-8 text-emerald-500" />
          إدارة المكن (فوري، أمان، إلخ)
        </h2>
        <button
          onClick={() => {
            setEditingMachine(null);
            setFormData({ name: 'فوري', terminalId: '', balance: 0, description: '' });
            setIsModalOpen(true);
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" /> إضافة مكنة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.map((machine) => (
          <motion.div
            key={machine.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                <Monitor className="w-6 h-6" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(machine)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => onDeleteMachine(machine.id)} className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">{machine.name}</h3>
            <div className="flex flex-col gap-1 mb-4">
              <p className="text-sm text-slate-500 font-mono flex items-center gap-1">
                <Hash className="w-3 h-3" /> {machine.terminalId}
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">الرصيد الحالي</p>
              <p className="text-2xl font-mono font-bold text-emerald-600">{machine.balance.toLocaleString()} ج.م</p>
            </div>
            
            {machine.description && (
              <p className="mt-4 text-sm text-slate-500 italic">"{machine.description}"</p>
            )}
          </motion.div>
        ))}
        {machines.length === 0 && (
          <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Monitor className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">لا يوجد مكن مسجل حالياً</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">{editingMachine ? 'تعديل مكنة' : 'إضافة مكنة جديدة'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <Plus className="w-5 h-5 text-slate-500 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم المكنة / الشركة</label>
                <select
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                >
                  {machineNames.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">رقم المكنة (Terminal ID)</label>
                <input
                  type="text"
                  required
                  value={formData.terminalId}
                  onChange={(e) => setFormData({ ...formData, terminalId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono"
                  placeholder="Terminal ID"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الرصيد الحالي</label>
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
                {editingMachine ? 'حفظ التعديلات' : 'إضافة المكنة'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
