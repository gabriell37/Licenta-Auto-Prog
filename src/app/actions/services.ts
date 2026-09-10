'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getStaffForShop } from '@/lib/auth';
import { serviceSchema } from '@/lib/validators';
import { toBani } from '@/lib/utils';

type ActionResult = { ok: boolean; error?: string };

const DENIED: ActionResult = { ok: false, error: 'Acces interzis' };

type ServiceInput = {
  name: string; categoryId?: string; description?: string;
  durationMin: number; priceRon: number; priceType: string;
};

/** Seed data / stale clients can send a category id that no longer exists — store null instead of failing the FK. */
async function resolveCategoryId(categoryId: string | undefined): Promise<string | null> {
  if (!categoryId) return null;
  const exists = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  return exists ? categoryId : null;
}

export async function createServiceAction(shopId: string, input: ServiceInput): Promise<ActionResult> {
  const staff = await getStaffForShop(shopId);
  if (!staff) return DENIED;
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Date invalide.' };
  const d = parsed.data;

  const categoryId = await resolveCategoryId(d.categoryId || undefined);
  const count = await prisma.service.count({ where: { shopId } });
  await prisma.service.create({
    data: {
      shopId, name: d.name, categoryId, description: d.description?.trim() || null,
      durationMin: d.durationMin, priceFromBani: toBani(d.priceRon), priceType: d.priceType, sortOrder: count,
    },
  });
  revalidatePath('/pro/services');
  return { ok: true };
}

export async function updateServiceAction(id: string, input: ServiceInput): Promise<ActionResult> {
  const svc = await prisma.service.findUnique({ where: { id } });
  if (!svc) return { ok: false, error: 'Serviciu negăsit.' };
  const staff = await getStaffForShop(svc.shopId);
  if (!staff) return DENIED;
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Date invalide.' };
  const d = parsed.data;

  const categoryId = await resolveCategoryId(d.categoryId || undefined);
  await prisma.service.update({
    where: { id },
    data: {
      name: d.name, categoryId,
      // The manager form doesn't edit description — leave it untouched unless sent.
      ...(d.description !== undefined ? { description: d.description.trim() || null } : {}),
      durationMin: d.durationMin, priceFromBani: toBani(d.priceRon), priceType: d.priceType,
    },
  });
  revalidatePath('/pro/services');
  return { ok: true };
}

export async function toggleServiceActiveAction(id: string): Promise<ActionResult> {
  const svc = await prisma.service.findUnique({ where: { id } });
  if (!svc) return { ok: false, error: 'Serviciu negăsit.' };
  const staff = await getStaffForShop(svc.shopId);
  if (!staff) return DENIED;
  await prisma.service.update({ where: { id }, data: { active: !svc.active } });
  revalidatePath('/pro/services');
  return { ok: true };
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  const svc = await prisma.service.findUnique({ where: { id } });
  if (!svc) return { ok: false, error: 'Serviciu negăsit.' };
  const staff = await getStaffForShop(svc.shopId);
  if (!staff) return DENIED;
  await prisma.service.delete({ where: { id } });
  revalidatePath('/pro/services');
  return { ok: true };
}
