import type { Metadata } from 'next';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin — Utilizatori' };

const ROLE_BADGE: Record<string, { v: any; label: string }> = {
  ADMIN: { v: 'danger', label: 'Admin' },
  STAFF: { v: 'brand', label: 'Service' },
  CUSTOMER: { v: 'neutral', label: 'Client' },
};

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { _count: { select: { vehicles: true, appointments: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Utilizatori</h1>
      <p className="mt-1 text-sm text-fg-muted">{users.length} utilizatori înregistrați.</p>

      <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-surface scroll-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-subtle">
              <th className="p-3 font-medium">Utilizator</th>
              <th className="p-3 font-medium">Rol</th>
              <th className="hidden p-3 font-medium sm:table-cell">Mașini</th>
              <th className="hidden p-3 font-medium sm:table-cell">Programări</th>
              <th className="hidden p-3 font-medium md:table-cell">Înregistrat</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const badge = ROLE_BADGE[u.role] ?? ROLE_BADGE.CUSTOMER!;
              return (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} src={u.avatarUrl} size={32} />
                      <div className="min-w-0"><p className="truncate font-medium text-fg">{u.name}</p><p className="truncate text-xs text-fg-subtle">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="p-3"><Badge variant={badge.v}>{badge.label}</Badge></td>
                  <td className="hidden p-3 text-fg-muted sm:table-cell">{u._count.vehicles}</td>
                  <td className="hidden p-3 text-fg-muted sm:table-cell">{u._count.appointments}</td>
                  <td className="hidden p-3 text-fg-muted md:table-cell">{formatDate(u.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
