'use client';

import * as React from 'react';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { toast } from '@/components/ui/toaster';
import { changePasswordAction } from '@/app/actions/account';

export function ChangePasswordForm() {
  const [current, setCurrent] = React.useState('');
  const [next, setNext] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [pending, start] = React.useTransition();

  const mismatch = confirm.length > 0 && next !== confirm;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      toast.error('Parolele noi nu coincid.');
      return;
    }
    start(async () => {
      const res = await changePasswordAction({ currentPassword: current, newPassword: next });
      if (res.ok) {
        toast.success('Parola a fost schimbată.');
        setCurrent('');
        setNext('');
        setConfirm('');
      } else {
        toast.error(res.error ?? 'Nu am putut schimba parola.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Parola actuală" htmlFor="pw-current" required>
        <Input
          id="pw-current"
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
          required
        />
      </Field>
      <Field label="Parola nouă" htmlFor="pw-new" required hint="Minim 8 caractere.">
        <Input
          id="pw-new"
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      <Field
        label="Confirmă parola nouă"
        htmlFor="pw-confirm"
        required
        error={mismatch ? 'Parolele noi nu coincid.' : undefined}
      >
        <Input
          id="pw-confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          aria-invalid={mismatch}
          required
        />
      </Field>
      <Button type="submit" loading={pending} disabled={!current || !next || !confirm || mismatch}>
        <KeyRound className="h-4 w-4" /> Schimbă parola
      </Button>
    </form>
  );
}
