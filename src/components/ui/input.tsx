'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-11 w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-fg shadow-xs transition-colors',
        'placeholder:text-fg-subtle',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-brand',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/30',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
