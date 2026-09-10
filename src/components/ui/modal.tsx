'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** On mobile, render as a bottom sheet that slides up. */
  sheetOnMobile?: boolean;
}

/** Accessible modal dialog / bottom sheet with focus trapping, Escape, and backdrop close. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  sheetOnMobile = true,
}: ModalProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const prevFocus = React.useRef<HTMLElement | null>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      const focusable = ref.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }, 50);

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) {
        const items = ref.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (items.length === 0) return;
        const first = items[0]!;
        const last = items[items.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(t);
      prevFocus.current?.focus?.();
    };
  }, [open, onClose]);

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={cn(
              'relative z-10 w-full bg-surface shadow-xl',
              sizes[size],
              sheetOnMobile ? 'rounded-t-2xl sm:rounded-2xl' : 'rounded-2xl',
              'max-h-[92vh] overflow-y-auto scroll-thin'
            )}
            initial={{ opacity: 0, y: sheetOnMobile ? 40 : 12, scale: sheetOnMobile ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: sheetOnMobile ? 40 : 8, scale: sheetOnMobile ? 1 : 0.97 }}
            transition={{ type: 'spring', duration: 0.32, bounce: 0.1 }}
          >
            {(title || true) && (
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  {title && (
                    <h2 id={titleId} className="font-display text-lg font-semibold text-fg">
                      {title}
                    </h2>
                  )}
                  {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
                </div>
                <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Închide">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
            <div className="p-5">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-border p-5 pt-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
