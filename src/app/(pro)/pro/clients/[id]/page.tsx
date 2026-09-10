import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, Phone, Mail, Car, Gauge } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/ui/status-pill';
import { NoShopState } from '@/components/pro/no-shop-state';
import { requireShopAccess, getActiveShop } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDateTime, formatRON } from '@/lib/utils';
import type { AppointmentStatus } from '@/lib/enums';

export const metadata: Metadata = { title: 'Fișă client' };

export default async function ProClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireShopAccess();
  const shop = await getActiveShop(user);
  if (!shop) return <NoShopState isAdmin={user.role === 'ADMIN'} />;

  const client = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, phone: true, avatarUrl: true } });
  if (!client) notFound();

  const appts = await prisma.appointment.findMany({
    where: { shopId: shop.id, userId: id },
    orderBy: { startAt: 'desc' },
    include: { vehicle: true, items: { select: { name: true } } },
  });
  if (appts.length === 0) redirect('/pro/clients');

  const vehicles = Array.from(new Map(appts.filter((a) => a.vehicle).map((a) => [a.vehicle!.id, a.vehicle!])).values());
  const totalSpent = appts.filter((a) => a.status === 'DELIVERED').reduce((s, a) => s + (a.estimateBani ?? 0), 0);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/pro/clients" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Clienți
      </Link>

      <Card>
        <CardContent className="flex items-center gap-4 pt-5">
          <Avatar name={client.name} src={client.avatarUrl} size={56} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-bold text-fg">{client.name}</h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-fg-muted">
              {client.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {client.phone}</span>}
              <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {client.email}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-lg font-bold text-fg">{formatRON(totalSpent)}</p>
            <p className="text-xs text-fg-muted">total · {appts.length} vizite</p>
          </div>
        </CardContent>
      </Card>

      {vehicles.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-fg"><Car className="h-5 w-5 text-brand" /> Mașini</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {vehicles.map((v) => (
              <Card key={v.id}><CardContent className="pt-4">
                <p className="font-medium text-fg">{v.make} {v.model} {v.year}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-fg-muted">
                  {v.plate && <Badge variant="outline" className="font-mono uppercase">{v.plate}</Badge>}
                  {v.mileage != null && <span className="inline-flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {v.mileage.toLocaleString('ro-RO')} km</span>}
                </div>
              </CardContent></Card>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 font-display text-lg font-bold text-fg">Istoric programări</h2>
        <div className="space-y-2">
          {appts.map((a) => (
            <Link key={a.id} href={`/pro/appointments/${a.id}`} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:bg-surface-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-fg">{a.items.map((i) => i.name).join(', ')}</p>
                <p className="text-xs text-fg-subtle">{formatDateTime(a.startAt)}{a.vehicle ? ` · ${a.vehicle.make} ${a.vehicle.model}` : ''}</p>
              </div>
              <StatusPill status={a.status as AppointmentStatus} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
