import React, { useState } from 'react';
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  Search,
  Filter,
  PlusCircle,
  TrendingDown,
  CheckCircle,
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { formatETB } from '../utils/formatters';

export default function InventoryTable({ onOpenAddModal, filterLowStockOnly, setFilterLowStockOnly }) {
  const { inventory, adjustStock, language } = useBusiness();
  const isAmharic = language === 'am';

  const [searchTerm, setSearchTerm] = useState('');

  // Filter inventory
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
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {isAmharic ? 'የዕቃዎች ክምችት ዝርዝር' : 'Inventory & Stock Catalog'}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {inventory.length} {isAmharic ? 'ዕቃዎች' : 'Items'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAmharic
              ? 'የዕቃዎች መጠን፣ ዋጋ በብር እና ፈጣን ማስተካከያ አዝራሮች'
              : 'Real-time stock quantities, unit pricing (ETB), and instant adjustment buttons'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAmharic ? 'ዕቃ ፈልግ...' : 'Search item...'}
              className="w-full bg-slate-800/70 border border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Low Stock Toggle Filter */}
          <button
            onClick={() => setFilterLowStockOnly((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              filterLowStockOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'አነስተኛ ብቻ' : 'Low Stock Only'}</span>
          </button>

          {/* Add Item Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 active:scale-95 transition-all ml-auto sm:ml-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'አዲስ ዕቃ' : 'Add Item'}</span>
          </button>
        </div>
      </div>

      {/* Table responsive container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] tracking-wider border-y border-slate-800">
            <tr>
              <th scope="col" className="py-3 px-4 rounded-l-xl">
                {isAmharic ? 'የዕቃ ስም' : 'Item Name'}
              </th>
              <th scope="col" className="py-3 px-3">
                {isAmharic ? 'ምድብ' : 'Category'}
              </th>
              <th scope="col" className="py-3 px-3">
                {isAmharic ? 'በክምችት ያለው' : 'Quantity In Stock'}
              </th>
              <th scope="col" className="py-3 px-3">
                {isAmharic ? 'ነጠላ ዋጋ' : 'Unit Price (ETB)'}
              </th>
              <th scope="col" className="py-3 px-3">
                {isAmharic ? 'የክምችት ዋጋ' : 'Stock Value'}
              </th>
              <th scope="col" className="py-3 px-3 text-center">
                {isAmharic ? 'ሁኔታ' : 'Status'}
              </th>
              <th scope="col" className="py-3 px-4 text-right rounded-r-xl">
                {isAmharic ? 'ፈጣን እርምጃ' : 'Quick Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">
                  {isAmharic ? 'ምንም ዕቃ አልተገኘም' : 'No items match your search or filter.'}
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => {
                const isLowStock = item.quantity <= item.minThreshold;
                const isOutOfStock = item.quantity <= 0;
                const stockValue = item.quantity * item.unitPrice;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Item Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.nameAm}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[11px]">
                        {item.category}
                      </span>
                    </td>

                    {/* Quantity & Unit */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-base font-bold ${isOutOfStock ? 'text-rose-400' : isLowStock ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {item.quantity}
                        </span>
                        <span className="text-slate-400 text-xs">{item.unit}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Min alert: {item.minThreshold} {item.unit}
                      </div>
                    </td>

                    {/* Unit Price */}
                    <td className="py-3.5 px-3 font-semibold text-slate-200">
                      {formatETB(item.unitPrice)}
                      <span className="text-slate-400 font-normal text-[10px]"> / {item.unit}</span>
                    </td>

                    {/* Stock Value */}
                    <td className="py-3.5 px-3 font-medium text-slate-300">
                      {formatETB(stockValue)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3 text-center">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          {isAmharic ? 'አልቋል' : 'Out of Stock'}
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          {isAmharic ? 'አነስተኛ' : 'Low Stock'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" />
                          {isAmharic ? 'ደህና' : 'Healthy'}
                        </span>
                      )}
                    </td>

                    {/* Quick Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Quick Sell -1 */}
                        <button
                          onClick={() => adjustStock(item.id, -1)}
                          disabled={item.quantity <= 0}
                          title={isAmharic ? '1 ቅነሳ (ሽያጭ)' : 'Quick Sell -1 unit'}
                          className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-90"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Restock +1 */}
                        <button
                          onClick={() => adjustStock(item.id, 1)}
                          title={isAmharic ? '1 ጨምር (ክምችት)' : 'Quick Restock +1 unit'}
                          className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-all active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Restock +5 */}
                        <button
                          onClick={() => adjustStock(item.id, 5)}
                          title={isAmharic ? '5 ጨምር' : 'Restock +5 units'}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold transition-all active:scale-90"
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
