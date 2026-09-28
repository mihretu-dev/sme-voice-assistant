import React from 'react';
import { Mic, LayoutDashboard, CalendarDays, Sun, Moon, HelpCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useVoice } from '../context/VoiceContext';
import { useBusiness } from '../context/BusinessContext';

const NAV_ITEMS = [
  { icon: LayoutDashboard, id: 'dashboard', title: 'Dashboard', titleAm: 'ዳሽቦርድ' },
  { icon: CalendarDays,   id: 'calendar',  title: 'Reports',   titleAm: 'ሪፖርት' },
  { icon: Mic,            id: 'voice',     title: 'Voice',     titleAm: 'ድምፅ' },
];

export default function Sidebar({ activePage, setActivePage, onHelpClick }) {
  const { isDark, toggleTheme } = useTheme();
  const { isListening, isProcessing, effectiveState, toggleVoice } = useVoice();
  const { language } = useBusiness();
  const isAmharic = language === 'am';

  return (
    <>
      {/* ── Desktop & Tablet Sidebar (Hidden on Mobile) ── */}
      <nav
        className="hidden md:flex fixed top-0 left-0 h-screen w-16 flex-col items-center py-4 gap-1 z-50 bg-sidebar border-r border-sidebar transition-colors duration-300"
        aria-label="Desktop Navigation"
      >
        {/* Taskbar Primary Voice Mic Button */}
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
          {NAV_ITEMS.map(({ icon: Icon, id, title, titleAm }) => (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              title={isAmharic ? titleAm : title}
              className={`sidebar-nav-item ${activePage === id ? 'active' : ''}`}
              aria-label={isAmharic ? titleAm : title}
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

      {/* ── Mobile Bottom Navigation Bar (Visible only on Mobile) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-sidebar/95 backdrop-blur-lg border-t border-sidebar z-50 flex items-center justify-around px-2 pb-safe shadow-2xl transition-colors duration-300"
        aria-label="Mobile Bottom Navigation"
      >
        {/* Dashboard Tab */}
        <button
          onClick={() => setActivePage('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activePage === 'dashboard'
              ? 'text-teal font-semibold'
              : 'text-t3 hover:text-t1'
          }`}
          aria-label="Dashboard"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">
            {isAmharic ? 'ዳሽቦርድ' : 'Dashboard'}
          </span>
        </button>

        {/* Reports / Calendar Tab */}
        <button
          onClick={() => setActivePage('calendar')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activePage === 'calendar'
              ? 'text-teal font-semibold'
              : 'text-t3 hover:text-t1'
          }`}
          aria-label="Reports & Calendar"
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">
            {isAmharic ? 'ሪፖርት' : 'Reports'}
          </span>
        </button>

        {/* ── Center Elevated Mic Action Button ── */}
        <div className="relative -top-3">
          <button
            id="mobile-center-mic-button"
            type="button"
            onClick={toggleVoice}
            className={`w-13 h-13 rounded-full flex items-center justify-center shadow-xl ring-4 ring-page transition-all duration-200 active:scale-90 ${
              isListening
                ? 'bg-red-600 text-white scale-105 animate-pulse ring-red-400/40'
                : isProcessing
                ? 'bg-panel border-2 border-teal text-teal'
                : effectiveState === 'success'
                ? 'bg-emerald-600 text-white'
                : 'hover:scale-105'
            }`}
            style={
              effectiveState === 'idle'
                ? { background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }
                : undefined
            }
            title={isListening ? 'Stop recording' : 'Start voice recording'}
            aria-label="Voice input"
          >
            {isListening ? (
              <div className="flex items-end gap-[2px] h-4">
                <span className="w-1 bg-white rounded-full animate-audio-bar-1" />
                <span className="w-1 bg-white rounded-full animate-audio-bar-3" />
                <span className="w-1 bg-white rounded-full animate-audio-bar-2" />
              </div>
            ) : isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin text-teal" />
            ) : effectiveState === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Voice Console Page */}
        <button
          onClick={() => setActivePage('voice')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activePage === 'voice'
              ? 'text-teal font-semibold'
              : 'text-t3 hover:text-t1'
          }`}
          aria-label="Voice Console"
        >
          <Mic className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">
            {isAmharic ? 'ድምፅ' : 'Voice'}
          </span>
        </button>

        {/* Theme Toggle / Help */}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-t3 hover:text-t1 transition-all"
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-300" />
          )}
          <span className="text-[10px] font-medium leading-none">
            {isDark ? (isAmharic ? 'ብርሃን' : 'Light') : (isAmharic ? 'ጨለማ' : 'Dark')}
          </span>
        </button>
      </nav>
    </>
  );
}
