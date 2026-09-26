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
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ') + ' 100,24 0,24';
  return (
    <svg width="100%" height="24" viewBox="0 0 100 24" preserveAspectRatio="none" className="mt-2">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.30" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <polygon points={polygonPoints} fill={`url(#${gradientId})`} />
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

  // Parse number from formatETB for display split (number vs unit)
  const salesNum    = summary.todaySales;
  const expenseNum  = summary.todayExpenses;
  const netNum      = summary.netCash;

  function displayAmount(num) {
    const abs = Math.abs(num);
    if (abs >= 1_000_000) return { val: (abs / 1_000_000).toFixed(1), unit: 'M ETB' };
    if (abs >= 1_000)     return { val: (abs / 1_000).toFixed(1),     unit: 'k ETB' };
    return { val: abs.toLocaleString('en-US', { minimumFractionDigits: 0 }), unit: 'ETB' };
  }

  const cards = [
    {
      id:         'sales',
      title:      isAmharic ? 'የዛሬ ሽያጭ ድምር' : 'Daily Inflow (Sales)',
      sub:        `${summary.salesCount} ${isAmharic ? 'ግብይቶች' : 'transactions'}`,
      display:    displayAmount(salesNum),
      icon:       TrendingUp,
      iconBg:     'bg-emerald-500/10',
      iconColor:  'text-emerald-400',
      sparkColor: '#34d399',
      gradientId: 'sg-sales',
      sparkPoints: salesPoints,
      badge:      isAmharic ? 'ገቢ' : 'Inflow',
      badgeClass: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40',
    },
    {
      id:         'expenses',
      title:      isAmharic ? 'የዛሬ ወጪዎች' : 'Daily Outflow (Expenses)',
      sub:        isAmharic ? 'የሱቅ ወጪ' : 'Store expenses',
      display:    displayAmount(expenseNum),
      icon:       TrendingDown,
      iconBg:     'bg-rose-500/10',
      iconColor:  'text-rose-400',
      sparkColor: '#fb7185',
      gradientId: 'sg-expenses',
      sparkPoints: expensePoints,
      badge:      isAmharic ? 'ወጪ' : 'Outflow',
      badgeClass: 'text-rose-400 bg-rose-950/30 border-rose-800/40',
    },
    {
      id:        'net-cash',
      title:     isAmharic ? 'የተጣራ ጥሬ ገንዘብ' : 'Net Cash Margin',
      sub:       isAmharic ? 'ሽያጭ ሲቀነስ ወጪ' : 'Sales minus expenses',
      display:   displayAmount(netNum),
      prefix:    netNum < 0 ? '−' : '',
      icon:      Wallet,
      iconBg:    isDeficit ? 'bg-amber-500/10' : 'bg-teal-muted',
      iconColor: isDeficit ? 'text-amber-400' : 'text-teal',
      badge:     isDeficit ? (isAmharic ? 'ጉድለት' : 'Deficit') : (isAmharic ? 'ትርፍ' : 'Surplus'),
      badgeClass: isDeficit
        ? 'text-amber-400 bg-amber-950/30 border-amber-800/40'
        : 'text-teal bg-teal-muted border-teal/30',
      deficitBg: isDeficit,
    },
  ];

  return (
    <section aria-label="Business Metrics" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={[
              'rounded-2xl bg-panel border border-theme p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
              card.deficitBg ? 'border-amber-800/30' : '',
            ].join(' ')}
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-t3">{card.title}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-baseline gap-1.5">
              {card.prefix && <span className="text-2xl font-bold text-t2">{card.prefix}</span>}
              <span className="text-3xl font-bold tracking-tight text-t1 tabular-nums">
                {card.display.val}
              </span>
              <span className="text-sm font-semibold text-t3">{card.display.unit}</span>
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
            <div className="mt-3 flex items-center justify-between text-[11px] pt-2.5 border-t border-theme-muted">
              <span className="text-t4 truncate">{card.sub}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${card.badgeClass}`}>
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
}