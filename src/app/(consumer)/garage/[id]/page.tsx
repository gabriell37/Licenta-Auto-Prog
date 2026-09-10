import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  ArrowLeft, Car, Gauge, Pencil, CalendarPlus, Wrench, FileText, AlertTriangle, History, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { StatusPill } from '@/components/ui/status-pill';
import { EmptyState } from '@/components/ui/empty-state';
import { DeleteVehicleButton } from '@/components/vehicle/delete-vehicle-button';
import { ProblemLogForm } from '@/components/vehicle/problem-log-form';
import { DocumentVault } from '@/components/vehicle/document-vault';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { FUEL_LABELS_RO, type FuelType, type AppointmentStatus } from '@/lib/enums';
import { formatDate, formatDateTime, formatRON } from '@/lib/utils';

export const metadata: Metadata = { title: 'Detalii mașină' };

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser('/garage');
  const vehicle = await prisma.vehicle.findFirst({
    where: { id, userId: user.id },
    include: {
      appointments: { orderBy: { startAt: 'desc' }, include: { shop: { select: { name: true, slug: true } }, items: true } },
      problemLogs: { orderBy: { createdAt: 'desc' } },
      documents: { orderBy: { expiresAt: 'asc' } },
    },
  });
  if (!vehicle) notFound();

  const label = `${vehicle.make} ${vehicle.model}`;

  return (
    <div className="container max-w-3xl py-6 md:py-8">
      <Link href="/garage" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Înapoi la garaj
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand-subtle text-brand">
              <Car className="h-8 w-8" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
                {label}
                {/* explicit {' '} — JSX trims line-boundary whitespace, which glued model and year together */}
                {vehicle.year && <span className="text-fg-subtle font-normal">{' '}{vehicle.year}</span>}
              </h1>
              {vehicle.nickname && <p className="text-fg-muted">{vehicle.nickname}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-fg-muted">
                {vehicle.plate && <Badge variant="outline" className="font-mono uppercase">{vehicle.plate}</Badge>}
                {vehicle.fuel && <span>{FUEL_LABELS_RO[vehicle.fuel as FuelType] ?? vehicle.fuel}</span>}
                {vehicle.engine && <span>· {vehicle.engine}</span>}
                {vehicle.mileage != null && (
                  <span className="inline-flex items-center gap-1">· <Gauge className="h-3.5 w-3.5" /> {vehicle.mileage.toLocaleString('ro-RO')} km</span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button asChild variant="ghost" size="icon-sm" aria-label="Editează">
                <Link href={`/garage/${vehicle.id}/edit`}><Pencil className="h-4 w-4" /></Link>
              </Button>
              <DeleteVehicleButton id={vehicle.id} label={label} />
            </div>
          </div>
          <div className="mt-4">
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/search`}><CalendarPlus className="h-4 w-4" /> Programează service</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document vault */}
      <section className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-fg"><FileText className="h-5 w-5 text-brand" /> Documente &amp; expirări</h2>
        <Card>
          <CardContent className="pt-5">
            <DocumentVault
              vehicleId={vehicle.id}
              documents={vehicle.documents.map((d) => ({ id: d.id, type: d.type, number: d.number, expiresAt: d.expiresAt }))}
            />
          </CardContent>
        </Card>
      </section>

      {/* Problem log */}
      <section className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-fg"><AlertTriangle className="h-5 w-5 text-warning" /> Probleme raportate</h2>
        <Card>
          <CardContent className="space-y-4 pt-5">
            <ProblemLogForm vehicleId={vehicle.id} />
            {vehicle.problemLogs.length > 0 && (
              <ul className="space-y-2 border-t border-border pt-4">
                {vehicle.problemLogs.map((p) => (
                  <li key={p.id} className="flex items-start gap-3 text-sm">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${p.resolved ? 'bg-success' : 'bg-warning'}`} aria-hidden />
                    <div>
                      <p className="text-fg">{p.text}</p>
                      <p className="text-xs text-fg-subtle">{formatDate(p.createdAt)}{p.resolved ? ' · rezolvată' : ''}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Service history */}
      <section className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-fg"><History className="h-5 w-5 text-brand" /> Istoric service</h2>
        {vehicle.appointments.length === 0 ? (
          <EmptyState icon={Wrench} title="Niciun service încă" description="Programările acestei mașini vor apărea aici, cu tot ce s-a lucrat." />
        ) : (
          <ol className="relative space-y-4 border-l-2 border-border pl-5">
            {vehicle.appointments.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -left-[27px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface ring-2 ring-border">
                  {a.status === 'DELIVERED' ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Wrench className="h-3 w-3 text-brand" />}
                </span>
                <Link href={`/appointments/${a.id}`} className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-fg">{a.shop.name}</p>
                    <StatusPill status={a.status as AppointmentStatus} />
                  </div>
                  <p className="mt-1 text-sm text-fg-muted">{formatDateTime(a.startAt)}</p>
                  <p className="mt-1.5 text-sm text-fg-muted">{a.items.map((i) => i.name).join(', ')}</p>
                  {a.estimateBani ? <p className="mt-1 text-sm font-semibold text-fg">{formatRON(a.estimateBani)}</p> : null}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
