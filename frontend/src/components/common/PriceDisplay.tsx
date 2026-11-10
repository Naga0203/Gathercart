import React from 'react';

export interface PriceDisplayProps {
  price: number;
  mrp?: number;
  unitLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  showSavingsBadge?: boolean;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  mrp,
  unitLabel,
  size = 'md',
  showSavingsBadge = true,
  className = '',
}) => {
  const savings = mrp && mrp > price ? mrp - price : 0;
  const savingsPercent = mrp && mrp > 0 ? Math.round((savings / mrp) * 100) : 0;

  const sizeStyles = {
    sm: {
      price: 'text-base font-bold',
      mrp: 'text-xs',
      badge: 'text-[10px] px-1.5 py-0.5',
    },
    md: {
      price: 'text-xl font-extrabold',
      mrp: 'text-xs',
      badge: 'text-xs px-2 py-0.5',
    },
    lg: {
      price: 'text-3xl font-black',
      mrp: 'text-sm',
      badge: 'text-xs px-2.5 py-1',
    },
  };

  return (
    <div className={`flex flex-wrap items-baseline gap-2 ${className}`}>
      <span className={`text-slate-900 dark:text-white tracking-tight ${sizeStyles[size].price}`}>
        ₹{price.toLocaleString('en-IN')}
      </span>

      {mrp && mrp > price && (
        <span className={`text-slate-400 line-through font-medium ${sizeStyles[size].mrp}`}>
          ₹{mrp.toLocaleString('en-IN')}
        </span>
      )}

      {showSavingsBadge && savings > 0 && (
        <span
          className={`font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md ${sizeStyles[size].badge}`}
        >
          Save ₹{savings.toLocaleString('en-IN')} ({savingsPercent}%)
        </span>
      )}

      {unitLabel && (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">
          / {unitLabel}
        </span>
      )}
    </div>
  );
};

