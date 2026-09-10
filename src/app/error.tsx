'use client';

import Link from 'next/link';
import { Wrench, AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Error details stay in the console/logs — the user gets an actionable message only.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  function handleRetry() {
    reset();
  }

  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center bg-bg-subtle px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-fg-on-brand">
          <Wrench className="h-5 w-5" />
        </span>
        <span className="font-display text-2xl font-extrabold tracking-tight text-fg">AutoProg</span>
      </Link>

      <div className="flex w-full max-w-md flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface-2 px-6 py-12 text-center animate-fade-up">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-subtle text-danger">
          <AlertTriangle className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="font-display text-xl font-bold text-fg">A apărut o eroare neașteptată</h1>
        <p className="mt-1.5 max-w-sm text-sm text-fg-muted">
          Ne pare rău, ceva nu a funcționat corect. Poți încerca din nou sau te poți întoarce la pagina principală.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={handleRetry}>
            <RotateCcw className="h-4 w-4" /> Încearcă din nou
          </Button>
          <Button asChild variant="outline">
            <Link href="/"><Home className="h-4 w-4" /> Pagina principală</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
