import type { Metadata } from 'next';
import { Star, MessageSquareReply } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { RatingStars } from '@/components/rating-stars';
import { ReviewReply } from '@/components/pro/review-reply';
import { NoShopState } from '@/components/pro/no-shop-state';
import { requireShopAccess, getActiveShop } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Recenzii Pro' };

export default async function ProReviewsPage() {
  const user = await requireShopAccess();
  const shop = await getActiveShop(user);
  if (!shop) return <NoShopState isAdmin={user.role === 'ADMIN'} />;

  // Reviews hidden by platform moderation stay out of the shop's own list too.
  const reviews = await prisma.review.findMany({
    where: { shopId: shop.id, status: { in: ['PUBLISHED', 'PENDING'] } },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, avatarUrl: true } } },
  });

  const replied = reviews.filter((r) => r.reply).length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Recenzii</h1>
      <div className="mt-2 flex items-center gap-4">
        <RatingStars rating={shop.ratingAvg} count={shop.ratingCount} size={18} />
        <span className="text-sm text-fg-muted">· {replied}/{reviews.length} cu răspuns</span>
      </div>

      <div className="mt-5">
        {reviews.length === 0 ? (
          <EmptyState icon={Star} title="Nicio recenzie încă" description="Recenziile clienților vor apărea aici după programări finalizate." />
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <Avatar name={r.user.name} src={r.user.avatarUrl} size={36} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-fg">{r.user.name}</p>
                      <p className="text-xs text-fg-subtle">{formatDate(r.createdAt)}</p>
                    </div>
                    <RatingStars rating={r.rating} showValue={false} />
                  </div>
                  {r.body && <p className="mt-3 text-sm text-fg-muted">{r.body}</p>}
                  <ReviewReply reviewId={r.id} existing={r.reply} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
