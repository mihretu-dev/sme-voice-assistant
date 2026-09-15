import React, { useState } from 'react';
import { X, PackagePlus } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 shadow-xl p-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-4 h-4 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              {isAmharic ? 'አዲስ ዕቃ መዝግብ' : 'Add Inventory Item'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {isAmharic ? 'የዕቃ ስም (English)' : 'Item Name (English)'} *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. White Sugar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {isAmharic ? 'የዕቃ ስም (አማርኛ)' : 'Amharic Name / ትርጉም'}
            </label>
            <input
              type="text"
              placeholder="ለምሳሌ፡ ነጭ ስኳር"
              value={formData.nameAm}
              onChange={(e) => setFormData({ ...formData, nameAm: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {isAmharic ? 'መጠን' : 'Initial Quantity'}
              </label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {isAmharic ? 'መለኪያ' : 'Unit'}
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-slate-600"
              >
                <option value="kg">kg</option>
                <option value="Liters">Liters</option>
                <option value="Pcs">Pcs</option>
                <option value="Bags">Bags</option>
                <option value="Pack">Pack</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {isAmharic ? 'ነጠላ ዋጋ (ETB)' : 'Unit Price (ETB)'} *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {isAmharic ? 'የማስጠንቀቂያ ገደብ' : 'Min Alert Threshold'}
              </label>
              <input
                type="number"
                step="any"
                placeholder="10"
                value={formData.minThreshold}
                onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              {isAmharic ? 'ተው' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-white text-slate-900 transition-colors active:scale-95"
            >
              {isAmharic ? 'መዝግብ' : 'Save Item'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
