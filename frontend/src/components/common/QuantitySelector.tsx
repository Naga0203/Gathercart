import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (newValue: number) => void;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  min = 1,
  max = 3,
  onChange,
  unit,
  size = 'md',
  className = '',
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const btnSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  return (
    <div className={`inline-flex items-center gap-3 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={`${btnSizes[size]} rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-40 disabled:pointer-events-none shadow-xs transition active:scale-95`}
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="text-center min-w-[2.5rem]">
        <span className="font-bold text-slate-900 dark:text-white text-base leading-none">
          {value}
        </span>
        {unit && (
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
            {unit}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={`${btnSizes[size]} rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-40 disabled:pointer-events-none shadow-xs transition active:scale-95`}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

