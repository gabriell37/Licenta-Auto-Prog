'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check, ChevronLeft, ChevronRight, Car, Clock, CalendarDays, Wrench, Plus, MapPin, Loader2, PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MediaUploader } from '@/components/media/media-uploader';
import { toast } from '@/components/ui/toaster';
import { cn, formatRON, formatDuration, formatDate } from '@/lib/utils';
import { FUEL_LABELS_RO, type FuelType } from '@/lib/enums';
import { APP_TZ } from '@/lib/dates';
import { getSlotsAction, createBookingAction } from '@/app/actions/booking';
import type { Slot } from '@/lib/slots';

type Service = { id: string; name: string; durationMin: number; priceFromBani: number; priceType: string };
type Vehicle = { id: string; make: string; model: string; year: number | null; plate: string | null; fuel: string | null; nickname: string | null };

const STEPS = ['Servicii', 'Mașina', 'Data & ora', 'Detalii', 'Confirmare'];

export function BookingWizard({
  shop, services, vehicles, preselectedServiceId, preselectedVehicleId,
}: {
  shop: { id: string; name: string; locality: string | null };
  services: Service[];
  vehicles: Vehicle[];
  preselectedServiceId?: string;
  preselectedVehicleId?: string;
}) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [dir, setDir] = React.useState(1);
  const [selected, setSelected] = React.useState<string[]>(preselectedServiceId ? [preselectedServiceId] : []);
  const [vehicleId, setVehicleId] = React.useState<string>(
    preselectedVehicleId && vehicles.some((v) => v.id === preselectedVehicleId)
      ? preselectedVehicleId
      : vehicles[0]?.id ?? ''
  );
  const [date, setDate] = React.useState<string>('');
  const [slotISO, setSlotISO] = React.useState<string>('');
  const [mode, setMode] = React.useState<'DROP_OFF' | 'WAIT'>('DROP_OFF');
  const [problem, setProblem] = React.useState('');
  const [mediaIds, setMediaIds] = React.useState<string[]>([]);
  const [slots, setSlots] = React.useState<Slot[]>([]);
  const [loadingSlots, startSlots] = React.useTransition();
  const [submitting, setSubmitting] = React.useState(false);

  const chosenServices = services.filter((s) => selected.includes(s.id));
  const totalDuration = chosenServices.reduce((a, s) => a + s.durationMin, 0);
  const totalPrice = chosenServices.reduce((a, s) => a + s.priceFromBani, 0);

  // Day strip in Romania-local calendar days (YYYY-MM-DD keys) — a browser in
  // another timezone would otherwise offer the wrong day around midnight.
  const days = React.useMemo(() => {
    const keyFmt = new Intl.DateTimeFormat('en-CA', { timeZone: APP_TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
    const weekdayFmt = new Intl.DateTimeFormat('ro-RO', { timeZone: APP_TZ, weekday: 'short' });
    const monthFmt = new Intl.DateTimeFormat('ro-RO', { timeZone: APP_TZ, month: 'short' });
    const [y, m, d0] = keyFmt.format(new Date()).split('-').map(Number);
    const out: { key: string; weekday: string; day: number; month: string }[] = [];
    for (let i = 0; i < 14; i++) {
      // UTC noon of each calendar day sidesteps DST-shift duplicates
      const d = new Date(Date.UTC(y!, m! - 1, d0! + i, 12));
      const key = keyFmt.format(d);
      out.push({ key, weekday: weekdayFmt.format(d), day: Number(key.slice(8, 10)), month: monthFmt.format(d) });
    }
    return out;
  }, []);

  // monotonic id so a slow stale slot response can't overwrite a newer one
  const slotsReqRef = React.useRef(0);

  function loadSlots(dayKey: string) {
    setDate(dayKey);
    setSlotISO('');
    const reqId = ++slotsReqRef.current;
    startSlots(async () => {
      const res = await getSlotsAction(shop.id, dayKey, totalDuration || 60);
      if (reqId === slotsReqRef.current) setSlots(res);
    });
  }

  // Interruption-safe draft: leaving mid-booking (e.g. to add a car) and coming
  // back restores services, vehicle, day, slot and notes instead of restarting.
  const draftKey = `autoprog_booking_${shop.id}`;
  const draftRestored = React.useRef(false);
  // saving starts only on the render AFTER restore applied — otherwise the
  // mount-time save (with initial state) would clobber the draft before the
  // restore's setStates land (StrictMode double-effects make this a certainty)
  const [draftReady, setDraftReady] = React.useState(false);
  const skipStaleness = React.useRef(0);

  React.useEffect(() => {
    if (draftRestored.current) return;
    draftRestored.current = true;
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw) as {
          selected?: string[]; vehicleId?: string; date?: string; slotISO?: string;
          mode?: string; problem?: string; step?: number;
        };
        skipStaleness.current = 1;
        const restoredServices = (Array.isArray(d.selected) ? d.selected : []).filter((id) =>
          services.some((s) => s.id === id)
        );
        if (preselectedServiceId && !restoredServices.includes(preselectedServiceId)) {
          restoredServices.push(preselectedServiceId);
        }
        if (restoredServices.length > 0) setSelected(restoredServices);
        // a vehicle freshly created via "Adaugă mașină" (URL param) wins over the draft
        if (!preselectedVehicleId && d.vehicleId && vehicles.some((v) => v.id === d.vehicleId)) {
          setVehicleId(d.vehicleId);
        }
        if (d.mode === 'WAIT' || d.mode === 'DROP_OFF') setMode(d.mode);
        if (typeof d.problem === 'string') setProblem(d.problem);
        if (typeof d.step === 'number') setStep(Math.min(STEPS.length - 1, Math.max(0, d.step)));
        if (d.date) {
          const dayKey = d.date;
          const savedSlot = d.slotISO ?? '';
          const duration = services
            .filter((s) => restoredServices.includes(s.id))
            .reduce((a, s) => a + s.durationMin, 0);
          setDate(dayKey);
          const reqId = ++slotsReqRef.current;
          startSlots(async () => {
            const res = await getSlotsAction(shop.id, dayKey, duration || 60);
            if (reqId !== slotsReqRef.current) return;
            setSlots(res);
            if (savedSlot && res.some((s) => s.iso === savedSlot)) setSlotISO(savedSlot);
          });
        }
      }
    } catch {
      // corrupted draft — start clean
    }
    setDraftReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!draftReady) return;
    try {
      sessionStorage.setItem(
        draftKey,
        JSON.stringify({ selected, vehicleId, date, slotISO, mode, problem, step })
      );
    } catch {
      // storage unavailable — booking still works without the draft
    }
  }, [draftReady, draftKey, selected, vehicleId, date, slotISO, mode, problem, step]);

  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (skipStaleness.current > 0) {
      // change came from the draft restore — keep the restored day/slot
      skipStaleness.current--;
      return;
    }
    // duration changed (services) or vehicle changed → fetched slots are stale
    slotsReqRef.current++;
    setDate('');
    setSlotISO('');
    setSlots([]);
  }, [selected, vehicleId]);

  const canNext =
    (step === 0 && selected.length > 0) ||
    (step === 1 && !!vehicleId) ||
    (step === 2 && !!slotISO) ||
    step === 3 ||
    step === 4;

  function go(d: number) {
    setDir(d);
    setStep((s) => Math.min(STEPS.length - 1, Math.max(0, s + d)));
  }

  async function confirm() {
    setSubmitting(true);
    const res = await createBookingAction({
      shopId: shop.id, vehicleId, serviceIds: selected, startAt: slotISO, mode,
      problemText: problem, mediaIds,
    });
    if (res.ok) {
      try {
        sessionStorage.removeItem(draftKey);
      } catch {
        // ignore — draft simply expires with the session
      }
      toast.success('Programare confirmată! 🎉');
      router.push(`/appointments/${res.appointmentId}`);
    } else if (res.error === 'auth') {
      router.push(`/login?next=${encodeURIComponent(`/book/${shop.id}`)}`);
    } else {
      toast.error(res.error);
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Stepper */}
      <ol className="mb-6 flex items-center gap-1" aria-label="Pași programare">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  i < step ? 'bg-brand text-fg-on-brand' : i === step ? 'bg-brand text-fg-on-brand ring-4 ring-brand-subtle' : 'bg-surface-3 text-fg-subtle'
                )}
                aria-current={i === step ? 'step' : undefined}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cn('hidden text-sm font-medium sm:block', i === step ? 'text-fg' : 'text-fg-subtle')}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={cn('h-0.5 flex-1 rounded', i < step ? 'bg-brand' : 'bg-border')} />}
          </li>
        ))}
      </ol>

      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -24 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* STEP 1 — services */}
            {step === 0 && (
              <Step title="Ce servicii dorești?" subtitle="Poți alege mai multe.">
                <div className="space-y-2">
                  {services.map((s) => {
                    const on = selected.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelected((p) => (on ? p.filter((x) => x !== s.id) : [...p, s.id]))}
                        aria-pressed={on}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all',
                          on ? 'border-brand bg-brand-subtle/50 ring-1 ring-brand' : 'border-border bg-surface hover:bg-surface-2'
                        )}
                      >
                        <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2', on ? 'border-brand bg-brand text-fg-on-brand' : 'border-border-strong')}>
                          {on && <Check className="h-4 w-4" />}
                        </span>
                        <span className="flex-1">
                          <span className="block font-medium text-fg">{s.name}</span>
                          <span className="block text-sm text-fg-muted">{formatDuration(s.durationMin)}</span>
                        </span>
                        <span className="font-semibold text-fg">{s.priceFromBani > 0 ? formatRON(s.priceFromBani, { from: s.priceType === 'FROM' }) : '—'}</span>
                      </button>
                    );
                  })}
                </div>
              </Step>
            )}

            {/* STEP 2 — vehicle */}
            {step === 1 && (
              <Step title="Pentru ce mașină?" subtitle="Alege din garajul tău.">
                {vehicles.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border-strong bg-surface-2 p-6 text-center">
                    <Car className="mx-auto h-8 w-8 text-fg-subtle" />
                    <p className="mt-2 text-sm text-fg-muted">Nu ai nicio mașină în garaj.</p>
                    <Button asChild className="mt-3"><Link href={`/garage/new?next=${encodeURIComponent(`/book/${shop.id}`)}`}><Plus className="h-4 w-4" /> Adaugă o mașină</Link></Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {vehicles.map((v) => {
                      const on = vehicleId === v.id;
                      return (
                        <button
                          key={v.id} type="button" onClick={() => setVehicleId(v.id)} aria-pressed={on}
                          className={cn('flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all',
                            on ? 'border-brand bg-brand-subtle/50 ring-1 ring-brand' : 'border-border bg-surface hover:bg-surface-2')}
                        >
                          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-subtle text-brand"><Car className="h-6 w-6" /></span>
                          <span className="flex-1">
                            <span className="block font-medium text-fg">{v.make} {v.model} {v.year && <span className="text-fg-subtle">{v.year}</span>}</span>
                            <span className="block text-sm text-fg-muted">
                              {[v.plate, v.fuel ? FUEL_LABELS_RO[v.fuel as FuelType] : null, v.nickname].filter(Boolean).join(' · ')}
                            </span>
                          </span>
                          <span className={cn('flex h-6 w-6 items-center justify-center rounded-full border-2', on ? 'border-brand bg-brand text-fg-on-brand' : 'border-border-strong')}>
                            {on && <Check className="h-4 w-4" />}
                          </span>
                        </button>
                      );
                    })}
                    <Button asChild variant="ghost" size="sm" className="mt-1"><Link href={`/garage/new?next=${encodeURIComponent(`/book/${shop.id}`)}`}><Plus className="h-4 w-4" /> Adaugă altă mașină</Link></Button>
                  </div>
                )}
              </Step>
            )}

            {/* STEP 3 — date & time */}
            {step === 2 && (
              <Step title="Când te programezi?" subtitle={`Durată estimată: ${formatDuration(totalDuration || 60)}`}>
                <div className="flex gap-2 overflow-x-auto scroll-thin pb-2" role="group" aria-label="Alege ziua">
                  {days.map((d) => {
                    const on = date === d.key;
                    return (
                      <button
                        key={d.key} type="button" onClick={() => loadSlots(d.key)} aria-pressed={on}
                        className={cn('flex w-16 shrink-0 flex-col items-center gap-0.5 rounded-xl border py-2.5 transition-colors',
                          on ? 'border-brand bg-brand text-fg-on-brand' : 'border-border bg-surface text-fg-muted hover:bg-surface-2')}
                      >
                        <span className="text-xs uppercase">{d.weekday}</span>
                        <span className="text-lg font-bold leading-none">{d.day}</span>
                        <span className="text-[10px] uppercase">{d.month}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4" aria-live="polite">
                  {!date ? (
                    <p className="py-6 text-center text-sm text-fg-subtle">Alege o zi pentru a vedea intervalele libere.</p>
                  ) : loadingSlots ? (
                    <div className="flex items-center justify-center py-8 text-fg-muted"><Loader2 className="h-5 w-5 animate-spin" /></div>
                  ) : slots.length === 0 ? (
                    <p className="py-6 text-center text-sm text-fg-muted">Niciun interval liber în această zi. Încearcă altă dată.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {slots.map((s) => (
                        <button
                          key={s.iso} type="button" onClick={() => setSlotISO(s.iso)} aria-pressed={slotISO === s.iso}
                          className={cn('flex items-center justify-center gap-1 rounded-lg border py-2.5 text-sm font-medium transition-colors',
                            slotISO === s.iso ? 'border-brand bg-brand text-fg-on-brand' : 'border-border bg-surface text-fg hover:bg-surface-2')}
                        >
                          <Clock className="h-3.5 w-3.5" /> {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Step>
            )}

            {/* STEP 4 — details + media */}
            {step === 3 && (
              <Step title="Detalii despre problemă" subtitle="Ajută service-ul să se pregătească.">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {(['DROP_OFF', 'WAIT'] as const).map((m) => (
                      <button
                        key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m}
                        className={cn('rounded-xl border p-3 text-center text-sm font-medium transition-colors',
                          mode === m ? 'border-brand bg-brand-subtle/50 ring-1 ring-brand text-fg' : 'border-border bg-surface text-fg-muted hover:bg-surface-2')}
                      >
                        {m === 'DROP_OFF' ? 'Las mașina' : 'Aștept la service'}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label htmlFor="problem" className="mb-1.5 block text-sm font-medium text-fg">Descrie problema</label>
                    <Textarea id="problem" value={problem} onChange={(e) => setProblem(e.target.value)} rows={3}
                      placeholder="ex: zgomot la frânare, se aprinde un martor, vibrații la viteză mare…" />
                  </div>

                  <div>
                    <p className="mb-1.5 text-sm font-medium text-fg">Adaugă poze, video sau audio</p>
                    <MediaUploader onChange={setMediaIds} />
                  </div>
                </div>
              </Step>
            )}

            {/* STEP 5 — review */}
            {step === 4 && (
              <Step title="Verifică și confirmă" subtitle="Aproape gata!">
                <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
                  <Row icon={MapPin} label="Service">{shop.name}{shop.locality ? `, ${shop.locality}` : ''}</Row>
                  <Row icon={Wrench} label="Servicii">{chosenServices.map((s) => s.name).join(', ')}</Row>
                  <Row icon={Car} label="Mașina">{(() => { const v = vehicles.find((x) => x.id === vehicleId); return v ? `${v.make} ${v.model}` : '—'; })()}</Row>
                  <Row icon={CalendarDays} label="Data">{slotISO ? `${formatDate(slotISO)}, ${new Intl.DateTimeFormat('ro-RO', { hour: '2-digit', minute: '2-digit', timeZone: APP_TZ }).format(new Date(slotISO))}` : '—'}</Row>
                  <Row icon={Clock} label="Durată">{formatDuration(totalDuration || 60)} · {mode === 'DROP_OFF' ? 'las mașina' : 'aștept'}</Row>
                  {mediaIds.length > 0 && <Row icon={Check} label="Atașamente">{mediaIds.length} fișier(e)</Row>}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="font-medium text-fg">Total estimat</span>
                    <span className="font-display text-lg font-bold text-fg">{totalPrice > 0 ? formatRON(totalPrice, { from: true }) : 'la evaluare'}</span>
                  </div>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-fg-muted">
                  <PartyPopper className="h-3.5 w-3.5 text-accent" /> Vei primi confirmare și un reminder cu o zi înainte.
                </p>
              </Step>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer nav — linear, grouped */}
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
        <Button variant="ghost" onClick={() => go(-1)} disabled={step === 0 || submitting}>
          <ChevronLeft className="h-4 w-4" /> Înapoi
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => go(1)} disabled={!canNext} size="lg">
            Continuă <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={confirm} loading={submitting} size="lg" variant="accent">
            <Check className="h-4 w-4" /> Confirmă programarea
          </Button>
        )}
      </div>
    </div>
  );
}

function Step({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold tracking-tight text-fg">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-fg-muted">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" aria-hidden />
      <span className="w-24 shrink-0 text-fg-muted">{label}</span>
      <span className="flex-1 font-medium text-fg">{children}</span>
    </div>
  );
}
