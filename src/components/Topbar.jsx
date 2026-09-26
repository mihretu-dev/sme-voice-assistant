import React from 'react';
import { Bell, RotateCcw, AudioWaveform } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

export default function Topbar({ pageTitle, pageAction }) {
  const { language, setLanguage, resetToDemo } = useBusiness();
  const isAmharic = language === 'am';

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-theme bg-panel-blur sticky top-0 z-30 transition-colors duration-300">
      {/* Left: Logo name + page title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <AudioWaveform className="w-5 h-5 text-teal" />
          <span className="text-sm font-bold text-t1">BirrVoice Ledger</span>
        </div>
        {pageTitle && (
          <>
            <span className="text-t4 text-sm">/</span>
            <span className="text-sm font-medium text-t2">{pageTitle}</span>
          </>
        )}
      </div>

      {/* Right: language, reset, notifications, avatar */}
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <div className="hidden sm:flex items-center bg-surface p-0.5 rounded-lg border border-theme">
          <button
            onClick={() => setLanguage('en')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
              language === 'en'
                ? 'bg-teal-muted text-teal border border-teal/30'
                : 'text-t3 hover:text-t1'
            }`}
          >
            <span>🇬🇧</span><span>EN</span>
          </button>
          <button
            onClick={() => setLanguage('am')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
              language === 'am'
                ? 'bg-teal-muted text-teal border border-teal/30'
                : 'text-t3 hover:text-t1'
            }`}
          >
            <span>🇪🇹</span><span>አማርኛ</span>
          </button>
        </div>

        {/* Reset Demo */}
        <button
          onClick={resetToDemo}
          title={isAmharic ? 'ዳግም አስጀምር' : 'Reset sample data'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-t3 hover:text-t1 bg-raised border border-theme hover:bg-hover transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isAmharic ? 'ዳግም' : 'Reset'}</span>
        </button>

        {/* Notification bell */}
        <button
          className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-raised border border-theme text-t3 hover:text-t1 hover:bg-hover transition-colors"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-teal"></span>
        </button>

        {/* User avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
          title="Merchant Account"
        >
          M
        </div>
      </div>
    </header>
  );
}
