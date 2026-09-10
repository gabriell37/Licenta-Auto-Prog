'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toaster';
import { saveDviAction } from '@/app/actions/pro';
import { DVI_SEVERITIES, DVI_SEVERITY_META, type DviSeverity } from '@/lib/enums';
import { cn } from '@/lib/utils';

type Item = { name: string; severity: DviSeverity; note: string };

const PRESETS = ['Frâne față', 'Frâne spate', 'Anvelope', 'Ulei motor', 'Lichid frână', 'Baterie', 'Suspensie', 'Lumini'];

export function DviBuilder({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [items, setItems] = React.useState<Item[]>(PRESETS.slice(0, 4).map((name) => ({ name, severity: 'OK', note: '' })));
  const [pending, start] = React.useTransition();

  function update(i: number, patch: Partial<Item>) { setItems((p) => p.map((it, idx) => (idx === i ? { ...it, ...patch } : it))); }
  function add(name = '') { setItems((p) => [...p, { name, severity: 'OK', note: '' }]); }
  function remove(i: number) { setItems((p) => p.filter((_, idx) => idx !== i)); }

  function save() {
    const valid = items.filter((it) => it.name.trim());
    if (valid.length === 0) { toast.error('Adaugă cel puțin un punct de verificare.'); return; }
    start(async () => {
      const res = await saveDviAction(appointmentId, valid.map((it) => ({ name: it.name, severity: it.severity, note: it.note || undefined })));
      if (res.ok) { toast.success('Inspecția (DVI) a fost salvată și trimisă.'); router.refresh(); }
      else toast.error(res.error ?? 'Eroare.');
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface-2 p-2">
            <div className="flex items-center gap-2">
              <Input value={it.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="Punct verificat" className="h-9 flex-1" aria-label="Punct verificat" />
              <Button variant="ghost" size="icon-sm" onClick={() => remove(i)} aria-label="Șterge"><Trash2 className="h-4 w-4 text-danger" /></Button>
            </div>
            <div className="mt-2 flex gap-1.5" role="radiogroup" aria-label={`Severitate ${it.name}`}>
              {DVI_SEVERITIES.map((sev) => {
                const meta = DVI_SEVERITY_META[sev];
                const on = it.severity === sev;
                return (
                  <button key={sev} type="button" role="radio" aria-checked={on} onClick={() => update(i, { severity: sev })}
                    className={cn('flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors',
                      on ? '' : 'border-border bg-surface text-fg-muted hover:bg-surface-3')}
                    style={on ? { borderColor: `rgb(var(--${meta.token}))`, backgroundColor: `rgb(var(--${meta.token}) / 0.14)`, color: `rgb(var(--${meta.token}-fg))` } : undefined}>
                    {meta.ro}
                  </button>
                );
              })}
            </div>
            {it.severity !== 'OK' && (
              <Input value={it.note} onChange={(e) => update(i, { note: e.target.value })} placeholder="Detalii / recomandare" className="mt-2 h-9" aria-label="Notă" />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button key={p} type="button" onClick={() => add(p)} className="rounded-full border border-border-strong bg-surface px-2.5 py-1 text-xs text-fg-muted hover:bg-surface-2">
            <Plus className="mr-0.5 inline h-3 w-3" />{p}
          </button>
        ))}
      </div>

      <Button onClick={save} loading={pending} className="w-full"><ClipboardCheck className="h-4 w-4" /> Salvează inspecția (DVI)</Button>
    </div>
  );
}
