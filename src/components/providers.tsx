'use client';

import * as React from 'react';
import { ThemeProvider } from './ui/theme-provider';
import { Toaster } from './ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
