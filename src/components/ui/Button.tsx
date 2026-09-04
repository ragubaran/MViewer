import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'accent' | 'emerald';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm',
      outline: 'border border-slate-700 bg-slate-900/50 text-slate-200 hover:bg-slate-800 hover:text-white',
      ghost: 'text-slate-300 hover:bg-slate-800 hover:text-white',
      secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700',
      destructive: 'bg-rose-600 text-white hover:bg-rose-500',
      accent: 'bg-indigo-600 text-white hover:bg-indigo-500',
      emerald: 'bg-emerald-600 text-white hover:bg-emerald-500',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-3.5 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
