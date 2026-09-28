import React from 'react';
import { Bell, Database, RefreshCw, AudioWaveform, X, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

// Mini notification log panel shown when bell is clicked
function NotificationPanel({ items, onClose, isAmharic }) {
  return (
    <div className="absolute top-full right-0 mt-2 w-[calc(100vw-32px)] max-w-xs sm:w-80 bg-panel border border-theme rounded-2xl shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-theme bg-panel-hdr">
        <span className="text-xs font-semibold text-t1">
          {isAmharic ? 'ማሳወቂያዎች' : 'Notifications'}
        </span>
        <button
          onClick={onClose}
          className="text-t4 hover:text-t2 transition-colors p-1"
          aria-label={isAmharic ? 'ዝጋ' : 'Close'}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-[var(--c-border-muted)]">
        {items.length === 0 ? (
          <div className="py-8 text-center text-xs text-t4">
            {isAmharic ? 'ምንም አዲስ ማሳወቂያ የለም' : 'No notifications yet'}
          </div>
        ) : (
          items.slice(0, 10).map((n) => {
            const icons = {
              success: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
              error:   <AlertCircle  className="w-3.5 h-3.5 text-rose-400" />,
              warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
              info:    <Info          className="w-3.5 h-3.5 text-teal" style={{ color: 'var(--c-teal)' }} />,
            };
            return (
              <div key={n.id} className="flex items-start gap-2.5 px-3.5 py-2.5 hover:bg-raised transition-colors">
                <div className="mt-0.5 shrink-0">{icons[n.type] ?? icons.info}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-t1 leading-relaxed break-words">{n.message}</p>
                  <p className="text-[10px] text-t4 mt-0.5 font-mono">
                    {new Date(n.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function Topbar({ pageTitle, notificationLog, onBellClick, bellOpen, onBellClose }) {
  const { language, setLanguage, resetToDemo, clearDemoData, hasData } = useBusiness();
  const isAmharic = language === 'am';
  const isDemoActive = hasData;

  const handleDemoReset = () => {
    if (isDemoActive) {
      clearDemoData();
    } else {
      resetToDemo();
    }
  };

  // Localized page title mapping
  const localizedPageTitle =
    isAmharic
      ? pageTitle === 'Dashboard'
        ? 'ዳሽቦርድ'
        : pageTitle === 'Voice Logger'
        ? 'የድምፅ መመዝገቢያ'
        : pageTitle === 'Reports & Calendar' || pageTitle === 'Reports'
        ? 'የቀን መቁጠሪያና ሪፖርቶች'
        : pageTitle
      : pageTitle;

  return (
    <header className="h-14 flex items-center justify-between px-3 sm:px-6 border-b border-theme bg-panel-blur sticky top-0 z-30 transition-colors duration-300">
      {/* Left: brand logo + breadcrumb */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <AudioWaveform className="w-5 h-5 text-teal shrink-0" style={{ color: 'var(--c-teal)' }} />
          <span className="text-xs sm:text-sm font-bold text-t1 tracking-tight">
            BirrVoice
            <span className="hidden xs:inline"> Ledger</span>
          </span>
        </div>
        {pageTitle && (
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-t4 text-xs select-none">/</span>
            <span className="text-[11px] sm:text-xs font-medium text-t2 truncate max-w-[85px] xs:max-w-[130px] sm:max-w-none">
              {localizedPageTitle}
            </span>
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Language toggle: available on both mobile and desktop */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-surface hover:bg-raised border border-theme text-t1 transition-all active:scale-95"
          title={isAmharic ? 'ወደ እንግሊዝኛ ቀይር (Switch to English)' : 'Switch to Amharic (ወደ አማርኛ)'}
          aria-label="Toggle Language"
        >
          <span>{language === 'en' ? '🇬🇧' : '🇪🇹'}</span>
          <span className="text-[11px] font-mono">{language === 'en' ? 'EN' : 'አማ'}</span>
        </button>

        {/* Demo / Reset toggle button */}
        <button
          onClick={handleDemoReset}
          title={
            isDemoActive
              ? isAmharic ? 'ሁሉንም ውሂብ ሰርዝ' : 'Clear all data'
              : isAmharic ? 'ናሙና ውሂብ አስነሳ' : 'Load demo data'
          }
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
            isDemoActive
              ? 'bg-raised text-t2 border-theme hover:text-rose-400 hover:border-rose-500/40'
              : 'border-teal/40 bg-teal-muted text-teal'
          }`}
          style={!isDemoActive ? { color: 'var(--c-teal)' } : {}}
        >
          {isDemoActive ? (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden xs:inline text-[11px]">{isAmharic ? 'ሰርዝ' : 'Reset'}</span>
            </>
          ) : (
            <>
              <Database className="w-3.5 h-3.5" />
              <span className="hidden xs:inline text-[11px]">{isAmharic ? 'ናሙና' : 'Demo'}</span>
            </>
          )}
        </button>

        {/* Bell notification history button */}
        <div className="relative">
          <button
            onClick={onBellClick}
            className={`relative w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
              bellOpen
                ? 'bg-teal-muted border-teal/40 text-teal'
                : 'bg-raised border-theme text-t3 hover:text-t1 hover:bg-hover'
            }`}
            style={bellOpen ? { color: 'var(--c-teal)' } : {}}
            title={isAmharic ? 'የማሳወቂያ ታሪክ' : 'Notification History'}
            aria-label={isAmharic ? 'ማሳወቂያዎች' : 'Notifications'}
            aria-expanded={bellOpen}
          >
            <Bell className="w-4 h-4" />
            {notificationLog.length > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 rounded-full text-[9px] font-bold text-white flex items-center justify-center px-0.5"
                style={{ background: 'var(--c-teal)' }}
              >
                {Math.min(notificationLog.length, 9)}
              </span>
            )}
          </button>

          {bellOpen && (
            <NotificationPanel
              items={notificationLog}
              onClose={onBellClose}
              isAmharic={isAmharic}
            />
          )}
        </div>
      </div>
    </header>
  );
}
