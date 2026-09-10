import Link from 'next/link';
import type { Metadata } from 'next';
import { Store, Users, CalendarRange, TrendingUp, Star, ShieldAlert, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatRON } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin — Prezentare' };

export default async function AdminDashboard() {
  await requireAdmin();
  const [shops, users, appts, reviews, pending, revenue] = await Promise.all([
    prisma.shop.count(),
    prisma.user.count(),
    prisma.appointment.count(),
    prisma.review.count(),
    prisma.shop.count({ where: { status: { in: ['PENDING', 'DRAFT'] } } }),
    prisma.appointment.aggregate({ where: { status: 'DELIVERED' }, _sum: { estimateBani: true } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Prezentare platformă</h1>
      <p className="mt-1 text-sm text-fg-muted">Starea generală a AutoProg.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat icon={Store} label="Service-uri" value={String(shops)} href="/admin/shops" />
        <Stat icon={Users} label="Utilizatori" value={String(users)} href="/admin/users" />
        <Stat icon={CalendarRange} label="Programări" value={String(appts)} href="/admin/appointments" />
        <Stat icon={Star} label="Recenzii" value={String(reviews)} href="/admin/reviews" />
        <Stat icon={TrendingUp} label="Volum tranzacționat" value={formatRON(revenue._sum.estimateBani ?? 0)} />
        <Stat icon={ShieldAlert} label="Service-uri în așteptare" value={String(pending)} href="/admin/shops?status=PENDING" highlight={pending > 0} />
      </div>

      {pending > 0 && (
        <Link href="/admin/shops" className="mt-4 flex items-center gap-2 rounded-xl border border-warning/40 bg-warning-subtle px-4 py-3 text-sm font-medium text-warning-fg hover:bg-warning-subtle/70">
          <ShieldAlert className="h-4 w-4" /> {pending} service-uri așteaptă verificare
          <ArrowRight className="ml-auto h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, href, highlight }: { icon: any; label: string; value: string; href?: string; highlight?: boolean }) {
  const inner = (
    <Card className={highlight ? 'border-warning/40' : ''}>
      <CardContent className="flex items-center gap-3 pt-5">
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${highlight ? 'bg-warning-subtle text-warning-fg' : 'bg-brand-subtle text-brand'}`}><Icon className="h-5 w-5" /></span>
        <div><p className="font-display text-xl font-bold text-fg">{value}</p><p className="text-xs text-fg-muted">{label}</p></div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href} className="block transition-transform hover:-translate-y-0.5">{inner}</Link> : inner;
}
