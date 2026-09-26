import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

const DURATION = 5000; // ms

const CONFIG = {
  success: {
    Icon: CheckCircle2,
    bg:      'bg-emerald-950/80 border-emerald-500/40',
    icon:    'text-emerald-400',
    bar:     '#34d399',
    accent:  '#34d399',
  },
  error: {
    Icon: AlertCircle,
    bg:   'bg-rose-950/80 border-rose-500/40',
    icon: 'text-rose-400',
    bar:  '#fb7185',
    accent: '#fb7185',
  },
  warning: {
    Icon: AlertTriangle,
    bg:   'bg-amber-950/80 border-amber-500/40',
    icon: 'text-amber-400',
    bar:  '#fbbf24',
    accent: '#fbbf24',
  },
  info: {
    Icon: Info,
    bg:   'bg-teal-900/60 border-teal-500/40',
    icon: 'text-teal-300',
    bar:  '#14b8a6',
    accent: '#14b8a6',
  },
};

export default function NotificationToast() {
  const { notification, clearNotification } = useBusiness();
  const timerRef       = useRef(null);
  const [visible, setVisible]   = useState(false);
  const [leaving, setLeaving]   = useState(false);
  const prevIdRef  = useRef(null);

  // Start leave animation then remove
  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      setLeaving(false);
      clearNotification();
    }, 320);
  };

  useEffect(() => {
    if (!notification) {
      // No notification → nothing shown
      setVisible(false);
      setLeaving(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // New notification (different id) → reset and show
    if (notification.id !== prevIdRef.current) {
      prevIdRef.current = notification.id;
      setLeaving(false);
      setVisible(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(dismiss, DURATION);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification]);

  if (!notification || !visible) return null;

  const type = notification.type || 'info';
  const { Icon, bg, icon, bar } = CONFIG[type] || CONFIG.info;

  return (
    <div
      className={`
        fixed bottom-6 left-6 z-[100] max-w-[340px] w-full
        transition-all duration-300 ease-out
        ${leaving
          ? 'opacity-0 translate-y-2 scale-95 pointer-events-none'
          : 'opacity-100 translate-y-0 scale-100'
        }
      `}
      style={{
        animation: leaving ? undefined : 'toastSlideIn 0.32s cubic-bezier(0.22,1,0.36,1) forwards',
      }}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div
        className={`relative rounded-2xl border backdrop-blur-sm shadow-2xl overflow-hidden ${bg}`}
      >
        {/* Animated left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
          style={{ backgroundColor: bar }}
        />

        {/* Progress drain bar at bottom */}
        <div
          className="absolute bottom-0 left-0 h-[2px] rounded-full"
          style={{
            backgroundColor: bar,
            opacity: 0.6,
            width: '100%',
            animation: `toastDrain ${DURATION}ms linear forwards`,
            transformOrigin: 'left',
          }}
        />

        {/* Content */}
        <div className="flex items-start gap-3 px-4 py-3.5 pl-5 pr-10">
          <div className={`shrink-0 mt-0.5 ${icon}`}>
            <Icon className="w-4 h-4" />
          </div>
          <p className="text-xs text-white/90 leading-relaxed font-medium">
            {notification.message}
          </p>
        </div>

        {/* Dismiss button — properly positioned and clickable */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); dismiss(); }}
          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(-110%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes toastDrain {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}
