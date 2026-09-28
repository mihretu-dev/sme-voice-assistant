import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Package, Mic, Inbox, Download } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { formatETB, formatTime, formatDate } from '../utils/formatters';

function exportToCSV(transactions) {
  const rows = [
    ['Date', 'Time', 'Type', 'Item', 'Quantity', 'Unit', 'Amount (ETB)', 'Source'],
    ...transactions.map(tx => [
      formatDate(tx.timestamp),
      formatTime(tx.timestamp),
      tx.type,
      tx.item,
      tx.quantity ?? '',
      tx.unit ?? '',
      tx.amount ?? 0,
      tx.source ?? 'manual',
    ]),
  ];
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'birrvoice-ledger.csv' });
  a.click();
  URL.revokeObjectURL(url);
}

export default function TransactionHistory() {
  const { transactions, summary, language } = useBusiness();
  const isAmharic = language === 'am';
  const [activeTab, setActiveTab] = useState('all');

  const filtered = transactions.filter(tx =>
    activeTab === 'all' ? true : tx.type === activeTab
  );

  const tabClass = (tab, color) =>
    `px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
      activeTab === tab
        ? `bg-raised ${color}`
        : 'text-t4 hover:text-t2'
    }`;

  return (
    <div className="rounded-2xl bg-panel border border-theme p-3.5 sm:p-5 flex flex-col h-full transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-t1">
            {isAmharic ? 'የቅርብ ጊዜ ግብይቶች' : 'Transactional Ledger'}
          </h2>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono text-t3 bg-surface border border-theme">
            {filtered.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV */}
          <button
            onClick={() => exportToCSV(transactions)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-t3 hover:text-teal bg-raised border border-theme hover:border-teal/30 transition-all"
            title="Export Ledger as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAmharic ? 'ወጪ ላክ' : 'Export'}</span>
          </button>

          {/* Tab filter */}
          <div className="flex items-center bg-surface p-0.5 rounded-lg border border-theme">
            <button onClick={() => setActiveTab('all')}     className={tabClass('all',     'text-t1')}>
              {isAmharic ? 'ሁሉም' : 'All'}
            </button>
            <button onClick={() => setActiveTab('sale')}    className={tabClass('sale',    'text-emerald-400')}>
              {isAmharic ? 'ሽያጭ' : 'Sales'}
            </button>
            <button onClick={() => setActiveTab('expense')} className={tabClass('expense', 'text-rose-400')}>
              {isAmharic ? 'ወጪ' : 'Exp.'}
            </button>
            <button onClick={() => setActiveTab('stock')}   className={tabClass('stock',   'text-teal')}>
              {isAmharic ? 'ክምችት' : 'Stock'}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[460px] pr-0.5">
        {filtered.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-surface border border-theme flex items-center justify-center">
              <Inbox className="w-6 h-6 text-t4" />
            </div>
            <div>
              <p className="text-sm font-medium text-t2">
                {isAmharic ? 'ምንም ግብይት አልተገኘም' : 'No transactions yet'}
              </p>
              <p className="text-xs text-t4 mt-1 max-w-[200px]">
                {isAmharic
                  ? 'ድምፁን ተጠቀም ወይም ቅድሚያ ጠቅ ያድርጉ'
                  : 'Use the mic or click a preset to record your first transaction'}
              </p>
            </div>
          </div>
        ) : (
          filtered.map((tx, idx) => {
            const isSale    = tx.type === 'sale';
            const isExpense = tx.type === 'expense';
            const isStock   = tx.type === 'stock';

            return (
              <div
                key={tx.id}
                className="entry-in p-3 rounded-xl bg-raised hover:bg-hover border border-theme-muted transition-colors flex items-center justify-between gap-3"
                style={{ animationDelay: `${idx * 20}ms` }}
              >
                {/* Icon */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                  isSale    ? 'bg-emerald-500/12 text-emerald-400'
                  : isExpense ? 'bg-rose-500/12 text-rose-400'
                  :             'bg-teal-muted text-teal'
                }`}>
                  {isSale    ? <TrendingUp  className="w-3.5 h-3.5" />
                  : isExpense ? <TrendingDown className="w-3.5 h-3.5" />
                  :             <Package     className="w-3.5 h-3.5" />}
                </div>

                {/* Detail */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-xs text-t1 truncate">
                      {isAmharic && tx.itemAm ? tx.itemAm : tx.item}
                    </span>
                    {tx.source === 'voice' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-teal-muted border border-teal/30 text-[9px] font-medium text-teal">
                        <Mic className="w-2.5 h-2.5" />
                        Voice
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-t4 mt-0.5">
                    {isStock   ? <span>+{tx.quantity} {tx.unit || 'units'} restocked</span>
                    : isSale   ? <span>{tx.quantity} {tx.unit || 'units'} sold</span>
                    :            <span>{tx.note || 'Store expense'}</span>}
                    <span>•</span>
                    <span className="font-mono">{formatDate(tx.timestamp)} {formatTime(tx.timestamp)}</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  {isStock ? (
                    <div className="text-xs font-semibold font-mono text-teal">
                      +{tx.quantity} {tx.unit || 'units'}
                    </div>
                  ) : (
                    <div className={`text-xs sm:text-sm font-semibold font-mono tabular-nums ${
                      isSale ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isSale ? '+' : '−'} {formatETB(tx.amount)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer total */}
      {filtered.length > 0 && (
        <div className="mt-3 pt-3 border-t border-theme flex items-center justify-between text-xs">
          <span className="text-t4">
            {isAmharic ? 'ጠቅላላ ሽያጭ' : 'Total Sales'}
          </span>
          <span className="font-semibold font-mono text-emerald-400 text-sm">
            {formatETB(summary.todaySales)}
          </span>
        </div>
      )}
    </div>
  );
}