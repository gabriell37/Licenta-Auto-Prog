import { Check, XCircle } from 'lucide-react';
import { PIPELINE, APPOINTMENT_STATUS_META, type AppointmentStatus } from '@/lib/enums';
import { cn } from '@/lib/utils';

/** Horizontal pipeline tracker: shows progress through confirmed → ... → delivered. */
export function StatusTracker({ status }: { status: AppointmentStatus }) {
  if (status === 'CANCELLED' || status === 'NO_SHOW') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-subtle p-4 text-danger-fg">
        <XCircle className="h-5 w-5" aria-hidden />
        <span className="font-medium">{APPOINTMENT_STATUS_META[status].ro}</span>
      </div>
    );
  }
  const current = PIPELINE.indexOf(status);
  const idx = current === -1 ? 0 : current;

  return (
    <ol className="flex items-center" aria-label="Status programare">
      {PIPELINE.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        const meta = APPOINTMENT_STATUS_META[s];
        return (
          <li key={s} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <span className={cn('h-0.5 flex-1', i === 0 ? 'opacity-0' : done || active ? 'bg-brand' : 'bg-border')} />
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  done ? 'bg-brand text-fg-on-brand' : active ? 'bg-brand text-fg-on-brand ring-4 ring-brand-subtle' : 'bg-surface-3 text-fg-subtle'
                )}
                aria-current={active ? 'step' : undefined}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cn('h-0.5 flex-1', i === PIPELINE.length - 1 ? 'opacity-0' : done ? 'bg-brand' : 'bg-border')} />
            </div>
            <span className={cn('mt-1.5 hidden text-center text-[11px] leading-tight sm:block', active ? 'font-semibold text-fg' : 'text-fg-subtle')}>
              {meta.ro}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
