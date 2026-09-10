'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Hero search: free-text "what" + optional "where", routes to /search. */
export function SearchHero() {
  const router = useRouter();
  const [q, setQ] = React.useState('');
  const [where, setWhere] = React.useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (where.trim()) params.set('county', where.trim());
    router.push(`/search${params.toString() ? `?${params}` : ''}`);
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-2 shadow-lg sm:flex-row sm:items-center"
      role="search"
    >
      <div className="flex flex-1 items-center gap-2 px-2">
        <Search className="h-5 w-5 shrink-0 text-fg-subtle" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ce ai nevoie? ex: schimb ulei, ITP, frâne…"
          aria-label="Ce serviciu cauți"
          className="h-11 w-full bg-transparent text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
        />
      </div>
      <div className="hidden h-8 w-px bg-border sm:block" />
      <div className="flex flex-1 items-center gap-2 px-2 sm:max-w-[220px]">
        <MapPin className="h-5 w-5 shrink-0 text-fg-subtle" aria-hidden />
        <input
          value={where}
          onChange={(e) => setWhere(e.target.value)}
          placeholder="Oraș / județ"
          aria-label="Unde"
          className="h-11 w-full bg-transparent text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
        />
      </div>
      <Button type="submit" size="lg" className="shrink-0">
        <Search className="h-4 w-4" />
        Caută
      </Button>
    </form>
  );
}
