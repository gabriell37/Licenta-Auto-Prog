'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, Users, Star, CalendarRange } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Prezentare', icon: LayoutDashboard, exact: true },
  { href: '/admin/shops', label: 'Service-uri', icon: Store },
  { href: '/admin/users', label: 'Utilizatori', icon: Users },
  { href: '/admin/reviews', label: 'Recenzii', icon: Star },
  { href: '/admin/appointments', label: 'Programări', icon: CalendarRange },
];

export function AdminSidebar({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const pathname = usePathname();
  const active = (i: (typeof NAV)[number]) => (i.exact ? pathname === i.href : pathname.startsWith(i.href));

  if (variant === 'mobile') {
    return (
      <nav className="flex gap-1 overflow-x-auto scroll-thin border-b border-border bg-surface px-2 py-2 md:hidden" aria-label="Navigare admin">
        {NAV.map((i) => (
          <Link key={i.href} href={i.href} aria-current={active(i) ? 'page' : undefined}
            className={cn('flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium', active(i) ? 'bg-brand text-fg-on-brand' : 'text-fg-muted hover:bg-surface-3')}>
            <i.icon className="h-4 w-4" /> {i.label}
          </Link>
        ))}
      </nav>
    );
  }
  return (
    <nav className="flex flex-col gap-1 p-3" aria-label="Navigare admin">
      {NAV.map((i) => (
        <Link key={i.href} href={i.href} aria-current={active(i) ? 'page' : undefined}
          className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', active(i) ? 'bg-brand text-fg-on-brand shadow-sm' : 'text-fg-muted hover:bg-surface-3 hover:text-fg')}>
          <i.icon className="h-5 w-5" /> {i.label}
        </Link>
      ))}
    </nav>
  );
}
