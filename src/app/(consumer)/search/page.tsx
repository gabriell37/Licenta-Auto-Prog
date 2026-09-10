import * as React from 'react';
import type { Metadata } from 'next';
import { SearchX } from 'lucide-react';
import { SearchFilters } from '@/components/consumer/search-filters';
import { ShopCard } from '@/components/consumer/shop-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton';
import { searchShops, getCounties, type ShopSort } from '@/lib/queries';
import { CATEGORIES } from '@/lib/enums';

export const metadata: Metadata = { title: 'Caută service auto' };

type SP = { q?: string; category?: string; county?: string; sort?: string };

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const counties = await getCounties();

  return (
    <div className="container py-6 md:py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Caută service auto</h1>
      <p className="mt-1 text-fg-muted">Compară service-uri după serviciu, locație și recenzii.</p>

      <div className="mt-6">
        <React.Suspense fallback={<div className="h-40" />}>
          <SearchFilters counties={counties} />
        </React.Suspense>
      </div>

      <div className="mt-6">
        <React.Suspense key={JSON.stringify(sp)} fallback={<SkeletonList rows={6} />}>
          <Results sp={sp} />
        </React.Suspense>
      </div>
    </div>
  );
}

async function Results({ sp }: { sp: SP }) {
  const shops = await searchShops({
    q: sp.q,
    category: sp.category,
    county: sp.county,
    sort: (sp.sort as ShopSort) ?? 'relevance',
  });

  const catName = CATEGORIES.find((c) => c.slug === sp.category)?.nameRo;

  if (shops.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="Niciun service găsit"
        description="Încearcă să elimini unele filtre sau să cauți în alt oraș. Adăugăm constant service-uri noi."
        action={
          <Button asChild variant="outline">
            <a href="/search">Resetează căutarea</a>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-fg-muted" role="status" aria-live="polite">
        <span className="font-semibold text-fg">{shops.length}</span> service-uri
        {catName ? ` pentru ${catName}` : ''}
        {sp.county ? ` în ${sp.county}` : ''}
        {sp.q ? ` · „${sp.q}”` : ''}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </>
  );
}
