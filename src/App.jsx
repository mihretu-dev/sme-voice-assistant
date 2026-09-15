import React, { useState } from 'react';
import { BusinessProvider } from './context/BusinessContext';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import VoiceLogger from './components/VoiceLogger';
import InventoryTable from './components/InventoryTable';
import TransactionHistory from './components/TransactionHistory';
import AddItemModal from './components/AddItemModal';
import NotificationToast from './components/NotificationToast';
import { Sparkles, Terminal, ShieldCheck } from 'lucide-react';

function DashboardContent() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  const handleSelectLowStockFilter = () => {
    setFilterLowStockOnly(true);
    // Scroll down to inventory table
    const tableEl = document.getElementById('inventory-section');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Metric Summary Cards */}
        <SummaryCards onSelectLowStockFilter={handleSelectLowStockFilter} />

        {/* Primary Action Row: Voice Logger */}
        <section aria-label="Voice Input Logger">
          <VoiceLogger />
        </section>

        {/* Core Tables Grid: Inventory Table (Left/Top) & Recent Transactions (Right/Bottom) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inventory Table (7 columns on desktop) */}
          <div id="inventory-section" className="lg:col-span-7 space-y-4">
            <InventoryTable
              onOpenAddModal={() => setIsAddModalOpen(true)}
              filterLowStockOnly={filterLowStockOnly}
              setFilterLowStockOnly={setFilterLowStockOnly}
            />
          </div>

          {/* Recent Activity Log (5 columns on desktop) */}
          <div className="lg:col-span-5 space-y-4">
            <TransactionHistory />
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Voxide Audio Stream Architecture • Built for Ethiopian Retail & Distribution SMEs</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            ETB Currency Engine • Audio Sample Rate 16kHz PCM
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <BusinessProvider>
      <DashboardContent />
    </BusinessProvider>
  );
}
