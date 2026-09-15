import React, { useState } from 'react';
import { X, PackagePlus, AlertCircle } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

export default function AddItemModal({ isOpen, onClose }) {
  const { addInventoryItem, language } = useBusiness();
  const isAmharic = language === 'am';

  const [formData, setFormData] = useState({
    name: '',
    nameAm: '',
    category: 'Commodities',
    quantity: '',
    unit: 'kg',
    unitPrice: '',
    minThreshold: '10',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.unitPrice) return;

    addInventoryItem({
      name: formData.name.trim(),
      nameAm: formData.nameAm.trim() || formData.name.trim(),
      category: formData.category,
      quantity: parseFloat(formData.quantity) || 0,
      unit: formData.unit,
      unitPrice: parseFloat(formData.unitPrice) || 0,
      minThreshold: parseFloat(formData.minThreshold) || 10,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAmharic ? 'አዲስ የዕቃ መዝገብ ጨምር' : 'Add New Inventory Item'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAmharic ? 'የዕቃውን ስም፣ ዋጋ እና መጠን ያስገቡ' : 'Configure item name, price in ETB, and alert levels'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isAmharic ? 'የዕቃው ስም (እንግሊዝኛ)' : 'Item Name (English)'} *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. White Sugar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isAmharic ? 'የዕቃው ስም (አማርኛ)' : 'Item Name (Amharic translation / ስም)'}
            </label>
            <input
              type="text"
              placeholder="ለምሳሌ፡ ነጭ ስኳር"
              value={formData.nameAm}
              onChange={(e) => setFormData({ ...formData, nameAm: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAmharic ? 'የመጀመሪያ መጠን' : 'Initial Quantity'}
              </label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAmharic ? 'መለኪያ መስፈርት' : 'Unit'}
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="kg">kg (ኪሎ)</option>
                <option value="Liters">Liters (ሊትር)</option>
                <option value="Pcs">Pcs (ቁራጭ)</option>
                <option value="Bags">Bags (ጆንያ / ቦርሳ)</option>
                <option value="Pack">Pack (ፓኬት)</option>
                <option value="Carton">Carton (ካርቶን)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAmharic ? 'ነጠላ ዋጋ (ETB)' : 'Unit Price (ETB)'} *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAmharic ? 'አነስተኛ ማስጠንቀቂያ ገደብ' : 'Low Alert Limit'}
              </label>
              <input
                type="number"
                step="any"
                placeholder="10"
                value={formData.minThreshold}
                onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700/80 transition-colors"
            >
              {isAmharic ? 'ተው' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              {isAmharic ? 'ዕቃ መዝግብ' : 'Save Item'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
