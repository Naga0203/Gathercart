import React from 'react';

export type StatusType = 'online' | 'active' | 'warning' | 'error' | 'pending' | 'neutral';

export interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  sublabel?: string;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  sublabel,
  pulse = false,
  size = 'md',
  className = '',
}) => {
  const dotColorMap: Record<StatusType, string> = {
    online: 'bg-emerald-500',
    active: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    pending: 'bg-sky-500',
    neutral: 'bg-slate-400',
  };

  const pingColorMap: Record<StatusType, string> = {
    online: 'bg-emerald-400',
    active: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-rose-400',
    pending: 'bg-sky-400',
    neutral: 'bg-slate-300',
  };

  const sizeMap = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex items-center justify-center">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pingColorMap[status]}`}
          />
        )}
        <span className={`relative inline-flex rounded-full ${sizeMap[size]} ${dotColorMap[status]}`} />
      </span>

      {(label || sublabel) && (
        <span className="inline-flex items-baseline gap-1 text-xs">
          {label && (
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              {sublabel}
            </span>
          )}
        </span>
      )}
    </div>
  );
};

