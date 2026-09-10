import { Skeleton } from '@/components/ui/skeleton';

// Replaces only the content area — the Pro header and sidebar come from the layout.
export default function ProLoading() {
  return (
    <div role="status" aria-label="Se încarcă pagina">
      <Skeleton className="h-7 w-48" />
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-4 h-64 rounded-xl" />
      <span className="sr-only">Se încarcă pagina…</span>
    </div>
  );
}
