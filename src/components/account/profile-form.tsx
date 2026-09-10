'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { toast } from '@/components/ui/toaster';
import { updateProfileAction } from '@/app/actions/account';

export function ProfileForm({ user }: { user: { name: string; phone: string | null; email: string } }) {
  const router = useRouter();
  const [name, setName] = React.useState(user.name);
  const [phone, setPhone] = React.useState(user.phone ?? '');
  const [pending, start] = React.useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await updateProfileAction({ name, phone });
      if (res.ok) {
        toast.success('Profil actualizat.');
        router.refresh();
      } else {
        toast.error(res.error ?? 'Nu am putut salva profilul.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nume complet" htmlFor="profile-name" required>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
      </Field>
      <Field label="Telefon" htmlFor="profile-phone" hint="Folosit de service pentru a te contacta.">
        <Input
          id="profile-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          placeholder="+40 7xx xxx xxx"
        />
      </Field>
      <Field label="Email" htmlFor="profile-email" hint="Adresa de email nu poate fi schimbată.">
        <Input id="profile-email" type="email" value={user.email} disabled readOnly />
      </Field>
      <Button type="submit" loading={pending}>
        <Save className="h-4 w-4" /> Salvează profilul
      </Button>
    </form>
  );
}
