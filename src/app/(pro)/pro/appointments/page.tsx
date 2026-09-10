import Link from 'next/link';
import type { Metadata } from 'next';
import { ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusPill } from '@/components/ui/status-pill';
import { EmptyState } from '@/components/ui/empty-state';
import { NoShopState } from '@/components/pro/no-shop-state';
import { requireShopAccess, getActiveShop } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cn, formatDateTime } from '@/lib/utils';
import type { Prisma } from '@prisma/client';
import { type AppointmentStatus as AS } from '@/lib/enums';

export const metadata: Metadata = { title: 'Programări Pro' };

const FILTERS = [
  { key: 'active', label: 'Active' },
  { key: 'action', label: 'Necesită acțiune' },
  { key: 'done', label: 'Finalizate' },
  { key: 'all', label: 'Toate' },
];

const PAGE_SIZE = 100;

export default async function ProAppointmentsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter: rawFilter } = await searchParams;
  const filter = FILTERS.some((f) => f.key === rawFilter) ? rawFilter! : 'active';
  const user = await requireShopAccess();
  const shop = await getActiveShop(user);
  if (!shop) return <NoShopState isAdmin={user.role === 'ADMIN'} />;

  const where: Prisma.AppointmentWhereInput = { shopId: shop.id };
  if (filter === 'active') where.status = { in: ['REQUESTED', 'CONFIRMED', 'RECEIVED', 'DIAGNOSING', 'AWAITING_APPROVAL', 'IN_PROGRESS', 'READY'] };
  else if (filter === 'action') where.status = { in: ['REQUESTED', 'AWAITING_APPROVAL'] };
  else if (filter === 'done') where.status = { in: ['DELIVERED', 'CANCELLED', 'NO_SHOW'] };

  const appts = await prisma.appointment.findMany({
    where,
    orderBy: { startAt: filter === 'done' ? 'desc' : 'asc' },
    include: { user: { select: { name: true } }, vehicle: { select: { make: true, model: true, plate: true } }, items: { select: { name: true } } },
    take: PAGE_SIZE,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Programări</h1>

      <div className="mt-4 inline-flex flex-wrap gap-1 rounded-lg border border-border bg-surface-2 p-1">
        {FILTERS.map((f) => (
          <Link key={f.key} href={`/pro/appointments?filter=${f.key}`}
            className={cn('rounded-md px-3 py-1.5 text-sm font-medium transition-colors', filter === f.key ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg')}>
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mt-5">
        {appts.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Nicio programare" description="Programările vor apărea aici pe măsură ce clienții se programează." />
        ) : (
          <div className="space-y-2">
            {appts.map((a) => (
              <Link key={a.id} href={`/pro/appointments/${a.id}`} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-3 transition-colors hover:bg-surface-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-fg">{a.user.name}</p>
                    {a.vehicle?.plate && <span className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] uppercase text-fg-muted">{a.vehicle.plate}</span>}
                  </div>
                  <p className="truncate text-sm text-fg-muted">
                    {a.vehicle ? `${a.vehicle.make} ${a.vehicle.model} · ` : ''}{a.items.map((i) => i.name).join(', ')}
                  </p>
                  <p className="text-xs text-fg-subtle">{formatDateTime(a.startAt)}</p>
                </div>
                <StatusPill status={a.status as AS} />
              </Link>
            ))}
            {appts.length === PAGE_SIZE && (
              <p className="pt-2 text-center text-xs text-fg-subtle">Se afișează primele {PAGE_SIZE} de programări.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
