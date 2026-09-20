import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  Mic,
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { formatETB, formatTime } from '../utils/formatters';

export default function TransactionHistory() {
  const { transactions, language } = useBusiness();
  const isAmharic = language === 'am';

  const [activeTab, setActiveTab] = useState('all');

  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === 'all') return true;
    return tx.type === activeTab;
  });

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800/70 p-5 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-100">
              {isAmharic ? 'የቅርብ ጊዜ ግብይቶች' : 'Journal'}
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-950/60 border border-slate-800/60">
              {filteredTransactions.length}
            </span>
          </div>
        </div>

        <div className="flex items-center bg-slate-950/60 p-0.5 rounded-lg border border-slate-800/60 self-stretch sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            {isAmharic ? 'ሁሉም' : 'All'}
          </button>
          <button
            onClick={() => setActiveTab('sale')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'sale' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            {isAmharic ? 'ሽያጮች' : 'Sales'}
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'expense' ? 'bg-slate-800 text-rose-400' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            {isAmharic ? 'ወጪዎች' : 'Expenses'}
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'stock' ? 'bg-slate-800 text-sky-400' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            {isAmharic ? 'ክምችት' : 'Stock'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[460px] pr-0.5">
        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            {isAmharic ? 'ምንም ግብይት አልተገኘም' : 'No recorded transactions in this view.'}
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isSale = tx.type === 'sale';
            const isExpense = tx.type === 'expense';
            const isStock = tx.type === 'stock';

            return (
              <div
                key={tx.id}
                className="p-3 rounded-lg bg-slate-950/40 hover:bg-slate-950/70 border border-slate-800/50 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${
                      isSale
                        ? 'bg-emerald-950/25 text-emerald-400'
                        : isExpense
                        ? 'bg-rose-950/25 text-rose-400'
                        : 'bg-sky-950/25 text-sky-400'
                    }`}
                  >
                    {isSale ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : isExpense ? (
                      <TrendingDown className="w-3.5 h-3.5" />
                    ) : (
                      <Package className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs text-slate-100">
                        {isAmharic && tx.itemAm ? tx.itemAm : tx.item}
                      </span>
                      {tx.source === 'voice' && (
                        <Mic className="w-3 h-3 text-indigo-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      {isStock ? (
                        <span>+{tx.quantity} {tx.unit || 'units'}</span>
                      ) : isSale ? (
                        <span>{tx.quantity} {tx.unit || 'units'} sold</span>
                      ) : (
                        <span>{tx.note || 'Store expense'}</span>
                      )}
                      <span>•</span>
                      <span className="font-mono">{formatTime(tx.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {isStock ? (
                    <div className="text-xs font-semibold font-mono text-sky-400">
                      +{tx.quantity} {tx.unit || 'units'}
                    </div>
                  ) : (
                    <div
                      className={`text-xs sm:text-sm font-semibold font-mono tabular-nums ${
                        isSale ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isSale ? '+' : '-'} {formatETB(tx.amount)}
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