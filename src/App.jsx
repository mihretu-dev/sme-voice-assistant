import React, { useState } from 'react';
import { BusinessProvider } from './context/BusinessContext';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import VoiceLogger from './components/VoiceLogger';
import InventoryTable from './components/InventoryTable';
import TransactionHistory from './components/TransactionHistory';
import AddItemModal from './components/AddItemModal';
import NotificationToast from './components/NotificationToast';
import { VoxideBridge } from './components/VoxideBridge';
import { ShieldCheck } from 'lucide-react';

function DashboardContent() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  const handleSelectLowStockFilter = () => {
    setFilterLowStockOnly(true);
    const tableEl = document.getElementById('inventory-section');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Merchant Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Metric Summary Cards */}
        <SummaryCards onSelectLowStockFilter={handleSelectLowStockFilter} />

        {/* Tactile Voice Logger Panel */}
        <section aria-label="Voice Ingestion Console">
          <VoiceLogger />
        </section>

        {/* Data Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Inventory Table */}
          <div id="inventory-section" className="lg:col-span-7">
            <InventoryTable
              onOpenAddModal={() => setIsAddModalOpen(true)}
              filterLowStockOnly={filterLowStockOnly}
              setFilterLowStockOnly={setFilterLowStockOnly}
            />
          </div>

          {/* Audit Ledger */}
          <div className="lg:col-span-5">
            <TransactionHistory />
          </div>
        </div>

      </main>

      {/* Grounded Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>BirrVoice Ledger • SME Merchant Point-of-Sale & Stock System</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Audio Sample: 16kHz PCM • Currency: ETB
          </div>
        </div>
      </footer>

      {/* Overlays */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <NotificationToast />
      <VoxideBridge />
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
