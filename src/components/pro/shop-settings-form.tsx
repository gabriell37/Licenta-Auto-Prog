'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/ui/field';
import { toast } from '@/components/ui/toaster';
import { updateShopAction } from '@/app/actions/shop';

type Shop = {
  id: string; name: string; description: string | null; phone: string | null; email: string | null;
  addressLine: string | null; locality: string | null; county: string | null;
};

export function ShopSettingsForm({ shop }: { shop: Shop }) {
  const router = useRouter();
  const [f, setF] = React.useState({
    name: shop.name, description: shop.description ?? '', phone: shop.phone ?? '', email: shop.email ?? '',
    addressLine: shop.addressLine ?? '', locality: shop.locality ?? '', county: shop.county ?? '',
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const [pending, start] = React.useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await updateShopAction(shop.id, f);
      if (res.ok) { toast.success('Setări salvate.'); router.refresh(); }
      else toast.error(res.error ?? 'Eroare.');
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Nume service" htmlFor="name" required><Input id="name" value={f.name} onChange={set('name')} /></Field>
      <Field label="Descriere" htmlFor="desc"><Textarea id="desc" value={f.description} onChange={set('description')} rows={3} placeholder="Descrie pe scurt service-ul tău…" /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Telefon" htmlFor="phone"><Input id="phone" type="tel" value={f.phone} onChange={set('phone')} /></Field>
        <Field label="Email" htmlFor="email"><Input id="email" type="email" value={f.email} onChange={set('email')} /></Field>
      </div>
      <Field label="Adresă" htmlFor="addr"><Input id="addr" value={f.addressLine} onChange={set('addressLine')} placeholder="Strada, număr" /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Localitate" htmlFor="loc"><Input id="loc" value={f.locality} onChange={set('locality')} /></Field>
        <Field label="Județ" htmlFor="county"><Input id="county" value={f.county} onChange={set('county')} /></Field>
      </div>
      <Button type="submit" loading={pending}><Save className="h-4 w-4" /> Salvează setările</Button>
    </form>
  );
}
