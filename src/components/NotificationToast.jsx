import React, { useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

export default function NotificationToast() {
  const { notification } = useBusiness();
  const drainRef = useRef(null);

  // Restart the drain animation when notification changes
  useEffect(() => {
    if (notification && drainRef.current) {
      drainRef.current.style.animation = 'none';
      // Force reflow
      void drainRef.current.offsetWidth;
      drainRef.current.style.animation = '';
    }
  }, [notification?.message]);

  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const isWarning = notification.type === 'warning';
  const isError   = notification.type === 'error';

  const borderColor = isSuccess ? 'border-emerald-700/60'
    : isWarning ? 'border-amber-700/60'
    : isError   ? 'border-rose-700/60'
    :             'border-theme';

  const drainColor = isSuccess ? 'bg-emerald-500'
    : isWarning ? 'bg-amber-500'
    : isError   ? 'bg-rose-500'
    :             'bg-indigo-500';

  const iconBg = isSuccess ? 'bg-emerald-500/15 text-emerald-400'
    : isWarning ? 'bg-amber-500/15 text-amber-400'
    : isError   ? 'bg-rose-500/15 text-rose-400'
    :             'bg-indigo-500/15 text-indigo-400';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full sm:w-auto">
      <div
        className={`toast-enter relative overflow-hidden flex items-start gap-3 px-4 py-3.5 rounded-xl bg-panel border ${borderColor} shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm`}
      >
        {/* Icon */}
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${iconBg}`}>
          {isSuccess  ? <CheckCircle2  className="w-4 h-4" />
          : isWarning ? <AlertTriangle className="w-4 h-4" />
          : isError   ? <AlertCircle   className="w-4 h-4" />
          :             <Info          className="w-4 h-4" />}
        </div>

        {/* Message */}
        <div className="flex-1 pt-0.5 min-w-0">
          <p className="text-xs font-semibold text-t1 leading-snug">
            {isSuccess ? (notification.title || 'Transaction Recorded') : ''}
          </p>
          <p className={`text-xs leading-relaxed mt-0.5 ${isSuccess ? 'text-t2' : 'text-t1'}`}>
            {notification.message}
          </p>
        </div>

        {/* Progress drain bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-raised overflow-hidden rounded-full">
          <div
            ref={drainRef}
            className={`h-full ${drainColor} toast-drain`}
          />
        </div>
      </div>
    </div>
  );
}
