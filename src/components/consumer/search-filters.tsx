'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { CATEGORIES } from '@/lib/enums';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function SearchFilters({ counties }: { counties: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = React.useState(params.get('q') ?? '');
  const category = params.get('category') ?? '';
  const county = params.get('county') ?? '';
  const sort = params.get('sort') ?? 'relevance';

  const update = React.useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      router.replace(`/search?${next.toString()}`, { scroll: false });
    },
    [params, router]
  );

  // debounce free-text search
  React.useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get('q') ?? '') !== q) update({ q: q || undefined });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="space-y-4">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: q || undefined });
        }}
        className="flex items-center gap-2 rounded-xl border border-border-strong bg-surface px-3 shadow-sm"
      >
        <Search className="h-5 w-5 shrink-0 text-fg-subtle" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Caută serviciu, service sau oraș…"
          aria-label="Caută"
          className="h-12 w-full bg-transparent text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
        />
        {q && (
          <button type="button" onClick={() => setQ('')} aria-label="Șterge căutarea" className="text-fg-subtle hover:text-fg">
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto scroll-thin pb-1" role="group" aria-label="Filtru categorie">
        <Chip active={!category} onClick={() => update({ category: undefined })}>Toate</Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c.slug} active={category === c.slug} onClick={() => update({ category: category === c.slug ? undefined : c.slug })}>
            {c.nameRo}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-48">
          <Select aria-label="Județ" value={county} onChange={(e) => update({ county: e.target.value || undefined })}>
            <option value="">Toate județele</option>
            {counties.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select aria-label="Sortare" value={sort} onChange={(e) => update({ sort: e.target.value })}>
            <option value="relevance">Cele mai relevante</option>
            <option value="rating">Cea mai bună notă</option>
            <option value="reviews">Cele mai multe recenzii</option>
          </Select>
        </div>
        {(category || county || q || sort !== 'relevance') && (
          <button
            onClick={() => { setQ(''); router.replace('/search', { scroll: false }); }}
            className="text-sm font-medium text-brand hover:underline"
          >
            Resetează filtrele
          </button>
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-brand bg-brand text-fg-on-brand'
          : 'border-border-strong bg-surface text-fg-muted hover:bg-surface-2 hover:text-fg'
      )}
    >
      {children}
    </button>
  );
}
