import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BusinessProvider, useBusiness } from './context/BusinessContext';
import { ThemeProvider } from './context/ThemeContext';
import { VoiceProvider, useVoice } from './context/VoiceContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import SummaryCards from './components/SummaryCards';
import VoiceLogger from './components/VoiceLogger';
import InventoryTable from './components/InventoryTable';
import TransactionHistory from './components/TransactionHistory';
import CalendarReports from './components/CalendarReports';
import AddItemModal from './components/AddItemModal';
import NotificationToast from './components/NotificationToast';
import OnboardingModal from './components/OnboardingModal';
import { VoxideBridge } from './components/VoxideBridge';
import { FileText, ExternalLink, X, Keyboard } from 'lucide-react';

// ── Help Modal ────────────────────────────────────────────────────────────────
function HelpModal({ onClose, isAmharic }) {
  const shortcuts = [
    {
      key: 'K',
      desc: isAmharic ? 'የቀጥታ ድምፅ ማይክሮፎን ክፈት / ዝጋ' : 'Activate / Stop voice mic',
    },
    {
      key: 'N',
      desc: isAmharic ? 'አዲስ ዕቃ መመዝገቢያ መስኮት ክፈት' : 'Open "Add New Item" modal',
    },
    {
      key: 'D',
      desc: isAmharic ? 'ወደ ዳሽቦርድ ሂድ' : 'Go to Dashboard',
    },
    {
      key: 'V',
      desc: isAmharic ? 'ወደ ድምፅ መመዝገቢያ ሂድ' : 'Go to Voice Logger',
    },
    {
      key: '?',
      desc: isAmharic ? 'ይህን የእርዳታ ገጽ ክፈት' : 'Open this Help panel',
    },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-panel border border-theme rounded-2xl shadow-2xl p-5 sm:p-6 modal-enter">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-t4 hover:text-t2 transition-colors p-1"
          aria-label={isAmharic ? 'ዝጋ' : 'Close Help'}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl bg-teal-muted flex items-center justify-center"
            style={{ backgroundColor: 'var(--c-teal-muted)' }}
          >
            <Keyboard className="w-5 h-5 text-teal" style={{ color: 'var(--c-teal)' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-t1">
              {isAmharic ? 'እርዳታና የቁልፍ ሰሌዳ አቋራጮች' : 'Help & Keyboard Shortcuts'}
            </h3>
            <p className="text-[11px] text-t4">
              {isAmharic ? 'የቢርቮይስ ፈጣን መመሪያ' : 'BirrVoice Ledger quick reference'}
            </p>
          </div>
        </div>

        {/* Keyboard shortcuts table */}
        <div className="space-y-1.5 mb-5">
          {shortcuts.map(({ key, desc }) => (
            <div
              key={key}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-raised border border-theme"
            >
              <kbd className="min-w-[28px] text-center px-2 py-1 rounded-md bg-surface border border-theme text-[11px] font-mono font-bold text-t1">
                {key}
              </kbd>
              <span className="text-xs text-t2">{desc}</span>
            </div>
          ))}
        </div>

        {/* Quick tip */}
        <div
          className="p-3 rounded-xl bg-teal-muted border border-teal/20 text-[11px] text-t2 leading-relaxed"
          style={{
            backgroundColor: 'var(--c-teal-muted)',
            borderColor: 'color-mix(in srgb, var(--c-teal) 20%, transparent)',
          }}
        >
          <strong className="text-t1">{isAmharic ? 'ጠቃሚ ምክር፡' : 'Tip:'}</strong>{' '}
          {isAmharic
            ? 'የቀጥታ ድምፅ ለመቅዳት ማይክሮፎኑን ወይም K ን ይጫኑ። የተናገሩት ቃል ወዲያው በስክሪኑ ላይ ይታያል!'
            : 'Click the mic orb, click the taskbar mic button, or press K to start live voice logging. A real-time preview of your spoken words will appear instantly on screen!'}
        </div>

        {/* Links */}
        <div className="mt-4 pt-4 border-t border-theme flex items-center justify-between text-[11px]">
          <a
            href="https://www.scholarxiv.com/write/6aa993bf67a18d2c6ed8ec92"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline"
            style={{ color: 'var(--c-teal)' }}
          >
            <FileText className="w-3 h-3" />
            <span>{isAmharic ? 'የምርምር ሰነድ (Scholarxiv)' : 'Ideation Paper'}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
          <span className="text-t4">STARK Hackathon 2026</span>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard inner ───────────────────────────────────────────────────────────
function DashboardContent() {
  const { notification, language } = useBusiness();
  const { toggleVoice, isListening, isProcessing, liveTranscript } = useVoice();
  const isAmharic = language === 'am';

  const [activePage, setActivePage] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('birrvoice-onboarded')
  );
  const [showHelp, setShowHelp] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notificationLog, setNotificationLog] = useState([]);

  // Dynamic localized page configurations
  const pageConfig = {
    voice: {
      title: isAmharic ? 'የድምፅ መመዝገቢያ' : 'Voice Logger',
      desc: isAmharic
        ? 'የቀጥታ ድምፅ ቅኝት፣ የእውነተኛ ጊዜ ቅድመ-ዕይታና ሲሙሌሽን'
        : 'Live voice ingestion, real-time preview & simulation',
    },
    dashboard: {
      title: isAmharic ? 'ዳሽቦርድ' : 'Dashboard',
      desc: isAmharic ? 'የሽያጭ፣ ክምችትና ጥሬ ገንዘብ ማጠቃለያ' : 'Sales, stock & cash summary',
    },
    calendar: {
      title: isAmharic ? 'የቀን መቁጠሪያና ሪፖርቶች' : 'Reports & Calendar',
      desc: isAmharic
        ? 'የቀን ክልል ማጠቃለያ፣ የግዕዝ ቀን መቁጠሪያና CSV ኤክስፖርት'
        : 'Date-range summaries, Ethiopian calendar view & CSV export',
    },
  };

  const page = pageConfig[activePage] ?? pageConfig.dashboard;

  // Collect every notification into the log for the bell panel
  const prevNotifId = useRef(null);
  useEffect(() => {
    if (notification && notification.id !== prevNotifId.current) {
      prevNotifId.current = notification.id;
      setNotificationLog((prev) => [notification, ...prev].slice(0, 50));
    }
  }, [notification]);

  // Close bell panel when clicking outside
  const bellRef = useRef(null);
  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [bellOpen]);

  const handleSelectLowStockFilter = useCallback(() => {
    setFilterLowStockOnly(true);
    setActivePage('dashboard');
    const el = document.getElementById('inventory-section');
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      switch (e.key.toLowerCase()) {
        case 'k':
          e.preventDefault();
          toggleVoice();
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
          setShowHelp(true);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleVoice]);

  return (
    <div className="min-h-screen bg-page flex antialiased transition-colors duration-300">
      {/* Sidebar with Taskbar Mic (Desktop + Mobile) */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onHelpClick={() => setShowHelp(true)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-16 pb-20 md:pb-0">
        {/* Topbar */}
        <div ref={bellRef}>
          <Topbar
            pageTitle={page.title}
            notificationLog={notificationLog}
            onBellClick={() => setBellOpen((o) => !o)}
            bellOpen={bellOpen}
            onBellClose={() => setBellOpen(false)}
          />
        </div>

        <main className="flex-1 p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {/* Page heading */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-t1">{page.title}</h1>
              <p className="text-xs text-t3 mt-0.5">{page.desc}</p>
            </div>
            <button
              onClick={() => setActivePage('dashboard')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 shadow-sm"
              style={{
                background:
                  activePage === 'dashboard'
                    ? 'linear-gradient(135deg, #14b8a6, #0d9488)'
                    : 'var(--c-raised)',
                color: activePage === 'dashboard' ? 'white' : 'var(--c-text-2)',
              }}
            >
              <span className="text-base leading-none">⊞</span>
              <span>{isAmharic ? 'ዳሽቦርድ' : 'Dashboard'}</span>
            </button>
          </div>

          {/* Keyboard hint strip */}
          <div className="hidden lg:flex items-center gap-4 text-[11px] text-t4 font-mono">
            {[
              ['K', isAmharic ? 'ድምፅ' : 'Voice'],
              ['N', isAmharic ? 'አዲስ ዕቃ' : 'New Item'],
              ['D', isAmharic ? 'ዳሽቦርድ' : 'Dashboard'],
              ['V', isAmharic ? 'የድምፅ ገጽ' : 'Voice Page'],
              ['?', isAmharic ? 'እርዳታ' : 'Help'],
            ].map(([k, label]) => (
              <span key={k}>
                <kbd className="px-1.5 py-0.5 bg-raised border border-theme rounded text-[10px]">
                  {k}
                </kbd>{' '}
                {label}
              </span>
            ))}
          </div>

          {/* Voice Logger page */}
          {activePage === 'voice' && (
            <section aria-label="Voice Ingestion Console">
              <VoiceLogger />
            </section>
          )}

          {/* Dashboard page */}
          {activePage === 'dashboard' && (
            <>
              <SummaryCards onSelectLowStockFilter={handleSelectLowStockFilter} />
              <section aria-label="Voice Ingestion Console">
                <VoiceLogger compact />
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
            </>
          )}

          {/* Calendar & Reports page */}
          {activePage === 'calendar' && (
            <section aria-label="Calendar and Reports">
              <CalendarReports />
            </section>
          )}
        </main>

        {/* Global Floating Live Voice HUD Bar (visible when recording outside voice console) */}
        {(isListening || isProcessing) && activePage !== 'voice' && (
          <aside
            aria-label="Live Voice Floating Status"
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-panel border-2 border-teal shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 max-w-[94vw]"
          >
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
                {isAmharic ? 'እያዳመጠ ነው' : 'Recording'}
              </span>
            </div>
            <div className="h-4 w-px bg-theme shrink-0" />
            <div className="flex items-center gap-2 text-xs font-medium text-t1 max-w-xs sm:max-w-sm md:max-w-md truncate">
              {liveTranscript ? (
                <span className="text-teal font-semibold">“{liveTranscript}”</span>
              ) : (
                <span className="text-t3 italic">
                  {isAmharic ? 'ድምፅዎን ይናገሩ...' : 'Speak your transaction now...'}
                </span>
              )}
            </div>
            <div className="flex items-end gap-1 h-3.5 px-1 shrink-0">
              <span className="w-1 bg-teal rounded-full animate-audio-bar-1" />
              <span className="w-1 bg-teal rounded-full animate-audio-bar-2" />
              <span className="w-1 bg-teal rounded-full animate-audio-bar-3" />
            </div>
            <button
              onClick={toggleVoice}
              className="ml-2 px-3 py-1 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all active:scale-95 shrink-0"
            >
              {isAmharic ? 'አቁም' : 'Stop'}
            </button>
          </aside>
        )}

        {/* Footer */}
        <footer className="border-t border-theme bg-panel py-3 px-6 text-[11px] text-t4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>BirrVoice Ledger • STARK Hackathon 2026</span>
            <div className="flex items-center gap-3 font-mono">
              <a
                href="https://www.scholarxiv.com/write/6aa993bf67a18d2c6ed8ec92"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline transition-colors"
                style={{ color: 'var(--c-teal)' }}
              >
                <FileText className="w-3 h-3" />
                <span>Scholarxiv</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
              <span>•</span>
              <span>ETB</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <AddItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <NotificationToast />
      <VoxideBridge />
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} isAmharic={isAmharic} />}
      {showOnboarding && <OnboardingModal onDone={() => setShowOnboarding(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BusinessProvider>
        <VoiceProvider>
          <DashboardContent />
        </VoiceProvider>
      </BusinessProvider>
    </ThemeProvider>
  );
}
