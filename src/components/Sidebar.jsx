import React from 'react';
import { Mic, LayoutDashboard, CalendarDays, Sun, Moon, HelpCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { icon: Mic,             id: 'voice',    title: 'Voice Logger' },
  { icon: LayoutDashboard, id: 'dashboard', title: 'Dashboard' },
  { icon: CalendarDays,   id: 'calendar', title: 'Reports' },
];

export default function Sidebar({ activePage, setActivePage, onHelpClick }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav
      className="fixed top-0 left-0 h-screen w-16 flex flex-col items-center py-4 gap-1 z-50 bg-sidebar border-r border-sidebar transition-colors duration-300"
      aria-label="Main Navigation"
    >
      {/* Logo mark */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 cursor-pointer shrink-0"
        style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
        title="BirrVoice Ledger"
      >
        <Mic className="w-5 h-5 text-white" />
      </div>

      {/* Top nav items */}
      <div className="flex flex-col items-center gap-1 flex-1">
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
      <div className="flex flex-col items-center gap-1 pb-2">
        {/* Help */}
        <button
          onClick={onHelpClick}
          title="Help & Keyboard Shortcuts"
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
          {isDark
            ? <Sun  className="w-5 h-5 text-amber-400" />
            : <Moon className="w-5 h-5 text-indigo-300" />
          }
        </button>
      </div>
    </nav>
  );
}
