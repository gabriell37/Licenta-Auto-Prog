import Link from 'next/link';
import type { Metadata } from 'next';
import { CalendarClock, Bell, CreditCard, BarChart3, Users, FileText, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Pentru service-uri auto',
  description: 'Primește programări online 24/7, reduci neprezentările și îți gestionezi tot service-ul dintr-un singur loc cu AutoProg Pro.',
};

const FEATURES = [
  { icon: CalendarClock, title: 'Calendar & programări 24/7', desc: 'Clienții se programează singuri online, pe bază de disponibilitate reală a posturilor de lucru și mecanicilor.' },
  { icon: Bell, title: 'Mai puține neprezentări', desc: 'Remindere automate și confirmări care reduc no-show-urile și golurile din program.' },
  { icon: FileText, title: 'Devize & fișe de lucru', desc: 'Întocmești devize, le trimiți clientului spre aprobare și urmărești lucrarea până la final.' },
  { icon: CreditCard, title: 'Plăți & facturare', desc: 'Încasezi online, emiți bon și factură, pregătit pentru e-Factura.' },
  { icon: Users, title: 'CRM & istoric pe VIN', desc: 'Toți clienții și mașinile lor, cu istoric complet de service per autovehicul.' },
  { icon: BarChart3, title: 'Rapoarte & analize', desc: 'Vezi veniturile, gradul de ocupare al posturilor și productivitatea echipei.' },
];

export default function BusinessPage() {
  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-brand-subtle/60 to-bg">
        <div className="container py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-fg sm:text-5xl">
              Umple-ți posturile de lucru cu <span className="text-brand">AutoProg Pro</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-fg-muted">
              Platforma completă de programări și management pentru service-uri auto din România. Programări online 24/7,
              devize, fișe de lucru, plăți și rapoarte — într-un singur loc.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg"><Link href="/register?next=/pro">Începe gratuit 14 zile <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/business/pricing">Vezi prețurile</Link></Button>
            </div>
            <p className="mt-3 text-sm text-fg-subtle">Fără comision pe programări · Anulezi oricând</p>
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-subtle text-brand"><f.icon className="h-6 w-6" /></span>
              <h3 className="mt-4 font-display font-semibold text-fg">{f.title}</h3>
              <p className="mt-1.5 text-sm text-fg-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="container grid gap-6 py-12 text-center sm:grid-cols-3">
          {[['10.000+', 'specialiști folosesc AutoProg'], ['500.000+', 'vizitatori lunar pe platformă'], ['0%', 'comision pe programări']].map(([n, l]) => (
            <div key={l}><p className="font-display text-3xl font-extrabold text-brand">{n}</p><p className="mt-1 text-sm text-fg-muted">{l}</p></div>
          ))}
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="rounded-2xl bg-brand px-6 py-12 text-center shadow-lg">
          <h2 className="font-display text-2xl font-bold text-fg-on-brand sm:text-3xl">Gata să începi?</h2>
          <p className="mx-auto mt-2 max-w-md text-brand-subtle/90">Listează-ți service-ul în câteva minute și primește prima programare azi.</p>
          <Button asChild size="lg" variant="accent" className="mt-6"><Link href="/register?next=/pro">Creează cont service</Link></Button>
          <ul className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-brand-subtle/90">
            {['14 zile gratuit', 'Fără card la înregistrare', 'Suport în română'].map((x) => (
              <li key={x} className="inline-flex items-center gap-1"><Check className="h-4 w-4" /> {x}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
