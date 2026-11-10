import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export interface CountdownTimerProps {
  label?: string;
  isUrgent?: boolean;
  className?: string;
  icon?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  label = 'ends soon',
  isUrgent = false,
  className = '',
  icon = true,
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md ${
        isUrgent
          ? 'bg-amber-100/90 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800'
          : 'bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
      } ${className}`}
    >
      {icon && (
        isUrgent ? (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        )
      )}
      <span>{label}</span>
    </div>
  );
};

