'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/toaster';
import { createEstimateAction } from '@/app/actions/pro';
import { formatRON } from '@/lib/utils';

type Line = { kind: string; description: string; qty: string; unitPriceRon: string };

const KINDS = [
  { value: 'LABOR', label: 'Manoperă' },
  { value: 'PART', label: 'Piesă' },
  { value: 'SUBLET', label: 'Subcontractare' },
];

export function DevizBuilder({
  appointmentId,
  existing,
  estimateApproved,
}: {
  appointmentId: string;
  existing?: { kind: string; description: string; qty: number; unitPriceBani: number }[];
  estimateApproved?: boolean;
}) {
  const router = useRouter();
  const [lines, setLines] = React.useState<Line[]>(
    existing && existing.length
      ? existing.map((l) => ({ kind: l.kind, description: l.description, qty: String(l.qty), unitPriceRon: (l.unitPriceBani / 100).toString() }))
      : [{ kind: 'LABOR', description: '', qty: '1', unitPriceRon: '' }]
  );
  const [pending, start] = React.useTransition();

  function update(i: number, patch: Partial<Line>) {
    setLines((p) => p.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function add() { setLines((p) => [...p, { kind: 'PART', description: '', qty: '1', unitPriceRon: '' }]); }
  function remove(i: number) { setLines((p) => p.filter((_, idx) => idx !== i)); }

  // Mirror the server: per-line integer bani with Math.round, then sum — so the
  // preview never drifts from what gets stored.
  const lineTotalBani = (l: Line) =>
    Math.round((parseFloat(l.qty) || 0) * (parseFloat(l.unitPriceRon) || 0) * 100);
  const subtotal = lines.reduce((a, l) => a + lineTotalBani(l), 0);
  const vat = Math.round(subtotal * 0.19);
  const total = subtotal + vat;

  function save() {
    const valid = lines.filter((l) => l.description.trim() && parseFloat(l.unitPriceRon || '0') >= 0);
    if (valid.length === 0) { toast.error('Adaugă cel puțin o linie validă.'); return; }
    if (valid.some((l) => !(parseFloat(l.qty) > 0))) {
      toast.error('Cantitatea trebuie să fie mai mare decât 0 pe fiecare linie.');
      return;
    }
    if (estimateApproved && !confirm('Devizul aprobat va fi retrimis spre aprobare. Continui?')) return;
    start(async () => {
      const res = await createEstimateAction(
        appointmentId,
        valid.map((l) => ({
          kind: l.kind, description: l.description, qty: parseFloat(l.qty), unitPriceRon: parseFloat(l.unitPriceRon || '0'),
        })),
        estimateApproved ? { revise: true } : undefined
      );
      if (res.ok) { toast.success('Deviz trimis clientului spre aprobare.'); router.refresh(); }
      else toast.error(res.error ?? 'Eroare.');
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {lines.map((l, i) => (
          <div key={i} className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-surface-2 p-2">
            <div className="w-28">
              <Select value={l.kind} onChange={(e) => update(i, { kind: e.target.value })} aria-label="Tip linie" className="h-9">
                {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </Select>
            </div>
            <div className="min-w-[140px] flex-1">
              <Input value={l.description} onChange={(e) => update(i, { description: e.target.value })} placeholder="Descriere" maxLength={200} className="h-9" aria-label="Descriere" />
            </div>
            <div className="w-16">
              <Input type="number" inputMode="decimal" value={l.qty} onChange={(e) => update(i, { qty: e.target.value })} placeholder="Cant." min={0} max={999} className="h-9" aria-label="Cantitate" />
            </div>
            <div className="w-24">
              <Input type="number" inputMode="decimal" value={l.unitPriceRon} onChange={(e) => update(i, { unitPriceRon: e.target.value })} placeholder="Preț RON" min={0} max={1_000_000} className="h-9" aria-label="Preț unitar" />
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => remove(i)} aria-label="Șterge linia" disabled={lines.length === 1}>
              <Trash2 className="h-4 w-4 text-danger" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={add}><Plus className="h-4 w-4" /> Adaugă linie</Button>

      <div className="space-y-1 rounded-lg border border-border bg-surface p-3 text-sm">
        <Row label="Subtotal" value={formatRON(subtotal)} />
        <Row label="TVA (19%)" value={formatRON(vat)} />
        <div className="flex items-center justify-between border-t border-border pt-1 font-display text-base font-bold text-fg">
          <span>Total</span><span>{formatRON(total)}</span>
        </div>
      </div>

      <Button onClick={save} loading={pending} className="w-full">
        <FileText className="h-4 w-4" /> {estimateApproved ? 'Retrimite devizul spre aprobare' : 'Trimite devizul clientului'}
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between text-fg-muted"><span>{label}</span><span className="font-medium text-fg">{value}</span></div>;
}
