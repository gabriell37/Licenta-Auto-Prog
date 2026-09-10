import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserMenu } from '@/components/consumer/user-menu';
import { requireAdmin } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const menuUser = { name: user.name, email: user.email, avatarUrl: user.avatarUrl, role: user.role, isStaff: true };

  return (
    <div className="min-h-dvh bg-bg-subtle" data-density="compact">
      <header className="sticky top-0 z-40 border-b border-border bg-surface">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fg text-bg"><Shield className="h-4 w-4" /></span>
            <span className="font-display text-lg font-extrabold tracking-tight text-fg">AutoProg <span className="text-fg-muted">Admin</span></span>
          </Link>
          <div className="ml-auto flex items-center gap-1.5">
            <Link href="/" className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-fg-muted hover:bg-surface-3 sm:inline-flex"><ArrowLeft className="h-4 w-4" /> Site</Link>
            <ThemeToggle />
            <UserMenu user={menuUser} />
          </div>
        </div>
      </header>

      <AdminSidebar variant="mobile" />

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r border-border bg-surface md:block">
          <AdminSidebar />
        </aside>
        <main id="main" className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
