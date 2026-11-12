import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type AlertVariant = 'error' | 'warning' | 'info' | 'success';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onDismiss,
  action,
  className = '',
}) => {
  const variantStyles = {
    error: {
      container: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />,
      actionBtn: 'text-rose-800 dark:text-rose-300 hover:text-rose-950 underline',
    },
    warning: {
      container: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />,
      actionBtn: 'text-amber-800 dark:text-amber-300 hover:text-amber-950 underline',
    },
    info: {
      container: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900 text-sky-900 dark:text-sky-200',
      icon: <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0" />,
      actionBtn: 'text-sky-800 dark:text-sky-300 hover:text-sky-950 underline',
    },
    success: {
      container: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />,
      actionBtn: 'text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 underline',
    },
  };

  const current = variantStyles[variant];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-2xl border text-xs sm:text-sm shadow-xs ${current.container} ${className}`}
    >
      <div className="mt-0.5">{current.icon}</div>

      <div className="flex-1">
        {title && <h5 className="font-bold mb-0.5">{title}</h5>}
        <div className="leading-relaxed">{children}</div>

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className={`mt-2 font-semibold text-xs block ${current.actionBtn}`}
          >
            {action.label}
          </button>
        )}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg transition"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export const ErrorMessage: React.FC<{ message: string; className?: string }> = ({
  message,
  className = '',
}) => {
  return (
    <Alert variant="error" className={className}>
      {message}
    </Alert>
  );
};

