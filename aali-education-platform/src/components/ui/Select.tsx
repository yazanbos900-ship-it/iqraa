import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-xl">
          <select
            id={selectId}
            ref={ref}
            className={`block w-full min-h-12 appearance-none rounded-xl text-sm bg-white border transition-colors duration-150 text-slate-900 ps-3.5 pe-10 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer ${
              error
                ? 'border-rose-400 focus:ring-rose-500'
                : 'border-slate-300 hover:border-slate-400'
            } ${className}`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none text-slate-400">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
