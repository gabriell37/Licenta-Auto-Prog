'use client';

import * as React from 'react';
import { useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { registerAction, loginAction, type AuthState } from '@/app/actions/auth';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const next = useSearchParams().get('next') ?? '';
  const action = mode === 'login' ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />

      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-subtle px-3 py-2.5 text-sm text-danger-fg animate-fade-in"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{state.error}</span>
        </div>
      )}

      {mode === 'register' && (
        <Field label="Nume complet" htmlFor="name" required error={state.fieldErrors?.name}>
          <Input id="name" name="name" autoComplete="name" placeholder="Andrei Popescu" required
            aria-invalid={!!state.fieldErrors?.name} />
        </Field>
      )}

      <Field label="Email" htmlFor="email" required error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" inputMode="email" autoComplete="email"
          placeholder="nume@exemplu.ro" required aria-invalid={!!state.fieldErrors?.email} />
      </Field>

      {mode === 'register' && (
        <Field label="Telefon" htmlFor="phone" hint="Opțional — pentru notificări despre programare" error={state.fieldErrors?.phone}>
          <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+40 7xx xxx xxx" />
        </Field>
      )}

      <Field
        label="Parolă"
        htmlFor="password"
        required
        hint={mode === 'register' ? 'Minim 8 caractere' : undefined}
        error={state.fieldErrors?.password}
      >
        <Input id="password" name="password" type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder="••••••••" required aria-invalid={!!state.fieldErrors?.password} />
      </Field>

      <Button type="submit" className="w-full" size="lg" loading={pending}>
        {mode === 'login' ? 'Intră în cont' : 'Creează cont'}
      </Button>

      <p className="text-center text-sm text-fg-muted">
        {mode === 'login' ? (
          <>
            Nu ai cont?{' '}
            <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-medium text-brand hover:underline">
              Înregistrează-te
            </Link>
          </>
        ) : (
          <>
            Ai deja cont?{' '}
            <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-medium text-brand hover:underline">
              Autentifică-te
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
