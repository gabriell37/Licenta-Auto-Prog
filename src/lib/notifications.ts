import { prisma } from './prisma';

type NotifyInput = {
  userId: string;
  type: string;
  title: string;
  body?: string;
  channel?: string;
  data?: Record<string, unknown>;
  scheduledFor?: Date | null;
};

/**
 * Create an in-app notification. Immediate ones are SENT right away; scheduled
 * ones stay PENDING until `deliverDueNotifications` flips them (called on the
 * notification surfaces — no external cron needed for the in-app channel).
 * Email/SMS delivery is intentionally stubbed in this demo.
 */
export async function notify(input: NotifyInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      channel: input.channel ?? 'inapp',
      data: JSON.stringify(input.data ?? {}),
      status: input.scheduledFor ? 'PENDING' : 'SENT',
      sentAt: input.scheduledFor ? null : new Date(),
      scheduledFor: input.scheduledFor ?? null,
    },
  });
}

/** Mark a user's due scheduled notifications as delivered (PENDING → SENT). */
export async function deliverDueNotifications(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, status: 'PENDING', scheduledFor: { lte: new Date() } },
    data: { status: 'SENT', sentAt: new Date() },
  });
}

/** Schedule the standard appointment reminder ~24h before start (RO: "reminder cu o zi înainte"). */
export async function scheduleAppointmentReminder(
  userId: string,
  appointmentId: string,
  startAt: Date,
  shopName: string
) {
  const remindAt = new Date(startAt.getTime() - 24 * 60 * 60 * 1000);
  if (remindAt.getTime() <= Date.now()) return null;
  return notify({
    userId,
    type: 'APPOINTMENT_REMINDER',
    title: 'Reminder programare',
    body: `Mâine ai programare la ${shopName}.`,
    channel: 'inapp',
    data: { appointmentId },
    scheduledFor: remindAt,
  });
}

/** Drop the pending reminder for an appointment (on cancel / before re-scheduling). */
export async function cancelAppointmentReminder(appointmentId: string) {
  await prisma.notification.deleteMany({
    where: {
      type: 'APPOINTMENT_REMINDER',
      status: 'PENDING',
      data: { contains: appointmentId },
    },
  });
}

/** Move an appointment's reminder to a new start time. */
export async function rescheduleAppointmentReminder(
  userId: string,
  appointmentId: string,
  newStartAt: Date,
  shopName: string
) {
  await cancelAppointmentReminder(appointmentId);
  return scheduleAppointmentReminder(userId, appointmentId, newStartAt, shopName);
}
