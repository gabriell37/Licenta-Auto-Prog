import Link from 'next/link';
import type { Metadata } from 'next';
import { CalendarDateNav } from '@/components/pro/calendar-date-nav';
import { NoShopState } from '@/components/pro/no-shop-state';
import { requireShopAccess, getActiveShop } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { dayKey, toDayKey, dayStart, dayEnd, minutesOfDay } from '@/lib/dates';
import { APPOINTMENT_STATUS_META, type AppointmentStatus } from '@/lib/enums';
import { formatTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'Calendar Pro' };

const START_HOUR = 8;
const END_HOUR = 19;
const ROW_H = 56; // px per hour
const GRID_START_MIN = START_HOUR * 60;
const GRID_END_MIN = END_HOUR * 60;
const MIN_BLOCK_MIN = 30;

export default async function ProCalendarPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  const user = await requireShopAccess();
  const shop = await getActiveShop(user);
  if (!shop) return <NoShopState isAdmin={user.role === 'ADMIN'} />;

  const key = toDayKey(date) ?? dayKey(new Date());

  const [resources, appts] = await Promise.all([
    prisma.resource.findMany({ where: { shopId: shop.id, active: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.appointment.findMany({
      where: { shopId: shop.id, startAt: { gte: dayStart(key), lte: dayEnd(key) }, status: { notIn: ['CANCELLED'] } },
      include: { user: { select: { name: true } }, vehicle: { select: { make: true, model: true } }, items: { select: { name: true } } },
    }),
  ]);

  const resourceIds = new Set(resources.map((r) => r.id));
  const columns = [...resources, { id: '__none__', name: 'Nealocat', type: '', shopId: shop.id, capabilities: '[]', active: true, sortOrder: 99 }];
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  // Clamp blocks into the 08:00–19:00 grid: early/late appointments pin to the
  // edges instead of rendering with negative tops or spilling past the bottom.
  function blockStyle(start: Date, end: Date) {
    const rawStart = minutesOfDay(start);
    const durMin = Math.max(MIN_BLOCK_MIN, (end.getTime() - start.getTime()) / 60000);
    const startMin = Math.min(Math.max(rawStart, GRID_START_MIN), GRID_END_MIN - MIN_BLOCK_MIN);
    const endMin = Math.min(Math.max(rawStart + durMin, startMin + MIN_BLOCK_MIN), GRID_END_MIN);
    return { top: ((startMin - GRID_START_MIN) / 60) * ROW_H, height: ((endMin - startMin) / 60) * ROW_H - 4 };
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Calendar</h1>
        <CalendarDateNav dateKey={key} />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface scroll-thin">
        <div className="flex min-w-[640px]">
          {/* Hour gutter */}
          <div className="w-14 shrink-0 border-r border-border">
            <div className="h-10 border-b border-border" />
            {hours.map((h) => (
              <div key={h} className="relative border-b border-border text-right" style={{ height: ROW_H }}>
                <span className="absolute -top-2 right-1.5 text-[11px] text-fg-subtle">{h}:00</span>
              </div>
            ))}
          </div>

          {/* Resource columns */}
          {columns.map((res) => {
            // Appointments on inactive/deleted resources land in "Nealocat" instead of disappearing.
            const colAppts = appts.filter((a) => {
              const col = a.resourceId && resourceIds.has(a.resourceId) ? a.resourceId : '__none__';
              return col === res.id;
            });
            return (
              <div key={res.id} className="min-w-[160px] flex-1 border-r border-border last:border-r-0">
                <div className="flex h-10 items-center justify-center border-b border-border px-2 text-center text-xs font-semibold text-fg">
                  {res.name}
                </div>
                <div className="relative" style={{ height: hours.length * ROW_H }}>
                  {hours.map((h) => <div key={h} className="border-b border-border/60" style={{ height: ROW_H }} />)}
                  {colAppts.map((a) => {
                    const s = blockStyle(a.startAt, a.endAt);
                    const meta = APPOINTMENT_STATUS_META[a.status as AppointmentStatus];
                    return (
                      <Link
                        key={a.id}
                        href={`/pro/appointments/${a.id}`}
                        className="absolute left-1 right-1 overflow-hidden rounded-md border p-1.5 text-[11px] leading-tight shadow-sm transition-transform hover:z-10 hover:scale-[1.02]"
                        style={{ top: s.top + 4, height: s.height, backgroundColor: `rgb(var(--${meta.token}) / 0.14)`, borderColor: `rgb(var(--${meta.token}) / 0.5)` }}
                      >
                        <span className="font-semibold text-fg">{formatTime(a.startAt)} · {a.user.name}</span>
                        <span className="block truncate text-fg-muted">{a.vehicle ? `${a.vehicle.make} ${a.vehicle.model}` : a.items[0]?.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {appts.length === 0 && <p className="mt-4 text-center text-sm text-fg-muted">Nicio programare în această zi.</p>}
    </div>
  );
}
