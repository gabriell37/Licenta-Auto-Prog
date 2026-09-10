import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from './prisma';
import { parseJson } from './utils';
import { APP_TZ, atTime, dayEnd, dayStart, toDayKey, weekdayOf } from './dates';

export type Slot = { iso: string; label: string };

const STEP_MIN = 30;

type Db = PrismaClient | Prisma.TransactionClient;

type SlotOptions = {
  /** Ignore this appointment when counting overlaps (used by reschedule). */
  excludeAppointmentId?: string;
  /** Run queries on a transaction client so the pick is atomic with the create. */
  db?: Db;
};

/**
 * Generate available start-times for a shop on a given day (Romania-local).
 * `dateInput` accepts a `YYYY-MM-DD` key or a full ISO datetime.
 * Capacity = number of ACTIVE resources; a slot is available while fewer
 * concurrent appointments than capacity overlap it. Excludes past times.
 */
export async function getAvailableSlots(
  shopId: string,
  dateInput: string,
  durationMin: number,
  opts: SlotOptions = {}
): Promise<Slot[]> {
  const key = toDayKey(dateInput);
  if (!key || !Number.isFinite(durationMin) || durationMin <= 0) return [];
  const weekday = weekdayOf(key);

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      openingHours: true,
      _count: { select: { resources: { where: { active: true } } } },
    },
  });
  if (!shop) return [];

  const hours = parseJson<{ day: number; open: string; close: string }[]>(shop.openingHours, []);
  const today = hours.find((h) => h.day === weekday);
  if (!today) return []; // closed

  const capacity = Math.max(1, shop._count.resources);

  const windowStart = dayStart(key);
  const windowEnd = dayEnd(key);
  const existing = await prisma.appointment.findMany({
    where: {
      shopId,
      // overlap with the day window (also catches appointments spanning midnight)
      startAt: { lt: windowEnd },
      endAt: { gt: windowStart },
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      ...(opts.excludeAppointmentId ? { id: { not: opts.excludeAppointmentId } } : {}),
    },
    select: { startAt: true, endAt: true },
  });

  const open = atTime(key, today.open || '08:00');
  const close = atTime(key, today.close || '18:00');

  const labelFmt = new Intl.DateTimeFormat('ro-RO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: APP_TZ,
  });

  const slots: Slot[] = [];
  const now = Date.now();
  for (
    let start = open.getTime();
    start + durationMin * 60000 <= close.getTime();
    start += STEP_MIN * 60000
  ) {
    const end = start + durationMin * 60000;
    if (start < now) continue; // no past slots

    const overlapping = existing.filter(
      (a) => a.startAt.getTime() < end && a.endAt.getTime() > start
    ).length;
    if (overlapping < capacity) {
      slots.push({ iso: new Date(start).toISOString(), label: labelFmt.format(new Date(start)) });
    }
  }
  return slots;
}

/**
 * Server-side validation that a requested start time is a slot the shop
 * actually offers (opening hours, grid alignment, capacity). Never trust the
 * client-picked ISO string alone.
 */
export async function isSlotBookable(
  shopId: string,
  startAt: Date,
  durationMin: number,
  opts: SlotOptions = {}
): Promise<boolean> {
  if (isNaN(startAt.getTime())) return false;
  const offered = await getAvailableSlots(shopId, startAt.toISOString(), durationMin, opts);
  const wanted = startAt.getTime();
  return offered.some((s) => new Date(s.iso).getTime() === wanted);
}

/** Pick a free resource for a confirmed start/end (first non-overlapping active resource). */
export async function pickFreeResource(
  shopId: string,
  startAt: Date,
  endAt: Date,
  opts: SlotOptions = {}
): Promise<string | null> {
  const db = opts.db ?? prisma;
  const resources = await db.resource.findMany({
    where: { shopId, active: true },
    orderBy: { sortOrder: 'asc' },
  });
  if (resources.length === 0) return null;
  const overlapping = await db.appointment.findMany({
    where: {
      shopId,
      resourceId: { not: null },
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
      ...(opts.excludeAppointmentId ? { id: { not: opts.excludeAppointmentId } } : {}),
    },
    select: { resourceId: true },
  });
  const busy = new Set(overlapping.map((a) => a.resourceId));
  return resources.find((r) => !busy.has(r.id))?.id ?? null;
}
