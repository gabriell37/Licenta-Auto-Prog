'use server';

import { unlink } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession, destroySession, requireUser, hashPassword, verifyPassword } from '@/lib/auth';
import { profileSchema, changePasswordSchema, consentSchema } from '@/lib/validators';

export type ActionResult = { ok: boolean; error?: string };

export async function updateProfileAction(input: {
  name: string;
  phone?: string;
}): Promise<ActionResult> {
  const user = await requireUser('/account/settings');
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Verifică datele introduse.' };
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
  });
  revalidatePath('/account');
  revalidatePath('/account/settings');
  return { ok: true };
}

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  const user = await requireUser('/account/settings');
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Verifică datele introduse.' };
  }
  // getCurrentUser() omits passwordHash by design — fetch it explicitly here.
  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!record || !(await verifyPassword(parsed.data.currentPassword, record.passwordHash))) {
    return { ok: false, error: 'Parola actuală este incorectă.' };
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });
  return { ok: true };
}

export async function setConsentAction(type: string, granted: boolean): Promise<{ ok: boolean }> {
  const session = await getSession();
  if (!session) return { ok: false };
  const parsed = consentSchema.safeParse({ type, granted });
  if (!parsed.success) return { ok: false };
  await prisma.consentRecord.create({
    data: { userId: session.userId, type: parsed.data.type, granted: parsed.data.granted },
  });
  revalidatePath('/account/settings');
  return { ok: true };
}

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function deleteAccountAction(): Promise<void> {
  const user = await requireUser();

  // Cascade delete removes the Media rows, but the files on disk would be
  // orphaned — unlink them first (GDPR erasure covers uploaded files too).
  const media = await prisma.media.findMany({
    where: { uploaderId: user.id },
    select: { url: true },
  });
  for (const m of media) {
    // basename() strips any path segments so a crafted url can't escape uploads/.
    const fileName = path.basename(m.url);
    if (!fileName || !m.url.startsWith('/uploads/')) continue;
    try {
      await unlink(path.join(UPLOADS_DIR, fileName));
    } catch {
      // file already gone or locked — the DB row is removed by the cascade anyway
    }
  }

  // GDPR right to erasure — cascade deletes remove vehicles, appointments, media rows, etc.
  await prisma.user.delete({ where: { id: user.id } });
  await destroySession();
  redirect('/');
}
