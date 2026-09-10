'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { SHOP_STATUSES, type ShopStatus } from '@/lib/enums';

type ActionResult = { ok: boolean; error?: string };

const REVIEW_STATUSES = ['PUBLISHED', 'PENDING', 'HIDDEN'] as const;

async function audit(
  actorId: string,
  action: string,
  entity: string,
  entityId: string,
  meta: Record<string, unknown>,
  shopId?: string
) {
  await prisma.auditLog.create({
    data: { actorId, shopId: shopId ?? null, action, entity, entityId, meta: JSON.stringify(meta) },
  });
}

export async function setShopStatusAction(shopId: string, status: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!SHOP_STATUSES.includes(status as ShopStatus)) return { ok: false, error: 'Status invalid.' };
  const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { status: true } });
  if (!shop) return { ok: false, error: 'Service negăsit.' };

  await prisma.shop.update({ where: { id: shopId }, data: { status } });
  await audit(admin.id, 'shop.status.set', 'Shop', shopId, { from: shop.status, to: status }, shopId);
  revalidatePath('/admin/shops');
  revalidatePath('/admin');
  return { ok: true };
}

export async function setReviewStatusAction(reviewId: string, status: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!REVIEW_STATUSES.includes(status as (typeof REVIEW_STATUSES)[number])) {
    return { ok: false, error: 'Status invalid.' };
  }
  const existing = await prisma.review.findUnique({ where: { id: reviewId }, select: { status: true } });
  if (!existing) return { ok: false, error: 'Recenzie negăsită.' };

  const review = await prisma.review.update({ where: { id: reviewId }, data: { status } });
  // recompute aggregate for the shop
  const agg = await prisma.review.aggregate({
    where: { shopId: review.shopId, status: 'PUBLISHED' },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.shop.update({
    where: { id: review.shopId },
    data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count },
  });
  await audit(admin.id, 'review.status.set', 'Review', reviewId, { from: existing.status, to: status }, review.shopId);
  revalidatePath('/admin/reviews');
  return { ok: true };
}
