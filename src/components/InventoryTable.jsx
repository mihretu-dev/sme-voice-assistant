import React, { useState } from 'react';
import {
  Plus,
  Minus,
  AlertCircle,
  Search,
  PlusCircle,
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { formatETB } from '../utils/formatters';

export default function InventoryTable({ onOpenAddModal, filterLowStockOnly, setFilterLowStockOnly }) {
  const { inventory, adjustStock, language } = useBusiness();
  const isAmharic = language === 'am';

  const [searchTerm, setSearchTerm] = useState('');

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameAm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterLowStockOnly) {
      return matchesSearch && item.quantity <= item.minThreshold;
    }
    return matchesSearch;
  });

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800/70 p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-100">
              {isAmharic ? 'የክምችት መዝገብ' : 'Inventory'}
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-950/60 border border-slate-800/60">
              {inventory.length} {isAmharic ? 'ዕቃዎች' : 'SKUs'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-40">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAmharic ? 'ዕቃ ፈልግ...' : 'Filter item...'}
              className="w-full bg-slate-950/60 border border-slate-800/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700"
            />
          </div>

          <button
            onClick={() => setFilterLowStockOnly((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filterLowStockOnly
                ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                : 'bg-slate-950/60 text-slate-400 border-slate-800/60 hover:text-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'አነስተኛ ብቻ' : 'Low Stock'}</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-white text-slate-900 text-xs font-semibold transition-colors active:scale-95 ml-auto sm:ml-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'ዕቃ መዝግብ' : 'New Item'}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-800/50">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/40 text-slate-500 uppercase text-[10px] tracking-wide border-b border-slate-800/50">
            <tr>
              <th scope="col" className="py-2 px-3 font-medium">{isAmharic ? 'የዕቃ ስም' : 'Item'}</th>
              <th scope="col" className="py-2 px-2.5 font-medium">{isAmharic ? 'በክምችት' : 'Stock'}</th>
              <th scope="col" className="py-2 px-2.5 font-medium">{isAmharic ? 'ነጠላ ዋጋ' : 'Price'}</th>
              <th scope="col" className="py-2 px-2.5 font-medium text-center">{isAmharic ? 'ሁኔታ' : 'Status'}</th>
              <th scope="col" className="py-2 px-3 font-medium text-right">{isAmharic ? 'ማስተካከያ' : 'Adjust'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-6 text-center text-slate-500">
                  {isAmharic ? 'ምንም ዕቃ አልተገኘም' : 'No items found matching the filter.'}
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => {
                const isLowStock = item.quantity <= item.minThreshold;
                const isOutOfStock = item.quantity <= 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-100">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.nameAm}</div>
                    </td>

                    <td className="py-2.5 px-2.5 tabular-nums">
                      <div className="font-medium text-slate-100">
                        {item.quantity} <span className="text-[11px] font-normal text-slate-500">{item.unit}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-2.5 tabular-nums font-mono text-slate-400">
                      {formatETB(item.unitPrice)}
                    </td>

                    <td className="py-2.5 px-2.5 text-center">
                      {isOutOfStock ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-rose-400 bg-rose-950/30 border border-rose-800/40">
                          {isAmharic ? 'አልቋል' : 'Depleted'}
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-amber-400 bg-amber-950/30 border border-amber-800/40">
                          {isAmharic ? 'አነስተኛ' : 'Low'}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-800/40">
                          {isAmharic ? 'ደህና' : 'Normal'}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => adjustStock(item.id, -1)}
                          disabled={item.quantity <= 0}
                          title={isAmharic ? '1 ቀንስ' : 'Sell/deduct 1'}
                          className="flex items-center justify-center w-6 h-6 rounded bg-slate-950/60 hover:bg-slate-800 text-slate-400 border border-slate-800/60 disabled:opacity-40 disabled:pointer-events-none transition-colors active:scale-90"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustStock(item.id, 1)}
                          title={isAmharic ? '1 ጨምር' : 'Add 1'}
                          className="flex items-center justify-center w-6 h-6 rounded bg-slate-950/60 hover:bg-slate-800 text-slate-400 border border-slate-800/60 transition-colors active:scale-90"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustStock(item.id, 5)}
                          title={isAmharic ? '5 ጨምር' : 'Add 5'}
                          className="px-1.5 py-0.5 rounded bg-slate-950/60 hover:bg-slate-800 text-slate-500 hover:text-slate-200 border border-slate-800/60 text-[10px] font-mono transition-colors active:scale-90"
                        >
                          +5
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}