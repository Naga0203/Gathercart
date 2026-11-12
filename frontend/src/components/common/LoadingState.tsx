import React from 'react';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <Loader2
      className={`animate-spin text-emerald-700 dark:text-emerald-500 ${sizeMap[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export interface LoadingStateProps {
  message?: string;
  submessage?: string;
  minHeight?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading pool details...',
  submessage = 'Connecting to local co-op network',
  minHeight = 'min-h-[240px]',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 ${minHeight} ${className}`}
    >
      <Spinner size="lg" />
      {message && (
        <h4 className="mt-4 text-sm font-bold text-slate-800 dark:text-slate-200">
          {message}
        </h4>
      )}
      {submessage && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {submessage}
        </p>
      )}
    </div>
  );
};

