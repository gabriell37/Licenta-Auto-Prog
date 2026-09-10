import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const COOKIE = 'autoprog_session';
// A missing AUTH_SECRET in production would let anyone forge sessions with the
// known fallback — refuse to start instead.
if (process.env.NODE_ENV === 'production' && !process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET must be set in production');
}
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret');
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Static bcrypt hash compared against when the email doesn't exist, so login
// timing doesn't reveal which emails are registered.
const DUMMY_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8i9PJzO2v8d3M5l6mUq0aFqGklXG36';

export type SessionPayload = { userId: string; role: string };

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}
export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}

/**
 * Constant-cost credential check: when the user lookup misses, still run a
 * bcrypt compare (against a dummy hash) and always return false.
 */
export async function verifyCredentials(
  pw: string,
  hash: string | null | undefined
): Promise<boolean> {
  const ok = await bcrypt.compare(pw, hash || DUMMY_HASH);
  return hash ? ok : false;
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    // COOKIE_SECURE=0 lets the demo VPS (plain HTTP on a bare IP) keep sessions;
    // remove the override once the site is behind HTTPS.
    secure: process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== '0',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    return { userId: payload.userId as string, role: payload.role as string };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    // Never let the hash travel beyond the auth layer (one prop-spread away
    // from a client component otherwise).
    omit: { passwordHash: true },
    include: { memberships: { include: { shop: true }, where: { active: true } } },
  });
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Require a logged-in user or redirect to login (optionally preserving return path). */
export async function requireUser(returnTo?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login${returnTo ? `?next=${encodeURIComponent(returnTo)}` : ''}`);
  }
  return user;
}

/** Require staff membership on a shop (any role) or throw/redirect. */
export async function requireShopAccess(shopId?: string): Promise<CurrentUser> {
  const user = await requireUser('/pro');
  const memberships = user.memberships;
  if (memberships.length === 0 && user.role !== 'ADMIN') {
    redirect('/pro/onboarding');
  }
  if (shopId && user.role !== 'ADMIN' && !memberships.some((m) => m.shopId === shopId)) {
    redirect('/pro');
  }
  return user;
}

/** The shop the current staff user is acting within (first membership for MVP). */
export async function getActiveShop(user: CurrentUser) {
  return user.memberships[0]?.shop ?? null;
}

/**
 * Action-level tenancy guard: the current user must be an active staff member
 * of `shopId` (or platform admin). Returns the user, or null when denied —
 * callers return a friendly error instead of throwing.
 */
export async function getStaffForShop(shopId: string): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role === 'ADMIN') return user;
  const isMember = user.memberships.some((m) => m.shopId === shopId && m.active);
  return isMember ? user : null;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser('/admin');
  if (user.role !== 'ADMIN') redirect('/');
  return user;
}
