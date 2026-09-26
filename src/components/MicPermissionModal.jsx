import React, { useState } from 'react';
import { Mic, X, Settings, AlertTriangle } from 'lucide-react';

/**
 * MicPermissionModal
 * Shows before attempting to connect to the live Voxide audio stream.
 * Explains what the browser will ask for and guides error recovery.
 */
export default function MicPermissionModal({ isOpen, onAllow, onDeny, error, language }) {
  const isAmharic = language === 'am';
  if (!isOpen) return null;

  // Error state types: 'denied' | 'usage_limit' | 'network' | null
  const isDenied     = error === 'denied';
  const isLimitError = error === 'usage_limit';
  const isNetError   = error === 'network';

  if (isDenied) {
    return (
      <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-panel border border-theme rounded-2xl shadow-2xl p-6 modal-enter">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-t1">
                {isAmharic ? 'ማይክሮፎን ተከለከለ' : 'Microphone Access Denied'}
              </h3>
              <p className="text-[11px] text-t4">
                {isAmharic ? 'ቅንብሮችን ይፈቅዱ' : 'Allow it in browser settings'}
              </p>
            </div>
          </div>
          <p className="text-xs text-t3 mb-4 leading-relaxed">
            {isAmharic
              ? 'ድምፅ ለመጠቀም ማይክሮፎን ፍቃድ ያስፈልጋል። በአሳሽ ቅንብሮች ወደ Site Settings ሂደው ፍቃዱን ያጸዱ።'
              : 'BirrVoice needs microphone access for live voice logging. Go to your browser\'s Site Settings → Permissions → Microphone and Allow this site.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onDeny}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-medium text-t3 bg-raised border border-theme hover:bg-hover transition-colors"
            >
              {isAmharic ? 'ሰረዝ' : 'Use Simulation Mode'}
            </button>
            <a
              href="chrome://settings/content/microphone"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
              onClick={onDeny}
            >
              <Settings className="w-3.5 h-3.5" />
              {isAmharic ? 'ቅንብሮች' : 'Open Settings'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isLimitError) {
    return (
      <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-panel border border-theme rounded-2xl shadow-2xl p-6 modal-enter">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-t1">
                {isAmharic ? 'የቮክሳይድ ገደብ ደረሰ' : 'Voxide Usage Limit Reached'}
              </h3>
              <p className="text-[11px] text-t4">
                {isAmharic ? 'ሲሙሌሽን ሁናቴ ይጠቀሙ' : 'Upgrade or use simulation mode'}
              </p>
            </div>
          </div>
          <p className="text-xs text-t3 mb-4 leading-relaxed">
            {isAmharic
              ? 'ቀጥታ የድምፅ ክሬዲቶችዎ አልቀዋል። ቅድሚያ ቺፕ ወይም ጽሑፍ ሲሙሌሽን ሁናቴን ይጠቀሙ።'
              : 'Your live Voxide voice credits have been exhausted. You can still use preset chips or text simulation below.'}
          </p>
          <button
            onClick={onDeny}
            className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
          >
            {isAmharic ? 'ሲሙሌሽን ሁናቴ ይጠቀሙ' : 'Continue with Simulation'}
          </button>
        </div>
      </div>
    );
  }

  if (isNetError) {
    return (
      <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-panel border border-theme rounded-2xl shadow-2xl p-6 modal-enter">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-sm font-bold text-t1">
              {isAmharic ? 'የኔትወርክ ስህተት' : 'Network Error'}
            </h3>
          </div>
          <p className="text-xs text-t3 mb-4">
            {isAmharic
              ? 'ከVoxide ጋር ለማገናኘት አልተቻለም። ኢንተርኔትዎን ያረጋግጡ።'
              : 'Could not connect to the Voxide audio service. Check your internet connection and try again.'}
          </p>
          <div className="flex gap-2">
            <button onClick={onDeny} className="flex-1 px-3 py-2 rounded-xl text-xs font-medium text-t3 bg-raised border border-theme hover:bg-hover transition-colors">
              {isAmharic ? 'ሲሙሌሽን' : 'Simulation Mode'}
            </button>
            <button onClick={onAllow} className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
              {isAmharic ? 'እንደገና ሞክር' : 'Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: initial permission request prompt
  return (
    <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-panel border border-theme rounded-2xl shadow-2xl p-6 modal-enter">
        <button
          onClick={onDeny}
          className="absolute top-4 right-4 text-t4 hover:text-t2 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-teal-muted" style={{ border: '1.5px solid var(--c-teal)' }}>
            <Mic className="w-8 h-8 text-teal" />
          </div>
          <h3 className="text-sm font-bold text-t1 mb-1">
            {isAmharic ? 'ማይክሮፎን ፍቃድ' : 'Microphone Permission'}
          </h3>
          <p className="text-xs text-t3 leading-relaxed max-w-[240px]">
            {isAmharic
              ? 'BirrVoice ቀጥታ ሽያጭ፣ ወጪ ወይም ዳግም ሙሌት ለመቅረጽ ማይክሮፎን ፍቃድ ይፈልጋል። አሳሽዎ ፍቃድ ይጠይቃቸዎታል።'
              : 'BirrVoice needs microphone access to record live sales, expenses, and restocks. Your browser will prompt you to Allow.'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onDeny}
            className="flex-1 px-3 py-2 rounded-xl text-xs font-medium text-t3 bg-raised border border-theme hover:bg-hover transition-colors"
          >
            {isAmharic ? 'አሁን አይደለም' : 'Not Now'}
          </button>
          <button
            onClick={onAllow}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
          >
            <Mic className="w-3.5 h-3.5" />
            {isAmharic ? 'ፍቃድ ስጥ' : 'Allow Mic'}
          </button>
        </div>
      </div>
    </div>
  );
}
