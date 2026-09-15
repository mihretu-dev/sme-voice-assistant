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
    <div className="fixed bottom-5 right-5 z-50 max-w-sm">
      <div
        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg shadow-lg border text-xs font-medium ${
          isSuccess
            ? 'bg-slate-900 text-emerald-300 border-emerald-800/80'
            : isWarning
            ? 'bg-slate-900 text-amber-300 border-amber-800/80'
            : isError
            ? 'bg-slate-900 text-rose-300 border-rose-800/80'
            : 'bg-slate-900 text-slate-200 border-slate-700'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : isWarning ? (
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
        ) : (
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
        )}
        <p>{notification.message}</p>
      </div>
    </div>
  );
}
