import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { formatETB } from '../utils/formatters';

function useHourlySparkline(transactions, type, hours = 8) {
  return useMemo(() => {
    const now = Date.now();
    const bucketMs = 60 * 60 * 1000;
    const buckets = new Array(hours).fill(0);
    transactions.forEach((tx) => {
      if (tx.type !== type) return;
      const age = now - tx.timestamp;
      if (age < 0 || age > hours * bucketMs) return;
      const idx = hours - 1 - Math.floor(age / bucketMs);
      if (idx >= 0 && idx < hours) buckets[idx] += Number(tx.amount) || 0;
    });
    const max = Math.max(...buckets, 1);
    const points = buckets
      .map((v, i) => {
        const x = (i / (hours - 1)) * 100;
        const y = 22 - (v / max) * 18;
        return `${x},${y}`;
      })
      .join(' ');
    return points;
  }, [transactions, type, hours]);
}

function Sparkline({ points, colorClass }) {
  return (
    <svg width="100%" height="24" viewBox="0 0 100 24" preserveAspectRatio="none" className="mt-2">
      <polyline points={points} fill="none" strokeWidth="1.5" className={colorClass} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function SummaryCards({ onSelectLowStockFilter }) {
  const { summary, language, transactions } = useBusiness();
  const isAmharic = language === 'am';

  const salesPoints = useHourlySparkline(transactions, 'sale');
  const expensePoints = useHourlySparkline(transactions, 'expense');

  const cards = [
    {
      id: 'sales',
      title: isAmharic ? 'የዛሬ ሽያጭ ድምር' : 'Daily Inflow (Sales)',
      subtitle: `${summary.salesCount} ${isAmharic ? 'ግብይቶች ዛሬ' : 'transactions logged'}`,
      amount: formatETB(summary.todaySales),
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
      badgeText: isAmharic ? 'ገቢ' : 'Inflow',
      badgeStyle: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
      sparkline: salesPoints,
      sparklineColor: 'stroke-emerald-400',
    },
    {
      id: 'expenses',
      title: isAmharic ? 'የዛሬ ወጪዎች' : 'Daily Outflow (Expenses)',
      subtitle: isAmharic ? 'የሱቅ እና የአሠራር ወጪ' : 'Store expenses & costs',
      amount: formatETB(summary.todayExpenses),
      icon: TrendingDown,
      iconColor: 'text-rose-400',
      badgeText: isAmharic ? 'ወጪ' : 'Outflow',
      badgeStyle: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
      sparkline: expensePoints,
      sparklineColor: 'stroke-slate-400',
    },
    {
      id: 'net-cash',
      title: isAmharic ? 'የተጣራ ጥሬ ገንዘብ' : 'Net Cash Margin',
      subtitle: isAmharic ? 'ሽያጭ ሲቀነስ ወጪ' : 'Sales minus expenses',
      amount: formatETB(summary.netCash),
      icon: Wallet,
      iconColor: summary.netCash >= 0 ? 'text-slate-200' : 'text-amber-400',
      badgeText: summary.netCash >= 0 ? (isAmharic ? 'ትርፍ' : 'Net Positive') : (isAmharic ? 'ጉድለት' : 'Deficit'),
      badgeStyle: summary.netCash >= 0 ? 'text-slate-300 bg-slate-800 border-slate-700' : 'text-amber-400 bg-amber-950/40 border-amber-800/40',
    },
    {
      id: 'low-stock',
      title: isAmharic ? 'ዝቅተኛ ክምችት ማስጠንቀቂያ' : 'Low Stock Items',
      subtitle: summary.lowStockCount > 0
        ? (isAmharic ? `${summary.lowStockCount} ዕቃዎች ከደረጃ በታች ናቸው` : `${summary.lowStockCount} item(s) below reorder level`)
        : (isAmharic ? 'ሁሉም ዕቃዎች በጥሩ መጠን አሉ' : 'All items at healthy stock'),
      amount: `${summary.lowStockCount} ${isAmharic ? 'ዕቃዎች' : 'Items'}`,
      icon: AlertCircle,
      iconColor: summary.lowStockCount > 0 ? 'text-amber-400' : 'text-slate-400',
      badgeText: summary.lowStockCount > 0 ? (isAmharic ? 'አስቸኳይ' : 'Reorder Needed') : (isAmharic ? 'ደህና' : 'Normal'),
      badgeStyle: summary.lowStockCount > 0 ? 'text-amber-400 bg-amber-950/40 border-amber-800/40' : 'text-slate-400 bg-slate-800 border-slate-700',
      onClick: onSelectLowStockFilter,
    },
  ];

  return (
    <section aria-label="Business Metrics Summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.onClick}
            className={`rounded-xl bg-slate-900 border border-slate-800/90 p-4 transition-colors ${
              card.onClick ? 'cursor-pointer hover:border-slate-700' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-xs font-medium text-slate-400">
                {card.title}
              </span>
              <IconComponent className={`w-4 h-4 ${card.iconColor}`} />
            </div>

            <div className="text-2xl font-bold tracking-tight text-slate-100 tabular-nums">
              {card.amount}
            </div>

            {card.sparkline && <Sparkline points={card.sparkline} colorClass={card.sparklineColor} />}

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2.5 border-t border-slate-800/60">
              <span className="truncate text-[11px] text-slate-400">{card.subtitle}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${card.badgeStyle}`}>
                {card.badgeText}
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
}