import React from 'react';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { formatETB } from '../utils/formatters';

export default function SummaryCards({ onSelectLowStockFilter }) {
  const { summary, language } = useBusiness();
  const isAmharic = language === 'am';

  const cards = [
    {
      id: 'sales',
      title: isAmharic ? 'የዛሬ ሽያጭ ድምር' : 'Total Daily Sales',
      subtitle: `${summary.salesCount} ${isAmharic ? 'ግብይቶች ዛሬ' : 'transactions today'}`,
      amount: formatETB(summary.todaySales),
      icon: TrendingUp,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      gradient: 'from-emerald-500/10 via-transparent to-transparent',
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
      tag: isAmharic ? 'ሽያጭ' : '+ Revenue',
      tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'expenses',
      title: isAmharic ? 'የዛሬ ወጪዎች' : "Today's Expenses",
      subtitle: isAmharic ? 'የሱቅ እና የአሠራር ወጪ' : 'Store & operational costs',
      amount: formatETB(summary.todayExpenses),
      icon: TrendingDown,
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      gradient: 'from-rose-500/10 via-transparent to-transparent',
      borderColor: 'border-rose-500/20 hover:border-rose-500/40',
      tag: isAmharic ? 'ወጪ' : '- Outflow',
      tagColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      id: 'net-cash',
      title: isAmharic ? 'የተጣራ ጥሬ ገንዘብ' : 'Net Cash Position',
      subtitle: isAmharic ? 'ሽያጭ ሲቀነስ ወጪ' : 'Daily sales minus expenses',
      amount: formatETB(summary.netCash),
      icon: Wallet,
      iconBg: summary.netCash >= 0 ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      gradient: summary.netCash >= 0 ? 'from-indigo-500/10 via-transparent to-transparent' : 'from-amber-500/10 via-transparent to-transparent',
      borderColor: summary.netCash >= 0 ? 'border-indigo-500/20 hover:border-indigo-500/40' : 'border-amber-500/20 hover:border-amber-500/40',
      tag: summary.netCash >= 0 ? (isAmharic ? 'ትርፍ' : 'Positive Margin') : (isAmharic ? 'ጉድለት' : 'Deficit'),
      tagColor: summary.netCash >= 0 ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'low-stock',
      title: isAmharic ? 'ዝቅተኛ ክምችት ማስጠንቀቂያ' : 'Low Stock Alert',
      subtitle: summary.lowStockCount > 0 
        ? (isAmharic ? `${summary.lowStockCount} ዕቃዎች ከማስጠንቀቂያ ገደብ በታች` : `${summary.lowStockCount} item(s) below threshold`)
        : (isAmharic ? 'ሁሉም ዕቃዎች በጥሩ መጠን አሉ' : 'All items at healthy levels'),
      amount: `${summary.lowStockCount} ${isAmharic ? 'ዕቃዎች' : 'Items'}`,
      isAlert: summary.lowStockCount > 0,
      icon: AlertTriangle,
      iconBg: summary.lowStockCount > 0 ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700',
      gradient: summary.lowStockCount > 0 ? 'from-amber-500/10 via-transparent to-transparent' : 'from-slate-800/10 via-transparent to-transparent',
      borderColor: summary.lowStockCount > 0 ? 'border-amber-500/30 hover:border-amber-500/50' : 'border-slate-800 hover:border-slate-700',
      tag: summary.lowStockCount > 0 ? (isAmharic ? 'አስቸኳይ' : 'Action Needed') : (isAmharic ? 'ደህንነቱ የተጠበቀ' : 'Healthy'),
      tagColor: summary.lowStockCount > 0 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-slate-400 bg-slate-800 border-slate-700',
      onClick: onSelectLowStockFilter,
    },
  ];

  return (
    <section aria-label="Business Metrics Summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.onClick}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${card.gradient} bg-slate-900/80 p-5 border ${card.borderColor} backdrop-blur-md shadow-lg transition-all duration-200 hover:-translate-y-0.5 ${
              card.onClick ? 'cursor-pointer' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${card.iconBg}`}>
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {card.amount}
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-2.5">
              <span className="truncate">{card.subtitle}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${card.tagColor}`}>
                {card.tag}
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
