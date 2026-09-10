import Link from 'next/link';
import type { Metadata } from 'next';
import { Wrench, SearchX, Search, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Pagina nu a fost găsită' };

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center bg-bg-subtle px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-fg-on-brand">
          <Wrench className="h-5 w-5" />
        </span>
        <span className="font-display text-2xl font-extrabold tracking-tight text-fg">AutoProg</span>
      </Link>

      <div className="flex w-full max-w-md flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface-2 px-6 py-12 text-center animate-fade-up">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-subtle text-brand">
          <SearchX className="h-7 w-7" aria-hidden />
        </span>
        <p className="font-display text-sm font-semibold uppercase tracking-wide text-fg-subtle">Eroare 404</p>
        <h1 className="mt-1 font-display text-xl font-bold text-fg">Pagina nu a fost găsită</h1>
        <p className="mt-1.5 max-w-sm text-sm text-fg-muted">
          Pagina pe care o cauți nu există sau a fost mutată. Încearcă pagina principală sau caută un service auto.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/"><Home className="h-4 w-4" /> Pagina principală</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search"><Search className="h-4 w-4" /> Caută un service</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
