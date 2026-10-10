import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-xl">
          {leftIcon && (
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`block w-full min-h-12 rounded-xl text-sm bg-white border transition-colors duration-150 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 ${
              leftIcon ? 'ps-10' : 'ps-3.5'
            } ${rightIcon ? 'pe-10' : 'pe-3.5'} py-3 ${
              error
                ? 'border-rose-400 focus:ring-rose-500'
                : 'border-slate-300 hover:border-slate-400'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
