import type { Metadata } from 'next';
import { CategoryTiles } from '@/components/consumer/category-tiles';
import { getCategoryCounts } from '@/lib/queries';

export const metadata: Metadata = { title: 'Categorii de servicii auto' };

export default async function CategoriesPage() {
  const counts = await getCategoryCounts();
  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Categorii de servicii</h1>
      <p className="mt-1 text-fg-muted">Alege tipul de serviciu de care ai nevoie pentru mașina ta.</p>
      <div className="mt-6">
        <CategoryTiles counts={counts} />
      </div>
    </div>
  );
}
