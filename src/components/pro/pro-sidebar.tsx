'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, ClipboardList, Users, Wrench, Star, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/pro', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/pro/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/pro/appointments', label: 'Programări', icon: ClipboardList },
  { href: '/pro/clients', label: 'Clienți', icon: Users },
  { href: '/pro/services', label: 'Servicii', icon: Wrench },
  { href: '/pro/reviews', label: 'Recenzii', icon: Star },
  { href: '/pro/settings', label: 'Setări', icon: Settings },
];

export function ProSidebar({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const pathname = usePathname();
  const isActive = (item: (typeof NAV)[number]) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

  if (variant === 'mobile') {
    return (
      <nav className="flex gap-1 overflow-x-auto scroll-thin border-b border-border bg-surface px-2 py-2 md:hidden" aria-label="Navigare Pro">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item) ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              isActive(item) ? 'bg-brand text-fg-on-brand' : 'text-fg-muted hover:bg-surface-3'
            )}
          >
            <item.icon className="h-4 w-4" aria-hidden />
            {item.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1 p-3" aria-label="Navigare Pro">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item) ? 'page' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive(item) ? 'bg-brand text-fg-on-brand shadow-sm' : 'text-fg-muted hover:bg-surface-3 hover:text-fg'
          )}
        >
          <item.icon className="h-5 w-5" aria-hidden />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
