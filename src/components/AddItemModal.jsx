import React, { useState } from 'react';
import { X, PackagePlus } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

const CATEGORIES = [
  { value: 'Commodities', en: 'Commodities',         am: 'መሰረታዊ ሸቀጦች' },
  { value: 'Grains',      en: 'Grains & Flours',     am: 'እህሎችና ዱቄት' },
  { value: 'Oils',        en: 'Cooking Oils',        am: 'ዘይቶች' },
  { value: 'Beverages',   en: 'Beverages & Coffee',  am: 'መጠጦችና ቡና' },
  { value: 'Hygiene',     en: 'Hygiene & Cleaning',  am: 'የጽዳት ዕቃዎች' },
  { value: 'Spices',      en: 'Spices',              am: 'ቅመማ ቅመሞች' },
  { value: 'Other',       en: 'Other Commodities',   am: 'ሌሎች ሸቀጦች' },
];

const UNITS = [
  { value: 'kg',     en: 'Kilograms (kg)', am: 'ኪሎግራም (kg)' },
  { value: 'Liters', en: 'Liters (L)',     am: 'ሊትር (Liters)' },
  { value: 'Pcs',    en: 'Pieces (Pcs)',   am: 'ፍሬ (Pcs)' },
  { value: 'Bags',   en: 'Bags / Sacks',   am: 'ጆንያ / ቦርሳ' },
  { value: 'Pack',   en: 'Pack / Carton',  am: 'ፓኬት / ካርቶን' },
];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-panel border border-theme shadow-2xl p-5 modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-theme">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-muted flex items-center justify-center text-teal">
              <PackagePlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-t1 tracking-wide">
                {isAmharic ? 'አዲስ ዕቃ መዝግብ' : 'Add Inventory Item'}
              </h3>
              <p className="text-[11px] text-t3">
                {isAmharic
                  ? 'የእቃውን መረጃ በትክክል ያስገቡ'
                  : 'Enter product details to add to stock'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-t3 hover:text-t1 hover:bg-hover transition-colors"
            title={isAmharic ? 'ዝጋ' : 'Close'}
            aria-label={isAmharic ? 'ዝጋ' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-t2 mb-1">
                {isAmharic ? 'የዕቃ ስም (English)' : 'Item Name (English)'} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. White Sugar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-surface border border-theme rounded-lg px-3 py-1.5 text-xs text-t1 placeholder:text-t4 focus:outline-none focus:ring-1 focus:ring-teal/30 focus:border-teal transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-t2 mb-1">
                {isAmharic ? 'የዕቃ ስም (አማርኛ)' : 'Amharic Name'}
              </label>
              <input
                type="text"
                placeholder="ለምሳሌ፡ ነጭ ስኳር"
                value={formData.nameAm}
                onChange={(e) => setFormData({ ...formData, nameAm: e.target.value })}
                className="w-full bg-surface border border-theme rounded-lg px-3 py-1.5 text-xs text-t1 placeholder:text-t4 focus:outline-none focus:ring-1 focus:ring-teal/30 focus:border-teal transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-t2 mb-1">
              {isAmharic ? 'የዕቃ ምድብ' : 'Category'}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-surface border border-theme rounded-lg px-3 py-1.5 text-xs text-t1 focus:outline-none focus:ring-1 focus:ring-teal/30 focus:border-teal transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-panel text-t1">
                  {isAmharic ? cat.am : cat.en}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-t2 mb-1">
                {isAmharic ? 'የመጀመሪያ ክምችት መጠን' : 'Initial Quantity'}
              </label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full bg-surface border border-theme rounded-lg px-3 py-1.5 text-xs text-t1 placeholder:text-t4 focus:outline-none focus:ring-1 focus:ring-teal/30 focus:border-teal transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-t2 mb-1">
                {isAmharic ? 'መለኪያ መስፈርት' : 'Measurement Unit'}
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-surface border border-theme rounded-lg px-2.5 py-1.5 text-xs text-t1 focus:outline-none focus:ring-1 focus:ring-teal/30 focus:border-teal transition-all"
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value} className="bg-panel text-t1">
                    {isAmharic ? u.am : u.en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-t2 mb-1">
                {isAmharic ? 'ነጠላ የመሸጫ ዋጋ (ETB)' : 'Unit Price (ETB)'} *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className="w-full bg-surface border border-theme rounded-lg px-3 py-1.5 text-xs text-t1 placeholder:text-t4 focus:outline-none focus:ring-1 focus:ring-teal/30 focus:border-teal transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-t2 mb-1">
                {isAmharic ? 'አነስተኛ ክምችት ማስጠንቀቂያ' : 'Min Alert Threshold'}
              </label>
              <input
                type="number"
                step="any"
                placeholder="10"
                value={formData.minThreshold}
                onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                className="w-full bg-surface border border-theme rounded-lg px-3 py-1.5 text-xs text-t1 placeholder:text-t4 focus:outline-none focus:ring-1 focus:ring-teal/30 focus:border-teal transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-theme">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-t2 hover:text-t1 bg-surface hover:bg-hover border border-theme transition-colors"
            >
              {isAmharic ? 'ይቅር' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all active:scale-95 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
            >
              {isAmharic ? 'ዕቃውን መዝግብ' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
