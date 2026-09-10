import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  ArrowLeft, Car, Clock, MapPin, Wrench, MessageSquare, Image as ImageIcon, Star, FileText, CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusTracker } from '@/components/appointment/status-tracker';
import { AppointmentActions } from '@/components/appointment/appointment-actions';
import { MessageThread } from '@/components/appointment/message-thread';
import { ReviewForm } from '@/components/appointment/review-form';
import { EstimateApproval } from '@/components/appointment/estimate-approval';
import { MediaGallery } from '@/components/media/media-gallery';
import { RatingStars } from '@/components/rating-stars';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { formatDateTime, formatRON, formatTime } from '@/lib/utils';
import type { AppointmentStatus } from '@/lib/enums';

export const metadata: Metadata = { title: 'Detalii programare' };

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser('/appointments');
  const appt = await prisma.appointment.findFirst({
    where: { id, userId: user.id },
    include: {
      shop: { select: { name: true, slug: true, locality: true, addressLine: true, phone: true } },
      vehicle: true,
      items: true,
      media: true,
      messages: { orderBy: { createdAt: 'asc' } },
      estimate: { include: { lines: true } },
      review: true,
    },
  });
  if (!appt) notFound();

  const status = appt.status as AppointmentStatus;
  const upcoming = !['DELIVERED', 'CANCELLED', 'NO_SHOW'].includes(status);
  const duration = appt.items.reduce((a, i) => a + i.durationMin, 0) || 60;

  return (
    <div className="container max-w-2xl py-6 md:py-8">
      <Link href="/appointments" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Programările mele
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link href={`/shop/${appt.shop.slug}`} className="font-display text-xl font-bold text-fg hover:text-brand">{appt.shop.name}</Link>
              <p className="mt-1 flex items-center gap-1 text-sm text-fg-muted"><MapPin className="h-3.5 w-3.5" /> {[appt.shop.addressLine, appt.shop.locality].filter(Boolean).join(', ')}</p>
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <StatusTracker status={status} />
          </div>
          {upcoming && appt.readyByAt && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-brand-subtle/60 px-3 py-2 text-sm text-brand-fg">
              <Clock className="h-4 w-4" /> Estimat gata în jurul orei <strong>{formatTime(appt.readyByAt)}</strong>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estimate approval */}
      {appt.estimate && (status === 'AWAITING_APPROVAL' || appt.estimate.status !== 'DRAFT') && (
        <section className="mt-6">
          <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-fg"><FileText className="h-5 w-5 text-warning" /> Deviz pentru aprobare</h2>
          <EstimateApproval estimate={appt.estimate} />
        </section>
      )}

      {/* Details */}
      <section className="mt-6">
        <Card>
          <CardContent className="space-y-3 pt-5 text-sm">
            <Detail icon={Clock} label="Data & ora">{formatDateTime(appt.startAt)}</Detail>
            {appt.vehicle && <Detail icon={Car} label="Mașina">{appt.vehicle.make} {appt.vehicle.model} {appt.vehicle.plate && <Badge variant="outline" className="ml-1 font-mono uppercase">{appt.vehicle.plate}</Badge>}</Detail>}
            <Detail icon={Wrench} label="Servicii">{appt.items.map((i) => i.name).join(', ')}</Detail>
            <Detail icon={Clock} label="Tip">{appt.mode === 'DROP_OFF' ? 'Las mașina' : 'Aștept la service'} · ~{duration} min</Detail>
            {appt.problemText && <Detail icon={MessageSquare} label="Problemă">{appt.problemText}</Detail>}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="font-medium text-fg">Total estimat</span>
              <span className="font-display text-lg font-bold text-fg">{appt.estimateBani ? formatRON(appt.estimateBani, { from: true }) : 'la evaluare'}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Actions */}
      {upcoming && (
        <div className="mt-4">
          <AppointmentActions id={appt.id} shopId={appt.shopId} durationMin={duration} />
        </div>
      )}

      {/* Media */}
      {appt.media.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-fg"><ImageIcon className="h-5 w-5 text-brand" /> Atașamente</h2>
          <MediaGallery media={appt.media} />
        </section>
      )}

      {/* Messages */}
      <section className="mt-6">
        <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-fg"><MessageSquare className="h-5 w-5 text-brand" /> Mesaje cu service-ul</h2>
        <Card><CardContent className="pt-5"><MessageThread appointmentId={appt.id} messages={appt.messages} currentUserId={user.id} /></CardContent></Card>
      </section>

      {/* Review */}
      {status === 'DELIVERED' && (
        <section className="mt-6">
          <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-fg"><Star className="h-5 w-5 text-accent" /> Recenzie</h2>
          <Card>
            <CardContent className="pt-5">
              {appt.review ? (
                <div>
                  <div className="flex items-center gap-2"><RatingStars rating={appt.review.rating} showValue={false} /> <span className="inline-flex items-center gap-1 text-sm font-medium text-success-fg"><CheckCircle2 className="h-4 w-4" /> Recenzie trimisă</span></div>
                  {appt.review.body && <p className="mt-2 text-sm text-fg-muted">{appt.review.body}</p>}
                </div>
              ) : (
                <ReviewForm appointmentId={appt.id} />
              )}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

function Detail({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" aria-hidden />
      <span className="w-24 shrink-0 text-fg-muted">{label}</span>
      <span className="flex-1 font-medium text-fg">{children}</span>
    </div>
  );
}
