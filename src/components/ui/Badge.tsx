import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const base = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide';

  const variants = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    success: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950/50',
    warning: 'bg-amber-950/80 text-amber-300 border border-amber-500/40',
    danger: 'bg-rose-950/80 text-rose-300 border border-rose-500/40 animate-pulse shadow-sm shadow-rose-950/50',
    outline: 'bg-transparent text-slate-300 border border-slate-700',
    info: 'bg-blue-950/80 text-blue-300 border border-blue-500/40',
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], className))} {...props}>
      {children}
    </span>
  );
};
