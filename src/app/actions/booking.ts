'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { bookingSchema, type BookingInput } from '@/lib/validators';
import { getAvailableSlots, isSlotBookable, pickFreeResource, type Slot } from '@/lib/slots';
import { toDayKey } from '@/lib/dates';
import { notify, scheduleAppointmentReminder } from '@/lib/notifications';

export async function getSlotsAction(shopId: string, dateInput: string, durationMin: number): Promise<Slot[]> {
  if (typeof shopId !== 'string' || !shopId) return [];
  const key = toDayKey(typeof dateInput === 'string' ? dateInput : null);
  if (!key) return [];
  const duration = Number(durationMin);
  if (!Number.isFinite(duration) || duration <= 0) return [];
  return getAvailableSlots(shopId, key, duration);
}

export type CreateBookingResult =
  | { ok: true; appointmentId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function createBookingAction(input: BookingInput): Promise<CreateBookingResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'auth' };

  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues) fe[String(i.path[0])] = i.message;
    return { ok: false, error: 'Verifică datele programării.', fieldErrors: fe };
  }
  const data = parsed.data;

  // validate session user (stale 30-day cookie), shop, ownership + load services
  const [user, shop, vehicle, services] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId }, select: { id: true } }),
    prisma.shop.findUnique({ where: { id: data.shopId }, select: { id: true, name: true, status: true } }),
    prisma.vehicle.findFirst({ where: { id: data.vehicleId, userId: session.userId } }),
    prisma.service.findMany({ where: { id: { in: data.serviceIds }, shopId: data.shopId, active: true } }),
  ]);
  if (!user) return { ok: false, error: 'Sesiune expirată' };
  if (!shop || shop.status !== 'VERIFIED') return { ok: false, error: 'Service negăsit.' };
  if (!vehicle) return { ok: false, error: 'Alege o mașină din garajul tău.' };
  if (services.length !== new Set(data.serviceIds).size) {
    return { ok: false, error: 'Unul dintre serviciile alese nu mai este disponibil.' };
  }

  const startAt = new Date(data.startAt);
  const totalDuration = services.reduce((sum, s) => sum + s.durationMin, 0);
  const totalPrice = services.reduce((sum, s) => sum + s.priceFromBani, 0);
  const endAt = new Date(startAt.getTime() + totalDuration * 60000);

  // never trust the client-picked ISO: must be a slot the shop actually offers
  if (!(await isSlotBookable(data.shopId, startAt, totalDuration))) {
    return { ok: false, error: 'Intervalul ales nu mai este valid. Alege altă oră.' };
  }

  // attachments must be the user's own uploads, not yet claimed by someone else's appointment
  if (data.mediaIds && data.mediaIds.length > 0) {
    const media = await prisma.media.findMany({
      where: { id: { in: data.mediaIds } },
      select: { uploaderId: true, appointmentId: true, appointment: { select: { userId: true } } },
    });
    const allOwned =
      media.length === new Set(data.mediaIds).size &&
      media.every(
        (m) => m.uploaderId === session.userId && (!m.appointmentId || m.appointment?.userId === session.userId)
      );
    if (!allOwned) return { ok: false, error: 'Atașamentele nu au putut fi verificate. Reîncarcă fișierele.' };
  }

  const appt = await prisma.$transaction(async (tx) => {
    const resourceId = await pickFreeResource(data.shopId, startAt, endAt, { db: tx });
    if (!resourceId) return null;
    const created = await tx.appointment.create({
      data: {
        shopId: data.shopId,
        userId: session.userId,
        vehicleId: data.vehicleId,
        resourceId,
        startAt,
        endAt,
        status: 'CONFIRMED',
        mode: data.mode,
        problemText: data.problemText || null,
        estimateBani: totalPrice,
        readyByAt: endAt,
        source: 'web',
        items: {
          create: services.map((s) => ({ serviceId: s.id, name: s.name, priceBani: s.priceFromBani, durationMin: s.durationMin })),
        },
      },
    });
    if (data.mediaIds && data.mediaIds.length > 0) {
      await tx.media.updateMany({
        where: { id: { in: data.mediaIds }, uploaderId: session.userId },
        data: { appointmentId: created.id },
      });
    }
    return created;
  });
  if (!appt) return { ok: false, error: 'Intervalul tocmai s-a ocupat. Alege altă oră.' };

  // confirmation + reminder — a notification failure must not fail the booking
  try {
    await notify({
      userId: session.userId,
      type: 'APPOINTMENT_CONFIRMED',
      title: 'Programare confirmată',
      body: `Programarea ta la ${shop.name} a fost confirmată.`,
      data: { appointmentId: appt.id },
    });
    await scheduleAppointmentReminder(session.userId, appt.id, startAt, shop.name);
  } catch (err) {
    console.error('booking notification failed', err);
  }

  revalidatePath('/appointments');
  return { ok: true, appointmentId: appt.id };
}
