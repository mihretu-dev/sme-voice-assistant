import React from 'react';
import { Mic, LayoutDashboard, CalendarDays, Sun, Moon, HelpCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useVoice } from '../context/VoiceContext';
import { useBusiness } from '../context/BusinessContext';

const NAV_ITEMS = [
  { icon: LayoutDashboard, id: 'dashboard', title: 'Dashboard', titleAm: 'ዳሽቦርድ' },
  { icon: CalendarDays,   id: 'calendar',  title: 'Reports & Calendar', titleAm: 'የቀን መቁጠሪያና ሪፖርቶች' },
  { icon: Mic,            id: 'voice',     title: 'Voice Console', titleAm: 'የድምፅ መመዝገቢያ' },
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
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 cursor-pointer shrink-0 transition-all duration-200 active:scale-90 shadow-lg ${
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
          title={
            isListening
              ? isAmharic ? 'የድምፅ ቀረጻ አቁም (K)' : 'Stop voice recording (K)'
              : isAmharic ? 'የቀጥታ ድምፅ ቅረጽ (K)' : 'Start voice recording (K)'
          }
          aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
        >
          {isListening ? (
            <div className="flex items-end gap-[2px] h-5">
              <span className="w-1 bg-white rounded-full animate-audio-bar-1" />
              <span className="w-1 bg-white rounded-full animate-audio-bar-3" />
              <span className="w-1 bg-white rounded-full animate-audio-bar-2" />
            </div>
          ) : isProcessing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : effectiveState === 'success' ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <Mic className="w-7 h-7 text-white" />
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
            title={isAmharic ? 'እርዳታና አቋራጮች (?)' : 'Help & Keyboard Shortcuts (?)'}
            className="sidebar-nav-item"
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={
              isDark
                ? isAmharic ? 'ወደ ብርሃን ሁናቴ ቀይር' : 'Switch to Light Mode'
                : isAmharic ? 'ወደ ጨለማ ሁናቴ ቀይር' : 'Switch to Dark Mode'
            }
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

      {/* ── Mobile Bottom Navigation Bar (Mathematically Centered 5-Column Grid) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-sidebar/95 backdrop-blur-lg border-t border-sidebar z-50 grid grid-cols-5 items-center justify-items-center px-1 pb-safe shadow-2xl transition-colors duration-300"
        aria-label="Mobile Bottom Navigation"
      >
        {/* Column 1: Dashboard Tab */}
        <button
          onClick={() => setActivePage('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 py-1 w-full transition-all ${
            activePage === 'dashboard'
              ? 'text-teal font-semibold'
              : 'text-t3 hover:text-t1'
          }`}
          aria-label={isAmharic ? 'ዳሽቦርድ' : 'Dashboard'}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">
            {isAmharic ? 'ዳሽቦርድ' : 'Dashboard'}
          </span>
        </button>

        {/* Column 2: Reports / Calendar Tab */}
        <button
          onClick={() => setActivePage('calendar')}
          className={`flex flex-col items-center justify-center gap-1 py-1 w-full transition-all ${
            activePage === 'calendar'
              ? 'text-teal font-semibold'
              : 'text-t3 hover:text-t1'
          }`}
          aria-label={isAmharic ? 'ሪፖርት' : 'Reports'}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">
            {isAmharic ? 'ሪፖርት' : 'Reports'}
          </span>
        </button>

        {/* Column 3: EXACT Dead-Center Elevated Mic Button */}
        <div className="flex items-center justify-center w-full relative -top-5">
          <button
            id="mobile-center-mic-button"
            type="button"
            onClick={toggleVoice}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-page transition-all duration-200 active:scale-90 ${
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
                ? { background: 'linear-gradient(135deg, #14b8a6, #0d9488)', boxShadow: '0 8px 25px rgba(20,184,166,0.45)' }
                : undefined
            }
            title={
              isListening
                ? isAmharic ? 'ቀረጻ አቁም' : 'Stop recording'
                : isAmharic ? 'ድምፅ ቅረጽ' : 'Start voice recording'
            }
            aria-label="Voice input"
          >
            {isListening ? (
              <div className="flex items-end gap-[2px] h-5">
                <span className="w-1.5 bg-white rounded-full animate-audio-bar-1" />
                <span className="w-1.5 bg-white rounded-full animate-audio-bar-3" />
                <span className="w-1.5 bg-white rounded-full animate-audio-bar-2" />
              </div>
            ) : isProcessing ? (
              <Loader2 className="w-7 h-7 animate-spin text-teal" />
            ) : effectiveState === 'success' ? (
              <CheckCircle2 className="w-7 h-7 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
        </div>

        {/* Column 4: Voice Console Page */}
        <button
          onClick={() => setActivePage('voice')}
          className={`flex flex-col items-center justify-center gap-1 py-1 w-full transition-all ${
            activePage === 'voice'
              ? 'text-teal font-semibold'
              : 'text-t3 hover:text-t1'
          }`}
          aria-label={isAmharic ? 'ድምፅ' : 'Voice'}
        >
          <Mic className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">
            {isAmharic ? 'ድምፅ' : 'Voice'}
          </span>
        </button>

        {/* Column 5: Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center justify-center gap-1 py-1 w-full text-t3 hover:text-t1 transition-all"
          aria-label={isAmharic ? 'ገጽታ ቀይር' : 'Toggle Theme'}
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
