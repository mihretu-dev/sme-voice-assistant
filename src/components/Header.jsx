import React from 'react';
import { RotateCcw, AudioWaveform, Store, Sun, Moon, FileText, ExternalLink } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const { language, setLanguage, resetToDemo } = useBusiness();
  const { isDark, toggleTheme } = useTheme();
  const isAmharic = language === 'am';

  return (
    <header className="border-b border-theme bg-panel-blur sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">

        {/* Brand & Store Identity */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            {/* Logo icon with gradient bg */}
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 shadow-sm">
              <AudioWaveform className="w-5 h-5 text-indigo-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                {/* Gradient product name */}
                <span className="text-base font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  BirrVoice
                </span>
                <span className="text-base font-bold tracking-tight text-t1">
                  Ledger
                </span>
                <span className="hidden sm:inline-flex text-[11px] font-medium text-t3 border-l border-theme pl-2">
                  {isAmharic ? 'የንግድ ድምፅና ክምችት መዝገብ' : 'Smart Voice & Stock Management'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-t3">
                <span className="flex items-center gap-1">
                  <Store className="w-3 h-3" />
                  <span>{isAmharic ? 'አዲስ አበባ • ዋና ቅርንጫፍ' : 'Addis Ababa Central Store'}</span>
                </span>
                <span className="text-t4">•</span>
                <span className="font-mono text-[10px] text-t4">ETB POS v1.2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">

          {/* Scholarxiv Ideation link (Rule 01) */}
          <a
            href="https://www.scholarxiv.com/write/6aa993bf67a18d2c6ed8ec92"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-raised border border-theme text-[11px] font-medium text-t3 hover:text-indigo-400 hover:border-indigo-500/40 transition-colors"
            title="Scholarxiv Ideation Documentation (STARK Hackathon Rule 01)"
          >
            <FileText className="w-3 h-3 text-indigo-400" />
            <span>Scholarxiv Ideation</span>
            <ExternalLink className="w-2.5 h-2.5 text-t4" />
          </a>

          {/* Live status pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-raised border border-theme text-[11px] font-mono text-t3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400">Voxide Ready</span>
          </div>

          {/* Language segmented control */}
          <div className="flex items-center bg-surface p-0.5 rounded-lg border border-theme">
            <button
              onClick={() => setLanguage('en')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                language === 'en'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-700/50'
                  : 'text-t3 hover:text-t1'
              }`}
            >
              <span>🇬🇧</span>
              <span>EN</span>
            </button>
            <button
              onClick={() => setLanguage('am')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                language === 'am'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-700/50'
                  : 'text-t3 hover:text-t1'
              }`}
            >
              <span>🇪🇹</span>
              <span>አማርኛ</span>
            </button>
          </div>

          {/* Dark / Light toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-raised border border-theme text-t2 hover:text-t1 hover:bg-hover transition-colors"
          >
            {isDark
              ? <Sun className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4 text-indigo-400" />
            }
          </button>

          {/* Reset Demo */}
          <button
            onClick={resetToDemo}
            title={isAmharic ? 'ዳግም አስጀምር' : 'Reset sample data'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-t3 hover:text-t1 bg-raised border border-theme hover:bg-hover transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAmharic ? 'ዳግም አስጀምር' : 'Reset Demo'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
