'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession, requireUser } from '@/lib/auth';
import { messageSchema, reviewSchema } from '@/lib/validators';
import { isSlotBookable, pickFreeResource } from '@/lib/slots';
import { notify, cancelAppointmentReminder, rescheduleAppointmentReminder } from '@/lib/notifications';
import { canTransition, TERMINAL_STATUSES, type AppointmentStatus } from '@/lib/enums';

async function ownedAppointment(id: string, userId: string) {
  return prisma.appointment.findFirst({ where: { id, userId }, include: { shop: true, items: true } });
}

function isTerminal(status: string) {
  return TERMINAL_STATUSES.includes(status as AppointmentStatus);
}

export async function cancelAppointmentAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'auth' };
  const appt = await ownedAppointment(id, session.userId);
  if (!appt) return { ok: false, error: 'Programare negăsită.' };
  if (isTerminal(appt.status)) return { ok: false, error: 'Programarea nu mai poate fi anulată.' };

  await prisma.appointment.update({ where: { id }, data: { status: 'CANCELLED' } });
  try {
    await cancelAppointmentReminder(id);
    await notify({
      userId: session.userId, type: 'APPOINTMENT_CANCELLED', title: 'Programare anulată',
      body: `Programarea ta la ${appt.shop.name} a fost anulată.`, data: { appointmentId: id },
    });
  } catch (err) {
    console.error('cancel notification failed', err);
  }
  revalidatePath('/appointments');
  revalidatePath(`/appointments/${id}`);
  return { ok: true };
}

export async function rescheduleAppointmentAction(id: string, newISO: string): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'auth' };
  const appt = await ownedAppointment(id, session.userId);
  if (!appt) return { ok: false, error: 'Programare negăsită.' };
  if (isTerminal(appt.status)) return { ok: false, error: 'Programarea nu mai poate fi reprogramată.' };

  const start = new Date(newISO);
  if (isNaN(start.getTime())) return { ok: false, error: 'Interval invalid.' };
  const duration = appt.items.reduce((a, i) => a + i.durationMin, 0) || 60;
  const end = new Date(start.getTime() + duration * 60000);

  if (!(await isSlotBookable(appt.shopId, start, duration, { excludeAppointmentId: id }))) {
    return { ok: false, error: 'Intervalul ales nu mai este valid. Alege altă oră.' };
  }
  // only a not-yet-started appointment goes (back) to CONFIRMED; in-shop statuses keep their place in the pipeline
  const status = ['REQUESTED', 'CONFIRMED'].includes(appt.status) ? 'CONFIRMED' : appt.status;
  const moved = await prisma.$transaction(async (tx) => {
    const resourceId = await pickFreeResource(appt.shopId, start, end, {
      excludeAppointmentId: id,
      db: tx,
    });
    if (!resourceId) return false;
    await tx.appointment.update({
      where: { id },
      data: { startAt: start, endAt: end, resourceId, readyByAt: end, status },
    });
    return true;
  });
  if (!moved) return { ok: false, error: 'Intervalul tocmai s-a ocupat. Alege altă oră.' };
  try {
    await rescheduleAppointmentReminder(session.userId, id, start, appt.shop.name);
    await notify({
      userId: session.userId, type: 'APPOINTMENT_RESCHEDULED', title: 'Programare reprogramată',
      body: `Programarea la ${appt.shop.name} a fost mutată.`, data: { appointmentId: id },
    });
  } catch (err) {
    console.error('reschedule notification failed', err);
  }
  revalidatePath('/appointments');
  revalidatePath(`/appointments/${id}`);
  return { ok: true };
}

export async function sendMessageAction(appointmentId: string, body: string): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const appt = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      ...(user.role === 'ADMIN'
        ? {}
        : { OR: [{ userId: user.id }, { shop: { memberships: { some: { userId: user.id, active: true } } } }] }),
    },
  });
  if (!appt) return { ok: false };
  const parsed = messageSchema.safeParse({ appointmentId, body });
  if (!parsed.success) return { ok: false };
  await prisma.message.create({ data: { appointmentId, senderId: user.id, body: parsed.data.body } });
  revalidatePath(`/appointments/${appointmentId}`);
  return { ok: true };
}

export async function approveEstimateAction(estimateId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'auth' };
  const est = await prisma.estimate.findFirst({
    where: { id: estimateId, appointment: { userId: session.userId } },
    include: { appointment: true },
  });
  if (!est) return { ok: false, error: 'Deviz negăsit.' };
  if (est.status !== 'SENT') return { ok: false, error: 'Devizul nu mai poate fi aprobat.' };
  if (est.appointment && isTerminal(est.appointment.status)) {
    return { ok: false, error: 'Programarea este deja încheiată.' };
  }
  await prisma.estimate.update({ where: { id: estimateId }, data: { status: 'APPROVED', approvedAt: new Date() } });
  if (est.appointmentId && est.appointment && canTransition(est.appointment.status, 'IN_PROGRESS')) {
    await prisma.appointment.update({ where: { id: est.appointmentId }, data: { status: 'IN_PROGRESS' } });
  }
  if (est.appointmentId) revalidatePath(`/appointments/${est.appointmentId}`);
  return { ok: true };
}

export async function rejectEstimateAction(estimateId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'auth' };
  const est = await prisma.estimate.findFirst({
    where: { id: estimateId, appointment: { userId: session.userId } },
    include: { appointment: true },
  });
  if (!est) return { ok: false, error: 'Deviz negăsit.' };
  if (est.status !== 'SENT') return { ok: false, error: 'Devizul nu mai poate fi refuzat.' };

  // appointment status stays put — staff decides the next step after a refusal
  await prisma.estimate.update({ where: { id: estimateId }, data: { status: 'REJECTED' } });
  if (est.appointmentId) {
    try {
      await prisma.message.create({
        data: { appointmentId: est.appointmentId, senderId: session.userId, body: 'Am refuzat devizul propus.' },
      });
    } catch (err) {
      console.error('reject estimate message failed', err);
    }
    revalidatePath(`/appointments/${est.appointmentId}`);
  }
  return { ok: true };
}

export async function submitReviewAction(input: unknown): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'auth' };
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Verifică recenzia.' };
  const d = parsed.data;
  const appt = await prisma.appointment.findFirst({
    where: { id: d.appointmentId, userId: session.userId, status: 'DELIVERED' },
    include: { review: true },
  });
  if (!appt) return { ok: false, error: 'Poți recenza doar programări finalizate.' };
  if (appt.review) return { ok: false, error: 'Ai recenzat deja această programare.' };

  try {
    await prisma.review.create({
      data: {
        shopId: appt.shopId, userId: session.userId, appointmentId: appt.id, rating: d.rating,
        ratingPrice: d.ratingPrice, ratingQuality: d.ratingQuality, ratingTimeliness: d.ratingTimeliness, ratingComms: d.ratingComms,
        body: d.body || null,
      },
    });
  } catch (err) {
    // double submit races past the read-check above; the unique index catches it
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { ok: false, error: 'Ai recenzat deja această programare.' };
    }
    throw err;
  }
  // recompute shop aggregate
  const agg = await prisma.review.aggregate({ where: { shopId: appt.shopId, status: 'PUBLISHED' }, _avg: { rating: true }, _count: true });
  await prisma.shop.update({
    where: { id: appt.shopId },
    data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count },
  });
  revalidatePath(`/appointments/${appt.id}`);
  return { ok: true };
}
