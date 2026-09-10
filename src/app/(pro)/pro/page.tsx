import Link from 'next/link';
import type { Metadata } from 'next';
import { CalendarDays, TrendingUp, Star, Clock, Car, ArrowRight, CalendarCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusPill } from '@/components/ui/status-pill';
import { EmptyState } from '@/components/ui/empty-state';
import { NoShopState } from '@/components/pro/no-shop-state';
import { requireShopAccess, getActiveShop } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { dayKey, dayStart, dayEnd, addDaysKey, weekStart } from '@/lib/dates';
import { formatRON, formatTime } from '@/lib/utils';
import type { AppointmentStatus } from '@/lib/enums';

export const metadata: Metadata = { title: 'Dashboard Pro' };

export default async function ProDashboard() {
  const user = await requireShopAccess();
  const shop = await getActiveShop(user);
  if (!shop) return <NoShopState isAdmin={user.role === 'ADMIN'} />;

  // Romania-local day/week/month windows (server may run in UTC).
  const now = new Date();
  const todayKey = dayKey(now);
  const startToday = dayStart(todayKey);
  const endToday = dayEnd(todayKey);
  const startWeek = weekStart(now); // Monday — dow-based math broke on Sundays
  const endWeek = dayStart(addDaysKey(dayKey(startWeek), 7));
  const startMonth = dayStart(`${todayKey.slice(0, 8)}01`);

  const [todayAppts, weekCount, monthAgg, pendingCount] = await Promise.all([
    prisma.appointment.findMany({
      where: { shopId: shop.id, startAt: { gte: startToday, lte: endToday }, status: { notIn: ['CANCELLED'] } },
      orderBy: { startAt: 'asc' },
      include: { user: { select: { name: true } }, vehicle: { select: { make: true, model: true, plate: true } }, items: { select: { name: true } } },
    }),
    prisma.appointment.count({ where: { shopId: shop.id, startAt: { gte: startWeek, lt: endWeek }, status: { notIn: ['CANCELLED', 'NO_SHOW'] } } }),
    prisma.appointment.aggregate({ where: { shopId: shop.id, status: 'DELIVERED', startAt: { gte: startMonth } }, _sum: { estimateBani: true } }),
    prisma.appointment.count({ where: { shopId: shop.id, status: { in: ['REQUESTED', 'AWAITING_APPROVAL'] } } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Bună, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-fg-muted">Iată cum arată ziua la {shop.name}.</p>
        </div>
        <Link href="/pro/calendar" className="hidden items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-fg-on-brand hover:bg-brand-hover sm:inline-flex">
          <CalendarDays className="h-4 w-4" /> Calendar
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={CalendarCheck} label="Programări azi" value={String(todayAppts.length)} tone="brand" />
        <Stat icon={Clock} label="Săptămâna aceasta" value={String(weekCount)} tone="info" />
        <Stat icon={TrendingUp} label="Venit luna curentă" value={formatRON(monthAgg._sum.estimateBani ?? 0)} tone="success" />
        <Stat icon={Star} label="Notă medie" value={shop.ratingAvg.toFixed(1)} tone="accent" />
      </div>

      {pendingCount > 0 && (
        <Link href="/pro/appointments?filter=action" className="mt-4 flex items-center gap-2 rounded-xl border border-warning/40 bg-warning-subtle px-4 py-3 text-sm font-medium text-warning-fg transition-colors hover:bg-warning-subtle/70">
          <Clock className="h-4 w-4" /> {pendingCount} programări așteaptă o acțiune (confirmare sau deviz)
          <ArrowRight className="ml-auto h-4 w-4" />
        </Link>
      )}

      {/* Today's schedule */}
      <section className="mt-6">
        <h2 className="mb-3 font-display text-lg font-bold text-fg">Programul de azi</h2>
        {todayAppts.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Nicio programare azi" description="Când clienții se programează, vor apărea aici." />
        ) : (
          <div className="space-y-2">
            {todayAppts.map((a) => (
              <Link key={a.id} href={`/pro/appointments/${a.id}`} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-3 transition-colors hover:bg-surface-2">
                <div className="flex w-16 shrink-0 flex-col items-center rounded-lg bg-brand-subtle py-1.5 text-brand">
                  <span className="text-sm font-bold">{formatTime(a.startAt)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-fg">{a.user.name}</p>
                  <p className="truncate text-sm text-fg-muted">
                    {a.vehicle ? `${a.vehicle.make} ${a.vehicle.model}` : 'Fără mașină'} · {a.items.map((i) => i.name).join(', ')}
                  </p>
                </div>
                <StatusPill status={a.status as AppointmentStatus} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: 'brand' | 'info' | 'success' | 'accent' }) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-subtle text-brand', info: 'bg-info-subtle text-info-fg',
    success: 'bg-success-subtle text-success-fg', accent: 'bg-accent-subtle text-accent-fg',
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-5">
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}><Icon className="h-5 w-5" aria-hidden /></span>
        <div>
          <p className="font-display text-xl font-bold text-fg">{value}</p>
          <p className="text-xs text-fg-muted">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
