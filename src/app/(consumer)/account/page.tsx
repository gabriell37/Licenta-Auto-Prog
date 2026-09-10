import Link from 'next/link';
import type { Metadata } from 'next';
import { Car, CalendarDays, Heart, Bell, Shield, Wrench, ChevronRight, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ShopCard } from '@/components/consumer/shop-card';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logoutAction } from '@/app/actions/auth';

export const metadata: Metadata = { title: 'Contul meu' };

export default async function AccountPage() {
  const user = await requireUser('/account');

  const [favorites, vehicleCount, apptCount, unread] = await Promise.all([
    prisma.favorite.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
    prisma.vehicle.count({ where: { userId: user.id } }),
    prisma.appointment.count({ where: { userId: user.id } }),
    // unread = delivered but not yet seen; the notifications page flips due PENDING → SENT
    prisma.notification.count({ where: { userId: user.id, status: 'SENT', readAt: null } }),
  ]);
  const favShops = favorites.length
    ? await prisma.shop.findMany({ where: { id: { in: favorites.map((f) => f.shopId) } }, include: { services: { take: 1, orderBy: { priceFromBani: 'asc' } } } })
    : [];

  const isStaff = user.memberships.length > 0 || user.role === 'STAFF' || user.role === 'ADMIN';

  return (
    <div className="container max-w-3xl py-6 md:py-8">
      <Card>
        <CardContent className="flex items-center gap-4 pt-5">
          <Avatar name={user.name} src={user.avatarUrl} size={56} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-bold text-fg">{user.name}</h1>
            <p className="truncate text-sm text-fg-muted">{user.email}</p>
          </div>
          <Button asChild variant="outline" size="sm"><Link href="/account/settings">Setări</Link></Button>
        </CardContent>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat href="/garage" icon={Car} label="Mașini" value={vehicleCount} />
        <Stat href="/appointments" icon={CalendarDays} label="Programări" value={apptCount} />
        <Stat href="/account" icon={Heart} label="Favorite" value={favShops.length} />
        <Stat href="/notifications" icon={Bell} label="Notificări" value={unread} highlight={unread > 0} />
      </div>

      <nav className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
        <NavRow href="/garage" icon={Car}>Garajul meu</NavRow>
        <NavRow href="/appointments" icon={CalendarDays}>Programările mele</NavRow>
        <NavRow href="/notifications" icon={Bell}>Notificări{unread > 0 ? ` (${unread})` : ''}</NavRow>
        {isStaff && <NavRow href="/pro" icon={Wrench}>Panou service (Pro)</NavRow>}
        {user.role === 'ADMIN' && <NavRow href="/admin" icon={Shield}>Administrare platformă</NavRow>}
        <NavRow href="/account/settings" icon={Shield}>Confidențialitate & date (GDPR)</NavRow>
      </nav>

      {favShops.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-fg"><Heart className="h-5 w-5 text-danger" /> Service-uri favorite</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {favShops.map((s) => <ShopCard key={s.id} shop={s} />)}
          </div>
        </section>
      )}

      <form action={logoutAction} className="mt-8">
        <Button type="submit" variant="ghost" className="text-danger hover:bg-danger-subtle">
          <LogOut className="h-4 w-4" /> Deconectare
        </Button>
      </form>
    </div>
  );
}

function Stat({ href, icon: Icon, label, value, highlight }: { href: string; icon: any; label: string; value: number; highlight?: boolean }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface p-4 text-center shadow-sm transition-colors hover:bg-surface-2">
      <Icon className={`h-5 w-5 ${highlight ? 'text-accent' : 'text-brand'}`} aria-hidden />
      <span className="font-display text-xl font-bold text-fg">{value}</span>
      <span className="text-xs text-fg-muted">{label}</span>
    </Link>
  );
}

function NavRow({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2">
      <Icon className="h-5 w-5 text-fg-muted" aria-hidden />
      <span className="flex-1 text-sm font-medium text-fg">{children}</span>
      <ChevronRight className="h-4 w-4 text-fg-subtle" aria-hidden />
    </Link>
  );
}
