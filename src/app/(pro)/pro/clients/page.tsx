import Link from 'next/link';
import type { Metadata } from 'next';
import { Users, Phone, ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { NoShopState } from '@/components/pro/no-shop-state';
import { requireShopAccess, getActiveShop } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { relativeTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'Clienți Pro' };

export default async function ProClientsPage() {
  const user = await requireShopAccess();
  const shop = await getActiveShop(user);
  if (!shop) return <NoShopState isAdmin={user.role === 'ADMIN'} />;

  const grouped = await prisma.appointment.groupBy({
    by: ['userId'],
    where: { shopId: shop.id },
    _count: true,
    _max: { startAt: true },
  });
  const users = grouped.length
    ? await prisma.user.findMany({ where: { id: { in: grouped.map((g) => g.userId) } }, select: { id: true, name: true, email: true, phone: true, avatarUrl: true } })
    : [];
  const byId = Object.fromEntries(users.map((u) => [u.id, u]));
  const clients = grouped
    .map((g) => ({ ...byId[g.userId]!, count: g._count, last: g._max.startAt }))
    .filter((c) => c.id)
    .sort((a, b) => (b.last?.getTime() ?? 0) - (a.last?.getTime() ?? 0));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Clienți</h1>
      <p className="mt-1 text-sm text-fg-muted">{clients.length} clienți cu programări la {shop.name}.</p>

      <div className="mt-5">
        {clients.length === 0 ? (
          <EmptyState icon={Users} title="Niciun client încă" description="Clienții apar aici după prima programare." />
        ) : (
          <div className="space-y-2">
            {clients.map((c) => (
              <Link key={c.id} href={`/pro/clients/${c.id}`} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:bg-surface-2">
                <Avatar name={c.name} src={c.avatarUrl} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-fg">{c.name}</p>
                  <p className="truncate text-sm text-fg-muted">
                    {c.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {c.phone} · </span>}
                    {c.count} programări{c.last ? ` · ultima ${relativeTime(c.last)}` : ''}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-fg-subtle" aria-hidden />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
