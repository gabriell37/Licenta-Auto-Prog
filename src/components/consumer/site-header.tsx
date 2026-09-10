import Link from 'next/link';
import { Wrench, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserMenu } from './user-menu';
import { getCurrentUser } from '@/lib/auth';

export async function SiteHeader() {
  const user = await getCurrentUser();
  const menuUser = user
    ? {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isStaff: user.memberships.length > 0 || user.role === 'STAFF' || user.role === 'ADMIN',
      }
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="AutoProg — acasă">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-fg-on-brand">
            <Wrench className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-fg hidden sm:block">AutoProg</span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex" aria-label="Principal">
          <NavLink href="/search">Caută service</NavLink>
          <NavLink href="/categories">Categorii</NavLink>
          <NavLink href="/business">Pentru service-uri</NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href="/search"
            className="flex h-9 items-center gap-2 rounded-full border border-border-strong bg-surface px-3 text-sm text-fg-muted transition-colors hover:bg-surface-2 md:hidden"
            aria-label="Caută"
          >
            <Search className="h-4 w-4" />
          </Link>
          <ThemeToggle />
          <UserMenu user={menuUser} />
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-3 hover:text-fg"
    >
      {children}
    </Link>
  );
}
