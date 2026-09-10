import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, User, Car, Phone, Clock, Wrench, FileText, ClipboardCheck, Image as ImageIcon, MessageSquare, Gauge } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/ui/status-pill';
import { StatusUpdater } from '@/components/pro/status-updater';
import { CheckInForm } from '@/components/pro/check-in-form';
import { DevizBuilder } from '@/components/pro/deviz-builder';
import { DviBuilder } from '@/components/pro/dvi-builder';
import { MessageThread } from '@/components/appointment/message-thread';
import { MediaGallery } from '@/components/media/media-gallery';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { formatDateTime, formatRON } from '@/lib/utils';
import { FUEL_LABELS_RO, type FuelType, type AppointmentStatus } from '@/lib/enums';

export const metadata: Metadata = { title: 'Gestionează programarea' };

export default async function ProAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser('/pro');
  const appt = await prisma.appointment.findUnique({
    where: { id },
    include: {
      shop: { select: { id: true, name: true } },
      user: { select: { name: true, phone: true, email: true } },
      vehicle: true,
      items: true,
      media: true,
      messages: { orderBy: { createdAt: 'asc' } },
      estimate: { include: { lines: true } },
      workOrder: { include: { dvi: { include: { items: true } } } },
    },
  });
  if (!appt) notFound();
  const allowed = user.role === 'ADMIN' || user.memberships.some((m) => m.shopId === appt.shopId);
  if (!allowed) redirect('/pro');

  const status = appt.status as AppointmentStatus;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/pro/appointments" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Toate programările
      </Link>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left: details & work */}
        <div className="space-y-5 lg:col-span-2">
          {/* Header */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="font-display text-xl font-bold text-fg">{appt.user.name}</h1>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-muted">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDateTime(appt.startAt)}</span>
                    {appt.user.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {appt.user.phone}</span>}
                  </p>
                </div>
                <StatusPill status={status} />
              </div>
              {appt.problemText && (
                <div className="mt-3 rounded-lg bg-surface-2 p-3 text-sm">
                  <p className="font-medium text-fg">Problema raportată:</p>
                  <p className="text-fg-muted">{appt.problemText}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicle */}
          {appt.vehicle && (
            <Card>
              <CardContent className="pt-5">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg"><Car className="h-4 w-4 text-brand" /> Autovehicul</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fg-muted">
                  <span className="font-medium text-fg">{appt.vehicle.make} {appt.vehicle.model} {appt.vehicle.year}</span>
                  {appt.vehicle.plate && <Badge variant="outline" className="font-mono uppercase">{appt.vehicle.plate}</Badge>}
                  {appt.vehicle.fuel && <span>{FUEL_LABELS_RO[appt.vehicle.fuel as FuelType] ?? appt.vehicle.fuel}</span>}
                  {appt.vehicle.engine && <span>· {appt.vehicle.engine}</span>}
                  {appt.vehicle.mileage != null && <span className="inline-flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {appt.vehicle.mileage.toLocaleString('ro-RO')} km</span>}
                  {appt.vehicle.vin && <span className="font-mono text-xs">VIN: {appt.vehicle.vin}</span>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services */}
          <Card>
            <CardContent className="pt-5">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg"><Wrench className="h-4 w-4 text-brand" /> Servicii solicitate</h2>
              <ul className="divide-y divide-border">
                {appt.items.map((i) => (
                  <li key={i.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-fg">{i.name}</span>
                    <span className="font-medium text-fg">{i.priceBani > 0 ? formatRON(i.priceBani) : '—'}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Check-in / Work order */}
          <Card>
            <CardContent className="pt-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg"><ClipboardCheck className="h-4 w-4 text-brand" /> Primire & fișă de lucru</h2>
              {appt.workOrder ? (
                <div className="rounded-lg bg-surface-2 p-3 text-sm">
                  <p className="font-medium text-fg">Fișă {appt.workOrder.number}</p>
                  <p className="text-fg-muted">
                    {appt.workOrder.mileageIn != null && `${appt.workOrder.mileageIn.toLocaleString('ro-RO')} km · `}
                    Combustibil {appt.workOrder.fuelLevel ?? '—'}%
                  </p>
                  {appt.workOrder.intakeNotes && <p className="mt-1 text-fg-muted">{appt.workOrder.intakeNotes}</p>}
                </div>
              ) : (
                <CheckInForm appointmentId={appt.id} currentMileage={appt.vehicle?.mileage} />
              )}
            </CardContent>
          </Card>

          {/* DVI */}
          {appt.workOrder && (
            <Card>
              <CardContent className="pt-5">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg"><ClipboardCheck className="h-4 w-4 text-brand" /> Inspecție vehicul (DVI)</h2>
                {appt.workOrder.dvi ? (
                  <ul className="space-y-1.5">
                    {appt.workOrder.dvi.items.map((it) => (
                      <li key={it.id} className="flex items-center justify-between text-sm">
                        <span className="text-fg">{it.name}</span>
                        <span className="text-xs font-medium" style={{ color: `rgb(var(--${it.severity === 'OK' ? 'success' : it.severity === 'ADVISE' ? 'warning' : 'danger'}-fg))` }}>
                          {it.severity === 'OK' ? 'OK' : it.severity === 'ADVISE' ? 'De urmărit' : 'Urgent'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <DviBuilder appointmentId={appt.id} />
                )}
              </CardContent>
            </Card>
          )}

          {/* Deviz */}
          <Card>
            <CardContent className="pt-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg"><FileText className="h-4 w-4 text-brand" /> Deviz {appt.estimate && <Badge variant={appt.estimate.status === 'APPROVED' ? 'success' : 'warning'}>{appt.estimate.status === 'APPROVED' ? 'Aprobat' : 'Trimis'}</Badge>}</h2>
              <DevizBuilder appointmentId={appt.id} existing={appt.estimate?.lines} estimateApproved={appt.estimate?.status === 'APPROVED'} />
            </CardContent>
          </Card>

          {/* Media */}
          {appt.media.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg"><ImageIcon className="h-4 w-4 text-brand" /> Atașamente client</h2>
                <MediaGallery media={appt.media} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: status & messages */}
        <div className="space-y-5">
          <Card>
            <CardContent className="pt-5">
              <h2 className="mb-3 text-sm font-semibold text-fg">Status</h2>
              <StatusUpdater appointmentId={appt.id} status={status} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg"><MessageSquare className="h-4 w-4 text-brand" /> Mesaje client</h2>
              <MessageThread appointmentId={appt.id} messages={appt.messages} currentUserId={user.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
