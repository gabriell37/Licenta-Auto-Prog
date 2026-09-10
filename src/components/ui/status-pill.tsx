import * as React from 'react';
import { cn } from '@/lib/utils';
import { APPOINTMENT_STATUS_META, type AppointmentStatus } from '@/lib/enums';

/**
 * Status pill that pairs a hue with a label (and dot) — color is never the only signal,
 * satisfying WCAG 1.4.1 (use of color). Color comes from the pipeline status token.
 */
export function StatusPill({
  status,
  className,
  locale = 'ro',
}: {
  status: AppointmentStatus;
  className?: string;
  locale?: 'ro' | 'en';
}) {
  const meta = APPOINTMENT_STATUS_META[status];
  const color = `rgb(var(--${meta.token}))`;
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', className)}
      style={{ color, backgroundColor: `rgb(var(--${meta.token}) / 0.12)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      {locale === 'ro' ? meta.ro : meta.en}
    </span>
  );
}
