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
    return buckets.map((v, i) => ({
      x: (i / (hours - 1)) * 100,
      y: 22 - (v / max) * 18,
    }));
  }, [transactions, type, hours]);
}

function Sparkline({ points, color, gradientId }) {
  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  // Build a filled polygon: line points + bottom-right + bottom-left
  const polygonPoints =
    points.map(p => `${p.x},${p.y}`).join(' ') + ' 100,24 0,24';

  return (
    <svg width="100%" height="24" viewBox="0 0 100 24" preserveAspectRatio="none" className="mt-2">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      {/* Gradient fill */}
      <polygon points={polygonPoints} fill={`url(#${gradientId})`} />
      {/* Line */}
      <polyline
        points={polylinePoints}
        fill="none"
        strokeWidth="1.5"
        stroke={color}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SummaryCards({ onSelectLowStockFilter }) {
  const { summary, language, transactions } = useBusiness();
  const isAmharic = language === 'am';

  const salesPoints   = useHourlySparkline(transactions, 'sale');
  const expensePoints = useHourlySparkline(transactions, 'expense');

  const isDeficit = summary.netCash < 0;

  const cards = [
    {
      id: 'sales',
      title:       isAmharic ? 'የዛሬ ሽያጭ ድምር' : 'Daily Inflow (Sales)',
      subtitle:    `${summary.salesCount} ${isAmharic ? 'ግብይቶች ዛሬ' : 'transactions logged'}`,
      amount:      formatETB(summary.todaySales),
      icon:        TrendingUp,
      iconColor:   'text-emerald-400',
      badgeText:   isAmharic ? 'ገቢ' : 'Inflow',
      badgeStyle:  'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
      accentTop:   'before:bg-emerald-500/40',
      sparkColor:  '#34d399',
      gradientId:  'sg-sales',
      sparkPoints: salesPoints,
    },
    {
      id: 'expenses',
      title:       isAmharic ? 'የዛሬ ወጪዎች' : 'Daily Outflow (Expenses)',
      subtitle:    isAmharic ? 'የሱቅ እና የአሠራር ወጪ' : 'Store expenses & costs',
      amount:      formatETB(summary.todayExpenses),
      icon:        TrendingDown,
      iconColor:   'text-rose-400',
      badgeText:   isAmharic ? 'ወጪ' : 'Outflow',
      badgeStyle:  'text-rose-400 bg-rose-950/40 border-rose-800/40',
      accentTop:   'before:bg-rose-500/40',
      sparkColor:  '#fb7185',
      gradientId:  'sg-expenses',
      sparkPoints: expensePoints,
    },
    {
      id: 'net-cash',
      title:      isAmharic ? 'የተጣራ ጥሬ ገንዘብ' : 'Net Cash Margin',
      subtitle:   isAmharic ? 'ሽያጭ ሲቀነስ ወጪ' : 'Sales minus expenses',
      amount:     formatETB(summary.netCash),
      icon:       Wallet,
      iconColor:  isDeficit ? 'text-amber-400' : 'text-emerald-400',
      badgeText:  isDeficit ? (isAmharic ? 'ጉድለት' : 'Deficit') : (isAmharic ? 'ትርፍ' : 'Net Positive'),
      badgeStyle: isDeficit
        ? 'text-amber-400 bg-amber-950/40 border-amber-800/40'
        : 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
      accentTop:  isDeficit ? 'before:bg-amber-500/40' : 'before:bg-emerald-500/40',
      deficitBg:  isDeficit,
    },
    {
      id: 'low-stock',
      title:     isAmharic ? 'ዝቅተኛ ክምችት ማስጠንቀቂያ' : 'Low Stock Items',
      subtitle:  summary.lowStockCount > 0
        ? (isAmharic ? `${summary.lowStockCount} ዕቃዎች ከደረጃ በታች` : `${summary.lowStockCount} item(s) below reorder level`)
        : (isAmharic ? 'ሁሉም ዕቃዎች ደህና ናቸው' : 'All items at healthy stock'),
      amount:    `${summary.lowStockCount} ${isAmharic ? 'ዕቃዎች' : 'Items'}`,
      icon:      AlertCircle,
      iconColor: summary.lowStockCount > 0 ? 'text-amber-400' : 'text-t3',
      badgeText: summary.lowStockCount > 0 ? (isAmharic ? 'አስቸኳይ' : 'Reorder') : (isAmharic ? 'ደህና' : 'Normal'),
      badgeStyle: summary.lowStockCount > 0
        ? 'text-amber-400 bg-amber-950/40 border-amber-800/40'
        : 'text-t3 bg-raised border-theme',
      accentTop: summary.lowStockCount > 0 ? 'before:bg-amber-500/40' : 'before:bg-surface',
      onClick:   onSelectLowStockFilter,
    },
  ];

  return (
    <section aria-label="Business Metrics Summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.onClick}
            className={[
              // Base card
              'relative rounded-xl bg-panel border border-theme p-4 transition-all duration-200',
              'before:absolute before:inset-x-4 before:top-0 before:h-[2px] before:rounded-full',
              card.accentTop,
              // Hover lift
              card.onClick ? 'cursor-pointer hover:border-indigo-500/30 hover:-translate-y-0.5 hover:shadow-lg' : 'hover:-translate-y-0.5 hover:shadow-md',
              // Deficit tint
              card.deficitBg ? 'bg-amber-950/10' : '',
            ].join(' ')}
          >
            {/* Title row */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-xs font-medium text-t3">{card.title}</span>
              <Icon className={`w-4 h-4 ${card.iconColor}`} />
            </div>

            {/* Amount */}
            <div className="text-2xl font-bold tracking-tight text-t1 tabular-nums">
              {card.amount}
            </div>

            {/* Sparkline */}
            {card.sparkPoints && (
              <Sparkline
                points={card.sparkPoints}
                color={card.sparkColor}
                gradientId={card.gradientId}
              />
            )}

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-theme-muted">
              <span className="truncate text-[11px] text-t3">{card.subtitle}</span>
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