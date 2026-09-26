import React, { useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

export default function NotificationToast() {
  const { notification, clearNotification } = useBusiness();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!notification) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(clearNotification, 3500);
    return () => clearTimeout(timerRef.current);
  }, [notification, clearNotification]);

  if (!notification) return null;

  const config = {
    success: { Icon: CheckCircle2, badge: 'bg-emerald-500/15 border-emerald-500/30', iconClass: 'text-emerald-400', label: 'bg-emerald-500' },
    error:   { Icon: AlertCircle,  badge: 'bg-rose-500/15 border-rose-500/30',    iconClass: 'text-rose-400',    label: 'bg-rose-500' },
    info:    { Icon: Info,          badge: 'bg-teal/10 border-teal/30',             iconClass: 'text-teal',        label: 'bg-teal' },
    warning: { Icon: AlertTriangle, badge: 'bg-amber-500/15 border-amber-500/30',  iconClass: 'text-amber-400',   label: 'bg-amber-500' },
  };

  const type = notification.type || 'info';
  const { Icon, badge, iconClass, label } = config[type] || config.info;

  return (
    <div className="fixed bottom-6 left-6 z-[70] max-w-[320px] w-full" role="alert" aria-live="polite">
      <div className={`toast-enter relative bg-panel border rounded-2xl shadow-2xl overflow-hidden ${badge}`}>
        {/* Progress drain bar */}
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${label} toast-drain opacity-60`} />

        <div className="flex items-start gap-3 px-4 py-3.5 pr-10">
          <div className={`shrink-0 mt-0.5 ${iconClass}`}>
            <Icon className="w-4 h-4" />
          </div>
          <p className="text-xs text-t1 leading-relaxed font-medium pr-1">
            {notification.message}
          </p>
        </div>

        <button
          onClick={clearNotification}
          className="absolute top-3 right-3 text-t4 hover:text-t2 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
