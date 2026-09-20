import React, { useState } from 'react';
import { Plus, Minus, AlertCircle, Search, PlusCircle } from 'lucide-react';
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
    return filterLowStockOnly ? matchesSearch && item.quantity <= item.minThreshold : matchesSearch;
  });

  return (
    <div className="rounded-xl bg-panel border border-theme p-5 transition-colors duration-300">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-t1">
            {isAmharic ? 'የክምችት መዝገብ' : 'Inventory'}
          </h2>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono text-t3 bg-surface border border-theme">
            {inventory.length} {isAmharic ? 'ዕቃዎች' : 'SKUs'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-40">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-t4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAmharic ? 'ዕቃ ፈልግ...' : 'Filter item...'}
              className="w-full bg-surface border border-theme rounded-lg pl-8 pr-3 py-1.5 text-xs text-t1 placeholder-t4 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-colors"
            />
          </div>

          {/* Low stock filter toggle */}
          <button
            onClick={() => setFilterLowStockOnly(prev => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filterLowStockOnly
                ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                : 'bg-surface text-t3 border-theme hover:text-t1'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'አነስተኛ ብቻ' : 'Low Stock'}</span>
          </button>

          {/* Add New Item — indigo CTA */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors active:scale-95 ml-auto sm:ml-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'ዕቃ መዝግብ' : 'New Item'}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-theme">
        <table className="w-full text-left text-xs text-t2">
          <thead className="bg-surface text-t4 uppercase text-[10px] tracking-wide border-b border-theme">
            <tr>
              <th scope="col" className="py-2 px-3 font-medium">{isAmharic ? 'የዕቃ ስም' : 'Item'}</th>
              <th scope="col" className="py-2 px-2.5 font-medium">{isAmharic ? 'በክምችት' : 'Stock'}</th>
              <th scope="col" className="py-2 px-2.5 font-medium">{isAmharic ? 'ነጠላ ዋጋ' : 'Price'}</th>
              <th scope="col" className="py-2 px-2.5 font-medium text-center">{isAmharic ? 'ሁኔታ' : 'Status'}</th>
              <th scope="col" className="py-2 px-3 font-medium text-right">{isAmharic ? 'ማስተካከያ' : 'Adjust'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--c-border-muted)]">
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-6 text-center text-t4">
                  {isAmharic ? 'ምንም ዕቃ አልተገኘም' : 'No items found matching the filter.'}
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => {
                const isLowStock   = item.quantity <= item.minThreshold && item.quantity > 0;
                const isOutOfStock = item.quantity <= 0;

                // Row highlight classes
                const rowBg = isOutOfStock
                  ? 'bg-rose-950/10 border-l-2 border-l-rose-500/40'
                  : isLowStock
                  ? 'bg-amber-950/10 border-l-2 border-l-amber-500/40'
                  : '';

                // Quantity colour
                const qtyColor = isOutOfStock
                  ? 'text-rose-400'
                  : isLowStock
                  ? 'text-amber-400'
                  : 'text-t1';

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-raised transition-colors ${rowBg}`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-t1">{item.name}</div>
                      <div className="text-[11px] text-t4">{item.nameAm}</div>
                    </td>

                    <td className="py-2.5 px-2.5 tabular-nums">
                      <div className={`font-semibold ${qtyColor}`}>
                        {item.quantity}{' '}
                        <span className="text-[11px] font-normal text-t4">{item.unit}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-2.5 tabular-nums font-mono text-t3">
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
                          className="flex items-center justify-center w-6 h-6 rounded bg-surface hover:bg-raised text-t3 border border-theme disabled:opacity-40 disabled:pointer-events-none transition-colors active:scale-90"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustStock(item.id, 1)}
                          title={isAmharic ? '1 ጨምር' : 'Add 1'}
                          className="flex items-center justify-center w-6 h-6 rounded bg-surface hover:bg-raised text-t3 border border-theme transition-colors active:scale-90"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustStock(item.id, 5)}
                          title={isAmharic ? '5 ጨምር' : 'Add 5'}
                          className="px-2 py-0.5 rounded bg-surface hover:bg-raised text-t3 hover:text-t1 border border-theme text-xs font-mono transition-colors active:scale-90"
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