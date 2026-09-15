import React, { useState } from 'react';
import {
  History,
  TrendingUp,
  TrendingDown,
  Package,
  Mic,
  Clock,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { formatETB, formatTime, formatDate } from '../utils/formatters';

export default function TransactionHistory() {
  const { transactions, language } = useBusiness();
  const isAmharic = language === 'am';

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'sale' | 'expense' | 'stock'

  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === 'all') return true;
    return tx.type === activeTab;
  });

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col h-full">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {isAmharic ? 'የቅርብ ጊዜ ግብይቶች' : 'Recent Transactions'}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {filteredTransactions.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAmharic
              ? 'በድምፅ እና በእጅ የተመዘገቡ የሽያጭ፣ ወጪ እና የክምችት ዝርዝሮች'
              : 'Audit log of voice-logged and manual sales, expenses, and inventory adjustments'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-800/60 p-1 rounded-xl border border-slate-700/60 self-stretch sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAmharic ? 'ሁሉም' : 'All'}
          </button>
          <button
            onClick={() => setActiveTab('sale')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sale'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAmharic ? 'ሽያጮች' : 'Sales'}
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'expense'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAmharic ? 'ወጪዎች' : 'Expenses'}
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'stock'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAmharic ? 'ክምችት' : 'Stock'}
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[480px] pr-1">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">
              {isAmharic ? 'ምንም ግብይት አልተገኘም' : 'No transactions found in this view.'}
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isSale = tx.type === 'sale';
            const isExpense = tx.type === 'expense';
            const isStock = tx.type === 'stock';

            return (
              <div
                key={tx.id}
                className="group p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-between gap-3"
              >
                {/* Type Icon & Details */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl border ${
                      isSale
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : isExpense
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                    }`}
                  >
                    {isSale ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : isExpense ? (
                      <TrendingDown className="w-5 h-5" />
                    ) : (
                      <Package className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {isAmharic && tx.itemAm ? tx.itemAm : tx.item}
                      </span>
                      {tx.source === 'voice' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" title="Captured via Voice Stream">
                          <Mic className="w-2.5 h-2.5" />
                          <span>VOICE</span>
                        </span>
                      )}
                      {tx.language && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                          {tx.language}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      {isStock ? (
                        <span>
                          {isAmharic ? 'የተጨመረ መጠን' : 'Added'}: +{tx.quantity} {tx.unit || 'units'}
                        </span>
                      ) : isSale ? (
                        <span>
                          {isAmharic ? 'የተሸጠ መጠን' : 'Sold'}: {tx.quantity} {tx.unit || 'units'}
                        </span>
                      ) : (
                        <span>{tx.note || (isAmharic ? 'የወጪ ክፍያ' : 'Expense')}</span>
                      )}
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatTime(tx.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount / Quantity */}
                <div className="text-right">
                  {isStock ? (
                    <div className="text-sm font-bold text-sky-400">
                      +{tx.quantity} {tx.unit || 'units'}
                    </div>
                  ) : (
                    <div
                      className={`text-sm sm:text-base font-bold font-mono ${
                        isSale ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isSale ? '+' : '-'} {formatETB(tx.amount)}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {isSale ? (isAmharic ? 'የሽያጭ ገቢ' : 'Sale') : isExpense ? (isAmharic ? 'ወጪ' : 'Expense') : (isAmharic ? 'ክምችት' : 'Stock In')}
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
