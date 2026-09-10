import Link from 'next/link';
import type { Metadata } from 'next';
import { CalendarDays, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { AppointmentCard } from '@/components/appointment/appointment-card';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TERMINAL_STATUSES } from '@/lib/enums';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Programările mele' };

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const user = await requireUser('/appointments');
  const isPast = tab === 'past';

  // partition on status, not date: an IN_PROGRESS appointment from this morning
  // is still "upcoming" work; only terminal ones belong to history
  const appointments = await prisma.appointment.findMany({
    where: {
      userId: user.id,
      status: isPast ? { in: [...TERMINAL_STATUSES] } : { notIn: [...TERMINAL_STATUSES] },
    },
    orderBy: { startAt: isPast ? 'desc' : 'asc' },
    include: { shop: { select: { name: true, locality: true } }, vehicle: { select: { make: true, model: true } }, items: { select: { name: true } } },
  });

  return (
    <div className="container max-w-3xl py-6 md:py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Programările mele</h1>

      {/* Tabs */}
      <div className="mt-4 inline-flex rounded-lg border border-border bg-surface-2 p-1" role="tablist">
        <TabLink href="/appointments" active={!isPast}>Viitoare</TabLink>
        <TabLink href="/appointments?tab=past" active={isPast}>Istoric</TabLink>
      </div>

      <div className="mt-5">
        {appointments.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={isPast ? 'Niciun istoric încă' : 'Nicio programare viitoare'}
            description={isPast ? 'Programările finalizate vor apărea aici.' : 'Caută un service și fă-ți prima programare în câteva secunde.'}
            action={!isPast ? <Button asChild><Link href="/search"><Search className="h-4 w-4" /> Caută service</Link></Button> : undefined}
          />
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <AppointmentCard key={a.id} appointment={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={cn('rounded-md px-4 py-1.5 text-sm font-medium transition-colors', active ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg')}
    >
      {children}
    </Link>
  );
}
