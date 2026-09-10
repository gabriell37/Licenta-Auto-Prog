'use client';

import * as React from 'react';
import Link from 'next/link';
import { Car, CalendarDays, LogOut, User as UserIcon, Shield, Wrench, ChevronDown, LogIn } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { logoutAction } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

type MenuUser = { name: string; email: string; avatarUrl?: string | null; role: string; isStaff: boolean };

export function UserMenu({ user }: { user: MenuUser | null }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild size="sm">
          <Link href="/login"><LogIn className="h-4 w-4" /> Autentificare</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
          <Link href="/register">Cont nou</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full p-0.5 pr-2 transition-colors hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar name={user.name} src={user.avatarUrl} size={32} />
        <ChevronDown className={cn('h-4 w-4 text-fg-subtle transition-transform', open && 'rotate-180')} aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right rounded-xl border border-border bg-surface p-1.5 shadow-lg animate-scale-in"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-fg">{user.name}</p>
            <p className="truncate text-xs text-fg-muted">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-border" />
          <MenuLink href="/account" icon={UserIcon} onClick={() => setOpen(false)}>Contul meu</MenuLink>
          <MenuLink href="/garage" icon={Car} onClick={() => setOpen(false)}>Garajul meu</MenuLink>
          <MenuLink href="/appointments" icon={CalendarDays} onClick={() => setOpen(false)}>Programările mele</MenuLink>
          {user.isStaff && <MenuLink href="/pro" icon={Wrench} onClick={() => setOpen(false)}>Panou service (Pro)</MenuLink>}
          {user.role === 'ADMIN' && <MenuLink href="/admin" icon={Shield} onClick={() => setOpen(false)}>Administrare</MenuLink>}
          <div className="my-1 h-px bg-border" />
          <form action={logoutAction}>
            <button
              role="menuitem"
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger transition-colors hover:bg-danger-subtle"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Deconectare
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, icon: Icon, children, onClick }: { href: string; icon: any; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      role="menuitem"
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-fg transition-colors hover:bg-surface-3"
    >
      <Icon className="h-4 w-4 text-fg-muted" aria-hidden />
      {children}
    </Link>
  );
}
