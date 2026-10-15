import React from 'react';
import { LayoutDashboard, Users, ArrowUpRight, ArrowDownLeft, History as HistoryIcon, PlusCircle, Wallet, DollarSign, Calculator, Smartphone, Settings, FileText } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'customers', label: 'العملاء', icon: Users },
    { id: 'transactions', label: 'حسابات العملاء', icon: HistoryIcon },
    { id: 'wallets', label: 'المحافظ الخاصة', icon: Smartphone },
    { id: 'machines', label: 'المكن', icon: Smartphone },
    { id: 'expenses', label: 'المصروفات', icon: DollarSign },
    { id: 'debts', label: 'المستحقات والآجل', icon: PlusCircle },
    { id: 'reports', label: 'التقارير', icon: FileText },
    { id: 'cash-counter', label: 'عداد النقدية', icon: Calculator },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed right-0 top-0 flex flex-col border-l border-slate-800" dir="rtl">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-emerald-500 p-2 rounded-lg">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold tracking-tight leading-tight">الشعراوي بلس</h1>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">خدمتكم تسعدنا</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
          <p className="text-xs text-slate-500 mb-1">المسؤول</p>
          <p className="text-sm font-medium truncate">tamerfawzyragheb@gmail.com</p>
        </div>
      </div>
    </div>
  );
};
