import Link from 'next/link';
import type { Metadata } from 'next';
import { Search, CalendarCheck, Car, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Despre AutoProg',
  description: 'AutoProg — platformă demonstrativă de programări online la service-uri auto din România.',
};

export default function DesprePage() {
  return (
    <div className="container max-w-3xl py-8 md:py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight text-fg">Despre AutoProg</h1>
      <p className="mt-3 text-base leading-relaxed text-fg-muted">
        AutoProg este o platformă demonstrativă de programări online la service-uri auto, construită
        ca proiect educațional. Ideea este simplă: găsirea unui service bun și programarea unei
        intervenții nu ar trebui să însemne zeci de telefoane și liste de așteptare neclare.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-fg">Misiunea noastră</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">
          Vrem să arătăm cum ar putea funcționa o piață transparentă a serviciilor auto din România:
          prețuri afișate clar, recenzii lăsate doar de clienți care chiar au fost la service,
          intervale orare reale și un istoric complet al mașinii tale, într-un singur loc — de la
          schimbul de ulei până la expirarea ITP-ului.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-fg">Cum funcționează</h2>
        <ol className="mt-4 space-y-4">
          {[
            { icon: Search, title: 'Cauți și compari', desc: 'Filtrezi service-urile după categorie, localitate și recenzii. Vezi serviciile oferite, durata și prețul estimat înainte să te decizi.' },
            { icon: CalendarCheck, title: 'Te programezi online', desc: 'Alegi mașina din garajul tău virtual, serviciul dorit și un interval orar liber. Poți atașa poze sau o înregistrare audio cu problema.' },
            { icon: Car, title: 'Urmărești totul în timp real', desc: 'Primești notificări la fiecare schimbare de status: mașina a fost primită, e în diagnoză, devizul așteaptă aprobarea ta, e gata de ridicare.' },
          ].map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-xl border border-border bg-surface p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand">
                <s.icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold text-fg">{i + 1}. {s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-fg-muted">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 rounded-xl border border-border bg-surface-2 p-5">
        <h2 className="font-display text-base font-semibold text-fg">Proiect demonstrativ</h2>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">
          AutoProg este un proiect demonstrativ (lucrare de licență), nu un serviciu comercial.
          Service-urile, programările și conturile din platformă sunt date de test. Nu se procesează
          plăți și nu se prestează servicii auto reale.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/search">Caută un service <ArrowRight className="h-4 w-4" /></Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/business">Ai un service? Listează-l</Link>
        </Button>
      </div>
    </div>
  );
}
