import React, { useState } from 'react';
import { Plus, Minus, AlertCircle, Search, PlusCircle, ChevronDown } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { formatETB } from '../utils/formatters';

const CATEGORY_OPTIONS = ['All', 'Commodities', 'Grains', 'Oils', 'Beverages', 'Hygiene', 'Spices', 'Other'];

// Emoji icon lookup by category
const CATEGORY_ICON = {
  Commodities: '🧂',
  Grains:      '🌾',
  Oils:        '🫙',
  Beverages:   '☕',
  Hygiene:     '🧼',
  Spices:      '🌶️',
  Other:       '📦',
};

export default function InventoryTable({ onOpenAddModal, filterLowStockOnly, setFilterLowStockOnly }) {
  const { inventory, adjustStock, language } = useBusiness();
  const isAmharic = language === 'am';
  const [searchTerm, setSearchTerm]     = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showCatDrop, setShowCatDrop]   = useState(false);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameAm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat   = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesLow   = filterLowStockOnly ? item.quantity <= item.minThreshold : true;
    return matchesSearch && matchesCat && matchesLow;
  });

  return (
    <div className="rounded-2xl bg-panel border border-theme p-3.5 sm:p-5 transition-colors duration-300">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-t1">
            {isAmharic ? 'የክምችት መዝገብ' : 'Stock'}
          </h2>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono text-t3 bg-surface border border-theme">
            {inventory.length} {isAmharic ? 'ዕቃዎች' : 'SKUs'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-36">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-t4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAmharic ? 'ዕቃ ፈልግ...' : 'Filter item...'}
              className="w-full bg-surface border border-theme rounded-lg pl-8 pr-3 py-1.5 text-xs text-t1 placeholder:text-t4 focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors"
            />
          </div>

          {/* Category dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCatDrop(p => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface border border-theme text-t2 hover:text-t1 hover:bg-raised transition-colors"
            >
              <span>{categoryFilter === 'All' ? (isAmharic ? 'ሁሉም ምድቦች' : 'All Items') : categoryFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-t4" />
            </button>
            {showCatDrop && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-panel border border-theme rounded-xl shadow-xl py-1 min-w-[140px]">
                {CATEGORY_OPTIONS.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setCategoryFilter(cat); setShowCatDrop(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                      categoryFilter === cat ? 'text-teal font-semibold bg-teal-muted' : 'text-t2 hover:bg-raised'
                    }`}
                  >
                    {CATEGORY_ICON[cat] ?? '📦'} {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Low stock filter */}
          <button
            onClick={() => setFilterLowStockOnly(prev => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filterLowStockOnly
                ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                : 'bg-surface text-t3 border-theme hover:text-t1'
            }`}
            title="Show low stock only"
          >
            <AlertCircle className="w-3.5 h-3.5" />
          </button>

          {/* Add New Item */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-all active:scale-95 ml-auto sm:ml-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'ዕቃ ጨምር' : 'New Item'}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-theme">
        <table className="w-full text-left text-xs text-t2">
          <thead className="bg-surface text-t4 uppercase text-[10px] tracking-wide border-b border-theme">
            <tr>
              <th scope="col" className="py-2.5 px-3 font-medium">{isAmharic ? 'ዕቃ' : 'Item'}</th>
              <th scope="col" className="py-2.5 px-3 font-medium">{isAmharic ? 'ክምችት' : 'Stock'}</th>
              <th scope="col" className="py-2.5 px-3 font-medium hidden sm:table-cell">{isAmharic ? 'ዋጋ' : 'Price'}</th>
              <th scope="col" className="py-2.5 px-3 font-medium text-center">{isAmharic ? 'ሁኔታ' : 'Status'}</th>
              <th scope="col" className="py-2.5 px-3 font-medium text-right">{isAmharic ? 'ማስተካከያ' : 'Adjust'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--c-border-muted)]">
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-t4">
                  {isAmharic ? 'ምንም ዕቃ አልተገኘም' : 'No items match the filter.'}
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => {
                const isLowStock   = item.quantity <= item.minThreshold && item.quantity > 0;
                const isOutOfStock = item.quantity <= 0;

                const rowBg = isOutOfStock
                  ? 'bg-rose-950/8 border-l-2 border-l-rose-500/40'
                  : isLowStock
                  ? 'bg-amber-950/8 border-l-2 border-l-amber-500/40'
                  : '';

                const qtyColor = isOutOfStock ? 'text-rose-400'
                  : isLowStock ? 'text-amber-400'
                  : 'text-t1';

                const emoji = CATEGORY_ICON[item.category] ?? '📦';

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-raised transition-colors ${rowBg}`}
                  >
                    {/* Item name + emoji */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none select-none" aria-hidden="true">{emoji}</span>
                        <div>
                          <div className="font-medium text-t1">{isAmharic ? item.nameAm : item.name}</div>
                          {isAmharic
                            ? <div className="text-[11px] text-t4">{item.name}</div>
                            : <div className="text-[11px] text-t4">{item.nameAm}</div>
                          }
                        </div>
                      </div>
                    </td>

                    {/* Stock quantity */}
                    <td className="py-3 px-3 tabular-nums">
                      <div className={`font-semibold ${qtyColor}`}>
                        {item.quantity}{' '}
                        <span className="text-[11px] font-normal text-t4">{item.unit}</span>
                      </div>
                    </td>

                    {/* Price — hidden on small screens */}
                    <td className="py-3 px-3 tabular-nums font-mono text-t3 hidden sm:table-cell">
                      {formatETB(item.unitPrice)}
                    </td>

                    {/* Status badge — matches screenshot green/amber/red pills */}
                    <td className="py-3 px-3 text-center">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-rose-400 bg-rose-950/30 border border-rose-800/40">
                          <span className="w-1 h-1 rounded-full bg-rose-400"></span>
                          {isAmharic ? 'አልቋል' : 'Depleted'}
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-amber-400 bg-amber-950/30 border border-amber-800/40">
                          <span className="w-1 h-1 rounded-full bg-amber-400"></span>
                          {isAmharic ? 'አነስተኛ' : 'Low'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-teal bg-teal-muted border border-teal/30">
                          <span className="w-1 h-1 rounded-full bg-teal" style={{backgroundColor:'var(--c-teal)'}}></span>
                          {isAmharic ? 'ደህና' : 'Stocked'}
                        </span>
                      )}
                    </td>

                    {/* Adjust buttons */}
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => adjustStock(item.id, -1)}
                          disabled={item.quantity <= 0}
                          title={isAmharic ? '1 ቀንስ' : 'Deduct 1'}
                          className="flex items-center justify-center w-6 h-6 rounded-md bg-surface hover:bg-raised text-t3 border border-theme disabled:opacity-40 disabled:pointer-events-none transition-colors active:scale-90"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustStock(item.id, 1)}
                          title={isAmharic ? '1 ጨምር' : 'Add 1'}
                          className="flex items-center justify-center w-6 h-6 rounded-md bg-surface hover:bg-raised text-t3 border border-theme transition-colors active:scale-90"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustStock(item.id, 5)}
                          title={isAmharic ? '+5 ጨምር' : 'Restock +5'}
                          className="px-2 py-0.5 rounded-md bg-surface hover:bg-raised text-teal hover:text-teal border border-theme text-xs font-semibold transition-colors active:scale-90"
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