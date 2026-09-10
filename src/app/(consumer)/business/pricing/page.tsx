import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Prețuri AutoProg Pro' };

const PLANS = [
  {
    name: 'Abonament AutoProg', price: '34,99 €', period: '/ lună', highlight: true,
    cta: 'Începe 14 zile gratuit', href: '/register?next=/pro',
    features: [
      'Programări online 24/7 nelimitate', '1 cont profesionist inclus', 'Profil pe AutoProg (indexat în Google)',
      'Calendar cu posturi de lucru & mecanici', 'Devize, fișe de lucru & DVI', 'Notificări SMS nelimitate',
      'Plăți online cu cardul', 'Rapoarte vânzări & performanță', 'Fără comision pe programări',
    ],
    note: '+ 9,99 € / profesionist adițional / lună',
  },
  {
    name: 'AutoProg Pro Plus', price: 'La cerere', period: '', highlight: false,
    cta: 'Contactează-ne', href: '/register?next=/pro',
    features: [
      'Tot din Abonament AutoProg', 'Setare cont & import de date', 'Modul facturare & e-Factura',
      'Calcul comisioane angajați', 'Integrare POS & casă de marcat', 'Asistență prioritizată',
    ],
    note: 'Soluții pentru afaceri medii și mari.',
  },
];

export default function PricingPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">Prețuri simple, fără surprize</h1>
        <p className="mt-3 text-fg-muted">Un singur abonament cu tot ce-ți trebuie. Prețurile nu includ TVA.</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
        {PLANS.map((p) => (
          <div key={p.name} className={`relative rounded-2xl border bg-surface p-6 shadow-sm ${p.highlight ? 'border-brand ring-1 ring-brand' : 'border-border'}`}>
            {p.highlight && <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 text-xs font-bold text-fg-on-brand">Cel mai popular</span>}
            <h2 className="font-display text-xl font-bold text-fg">{p.name}</h2>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-extrabold text-fg">{p.price}</span>
              <span className="text-fg-muted">{p.period}</span>
            </div>
            <p className="mt-1 text-sm text-fg-muted">{p.note}</p>
            <Button asChild className="mt-5 w-full" variant={p.highlight ? 'primary' : 'outline'} size="lg">
              <Link href={p.href}>{p.cta} <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <ul className="mt-6 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-fg">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
