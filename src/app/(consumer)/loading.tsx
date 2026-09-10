import { Skeleton, SkeletonList } from '@/components/ui/skeleton';

export default function ConsumerLoading() {
  return (
    <div className="container max-w-3xl py-6 md:py-8" role="status" aria-label="Se încarcă pagina">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      <div className="mt-6">
        <SkeletonList rows={4} />
      </div>
      <span className="sr-only">Se încarcă pagina…</span>
    </div>
  );
}
