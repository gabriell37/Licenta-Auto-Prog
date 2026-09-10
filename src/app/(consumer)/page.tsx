import Link from 'next/link';
import { Search, CalendarCheck, Car, ShieldCheck, Star, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchHero } from '@/components/consumer/search-hero';
import { CategoryTiles } from '@/components/consumer/category-tiles';
import { ShopCard } from '@/components/consumer/shop-card';
import { getCategoryCounts, getFeaturedShops } from '@/lib/queries';

export default async function HomePage() {
  const [counts, featured] = await Promise.all([getCategoryCounts(), getFeaturedShops(6)]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-brand-subtle/60 to-bg">
        <div className="container py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-fg-muted shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              #1 platformă de programări auto din România
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-fg sm:text-5xl">
              Service auto de încredere,{' '}
              <span className="text-brand">programat online</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-fg-muted sm:text-lg">
              Găsește mecanici, vulcanizări, ITP și detailing aproape de tine. Compară prețuri și recenzii,
              programează-te în câteva secunde — fără telefoane.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-2xl animate-fade-up" style={{ animationDelay: '80ms' }}>
            <SearchHero />
          </div>
          <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-fg-muted">
            <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-accent" /> Recenzii doar de la clienți reali</span>
            <span className="inline-flex items-center gap-1.5"><Car className="h-4 w-4 text-brand" /> Programare în sub un minut</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" /> Service-uri verificate</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-10 md:py-14">
        <SectionHeading title="Ce serviciu cauți?" subtitle="Alege o categorie și vezi service-urile disponibile" />
        <div className="mt-6">
          <CategoryTiles counts={counts} />
        </div>
      </section>

      {/* Featured shops */}
      <section className="container py-6 md:py-10">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading title="Service-uri de top" subtitle="Cele mai bine cotate, aproape de tine" />
          <Button asChild variant="ghost" size="sm" className="shrink-0">
            <Link href="/search">Vezi toate <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-surface">
        <div className="container py-12 md:py-16">
          <SectionHeading center title="Cum funcționează" subtitle="Trei pași simpli până la mașina reparată" />
          <div className="mx-auto mt-8 grid max-w-4xl gap-6 sm:grid-cols-3">
            {[
              { icon: Search, title: 'Caută & compară', desc: 'Găsește service-uri după serviciu, locație și mașina ta. Vezi prețuri și recenzii reale.' },
              { icon: CalendarCheck, title: 'Programează online', desc: 'Alege ziua și ora dintre intervalele libere. Atașează poze, video sau o înregistrare audio cu problema.' },
              { icon: Car, title: 'Lasă mașina', desc: 'Primești remindere automate și urmărești statusul în timp real, până e gata de ridicare.' },
            ].map((s, i) => (
              <div key={s.title} className="relative rounded-xl border border-border bg-bg p-6">
                <span className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-fg-on-brand">
                  {i + 1}
                </span>
                <s.icon className="h-7 w-7 text-brand" aria-hidden />
                <h3 className="mt-3 font-display font-semibold text-fg">{s.title}</h3>
                <p className="mt-1.5 text-sm text-fg-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business CTA */}
      <section className="container py-12 md:py-16">
        <div className="overflow-hidden rounded-2xl bg-brand px-6 py-10 text-center shadow-lg md:px-12 md:py-14">
          <h2 className="font-display text-2xl font-bold text-fg-on-brand sm:text-3xl">Ai un service auto?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-subtle/90 text-[15px]">
            Primește programări 24/7, reduci neprezentările cu remindere SMS și îți gestionezi calendarul,
            devizele și clienții într-un singur loc.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="accent">
              <Link href="/business">Listează-ți afacerea <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Link href="/business/pricing">Vezi prețurile</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeading({ title, subtitle, center }: { title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={center ? 'text-center' : ''}>
      <h2 className="font-display text-2xl font-bold tracking-tight text-fg">{title}</h2>
      {subtitle && <p className={`mt-1 text-fg-muted ${center ? 'mx-auto max-w-lg' : ''}`}>{subtitle}</p>}
    </div>
  );
}
