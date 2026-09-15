import React from 'react';
import { Layers, RotateCcw, Globe, Store, AudioWaveform } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

export default function Header() {
  const { language, setLanguage, resetToDemo } = useBusiness();
  const isAmharic = language === 'am';

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand & Store Identity */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 shadow-sm">
              <AudioWaveform className="w-5 h-5 text-indigo-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-100 tracking-tight">
                  BirrVoice Ledger
                </span>
                <span className="hidden sm:inline-flex text-[11px] font-medium text-slate-400 border-l border-slate-800 pl-2">
                  {isAmharic ? 'የንግድ ድምፅና ክምችት መዝገብ' : 'Smart Voice & Stock Management'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Store className="w-3 h-3 text-slate-400" />
                  <span>{isAmharic ? 'አዲስ አበባ • ዋና ቅርንጫፍ' : 'Addis Ababa Central Store'}</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 font-mono text-[10px]">ETB POS v1.2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls: Segmented language selector & Reset */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Clean Segmented Language Control */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                language === 'en'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('am')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                language === 'am'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              አማርኛ
            </button>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={resetToDemo}
            title={isAmharic ? 'ዳግም አስጀምር' : 'Reset sample data'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{isAmharic ? 'ዳግም አስጀምር' : 'Reset Demo'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
