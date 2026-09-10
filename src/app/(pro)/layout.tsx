import Link from 'next/link';
import { Wrench, ArrowLeft } from 'lucide-react';
import { ProSidebar } from '@/components/pro/pro-sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserMenu } from '@/components/consumer/user-menu';
import { requireUser, getActiveShop } from '@/lib/auth';

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  // Only auth here: membership gating stays in each page (requireShopAccess),
  // otherwise /pro/onboarding — rendered inside this layout — would redirect to itself.
  const user = await requireUser('/pro');
  const shop = await getActiveShop(user);

  const menuUser = { name: user.name, email: user.email, avatarUrl: user.avatarUrl, role: user.role, isStaff: true };

  return (
    <div className="min-h-dvh bg-bg-subtle" data-density="compact">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href="/pro" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-fg-on-brand"><Wrench className="h-4 w-4" /></span>
            <span className="font-display text-lg font-extrabold tracking-tight text-fg">AutoProg <span className="text-brand">Pro</span></span>
          </Link>
          {shop && <span className="hidden truncate text-sm text-fg-muted sm:block">· {shop.name}</span>}
          <div className="ml-auto flex items-center gap-1.5">
            <Link href="/" className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-fg-muted hover:bg-surface-3 sm:inline-flex">
              <ArrowLeft className="h-4 w-4" /> Site
            </Link>
            <ThemeToggle />
            <UserMenu user={menuUser} />
          </div>
        </div>
      </header>

      <ProSidebar variant="mobile" />

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r border-border bg-surface md:block">
          <ProSidebar />
        </aside>
        <main id="main" className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
