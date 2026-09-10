import Link from 'next/link';
import type { Metadata } from 'next';
import { Store, ExternalLink, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShopSettingsForm } from '@/components/pro/shop-settings-form';
import { NoShopState } from '@/components/pro/no-shop-state';
import { requireShopAccess, getActiveShop } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'Setări service' };

export default async function ProSettingsPage() {
  const user = await requireShopAccess();
  const shop = await getActiveShop(user);
  if (!shop) return <NoShopState isAdmin={user.role === 'ADMIN'} />;
  const subscription = await prisma.subscription.findUnique({ where: { shopId: shop.id } });
  const planName = subscription ? (subscription.plan === 'PRO_PLUS' ? 'AutoProg Pro Plus' : 'AutoProg Pro') : 'Plan Pro';

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Setări service</h1>

      <div className="mt-5 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2"><Store className="h-5 w-5 text-brand" /> Date service</span>
              <Button asChild variant="ghost" size="sm"><Link href={`/shop/${shop.slug}`}>Vezi profil public <ExternalLink className="h-3.5 w-3.5" /></Link></Button>
            </CardTitle>
          </CardHeader>
          <CardContent><ShopSettingsForm shop={shop} /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-5 w-5 text-brand" /> Abonament</CardTitle><CardDescription>Planul tău AutoProg Pro.</CardDescription></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 p-3">
              <div>
                <p className="font-medium text-fg">{planName}</p>
                <p className="text-sm text-fg-muted">Facturare lunară</p>
              </div>
              <Badge variant={subscription?.status === 'ACTIVE' ? 'success' : 'warning'}>{subscription?.status === 'ACTIVE' ? 'Activ' : subscription?.status ?? 'Trial'}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
