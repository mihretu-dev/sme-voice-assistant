import React from 'react';
import { Mic, LayoutDashboard, CalendarDays, Sun, Moon, HelpCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useVoice } from '../context/VoiceContext';

const NAV_ITEMS = [
  { icon: LayoutDashboard, id: 'dashboard', title: 'Dashboard', titleAm: 'ዳሽቦርድ' },
  { icon: CalendarDays,   id: 'calendar',  title: 'Reports & Calendar', titleAm: 'የቀን መቁጠሪያና ሪፖርቶች' },
  { icon: Mic,            id: 'voice',     title: 'Voice Console', titleAm: 'የድምፅ መመዝገቢያ' },
];

export default function Sidebar({ activePage, setActivePage, onHelpClick }) {
  const { isDark, toggleTheme } = useTheme();
  const { isListening, isProcessing, effectiveState, toggleVoice } = useVoice();

  return (
    <nav
      className="fixed top-0 left-0 h-screen w-16 flex flex-col items-center py-4 gap-1 z-50 bg-sidebar border-r border-sidebar transition-colors duration-300"
      aria-label="Main Navigation"
    >
      {/* ── Taskbar Primary Voice Mic Button ── */}
      <button
        id="sidebar-taskbar-mic-button"
        type="button"
        onClick={toggleVoice}
        className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 cursor-pointer shrink-0 transition-all duration-200 active:scale-90 shadow-md ${
          isListening
            ? 'bg-red-600 text-white scale-105 animate-pulse ring-4 ring-red-400/30'
            : isProcessing
            ? 'bg-panel border-2 border-teal text-teal'
            : effectiveState === 'success'
            ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
            : 'hover:scale-105'
        }`}
        style={
          effectiveState === 'idle'
            ? { background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }
            : undefined
        }
        title={isListening ? 'Stop voice recording (K)' : 'Start voice recording (K)'}
        aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
      >
        {isListening ? (
          <div className="flex items-end gap-[2px] h-4">
            <span className="w-1 bg-white rounded-full animate-audio-bar-1" />
            <span className="w-1 bg-white rounded-full animate-audio-bar-3" />
            <span className="w-1 bg-white rounded-full animate-audio-bar-2" />
          </div>
        ) : isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : effectiveState === 'success' ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Top nav items */}
      <div className="flex flex-col items-center gap-1.5 flex-1">
        {NAV_ITEMS.map(({ icon: Icon, id, title }) => (
          <button
            key={id}
            onClick={() => setActivePage(id)}
            title={title}
            className={`sidebar-nav-item ${activePage === id ? 'active' : ''}`}
            aria-label={title}
            aria-current={activePage === id ? 'page' : undefined}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* Bottom: theme toggle + help */}
      <div className="flex flex-col items-center gap-1.5 pb-2">
        {/* Help */}
        <button
          onClick={onHelpClick}
          title="Help & Keyboard Shortcuts (?)"
          className="sidebar-nav-item"
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="sidebar-nav-item"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-300" />
          )}
        </button>
      </div>
    </nav>
  );
}
