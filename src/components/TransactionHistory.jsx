import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Package, Mic, Inbox, Download } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { formatETB, formatTime, formatDate, formatEthiopianDate } from '../utils/formatters';

function exportToCSV(transactions, isAmharic) {
  const rows = [
    [
      isAmharic ? 'ቀን (ፈረንጅ)' : 'Date (Gregorian)',
      isAmharic ? 'ቀን (ግዕዝ)' : 'Date (Ethiopian)',
      isAmharic ? 'ሰዓት' : 'Time',
      isAmharic ? 'ዓይነት' : 'Type',
      isAmharic ? 'የዕቃ ስም' : 'Item',
      isAmharic ? 'ብዛት' : 'Quantity',
      isAmharic ? 'መለኪያ' : 'Unit',
      isAmharic ? 'ዋጋ (ብር)' : 'Amount (ETB)',
      isAmharic ? 'ምንጭ' : 'Source',
      isAmharic ? 'ማስታወሻ' : 'Note',
    ],
    ...transactions.map((tx) => [
      formatDate(tx.timestamp),
      formatEthiopianDate(tx.timestamp, isAmharic),
      formatTime(tx.timestamp),
      tx.type.toUpperCase(),
      isAmharic ? tx.itemAm || tx.item : tx.item,
      tx.quantity ?? '',
      tx.unit ?? '',
      tx.amount ?? 0,
      tx.source ?? 'manual',
      tx.note ?? '',
    ]),
  ];
  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: 'birrvoice-ledger.csv',
  });
  a.click();
  URL.revokeObjectURL(url);
}

export default function TransactionHistory() {
  const { transactions, summary, language } = useBusiness();
  const isAmharic = language === 'am';
  const [activeTab, setActiveTab] = useState('all');

  const filtered = transactions.filter((tx) =>
    activeTab === 'all' ? true : tx.type === activeTab
  );

  const tabClass = (tab, color) =>
    `px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
      activeTab === tab ? `bg-raised ${color}` : 'text-t4 hover:text-t2'
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
            onClick={() => exportToCSV(transactions, isAmharic)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-t3 hover:text-teal bg-raised border border-theme hover:border-teal/30 transition-all"
            title={isAmharic ? 'የግብይት ሰነድ በ CSV አውርድ' : 'Export Ledger as CSV'}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAmharic ? 'ወጪ ላክ' : 'Export'}</span>
          </button>

          {/* Tab filter */}
          <div className="flex items-center bg-surface p-0.5 rounded-lg border border-theme">
            <button onClick={() => setActiveTab('all')} className={tabClass('all', 'text-t1')}>
              {isAmharic ? 'ሁሉም' : 'All'}
            </button>
            <button
              onClick={() => setActiveTab('sale')}
              className={tabClass('sale', 'text-emerald-400')}
            >
              {isAmharic ? 'ሽያጭ' : 'Sales'}
            </button>
            <button
              onClick={() => setActiveTab('expense')}
              className={tabClass('expense', 'text-rose-400')}
            >
              {isAmharic ? 'ወጪ' : 'Exp.'}
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={tabClass('stock', 'text-teal')}
            >
              {isAmharic ? 'ጭማሪ' : 'Stock'}
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
              <p className="text-xs text-t4 mt-1 max-w-[220px]">
                {isAmharic
                  ? 'የመጀመሪያዎን ግብይት ለመመዝገብ ማይክሮፎኑን ይጠቀሙ ወይም ቅድሚያ ሁኔታዎችን ይጫኑ'
                  : 'Use the mic or click a preset to record your first transaction'}
              </p>
            </div>
          </div>
        ) : (
          filtered.map((tx) => {
            const isSale = tx.type === 'sale';
            const isStock = tx.type === 'stock';
            const isVoice = tx.source === 'voice';

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-surface/60 hover:bg-surface border border-theme transition-colors gap-2.5"
              >
                {/* Icon badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSale
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : isStock
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {isSale ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : isStock ? (
                    <Package className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-t1 truncate">
                      {isAmharic ? tx.itemAm || tx.item : tx.item}
                    </span>
                    {isVoice && (
                      <span
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono text-teal border border-teal/30"
                        title={isAmharic ? 'በድምፅ የተመዘገበ' : 'Voice logged'}
                      >
                        <Mic className="w-2.5 h-2.5" />
                        <span>Voice</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-t4 mt-0.5">
                    {isStock ? (
                      <span>
                        +{tx.quantity} {tx.unit || (isAmharic ? 'ፍሬ' : 'units')}{' '}
                        {isAmharic ? 'ተጨመረ' : 'restocked'}
                      </span>
                    ) : isSale ? (
                      <span>
                        {tx.quantity} {tx.unit || (isAmharic ? 'ፍሬ' : 'units')}{' '}
                        {isAmharic ? 'ተሸጠ' : 'sold'}
                      </span>
                    ) : (
                      <span>{tx.note || (isAmharic ? 'የሱቅ ወጪ' : 'Store expense')}</span>
                    )}
                    <span>•</span>
                    <span className="font-mono">
                      {formatDate(tx.timestamp)} {formatTime(tx.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  {isStock ? (
                    <div className="text-xs font-semibold font-mono text-teal">
                      +{tx.quantity} {tx.unit || (isAmharic ? 'ፍሬ' : 'units')}
                    </div>
                  ) : (
                    <div
                      className={`text-xs sm:text-sm font-semibold font-mono tabular-nums ${
                        isSale ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
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
            {isAmharic ? 'የዛሬ ጠቅላላ ሽያጭ፡' : 'Today Total Sales:'}
          </span>
          <span className="font-semibold font-mono text-emerald-400 text-sm">
            {formatETB(summary.todaySales)}
          </span>
        </div>
      )}
    </div>
  );
}