'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/toaster';
import { updateAppointmentStatusAction } from '@/app/actions/pro';
import { PIPELINE, APPOINTMENT_TRANSITIONS, APPOINTMENT_STATUS_META, canTransition, type AppointmentStatus } from '@/lib/enums';

export function StatusUpdater({ appointmentId, status }: { appointmentId: string; status: AppointmentStatus }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [target, setTarget] = React.useState<string>(status);

  // After a successful update + refresh the server sends a new status prop;
  // re-sync so the select doesn't keep offering stale transitions.
  React.useEffect(() => setTarget(status), [status]);

  const allowed = APPOINTMENT_TRANSITIONS[status] ?? [];
  const idx = PIPELINE.indexOf(status);
  const pipelineNext = idx >= 0 && idx < PIPELINE.length - 1 ? PIPELINE[idx + 1] : null;
  const next = pipelineNext && canTransition(status, pipelineNext) ? pipelineNext : null;

  function update(to: string) {
    if (to === 'CANCELLED' || to === 'NO_SHOW') {
      const label = APPOINTMENT_STATUS_META[to as AppointmentStatus].ro;
      if (!confirm(`Sigur marchezi programarea ca „${label}”? Clientul va fi notificat.`)) return;
    }
    start(async () => {
      const res = await updateAppointmentStatusAction(appointmentId, to);
      if (res.ok) { toast.success('Status actualizat. Clientul a fost notificat.'); router.refresh(); }
      else toast.error(res.error ?? 'Eroare.');
    });
  }

  if (allowed.length === 0) {
    return <p className="text-sm text-fg-muted">Programarea este în starea finală „{APPOINTMENT_STATUS_META[status].ro}” — statusul nu mai poate fi schimbat.</p>;
  }

  return (
    <div className="space-y-3">
      {next && (
        <Button onClick={() => update(next)} loading={pending} className="w-full" size="lg">
          <ArrowRight className="h-4 w-4" /> Avansează la „{APPOINTMENT_STATUS_META[next].ro}”
        </Button>
      )}
      <div className="flex gap-2">
        <Select value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Setează status">
          <option value={status} disabled>{APPOINTMENT_STATUS_META[status].ro} (curent)</option>
          {allowed.map((s) => (
            <option key={s} value={s}>{APPOINTMENT_STATUS_META[s].ro}</option>
          ))}
        </Select>
        <Button variant="outline" onClick={() => update(target)} loading={pending} disabled={target === status}>
          <Check className="h-4 w-4" /> Setează
        </Button>
      </div>
    </div>
  );
}
