import * as React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AuthForm } from '@/components/auth/auth-form';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Creează cont' };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === 'ADMIN' ? '/admin' : user.role === 'STAFF' || user.memberships.length > 0 ? '/pro' : '/');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Creează-ți cont</CardTitle>
        <CardDescription>Programează-te la service în câteva secunde, fără telefoane.</CardDescription>
      </CardHeader>
      <CardContent>
        <React.Suspense>
          <AuthForm mode="register" />
        </React.Suspense>
      </CardContent>
    </Card>
  );
}
