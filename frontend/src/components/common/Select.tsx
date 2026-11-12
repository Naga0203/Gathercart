import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, placeholder, leftIcon, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative rounded-xl shadow-xs">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              {leftIcon}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            className={`block w-full appearance-none rounded-xl border text-sm transition focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 dark:disabled:bg-slate-900 ${
              leftIcon ? 'pl-11' : 'pl-4'
            } pr-10 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-600 dark:focus:ring-rose-950'
                : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100 dark:border-slate-700 dark:focus:border-emerald-500 dark:focus:ring-emerald-950'
            } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-slate-400">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={String(option.value)}
                value={option.value}
                disabled={option.disabled}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

