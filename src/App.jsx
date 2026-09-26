import React, { useState, useEffect, useCallback } from 'react';
import { BusinessProvider } from './context/BusinessContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import SummaryCards from './components/SummaryCards';
import VoiceLogger from './components/VoiceLogger';
import InventoryTable from './components/InventoryTable';
import TransactionHistory from './components/TransactionHistory';
import AddItemModal from './components/AddItemModal';
import NotificationToast from './components/NotificationToast';
import OnboardingModal from './components/OnboardingModal';
import { VoxideBridge } from './components/VoxideBridge';
import { FileText, ExternalLink } from 'lucide-react';

const PAGE_CONFIG = {
  voice:     { title: 'Voice Logger',   desc: 'Live voice ingestion & simulation' },
  dashboard: { title: 'Dashboard',      desc: 'Sales, stock & cash summary' },
  calendar:  { title: 'Reports',        desc: 'Date-range summaries & exports' },
  team:      { title: 'Team',           desc: 'Merchant accounts' },
};

function DashboardContent() {
  const [activePage, setActivePage]           = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen]   = useState(false);
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [showOnboarding, setShowOnboarding]   = useState(
    () => !localStorage.getItem('birrvoice-onboarded')
  );

  const handleSelectLowStockFilter = useCallback(() => {
    setFilterLowStockOnly(true);
    setActivePage('dashboard');
    const tableEl = document.getElementById('inventory-section');
    if (tableEl) setTimeout(() => tableEl.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      // Ignore if focus is in an input/textarea/select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      switch (e.key.toLowerCase()) {
        case 'k':
          // Open/trigger the mic orb
          document.getElementById('voxide-mic-button')?.click();
          break;
        case 'n':
          setIsAddModalOpen(true);
          break;
        case 'd':
          setActivePage('dashboard');
          break;
        case 'v':
          setActivePage('voice');
          break;
        case '?':
          setShowOnboarding(true);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const page   = PAGE_CONFIG[activePage] ?? PAGE_CONFIG.dashboard;
  const isVoice = activePage === 'voice';

  return (
    <div className="min-h-screen bg-page flex antialiased transition-colors duration-300">
      {/* Left Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main content area — offset by sidebar width */}
      <div className="flex-1 flex flex-col min-w-0 ml-16">
        {/* Topbar */}
        <Topbar pageTitle={page.title} />

        {/* Page content */}
        <main className="flex-1 p-5 md:p-6 space-y-5 overflow-y-auto">

          {/* Page heading row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-t1">{page.title}</h1>
              <p className="text-xs text-t3 mt-0.5">{page.desc}</p>
            </div>
            {/* Teal primary CTA matching screenshot "Dashboard" button */}
            <button
              onClick={() => setActivePage('dashboard')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 shadow-sm"
              style={{ background: activePage === 'dashboard' ? 'linear-gradient(135deg, #14b8a6, #0d9488)' : '#1e293b' }}
            >
              <span className="text-base leading-none">⊞</span>
              Dashboard
            </button>
          </div>

          {/* Keyboard shortcut hint (subtle) */}
          <div className="hidden lg:flex items-center gap-4 text-[11px] text-t4 font-mono">
            <span><kbd className="px-1.5 py-0.5 bg-raised border border-theme rounded text-[10px]">K</kbd> Voice</span>
            <span><kbd className="px-1.5 py-0.5 bg-raised border border-theme rounded text-[10px]">N</kbd> New Item</span>
            <span><kbd className="px-1.5 py-0.5 bg-raised border border-theme rounded text-[10px]">D</kbd> Dashboard</span>
            <span><kbd className="px-1.5 py-0.5 bg-raised border border-theme rounded text-[10px]">?</kbd> Help</span>
          </div>

          {/* Voice Logger page */}
          {isVoice && (
            <section aria-label="Voice Ingestion Console">
              <VoiceLogger />
            </section>
          )}

          {/* Dashboard page */}
          {activePage === 'dashboard' && (
            <>
              {/* Summary Cards */}
              <SummaryCards onSelectLowStockFilter={handleSelectLowStockFilter} />

              {/* Voice Logger (compact, in dashboard) */}
              <section aria-label="Voice Ingestion Console">
                <VoiceLogger compact />
              </section>

              {/* Stock + Ledger */}
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
            </>
          )}

          {/* Placeholder pages */}
          {activePage === 'calendar' && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-raised border border-theme flex items-center justify-center text-2xl">📅</div>
              <p className="text-sm font-medium text-t2">Calendar & Reports</p>
              <p className="text-xs text-t4 max-w-xs">Date-range summaries, Ethiopian calendar view, and CSV exports coming soon.</p>
              <button
                onClick={() => setActivePage('dashboard')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {activePage === 'team' && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-raised border border-theme flex items-center justify-center text-2xl">👥</div>
              <p className="text-sm font-medium text-t2">Team Management</p>
              <p className="text-xs text-t4 max-w-xs">Multi-merchant accounts and role management coming soon.</p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-theme bg-panel py-3 px-6 text-[11px] text-t4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>BirrVoice Ledger • STARK Hackathon — Team Pixel &amp; Code</span>
            <div className="flex items-center gap-3 font-mono">
              <a
                href="https://www.scholarxiv.com/write/6aa993bf67a18d2c6ed8ec92"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-teal hover:text-teal/80 transition-colors"
              >
                <FileText className="w-3 h-3" />
                <span>Scholarxiv</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
              <span>•</span>
              <span>Audio: 16kHz PCM</span>
              <span>•</span>
              <span>ETB</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals & Overlays */}
      <AddItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <NotificationToast />
      <VoxideBridge />
      {showOnboarding && <OnboardingModal onDone={() => setShowOnboarding(false)} />}
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
