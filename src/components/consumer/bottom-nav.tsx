'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Car, CalendarDays, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/', label: 'Acasă', icon: Home, exact: true },
  { href: '/search', label: 'Caută', icon: Search },
  { href: '/garage', label: 'Garaj', icon: Car },
  { href: '/appointments', label: 'Programări', icon: CalendarDays },
  { href: '/account', label: 'Cont', icon: User },
];

/** Mobile bottom tab bar — thumb-reachable primary navigation. Hidden on md+. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Navigare principală"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors',
                  active ? 'text-brand' : 'text-fg-subtle hover:text-fg'
                )}
              >
                <item.icon className={cn('h-5 w-5', active && 'scale-110 transition-transform')} aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
