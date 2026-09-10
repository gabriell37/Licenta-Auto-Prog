import * as React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AuthForm } from '@/components/auth/auth-form';
import { DemoAccounts } from '@/components/auth/demo-accounts';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Autentificare' };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === 'ADMIN' ? '/admin' : user.role === 'STAFF' || user.memberships.length > 0 ? '/pro' : '/');
  }

  const showDemoAccounts =
    process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEMO_ACCOUNTS === '1';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bine ai revenit</CardTitle>
        <CardDescription>Intră în cont pentru a-ți gestiona programările și mașinile.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <React.Suspense>
          <AuthForm mode="login" />
        </React.Suspense>
        {showDemoAccounts && <DemoAccounts />}
      </CardContent>
    </Card>
  );
}
