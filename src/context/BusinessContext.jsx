import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const BusinessContext = createContext();

const INITIAL_INVENTORY = [
  {
    id: 'item-1',
    name: 'Sugar',
    nameAm: 'ስኳር',
    category: 'Commodities',
    quantity: 42,
    unit: 'kg',
    unitPrice: 130,
    minThreshold: 20,
  },
  {
    id: 'item-2',
    name: 'Teff Flour',
    nameAm: 'ጤፍ ዱቄት',
    category: 'Grains',
    quantity: 14,
    unit: 'kg',
    unitPrice: 120,
    minThreshold: 25,
  },
  {
    id: 'item-3',
    name: 'Cooking Oil',
    nameAm: 'የምግብ ዘይት',
    category: 'Oils',
    quantity: 8,
    unit: 'Liters',
    unitPrice: 650,
    minThreshold: 15,
  },
  {
    id: 'item-4',
    name: 'Ethiopian Coffee',
    nameAm: 'የኢትዮጵያ ቡና',
    category: 'Beverages',
    quantity: 32,
    unit: 'kg',
    unitPrice: 420,
    minThreshold: 10,
  },
  {
    id: 'item-5',
    name: 'Sunlight Soap',
    nameAm: 'ሳሙና',
    category: 'Hygiene',
    quantity: 75,
    unit: 'Pcs',
    unitPrice: 45,
    minThreshold: 20,
  },
  {
    id: 'item-6',
    name: 'Wheat Flour',
    nameAm: 'የስንዴ ዱቄት',
    category: 'Grains',
    quantity: 60,
    unit: 'kg',
    unitPrice: 95,
    minThreshold: 25,
  },
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-1',
    type: 'sale',
    item: 'Sugar',
    itemAm: 'ስኳር',
    quantity: 2,
    unit: 'kg',
    amount: 260,
    language: 'en',
    timestamp: Date.now() - 1000 * 60 * 18,
    source: 'voice',
    note: 'Voice logged via Voxide',
  },
  {
    id: 'tx-2',
    type: 'sale',
    item: 'Cooking Oil',
    itemAm: 'የምግብ ዘይት',
    quantity: 2,
    unit: 'Liters',
    amount: 1300,
    language: 'am',
    timestamp: Date.now() - 1000 * 60 * 55,
    source: 'voice',
    note: 'በድምፅ የተመዘገበ ሽያጭ',
  },
  {
    id: 'tx-3',
    type: 'expense',
    item: 'Shop Packaging & Bags',
    itemAm: 'የማሸጊያ ፌስታል',
    quantity: 1,
    unit: 'pack',
    amount: 320,
    language: 'en',
    timestamp: Date.now() - 1000 * 60 * 110,
    source: 'voice',
    note: 'Packaging material expense',
  },
  {
    id: 'tx-4',
    type: 'stock',
    item: 'Wheat Flour',
    itemAm: 'የስንዴ ዱቄት',
    quantity: 20,
    unit: 'kg',
    amount: 0,
    language: 'en',
    timestamp: Date.now() - 1000 * 60 * 180,
    source: 'manual',
    note: 'Morning delivery received',
  },
];

export function BusinessProvider({ children }) {
  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem('sme_voice_inventory');
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('sme_voice_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [language, setLanguage] = useState('en'); // 'en' | 'am'
  const [lastVoiceEvent, setLastVoiceEvent] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('sme_voice_inventory', JSON.stringify(inventory));
    } catch (e) {
      console.error(e);
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('sme_voice_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  // Show auto-expiring notification banner/toast
  const showToast = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification((prev) => (prev?.id === notification?.id ? null : prev));
    }, 4500);
  };

  /**
   * Main Engine: Handles incoming structured JSON from Voxide audio streams or simulation
   * Payload contract:
   * { action: "sale" | "stock" | "expense", item: string, quantity: number, amount: number, language: "am" | "en" }
   */
  const processVoicePayload = (payload) => {
    if (!payload || !payload.action) {
      showToast('Invalid voice payload structure', 'error');
      return { success: false, error: 'Invalid payload' };
    }

    const { action, item, quantity = 1, amount = 0, language: payloadLang = 'en', rawTranscript } = payload;
    const now = Date.now();
    const query = (item || '').trim().toLowerCase();

    // Find inventory item matching English or Amharic name
    const foundItem = inventory.find(
      (inv) =>
        inv.name.toLowerCase() === query ||
        inv.nameAm.includes(item) ||
        query.includes(inv.name.toLowerCase()) ||
        item.includes(inv.nameAm)
    );

    let finalAmount = amount;
    let logItemName = foundItem ? foundItem.name : item;
    let logItemAm = foundItem ? foundItem.nameAm : item;
    let unit = foundItem ? foundItem.unit : 'unit';

    if (action === 'sale') {
      if (foundItem) {
        // If amount was not explicitly dictated or is 0, compute from unit price
        if (!finalAmount || finalAmount <= 0) {
          finalAmount = (foundItem.unitPrice || 0) * (quantity || 1);
        }

        // Deduct inventory
        setInventory((prev) =>
          prev.map((i) =>
            i.id === foundItem.id
              ? { ...i, quantity: Math.max(0, Number((i.quantity - quantity).toFixed(2))) }
              : i
          )
        );
      }

      // Record transaction
      const newTx = {
        id: `tx-${now}`,
        type: 'sale',
        item: logItemName,
        itemAm: logItemAm,
        quantity: Number(quantity) || 1,
        unit,
        amount: Number(finalAmount) || 0,
        language: payloadLang,
        timestamp: now,
        source: 'voice',
        note: rawTranscript || (payloadLang === 'am' ? `በድምፅ የተመዘገበ ሽያጭ (${quantity} ${unit})` : `Voice logged sale (${quantity} ${unit})`),
      };

      setTransactions((prev) => [newTx, ...prev]);
      setLastVoiceEvent({ payload, timestamp: now, txId: newTx.id });
      showToast(
        payloadLang === 'am'
          ? `የሽያጭ ድምፅ ተመዝግቧል፡ ${quantity} ${unit} ${logItemAm} በ ${finalAmount} ብር!`
          : `Voice Sale Recorded: ${quantity} ${unit} of ${logItemName} for ${finalAmount} ETB!`,
        'success'
      );
      return { success: true, transaction: newTx };
    }

    if (action === 'stock') {
      if (foundItem) {
        setInventory((prev) =>
          prev.map((i) =>
            i.id === foundItem.id
              ? { ...i, quantity: Number((i.quantity + Number(quantity)).toFixed(2)) }
              : i
          )
        );
      } else {
        // Add new item if not in catalog yet
        const newItem = {
          id: `item-${now}`,
          name: item,
          nameAm: item,
          category: 'General',
          quantity: Number(quantity) || 1,
          unit: 'unit',
          unitPrice: 0,
          minThreshold: 10,
        };
        setInventory((prev) => [...prev, newItem]);
      }

      const newTx = {
        id: `tx-${now}`,
        type: 'stock',
        item: logItemName,
        itemAm: logItemAm,
        quantity: Number(quantity) || 1,
        unit,
        amount: 0,
        language: payloadLang,
        timestamp: now,
        source: 'voice',
        note: rawTranscript || (payloadLang === 'am' ? `የዕቃ ጭማሪ በድምፅ ገብቷል` : `Inventory restocked via voice`),
      };

      setTransactions((prev) => [newTx, ...prev]);
      setLastVoiceEvent({ payload, timestamp: now, txId: newTx.id });
      showToast(
        payloadLang === 'am'
          ? `የዕቃ ጭማሪ ተመዝግቧል፡ ${quantity} ${unit} ${logItemAm} ገብቷል!`
          : `Stock Added: Restocked ${quantity} ${unit} of ${logItemName}!`,
        'info'
      );
      return { success: true, transaction: newTx };
    }

    if (action === 'expense') {
      const newTx = {
        id: `tx-${now}`,
        type: 'expense',
        item: item || 'Miscellaneous Expense',
        itemAm: item || 'ጠቅላላ ወጪ',
        quantity: Number(quantity) || 1,
        unit: 'item',
        amount: Number(finalAmount) || 0,
        language: payloadLang,
        timestamp: now,
        source: 'voice',
        note: rawTranscript || (payloadLang === 'am' ? `የወጪ ድምፅ ምዝገባ` : `Expense logged via voice`),
      };

      setTransactions((prev) => [newTx, ...prev]);
      setLastVoiceEvent({ payload, timestamp: now, txId: newTx.id });
      showToast(
        payloadLang === 'am'
          ? `የወጪ ድምፅ ተመዝግቧል፡ ${item} - ${finalAmount} ብር!`
          : `Expense Recorded: ${item} - ${finalAmount} ETB!`,
        'warning'
      );
      return { success: true, transaction: newTx };
    }

    return { success: false, error: `Unknown action: ${action}` };
  };

  // Quick manual stock adjustments
  const adjustStock = (itemId, delta) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updatedQty = Math.max(0, Number((item.quantity + delta).toFixed(2)));
          return { ...item, quantity: updatedQty };
        }
        return item;
      })
    );

    const targetItem = inventory.find((i) => i.id === itemId);
    if (targetItem) {
      const newTx = {
        id: `tx-${Date.now()}`,
        type: delta > 0 ? 'stock' : 'sale',
        item: targetItem.name,
        itemAm: targetItem.nameAm,
        quantity: Math.abs(delta),
        unit: targetItem.unit,
        amount: delta < 0 ? Math.abs(delta) * targetItem.unitPrice : 0,
        language: 'en',
        timestamp: Date.now(),
        source: 'manual',
        note: delta > 0 ? 'Quick stock increment' : 'Quick manual sale deduction',
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const addInventoryItem = (newItem) => {
    const item = {
      ...newItem,
      id: `item-${Date.now()}`,
      quantity: Number(newItem.quantity) || 0,
      unitPrice: Number(newItem.unitPrice) || 0,
      minThreshold: Number(newItem.minThreshold) || 10,
    };
    setInventory((prev) => [...prev, item]);
    showToast(`Added ${item.name} to inventory!`, 'success');
  };

  const resetToDemo = () => {
    setInventory(INITIAL_INVENTORY);
    setTransactions(INITIAL_TRANSACTIONS);
    setLastVoiceEvent(null);
    showToast('Reset to demo enterprise data.', 'info');
  };

  // Computed business aggregates
  const summary = useMemo(() => {
    let todaySales = 0;
    let todayExpenses = 0;
    let salesCount = 0;

    // Check transactions for current day (last 24h in demo context)
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

    transactions.forEach((tx) => {
      if (tx.timestamp >= twentyFourHoursAgo) {
        if (tx.type === 'sale') {
          todaySales += Number(tx.amount || 0);
          salesCount += 1;
        } else if (tx.type === 'expense') {
          todayExpenses += Number(tx.amount || 0);
        }
      }
    });

    const netCash = todaySales - todayExpenses;
    const lowStockItems = inventory.filter((item) => item.quantity <= item.minThreshold);
    const lowStockCount = lowStockItems.length;
    const totalInventoryValue = inventory.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    return {
      todaySales,
      todayExpenses,
      netCash,
      salesCount,
      lowStockCount,
      lowStockItems,
      totalInventoryValue,
      totalItemsCount: inventory.length,
    };
  }, [inventory, transactions]);

  return (
    <BusinessContext.Provider
      value={{
        inventory,
        transactions,
        language,
        setLanguage,
        lastVoiceEvent,
        notification,
        summary,
        processVoicePayload,
        adjustStock,
        addInventoryItem,
        resetToDemo,
        showToast,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
