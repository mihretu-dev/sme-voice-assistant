import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Package, Mic, Inbox } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { formatETB, formatTime } from '../utils/formatters';

export default function TransactionHistory() {
  const { transactions, language } = useBusiness();
  const isAmharic = language === 'am';
  const [activeTab, setActiveTab] = useState('all');

  const filteredTransactions = transactions.filter((tx) =>
    activeTab === 'all' ? true : tx.type === activeTab
  );

  const tabClass = (tab, activeColor) =>
    `px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
      activeTab === tab
        ? `bg-raised ${activeColor}`
        : 'text-t4 hover:text-t2'
    }`;

  return (
    <div className="rounded-xl bg-panel border border-theme p-5 flex flex-col h-full transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-t1">
            {isAmharic ? 'የቅርብ ጊዜ ግብይቶች' : 'Journal'}
          </h2>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono text-t3 bg-surface border border-theme">
            {filteredTransactions.length}
          </span>
        </div>

        {/* Tab filter */}
        <div className="flex items-center bg-surface p-0.5 rounded-lg border border-theme self-stretch sm:self-auto overflow-x-auto">
          <button onClick={() => setActiveTab('all')}     className={tabClass('all',     'text-t1')}>{isAmharic ? 'ሁሉም' : 'All'}</button>
          <button onClick={() => setActiveTab('sale')}    className={tabClass('sale',    'text-emerald-400')}>{isAmharic ? 'ሽያጮች' : 'Sales'}</button>
          <button onClick={() => setActiveTab('expense')} className={tabClass('expense', 'text-rose-400')}>{isAmharic ? 'ወጪዎች' : 'Expenses'}</button>
          <button onClick={() => setActiveTab('stock')}   className={tabClass('stock',   'text-sky-400')}>{isAmharic ? 'ክምችት' : 'Stock'}</button>
        </div>
      </div>

      {/* Transaction list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[460px] pr-0.5">
        {filteredTransactions.length === 0 ? (
          /* Enhanced empty state */
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
                  ? 'ድምፁን ተጠቀም ወይም ቅድሚያ የተዘጋጀ ሁኔታ ጠቅ ያድርጉ'
                  : 'Use the mic above or click a preset to record your first transaction'}
              </p>
            </div>
          </div>
        ) : (
          filteredTransactions.map((tx, idx) => {
            const isSale    = tx.type === 'sale';
            const isExpense = tx.type === 'expense';
            const isStock   = tx.type === 'stock';

            return (
              <div
                key={tx.id}
                className="entry-in p-3 rounded-lg bg-raised hover:bg-hover border border-theme-muted transition-colors flex items-center justify-between gap-3"
                style={{ animationDelay: `${idx * 20}ms` }}
              >
                {/* Icon */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                  isSale    ? 'bg-emerald-500/12 text-emerald-400'
                  : isExpense ? 'bg-rose-500/12 text-rose-400'
                  :             'bg-sky-500/12 text-sky-400'
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
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-950/40 border border-indigo-800/40 text-[9px] font-medium text-indigo-400">
                        <Mic className="w-2.5 h-2.5" />
                        Voice
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-t4 mt-0.5">
                    {isStock   ? <span>+{tx.quantity} {tx.unit || 'units'}</span>
                    : isSale   ? <span>{tx.quantity} {tx.unit || 'units'} sold</span>
                    :            <span>{tx.note || 'Store expense'}</span>}
                    <span>•</span>
                    <span className="font-mono">{formatTime(tx.timestamp)}</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  {isStock ? (
                    <div className="text-xs font-semibold font-mono text-sky-400">
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
    </div>
  );
}