import React from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const styles = {
    info: {
      container: 'bg-sky-50 border-sky-100 text-sky-950',
      icon: <Info className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />,
    },
    success: {
      container: 'bg-emerald-50 border-emerald-100 text-emerald-950',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />,
    },
    warning: {
      container: 'bg-amber-50 border-amber-100 text-amber-950',
      icon: <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />,
    },
    error: {
      container: 'bg-rose-50 border-rose-100 text-rose-950',
      icon: <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />,
    },
  };

  const current = styles[type];

  return (
    <div
      role="alert"
      className={`border rounded-2xl p-4 sm:p-5 flex items-start gap-3 relative transition-all ${current.container} ${className}`}
    >
      {current.icon}
      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold mb-1 text-sm">{title}</h4>}
        <div className="leading-relaxed opacity-95">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-60 hover:opacity-100 p-1 rounded-md transition-opacity"
          aria-label="إغلاق التنبيه"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
