'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, XCircle, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { cancelAppointmentAction, rescheduleAppointmentAction } from '@/app/actions/appointments';
import { getSlotsAction } from '@/app/actions/booking';
import type { Slot } from '@/lib/slots';
import { APP_TZ } from '@/lib/dates';

export function AppointmentActions({ id, shopId, durationMin }: { id: string; shopId: string; durationMin: number }) {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [reschedOpen, setReschedOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  // reschedule state
  const [date, setDate] = React.useState('');
  const [slotISO, setSlotISO] = React.useState('');
  const [slots, setSlots] = React.useState<Slot[]>([]);
  const [loading, startSlots] = React.useTransition();

  // Romania-local day keys (YYYY-MM-DD), same convention as the booking wizard
  const days = React.useMemo(() => {
    const keyFmt = new Intl.DateTimeFormat('en-CA', { timeZone: APP_TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
    const weekdayFmt = new Intl.DateTimeFormat('ro-RO', { timeZone: APP_TZ, weekday: 'short' });
    const [y, m, d0] = keyFmt.format(new Date()).split('-').map(Number);
    const out: { key: string; weekday: string; day: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(Date.UTC(y!, m! - 1, d0! + i, 12));
      const key = keyFmt.format(d);
      out.push({ key, weekday: weekdayFmt.format(d), day: Number(key.slice(8, 10)) });
    }
    return out;
  }, []);

  // monotonic id so a slow stale slot response can't overwrite a newer one
  const slotsReqRef = React.useRef(0);

  function pickDay(dayKey: string) {
    setDate(dayKey); setSlotISO('');
    const reqId = ++slotsReqRef.current;
    startSlots(async () => {
      const res = await getSlotsAction(shopId, dayKey, durationMin);
      if (reqId === slotsReqRef.current) setSlots(res);
    });
  }

  async function doCancel() {
    setBusy(true);
    const res = await cancelAppointmentAction(id);
    setBusy(false);
    if (res.ok) { toast.success('Programare anulată.'); setCancelOpen(false); router.refresh(); }
    else toast.error(res.error ?? 'Eroare.');
  }

  async function doReschedule() {
    if (!slotISO) return;
    setBusy(true);
    const res = await rescheduleAppointmentAction(id, slotISO);
    setBusy(false);
    if (res.ok) { toast.success('Programare reprogramată.'); setReschedOpen(false); router.refresh(); }
    else toast.error(res.error ?? 'Eroare.');
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => setReschedOpen(true)}>
        <CalendarClock className="h-4 w-4" /> Reprogramează
      </Button>
      <Button variant="ghost" className="text-danger hover:bg-danger-subtle" onClick={() => setCancelOpen(true)}>
        <XCircle className="h-4 w-4" /> Anulează
      </Button>

      <Modal
        open={cancelOpen} onClose={() => setCancelOpen(false)} size="sm" title="Anulezi programarea?"
        description="Locul tău va fi eliberat pentru alți clienți."
        footer={<>
          <Button variant="ghost" onClick={() => setCancelOpen(false)} disabled={busy}>Renunță</Button>
          <Button variant="danger" onClick={doCancel} loading={busy}>Da, anulează</Button>
        </>}
      >
        <p className="text-sm text-fg-muted">Poți face o nouă programare oricând.</p>
      </Modal>

      <Modal
        open={reschedOpen} onClose={() => setReschedOpen(false)} title="Reprogramează" description="Alege un nou interval."
        footer={<>
          <Button variant="ghost" onClick={() => setReschedOpen(false)} disabled={busy}>Renunță</Button>
          <Button onClick={doReschedule} loading={busy} disabled={!slotISO}>Confirmă noul interval</Button>
        </>}
      >
        <div className="flex gap-2 overflow-x-auto scroll-thin pb-2">
          {days.map((d) => (
            <button key={d.key} onClick={() => pickDay(d.key)} aria-pressed={date === d.key}
              className={cn('flex w-14 shrink-0 flex-col items-center rounded-lg border py-2', date === d.key ? 'border-brand bg-brand text-fg-on-brand' : 'border-border bg-surface text-fg-muted')}>
              <span className="text-xs uppercase">{d.weekday}</span>
              <span className="text-lg font-bold leading-none">{d.day}</span>
            </button>
          ))}
        </div>
        <div className="mt-3" aria-live="polite">
          {!date ? <p className="py-4 text-center text-sm text-fg-subtle">Alege o zi.</p>
            : loading ? <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-brand" /></div>
            : slots.length === 0 ? <p className="py-4 text-center text-sm text-fg-muted">Niciun interval liber.</p>
            : <div className="grid grid-cols-4 gap-2">
                {slots.map((s) => (
                  <button key={s.iso} onClick={() => setSlotISO(s.iso)} aria-pressed={slotISO === s.iso}
                    className={cn('flex items-center justify-center gap-1 rounded-lg border py-2 text-sm', slotISO === s.iso ? 'border-brand bg-brand text-fg-on-brand' : 'border-border bg-surface')}>
                    <Clock className="h-3 w-3" />{s.label}
                  </button>
                ))}
              </div>}
        </div>
      </Modal>
    </div>
  );
}
