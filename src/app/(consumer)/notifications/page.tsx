import Link from 'next/link';
import type { Metadata } from 'next';
import { Bell, CheckCheck, CalendarCheck, CalendarX, CalendarClock, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deliverDueNotifications } from '@/lib/notifications';
import { parseJson, relativeTime, formatDateTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'Notificări' };

const ICONS: Record<string, any> = {
  APPOINTMENT_CONFIRMED: CalendarCheck,
  APPOINTMENT_CANCELLED: CalendarX,
  APPOINTMENT_RESCHEDULED: CalendarClock,
  APPOINTMENT_REMINDER: Clock,
};

export default async function NotificationsPage() {
  const user = await requireUser('/notifications');

  // flip due PENDING reminders to SENT first, so they show up below and the
  // mark-read pass actually reaches them
  await deliverDueNotifications(user.id);

  const now = new Date();
  const delivered = await prisma.notification.findMany({
    where: { userId: user.id, status: { in: ['SENT', 'READ', 'FAILED'] } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const scheduled = await prisma.notification.findMany({
    where: { userId: user.id, status: 'PENDING', scheduledFor: { gt: now } },
    orderBy: { scheduledFor: 'asc' },
  });

  // mark delivered ones as read on view
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null, status: { in: ['SENT', 'READ', 'FAILED'] } },
    data: { readAt: now, status: 'READ' },
  });

  return (
    <div className="container max-w-2xl py-6 md:py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Notificări</h1>
        {delivered.length > 0 && <span className="inline-flex items-center gap-1 text-sm text-fg-subtle"><CheckCheck className="h-4 w-4" /> Toate citite</span>}
      </div>

      {scheduled.length > 0 && (
        <section className="mt-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-subtle">Programate</h2>
          <div className="space-y-2">
            {scheduled.map((n) => {
              const Icon = ICONS[n.type] ?? Bell;
              const data = parseJson<{ appointmentId?: string }>(n.data, {});
              return (
                <NotifRow key={n.id} icon={Icon} title={n.title} body={n.body} meta={`pentru ${formatDateTime(n.scheduledFor!)}`} href={data.appointmentId ? `/appointments/${data.appointmentId}` : undefined} muted />
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-5">
        {delivered.length === 0 ? (
          <EmptyState icon={Bell} title="Nicio notificare" description="Aici vei vedea confirmări, remindere și actualizări despre programările tale." />
        ) : (
          <div className="space-y-2">
            {delivered.map((n) => {
              const Icon = ICONS[n.type] ?? Bell;
              const data = parseJson<{ appointmentId?: string }>(n.data, {});
              return (
                <NotifRow key={n.id} icon={Icon} title={n.title} body={n.body} meta={relativeTime(n.createdAt)} href={data.appointmentId ? `/appointments/${data.appointmentId}` : undefined} unread={!n.readAt} />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function NotifRow({ icon: Icon, title, body, meta, href, unread, muted }: { icon: any; title: string; body: string | null; meta: string; href?: string; unread?: boolean; muted?: boolean }) {
  const inner = (
    <Card className={unread ? 'border-brand/40' : muted ? 'opacity-80' : ''}>
      <CardContent className="flex items-start gap-3 pt-4">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${muted ? 'bg-surface-3 text-fg-muted' : 'bg-brand-subtle text-brand'}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-fg">{title}{unread && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-brand align-middle" aria-label="necitit" />}</p>
          {body && <p className="text-sm text-fg-muted">{body}</p>}
          <p className="mt-0.5 text-xs text-fg-subtle">{meta}</p>
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}
