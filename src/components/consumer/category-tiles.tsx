import Link from 'next/link';
import { CategoryIcon } from '@/components/category-icon';
import { CATEGORIES } from '@/lib/enums';

export function CategoryTiles({ counts }: { counts: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={`/search?category=${c.slug}`}
          className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-subtle text-brand transition-colors group-hover:bg-brand group-hover:text-fg-on-brand">
            <CategoryIcon name={c.icon} className="h-6 w-6" />
          </span>
          <span className="text-sm font-medium text-fg leading-tight">{c.nameRo}</span>
          {counts[c.slug] ? (
            <span className="text-xs text-fg-subtle">{counts[c.slug]} service-uri</span>
          ) : (
            <span className="text-xs text-fg-subtle">În curând</span>
          )}
        </Link>
      ))}
    </div>
  );
}
