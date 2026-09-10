'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('block text-sm font-medium text-fg mb-1.5', className)}
      {...props}
    />
  );
}

interface FieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Accessible form field wrapper: label + control + inline error/hint. */
export function Field({ label, htmlFor, error, hint, required, className, children }: FieldProps) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="text-danger ml-0.5" aria-hidden>*</span>}
        </Label>
      )}
      {children}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
