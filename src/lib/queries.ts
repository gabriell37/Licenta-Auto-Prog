import { prisma } from './prisma';
import type { Prisma } from '@prisma/client';

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function getCategoryCounts() {
  const shops = await prisma.shop.groupBy({
    by: ['primaryCategory'],
    where: { status: 'VERIFIED' },
    _count: true,
  });
  return Object.fromEntries(shops.map((s) => [s.primaryCategory, s._count]));
}

export async function getFeaturedShops(limit = 6) {
  return prisma.shop.findMany({
    where: { status: 'VERIFIED' },
    orderBy: [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }],
    take: limit,
    include: { services: { take: 1, orderBy: { priceFromBani: 'asc' } } },
  });
}

export type ShopSort = 'relevance' | 'rating' | 'reviews';

export async function searchShops(opts: {
  q?: string;
  category?: string;
  county?: string;
  sort?: ShopSort;
}) {
  const where: Prisma.ShopWhereInput = { status: 'VERIFIED' };
  if (opts.category) where.primaryCategory = opts.category;
  // composed via AND so the location OR doesn't clobber the text-search OR
  const and: Prisma.ShopWhereInput[] = [];
  if (opts.county) {
    // users type cities ("Cluj-Napoca") as often as counties — match either
    and.push({ OR: [{ county: { contains: opts.county } }, { locality: { contains: opts.county } }] });
  }
  if (opts.q) {
    and.push({
      OR: [
        { name: { contains: opts.q } },
        { description: { contains: opts.q } },
        { locality: { contains: opts.q } },
        { services: { some: { name: { contains: opts.q } } } },
      ],
    });
  }
  if (and.length > 0) where.AND = and;
  const orderBy: Prisma.ShopOrderByWithRelationInput[] =
    opts.sort === 'reviews'
      ? [{ ratingCount: 'desc' }]
      : opts.sort === 'rating'
        ? [{ ratingAvg: 'desc' }]
        : [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }];

  return prisma.shop.findMany({
    where,
    orderBy,
    include: { services: { orderBy: { priceFromBani: 'asc' }, take: 3 } },
    take: 50,
  });
}

export async function getCounties() {
  const rows = await prisma.shop.findMany({
    where: { status: 'VERIFIED', county: { not: null } },
    distinct: ['county'],
    select: { county: true },
    orderBy: { county: 'asc' },
  });
  return rows.map((r) => r.county!).filter(Boolean);
}

export async function getShopBySlug(slug: string) {
  return prisma.shop.findFirst({
    where: { slug, status: 'VERIFIED' },
    include: {
      services: { where: { active: true }, orderBy: [{ sortOrder: 'asc' }] },
      resources: { where: { active: true }, orderBy: { sortOrder: 'asc' } },
      reviews: {
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true, avatarUrl: true } } },
      },
    },
  });
}

export async function getUserVehicles(userId: string) {
  return prisma.vehicle.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { appointments: true } } },
  });
}
