'use client';

import { useActionState } from 'react';
import { User, Wrench, Shield } from 'lucide-react';
import { loginAction, type AuthState } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';

const ACCOUNTS = [
  { label: 'Client', email: 'client@autoprog.ro', password: 'client1234', icon: User, next: '/' },
  { label: 'Service (Pro)', email: 'service@autoprog.ro', password: 'service1234', icon: Wrench, next: '/pro' },
  { label: 'Admin', email: 'admin@autoprog.ro', password: 'admin1234', icon: Shield, next: '/admin' },
];

/**
 * One-click demo logins for evaluators (thesis/demo aid).
 * Rendered only in development or when NEXT_PUBLIC_DEMO_ACCOUNTS=1 — the gate
 * lives server-side in the login page.
 */
export function DemoAccounts() {
  const [, formAction, pending] = useActionState<AuthState, FormData>(loginAction, {});
  return (
    <div className="rounded-lg border border-dashed border-border-strong bg-surface-2 p-3">
      <p className="mb-2 text-center text-xs font-medium text-fg-muted">Conturi demo — intră cu un click</p>
      <div className="grid grid-cols-3 gap-2">
        {ACCOUNTS.map((a) => (
          <form key={a.email} action={formAction}>
            <input type="hidden" name="email" value={a.email} />
            <input type="hidden" name="password" value={a.password} />
            <input type="hidden" name="next" value={a.next} />
            <Button type="submit" variant="outline" size="sm" className="w-full flex-col h-auto py-2 gap-1" disabled={pending}>
              <a.icon className="h-4 w-4 text-brand" aria-hidden />
              <span className="text-xs">{a.label}</span>
            </Button>
          </form>
        ))}
      </div>
    </div>
  );
}
