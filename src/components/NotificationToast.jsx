import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

export default function NotificationToast() {
  const { notification } = useBusiness();

  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const isWarning = notification.type === 'warning';
  const isError = notification.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border ${
          isSuccess
            ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-500/20'
            : isWarning
            ? 'bg-amber-950/90 text-amber-200 border-amber-500/40 shadow-amber-500/20'
            : isError
            ? 'bg-rose-950/90 text-rose-200 border-rose-500/40 shadow-rose-500/20'
            : 'bg-indigo-950/90 text-indigo-200 border-indigo-500/40 shadow-indigo-500/20'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        ) : isWarning ? (
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        ) : isError ? (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        ) : (
          <Info className="w-5 h-5 text-indigo-400 shrink-0" />
        )}
        <p className="text-xs font-semibold">{notification.message}</p>
      </div>
    </div>
  );
}
