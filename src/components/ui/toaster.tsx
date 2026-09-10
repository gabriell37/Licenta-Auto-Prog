'use client';

import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from 'next-themes';

/** Single app-wide toast surface. Use `toast` from 'sonner' for success/error feedback. */
export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      position="top-center"
      theme={(resolvedTheme as 'light' | 'dark') ?? 'system'}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'rounded-xl border border-border bg-surface text-fg shadow-lg',
        },
      }}
    />
  );
}

export { toast } from 'sonner';
