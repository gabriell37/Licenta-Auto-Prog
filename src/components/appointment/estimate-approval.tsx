'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { approveEstimateAction, rejectEstimateAction } from '@/app/actions/appointments';
import { formatRON } from '@/lib/utils';

type Line = { id: string; description: string; kind: string; qty: number; totalBani: number };
type Estimate = { id: string; status: string; totalBani: number; lines: Line[] };

export function EstimateApproval({ estimate }: { estimate: Estimate }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [acting, setActing] = React.useState<'approve' | 'reject' | null>(null);
  const approved = estimate.status === 'APPROVED';
  const rejected = estimate.status === 'REJECTED';

  function handleApprove() {
    setActing('approve');
    start(async () => {
      const res = await approveEstimateAction(estimate.id);
      if (res.ok) { toast.success('Deviz aprobat. Service-ul poate începe lucrul.'); router.refresh(); }
      else toast.error(res.error ?? 'Eroare.');
    });
  }

  function handleReject() {
    if (!confirm('Refuzi devizul? Service-ul va fi notificat și va decide pașii următori.')) return;
    setActing('reject');
    start(async () => {
      const res = await rejectEstimateAction(estimate.id);
      if (res.ok) { toast.success('Deviz refuzat. Service-ul a fost notificat.'); router.refresh(); }
      else toast.error(res.error ?? 'Eroare.');
    });
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <ul className="divide-y divide-border">
        {estimate.lines.map((l) => (
          <li key={l.id} className="flex items-center justify-between py-2 text-sm">
            <span className="text-fg">{l.description} {l.qty > 1 && <span className="text-fg-subtle">×{l.qty}</span>}</span>
            <span className="font-medium text-fg">{formatRON(l.totalBani)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
        <span className="font-medium text-fg">Total deviz</span>
        <span className="font-display text-lg font-bold text-fg">{formatRON(estimate.totalBani)}</span>
      </div>
      {approved ? (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-success-fg">
          <Check className="h-4 w-4" /> Deviz aprobat
        </p>
      ) : rejected ? (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-danger">
          <X className="h-4 w-4" /> Deviz refuzat
        </p>
      ) : (
        <div className="mt-3 flex gap-2">
          <Button onClick={handleApprove} loading={pending && acting === 'approve'} disabled={pending} className="flex-1">
            <Check className="h-4 w-4" /> Aprob devizul
          </Button>
          <Button
            variant="ghost"
            className="text-danger hover:bg-danger-subtle"
            onClick={handleReject}
            loading={pending && acting === 'reject'}
            disabled={pending}
          >
            <X className="h-4 w-4" /> Refuză devizul
          </Button>
        </div>
      )}
    </div>
  );
}
