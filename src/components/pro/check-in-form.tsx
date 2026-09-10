'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/ui/field';
import { toast } from '@/components/ui/toaster';
import { checkInAction } from '@/app/actions/pro';

export function CheckInForm({ appointmentId, currentMileage }: { appointmentId: string; currentMileage?: number | null }) {
  const router = useRouter();
  const [mileage, setMileage] = React.useState(currentMileage?.toString() ?? '');
  const [fuel, setFuel] = React.useState(50);
  const [notes, setNotes] = React.useState('');
  const [pending, start] = React.useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await checkInAction(appointmentId, {
        mileageIn: mileage ? Number(mileage) : undefined,
        fuelLevel: fuel,
        intakeNotes: notes || undefined,
      });
      if (res.ok) { toast.success('Check-in realizat. Fișa de lucru a fost deschisă.'); router.refresh(); }
      else toast.error(res.error ?? 'Eroare.');
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Kilometraj la primire" htmlFor="mileage">
        <Input id="mileage" type="number" inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="ex: 124000" min={0} max={2_000_000} step={1} />
      </Field>
      <div>
        <label htmlFor="fuel" className="mb-1.5 block text-sm font-medium text-fg">Nivel combustibil: <span className="text-brand">{fuel}%</span></label>
        <input id="fuel" type="range" min={0} max={100} step={5} value={fuel} onChange={(e) => setFuel(Number(e.target.value))} className="w-full accent-[rgb(var(--brand))]" />
      </div>
      <Field label="Observații la primire" htmlFor="notes">
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={1000} placeholder="ex: zgârietură ușă stânga, lipsă capac roată…" />
      </Field>
      <Button type="submit" loading={pending} className="w-full"><LogIn className="h-4 w-4" /> Înregistrează primirea mașinii</Button>
    </form>
  );
}
