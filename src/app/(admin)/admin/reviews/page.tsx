import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from '@/components/rating-stars';
import { ReviewModeration } from '@/components/admin/review-moderation';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin — Recenzii' };

export default async function AdminReviewsPage() {
  await requireAdmin();
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { name: true } }, shop: { select: { name: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Moderare recenzii</h1>

      <div className="mt-5 space-y-3">
        {reviews.map((r) => (
          <Card key={r.id} className={r.status === 'HIDDEN' ? 'opacity-60' : ''}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-fg">{r.user.name} <span className="font-normal text-fg-subtle">→ {r.shop.name}</span></p>
                  <div className="mt-1 flex items-center gap-2">
                    <RatingStars rating={r.rating} showValue={false} size={13} />
                    <span className="text-xs text-fg-subtle">{formatDate(r.createdAt)}</span>
                    {r.status === 'HIDDEN' && <Badge variant="danger">Ascunsă</Badge>}
                  </div>
                </div>
                <ReviewModeration reviewId={r.id} status={r.status} />
              </div>
              {r.body && <p className="mt-2 text-sm text-fg-muted">{r.body}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
