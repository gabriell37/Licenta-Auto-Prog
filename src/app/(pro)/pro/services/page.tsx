import type { Metadata } from 'next';
import { ServiceManager } from '@/components/pro/service-manager';
import { NoShopState } from '@/components/pro/no-shop-state';
import { requireShopAccess, getActiveShop } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'Servicii Pro' };

export default async function ProServicesPage() {
  const user = await requireShopAccess();
  const shop = await getActiveShop(user);
  if (!shop) return <NoShopState isAdmin={user.role === 'ADMIN'} />;

  const [services, categories] = await Promise.all([
    prisma.service.findMany({ where: { shopId: shop.id }, orderBy: { sortOrder: 'asc' } }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, nameRo: true } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Servicii & prețuri</h1>
      <p className="mt-1 text-sm text-fg-muted">Gestionează serviciile pe care clienții le pot programa.</p>
      <div className="mt-5">
        <ServiceManager shopId={shop.id} services={services} categories={categories} />
      </div>
    </div>
  );
}
