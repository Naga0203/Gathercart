import React from 'react';

export interface ProgressBarProps {
  current: number;
  total: number;
  variant?: 'emerald' | 'amber' | 'blue';
  showLabel?: boolean;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  variant = 'emerald',
  showLabel = false,
  leftLabel,
  rightLabel,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((current / (total || 1)) * 100)));

  const barColors = {
    emerald: 'bg-emerald-600 dark:bg-emerald-500',
    amber: 'bg-amber-500 dark:bg-amber-400',
    blue: 'bg-blue-600 dark:bg-blue-500',
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(showLabel || leftLabel || rightLabel) && (
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
          <span>{leftLabel || `${current} of ${total} pledged`}</span>
          <span>{rightLabel || `${percentage}%`}</span>
        </div>
      )}
      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColors[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

