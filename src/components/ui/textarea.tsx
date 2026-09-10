'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[88px] w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-fg shadow-xs transition-colors',
        'placeholder:text-fg-subtle resize-y',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-brand',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-danger',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
