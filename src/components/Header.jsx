import React from 'react';
import { Mic, Radio, RotateCcw, Globe, Sparkles } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

export default function Header() {
  const { language, setLanguage, resetToDemo } = useBusiness();

  const isAmharic = language === 'am';

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-500 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Mic className="w-5 h-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-slate-900"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>Voxide Voice</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-normal">
                  SME Pilot
                </span>
              </h1>
            </div>
            <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <span>{isAmharic ? 'የኢትዮጵያ ንግድ ድምፅ ረዳት' : 'Ethiopian SME Voice Assistant'}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                Voxide Stream Ready
              </span>
            </p>
          </div>
        </div>

        {/* Controls: Language toggle & Reset */}
        <div className="flex items-center gap-2.5 sm:self-center">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
            <button
              onClick={() => setLanguage('en')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                language === 'en'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>English</span>
            </button>
            <button
              onClick={() => setLanguage('am')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                language === 'am'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>አማርኛ</span>
            </button>
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={resetToDemo}
            title="Reset store to demo data"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-all active:scale-95 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{isAmharic ? 'ዳግም አስጀምር' : 'Reset Demo'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
