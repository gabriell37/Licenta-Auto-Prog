'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function toggleFavoriteAction(shopId: string): Promise<{ favorited: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { favorited: false, error: 'auth' };

  const existing = await prisma.favorite.findUnique({
    where: { userId_shopId: { userId: session.userId, shopId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath('/account');
    return { favorited: false };
  }
  try {
    await prisma.favorite.create({ data: { userId: session.userId, shopId } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // P2003: stale session cookie (user deleted) or unknown shop id
      if (err.code === 'P2003') return { favorited: false, error: 'Sesiune expirată' };
      // P2002: double-click race — it's already favorited
      if (err.code === 'P2002') return { favorited: true };
    }
    throw err;
  }
  revalidatePath('/account');
  return { favorited: true };
}
