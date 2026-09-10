import type { Metadata } from 'next';
import { StatusPill } from '@/components/ui/status-pill';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDateTime, formatRON } from '@/lib/utils';
import type { AppointmentStatus } from '@/lib/enums';

export const metadata: Metadata = { title: 'Admin — Programări' };

export default async function AdminAppointmentsPage() {
  await requireAdmin();
  const appts = await prisma.appointment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { name: true } }, shop: { select: { name: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Programări (toată platforma)</h1>

      <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-surface scroll-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-subtle">
              <th className="p-3 font-medium">Client</th>
              <th className="p-3 font-medium">Service</th>
              <th className="hidden p-3 font-medium md:table-cell">Data</th>
              <th className="p-3 font-medium">Status</th>
              <th className="hidden p-3 text-right font-medium sm:table-cell">Valoare</th>
            </tr>
          </thead>
          <tbody>
            {appts.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium text-fg">{a.user.name}</td>
                <td className="p-3 text-fg-muted">{a.shop.name}</td>
                <td className="hidden p-3 text-fg-muted md:table-cell">{formatDateTime(a.startAt)}</td>
                <td className="p-3"><StatusPill status={a.status as AppointmentStatus} /></td>
                <td className="hidden p-3 text-right font-medium text-fg sm:table-cell">{a.estimateBani ? formatRON(a.estimateBani) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
