'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getStaffForShop } from '@/lib/auth';
import { shopSettingsSchema } from '@/lib/validators';

type ShopInput = {
  name: string; description?: string; phone?: string; email?: string;
  addressLine?: string; locality?: string; county?: string;
};

export async function updateShopAction(shopId: string, input: ShopInput): Promise<{ ok: boolean; error?: string }> {
  const staff = await getStaffForShop(shopId);
  if (!staff) return { ok: false, error: 'Acces interzis' };
  const parsed = shopSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Date invalide.' };
  const d = parsed.data;

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      name: d.name,
      description: d.description || null,
      phone: d.phone || null,
      email: d.email || null,
      addressLine: d.addressLine || null,
      locality: d.locality || null,
      county: d.county || null,
    },
  });
  revalidatePath('/pro/settings');
  revalidatePath('/pro');
  return { ok: true };
}
