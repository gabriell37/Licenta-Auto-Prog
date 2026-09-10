import Link from 'next/link';
import type { Metadata } from 'next';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from '@/components/rating-stars';
import { ShopStatusControl } from '@/components/admin/shop-status-control';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CATEGORIES, SHOP_STATUSES, type ShopStatus } from '@/lib/enums';

export const metadata: Metadata = { title: 'Admin — Service-uri' };

const STATUS_BADGE: Record<string, { v: any; label: string }> = {
  VERIFIED: { v: 'success', label: 'Verificat' },
  PENDING: { v: 'warning', label: 'În așteptare' },
  DRAFT: { v: 'neutral', label: 'Ciornă' },
  SUSPENDED: { v: 'danger', label: 'Suspendat' },
};

export default async function AdminShopsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: rawStatus } = await searchParams;
  await requireAdmin();
  const status = SHOP_STATUSES.includes(rawStatus as ShopStatus) ? rawStatus : undefined;
  const shops = await prisma.shop.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { appointments: true, services: true } } },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Service-uri</h1>
      <p className="mt-1 text-sm text-fg-muted">{shops.length} service-uri{status ? ` cu status ${status}` : ''}.</p>

      <div className="mt-5 space-y-2">
        {shops.map((s) => {
          const badge = STATUS_BADGE[s.status] ?? STATUS_BADGE.DRAFT!;
          const cat = CATEGORIES.find((c) => c.slug === s.primaryCategory);
          return (
            <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/shop/${s.slug}`} className="truncate font-medium text-fg hover:text-brand">{s.name}</Link>
                  <ExternalLink className="h-3 w-3 text-fg-subtle" />
                  <Badge variant={badge.v}>{badge.label}</Badge>
                </div>
                <p className="truncate text-sm text-fg-muted">
                  {cat?.nameRo} · {s.locality}, {s.county} · {s._count.services} servicii · {s._count.appointments} programări
                </p>
                <div className="mt-1"><RatingStars rating={s.ratingAvg} count={s.ratingCount} size={12} /></div>
              </div>
              <ShopStatusControl shopId={s.id} status={s.status} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
