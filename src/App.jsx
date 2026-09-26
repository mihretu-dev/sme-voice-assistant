import React, { useState } from 'react';
import { BusinessProvider } from './context/BusinessContext';
import { ThemeProvider } from './context/ThemeContext';
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
    if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-page text-t1 flex flex-col antialiased transition-colors duration-300">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        <SummaryCards onSelectLowStockFilter={handleSelectLowStockFilter} />

        <section aria-label="Voice Ingestion Console">
          <VoiceLogger />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div id="inventory-section" className="lg:col-span-7">
            <InventoryTable
              onOpenAddModal={() => setIsAddModalOpen(true)}
              filterLowStockOnly={filterLowStockOnly}
              setFilterLowStockOnly={setFilterLowStockOnly}
            />
          </div>
          <div className="lg:col-span-5">
            <TransactionHistory />
          </div>
        </div>
      </main>

      <footer className="border-t border-theme bg-panel py-4 text-xs text-t3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-t3" />
            <span>BirrVoice Ledger • SME Merchant Point-of-Sale &amp; Stock System</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-t4">
            <a
              href="https://www.scholarxiv.com/write/6aa993bf67a18d2c6ed8ec92"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
            >
              Scholarxiv Ideation Paper
            </a>
            <span>•</span>
            <span>Audio: 16kHz PCM</span>
            <span>•</span>
            <span>Currency: ETB</span>
          </div>
        </div>
      </footer>

      <AddItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <NotificationToast />
      <VoxideBridge />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BusinessProvider>
        <DashboardContent />
      </BusinessProvider>
    </ThemeProvider>
  );
}
