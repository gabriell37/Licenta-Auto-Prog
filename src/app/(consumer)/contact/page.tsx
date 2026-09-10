import Link from 'next/link';
import type { Metadata } from 'next';
import { Mail, Clock, Store, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactează echipa AutoProg.',
};

export default function ContactPage() {
  return (
    <div className="container max-w-2xl py-8 md:py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight text-fg">Contact</h1>
      <p className="mt-3 text-base leading-relaxed text-fg-muted">
        Ai o întrebare, o sugestie sau ai întâmpinat o problemă? Scrie-ne și revenim cât de repede
        putem.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Echipa AutoProg</CardTitle>
          <CardDescription>Proiect demonstrativ — răspundem pe email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand">
              <Mail className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium text-fg">Email</p>
              <a href="mailto:contact@autoprog.ro" className="text-sm text-brand hover:underline">
                contact@autoprog.ro
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand">
              <Clock className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium text-fg">Program de răspuns</p>
              <p className="text-sm text-fg-muted">Luni – Vineri, 9:00 – 18:00</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-5 w-5 text-brand" /> Ai un service auto?
          </CardTitle>
          <CardDescription>
            Listează-ți afacerea pe AutoProg și primește programări online de la clienți noi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/business">Vezi detalii pentru service-uri <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
