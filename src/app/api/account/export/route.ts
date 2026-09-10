import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/** GDPR data portability — export all of the user's data as JSON. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      vehicles: { include: { documents: true, problemLogs: true } },
      appointments: { include: { items: true, media: true, messages: true, review: true } },
      reviews: true,
      favorites: { include: { shop: { select: { name: true, slug: true } } } },
      problemLogs: true,
      consents: true,
      notifications: true,
    },
  });
  if (!user) return NextResponse.json({ error: 'Negăsit' }, { status: 404 });

  const { passwordHash, ...safe } = user;
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), user: safe }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="autoprog-date-personale.json"',
    },
  });
}
