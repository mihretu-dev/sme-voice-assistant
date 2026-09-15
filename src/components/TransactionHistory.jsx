import React, { useState } from 'react';
import {
  History,
  TrendingUp,
  TrendingDown,
  Package,
  Mic,
  Clock,
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
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-sm flex flex-col h-full">
      {/* Header & Segmented Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              {isAmharic ? 'የቅርብ ጊዜ ግብይቶች' : 'Journal & Audit Log'}
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-950 border border-slate-800">
              {filteredTransactions.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAmharic
              ? 'በድምፅ እና በእጅ የተመዘገቡ የሽያጭ፣ ወጪ እና የክምችት ዝርዝሮች'
              : 'Chronological activity stream across all channels'}
          </p>
        </div>

        {/* Segmented Filter Control */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 self-stretch sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAmharic ? 'ሁሉም' : 'All'}
          </button>
          <button
            onClick={() => setActiveTab('sale')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'sale'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAmharic ? 'ሽያጮች' : 'Sales'}
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'expense'
                ? 'bg-slate-800 text-rose-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAmharic ? 'ወጪዎች' : 'Expenses'}
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'stock'
                ? 'bg-slate-800 text-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAmharic ? 'ክምችት' : 'Stock'}
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[460px] pr-0.5">
        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
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
                className="p-3 rounded-lg bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 transition-colors flex items-center justify-between gap-3"
              >
                {/* Details */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-lg border shrink-0 ${
                      isSale
                        ? 'bg-emerald-950/30 text-emerald-400 border-emerald-800/40'
                        : isExpense
                        ? 'bg-rose-950/30 text-rose-400 border-rose-800/40'
                        : 'bg-sky-950/30 text-sky-400 border-sky-800/40'
                    }`}
                  >
                    {isSale ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : isExpense ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : (
                      <Package className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-100">
                        {isAmharic && tx.itemAm ? tx.itemAm : tx.item}
                      </span>
                      {tx.source === 'voice' && (
                        <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-mono font-semibold text-indigo-400 bg-indigo-950/40 border border-indigo-800/40">
                          <Mic className="w-2.5 h-2.5" />
                          VOICE
                        </span>
                      )}
                      {tx.language && (
                        <span className="text-[9px] font-mono uppercase text-slate-400">
                          {tx.language}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      {isStock ? (
                        <span>+{tx.quantity} {tx.unit || 'units'}</span>
                      ) : isSale ? (
                        <span>{tx.quantity} {tx.unit || 'units'} sold</span>
                      ) : (
                        <span>{tx.note || 'Store expense'}</span>
                      )}
                      <span className="text-slate-700">•</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {formatTime(tx.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount / Change */}
                <div className="text-right shrink-0">
                  {isStock ? (
                    <div className="text-xs font-bold font-mono text-sky-400">
                      +{tx.quantity} {tx.unit || 'units'}
                    </div>
                  ) : (
                    <div
                      className={`text-xs sm:text-sm font-bold font-mono tabular-nums ${
                        isSale ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isSale ? '+' : '-'} {formatETB(tx.amount)}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 uppercase font-medium">
                    {isSale ? 'Sale' : isExpense ? 'Expense' : 'Stock In'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
