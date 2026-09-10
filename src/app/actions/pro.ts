'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getStaffForShop } from '@/lib/auth';
import { notify, cancelAppointmentReminder } from '@/lib/notifications';
import { checkInSchema, estimateSchema, dviItemSchema, reviewReplySchema } from '@/lib/validators';
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_STATUS_META,
  TERMINAL_STATUSES,
  canTransition,
  type AppointmentStatus,
} from '@/lib/enums';

const VAT_RATE = 0.19;

type ActionResult = { ok: boolean; error?: string };

const DENIED: ActionResult = { ok: false, error: 'Acces interzis' };

function isUniqueViolation(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';
}

/**
 * Document numbers (FL-/DEV-) come from a count inside the transaction; two
 * concurrent check-ins can still race on @@unique([shopId, number]), so retry
 * the whole transaction once — the second attempt sees the committed row.
 */
async function withNumberRetry(fn: () => Promise<void>): Promise<ActionResult> {
  try {
    await fn();
  } catch (e) {
    if (!isUniqueViolation(e)) throw e;
    try {
      await fn();
    } catch {
      return { ok: false, error: 'Eroare la generarea numărului de document. Încearcă din nou.' };
    }
  }
  return { ok: true };
}

export async function updateAppointmentStatusAction(
  appointmentId: string,
  status: string
): Promise<ActionResult> {
  if (!APPOINTMENT_STATUSES.includes(status as AppointmentStatus)) {
    return { ok: false, error: 'Status invalid' };
  }
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { shop: { select: { name: true } } },
  });
  if (!appt) return { ok: false, error: 'Programare negăsită' };
  const staff = await getStaffForShop(appt.shopId);
  if (!staff) return DENIED;

  if (!canTransition(appt.status, status)) {
    const from = APPOINTMENT_STATUS_META[appt.status as AppointmentStatus]?.ro ?? appt.status;
    const to = APPOINTMENT_STATUS_META[status as AppointmentStatus].ro;
    return { ok: false, error: `Tranziție nepermisă: din „${from}” în „${to}”.` };
  }

  await prisma.appointment.update({ where: { id: appointmentId }, data: { status } });
  if (status === 'CANCELLED' || status === 'NO_SHOW') {
    await cancelAppointmentReminder(appointmentId);
  }
  await notify({
    userId: appt.userId,
    type: 'APPOINTMENT_STATUS',
    title: 'Actualizare programare',
    body: `Status nou la ${appt.shop.name}: ${APPOINTMENT_STATUS_META[status as AppointmentStatus].ro}.`,
    data: { appointmentId },
  });
  revalidatePath(`/pro/appointments/${appointmentId}`);
  revalidatePath('/pro');
  revalidatePath(`/appointments/${appointmentId}`);
  return { ok: true };
}

export async function checkInAction(
  appointmentId: string,
  input: { mileageIn?: number; fuelLevel?: number; intakeNotes?: string }
): Promise<ActionResult> {
  const parsed = checkInSchema.safeParse({ appointmentId, ...input });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Date invalide.' };
  }
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt) return { ok: false, error: 'Programare negăsită' };
  const staff = await getStaffForShop(appt.shopId);
  if (!staff) return DENIED;
  if (appt.status !== 'CONFIRMED' && appt.status !== 'RECEIVED') {
    return { ok: false, error: 'Check-in posibil doar pentru programări confirmate.' };
  }

  const d = parsed.data;
  const fields = {
    mileageIn: d.mileageIn ?? null,
    fuelLevel: d.fuelLevel ?? null,
    intakeNotes: d.intakeNotes || null,
  };

  const result = await withNumberRetry(async () => {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.workOrder.findUnique({ where: { appointmentId } });
      if (existing) {
        await tx.workOrder.update({ where: { appointmentId }, data: fields });
        return;
      }
      const count = await tx.workOrder.count({ where: { shopId: appt.shopId } });
      await tx.workOrder.create({
        data: {
          appointmentId,
          shopId: appt.shopId,
          vehicleId: appt.vehicleId,
          number: `FL-${String(count + 1).padStart(5, '0')}`,
          ...fields,
        },
      });
    });
  });
  if (!result.ok) return result;

  // The odometer only moves forward — never overwrite with a lower reading.
  if (d.mileageIn != null && appt.vehicleId) {
    await prisma.vehicle.updateMany({
      where: { id: appt.vehicleId, OR: [{ mileage: null }, { mileage: { lt: d.mileageIn } }] },
      data: { mileage: d.mileageIn },
    });
  }
  if (appt.status === 'CONFIRMED') {
    await prisma.appointment.update({ where: { id: appointmentId }, data: { status: 'RECEIVED' } });
  }
  revalidatePath(`/pro/appointments/${appointmentId}`);
  return { ok: true };
}

type LineInput = { kind: string; description: string; qty: number; unitPriceRon: number };

export async function createEstimateAction(
  appointmentId: string,
  lines: LineInput[],
  opts?: { revise?: boolean }
): Promise<ActionResult> {
  const parsed = estimateSchema.safeParse({ appointmentId, lines });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Verifică liniile devizului.' };
  }
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { shop: { select: { name: true } }, estimate: { select: { status: true } } },
  });
  if (!appt) return { ok: false, error: 'Programare negăsită' };
  const staff = await getStaffForShop(appt.shopId);
  if (!staff) return DENIED;
  if (TERMINAL_STATUSES.includes(appt.status as AppointmentStatus)) {
    return { ok: false, error: 'Programarea este finalizată sau anulată — devizul nu mai poate fi modificat.' };
  }
  if (appt.estimate?.status === 'APPROVED' && !opts?.revise) {
    return {
      ok: false,
      error: 'Devizul a fost deja aprobat de client. Confirmă retrimiterea pentru a-l înlocui.',
    };
  }

  const computed = parsed.data.lines.map((l) => ({
    kind: l.kind,
    description: l.description,
    qty: l.qty,
    unitPriceBani: Math.round(l.unitPriceRon * 100),
    totalBani: Math.round(l.qty * l.unitPriceRon * 100),
  }));
  const subtotal = computed.reduce((a, l) => a + l.totalBani, 0);
  const tax = Math.round(subtotal * VAT_RATE);
  const total = subtotal + tax;

  const result = await withNumberRetry(async () => {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.estimate.findUnique({ where: { appointmentId } });
      if (existing) {
        await tx.estimate.update({
          where: { appointmentId },
          data: {
            status: 'SENT',
            approvedAt: null,
            subtotalBani: subtotal,
            taxBani: tax,
            totalBani: total,
            lines: { deleteMany: {}, create: computed },
          },
        });
        return;
      }
      const count = await tx.estimate.count({ where: { shopId: appt.shopId } });
      await tx.estimate.create({
        data: {
          shopId: appt.shopId,
          appointmentId,
          vehicleId: appt.vehicleId,
          number: `DEV-${String(count + 1).padStart(5, '0')}`,
          status: 'SENT',
          subtotalBani: subtotal,
          taxBani: tax,
          totalBani: total,
          lines: { create: computed },
        },
      });
    });
  });
  if (!result.ok) return result;

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      estimateBani: total,
      // Only advance the pipeline when the move is legal (e.g. not from READY).
      ...(canTransition(appt.status, 'AWAITING_APPROVAL') ? { status: 'AWAITING_APPROVAL' } : {}),
    },
  });
  await notify({
    userId: appt.userId,
    type: 'ESTIMATE_SENT',
    title: 'Deviz nou de aprobat',
    body: `${appt.shop.name} ți-a trimis un deviz spre aprobare.`,
    data: { appointmentId },
  });
  revalidatePath(`/pro/appointments/${appointmentId}`);
  revalidatePath(`/appointments/${appointmentId}`);
  return { ok: true };
}

type DviInput = { name: string; severity: string; note?: string };

export async function saveDviAction(appointmentId: string, items: DviInput[]): Promise<ActionResult> {
  const parsed = z.array(dviItemSchema).min(1, 'Adaugă cel puțin un punct de verificare.').max(100).safeParse(items);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Verifică punctele de inspecție.' };
  }
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { workOrder: true },
  });
  if (!appt) return { ok: false, error: 'Programare negăsită' };
  const staff = await getStaffForShop(appt.shopId);
  if (!staff) return DENIED;
  if (!appt.workOrder) return { ok: false, error: 'Fă mai întâi check-in pentru a deschide fișa de lucru.' };

  const create = parsed.data.map((i) => ({ name: i.name, severity: i.severity, note: i.note || null }));
  await prisma.dviReport.upsert({
    where: { workOrderId: appt.workOrder.id },
    update: { status: 'SENT', items: { deleteMany: {}, create } },
    create: { workOrderId: appt.workOrder.id, shopId: appt.shopId, status: 'SENT', items: { create } },
  });
  revalidatePath(`/pro/appointments/${appointmentId}`);
  return { ok: true };
}

export async function replyReviewAction(reviewId: string, reply: string): Promise<ActionResult> {
  const parsed = reviewReplySchema.safeParse({ reviewId, reply });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Răspuns invalid.' };
  }
  const review = await prisma.review.findUnique({ where: { id: parsed.data.reviewId } });
  if (!review) return { ok: false, error: 'Recenzie negăsită' };
  const staff = await getStaffForShop(review.shopId);
  if (!staff) return DENIED;

  const text = parsed.data.reply.trim();
  await prisma.review.update({
    where: { id: review.id },
    data: text ? { reply: text, replyAt: new Date() } : { reply: null, replyAt: null },
  });
  revalidatePath('/pro/reviews');
  return { ok: true };
}
