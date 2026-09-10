'use server';

import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createSession, destroySession, getSession, hashPassword, verifyCredentials } from '@/lib/auth';
import { loginSchema, registerSchema } from '@/lib/validators';
import { rateLimit, resetRateLimit } from '@/lib/rate-limit';

export type AuthState = { error?: string; fieldErrors?: Record<string, string> };

function roleHome(role: string): string {
  return role === 'ADMIN' ? '/admin' : role === 'STAFF' ? '/pro' : '/';
}

/** Open-redirect guard: only same-origin absolute paths ("//evil.com" is protocol-relative). */
function safeNext(raw: FormDataEntryValue | null, fallback: string): string {
  const next = typeof raw === 'string' ? raw : '';
  return next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const existing = await getSession();
  if (existing) redirect(roleHome(existing.role));

  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues) fe[String(i.path[0])] = i.message;
    return { fieldErrors: fe, error: 'Verifică datele introduse.' };
  }
  const { name, email, phone, password } = parsed.data;

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash: await hashPassword(password),
        role: 'CUSTOMER',
        consents: { create: [{ type: 'TERMS', granted: true }, { type: 'PRIVACY', granted: true }] },
      },
    });
  } catch (err) {
    // unique index is the source of truth — a pre-check would race with concurrent registers
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { error: 'Există deja un cont cu acest email.' };
    }
    throw err;
  }
  await createSession({ userId: user.id, role: user.role });

  redirect(safeNext(formData.get('next'), '/'));
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const existing = await getSession();
  if (existing) redirect(roleHome(existing.role));

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues) fe[String(i.path[0])] = i.message;
    return { fieldErrors: fe };
  }
  const { email, password } = parsed.data;

  if (!rateLimit(`login:${email}`, 5, 15 * 60 * 1000)) {
    return { error: 'Prea multe încercări. Reîncearcă în câteva minute.' };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // verifyCredentials runs a bcrypt compare even on a miss, so unknown emails take the same time
  if (!(await verifyCredentials(password, user?.passwordHash))) {
    return { error: 'Email sau parolă incorecte.' };
  }
  resetRateLimit(`login:${email}`);
  await createSession({ userId: user!.id, role: user!.role });

  redirect(safeNext(formData.get('next'), roleHome(user!.role)));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/');
}
