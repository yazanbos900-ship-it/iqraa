import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer active:translate-y-px select-none';

  const sizeStyles = {
    sm: 'text-xs min-h-9 px-3.5 py-2 gap-2',
    md: 'text-sm min-h-11 px-4 py-2.5 gap-2',
    lg: 'text-base min-h-12 px-5.5 py-3 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm border border-indigo-600',
    accent: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm border border-indigo-600',
    secondary: 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-100',
    outline: 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-none',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm border border-rose-600',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
