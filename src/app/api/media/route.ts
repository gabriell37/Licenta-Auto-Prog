import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getSession, getStaffForShop } from '@/lib/auth';
import { mediaMetaSchema } from '@/lib/validators';
import type { MediaKind } from '@/lib/enums';

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB
const KIND_BY_PREFIX: Record<string, MediaKind> = { image: 'IMAGE', video: 'VIDEO', audio: 'AUDIO' };
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/gif': 'gif',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
  'audio/webm': 'weba', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/wav': 'wav',
};

// Reject files whose bytes contradict the declared image mime (renamed executables etc.).
// HEIC/GIF have no check here — container formats vary; the mime allowlist still applies.
function matchesImageSignature(mime: string, buf: Buffer): boolean {
  switch (mime) {
    case 'image/jpeg':
      return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    case 'image/png':
      return buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    case 'image/webp':
      return buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';
    default:
      return true;
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Niciun fișier' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Fișier prea mare (max 50MB)' }, { status: 413 });

  const prefix = file.type.split('/')[0] ?? '';
  const kind = KIND_BY_PREFIX[prefix];
  if (!kind) return NextResponse.json({ error: 'Tip fișier nesuportat' }, { status: 415 });

  const rawCaption = form.get('caption');
  const meta = mediaMetaSchema.safeParse({
    kind,
    caption: typeof rawCaption === 'string' && rawCaption ? rawCaption : undefined,
  });
  if (!meta.success) return NextResponse.json({ error: 'Descriere prea lungă (max 200 caractere)' }, { status: 400 });

  const durationRaw = form.get('durationSec');
  const durationNum = typeof durationRaw === 'string' && durationRaw !== '' ? Number(durationRaw) : NaN;
  const durationSec = Number.isFinite(durationNum) ? Math.round(durationNum) : null;

  const appointmentId = (form.get('appointmentId') as string) || null;
  const vehicleId = (form.get('vehicleId') as string) || null;

  if (appointmentId) {
    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { userId: true, shopId: true },
    });
    if (!appt) return NextResponse.json({ error: 'Programare inexistentă' }, { status: 400 });
    if (appt.userId !== session.userId && !(await getStaffForShop(appt.shopId))) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 });
    }
  }
  if (vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { userId: true } });
    if (!vehicle) return NextResponse.json({ error: 'Vehicul inexistent' }, { status: 400 });
    if (vehicle.userId !== session.userId) return NextResponse.json({ error: 'Acces interzis' }, { status: 403 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (kind === 'IMAGE' && !matchesImageSignature(file.type, bytes)) {
    return NextResponse.json({ error: 'Fișierul nu este o imagine validă' }, { status: 415 });
  }

  const ext = EXT[file.type] ?? prefix;
  const fileName = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), bytes);

  const media = await prisma.media.create({
    data: {
      uploaderId: session.userId,
      kind,
      url: `/uploads/${fileName}`,
      mimeType: file.type,
      sizeBytes: file.size,
      durationSec,
      caption: meta.data.caption ?? null,
      appointmentId,
      vehicleId,
    },
  });

  return NextResponse.json({
    id: media.id, url: media.url, kind: media.kind, mimeType: media.mimeType, sizeBytes: media.sizeBytes,
  });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id lipsă' }, { status: 400 });

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media || media.uploaderId !== session.userId) {
    return NextResponse.json({ error: 'Negăsit' }, { status: 404 });
  }
  await prisma.media.delete({ where: { id } });

  // remove the file from disk; basename + containment check defeats traversal in a tampered url
  if (media.url.startsWith('/uploads/')) {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.resolve(uploadsDir, path.basename(media.url));
    if (filePath.startsWith(uploadsDir + path.sep)) {
      try {
        await unlink(filePath);
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') console.error('media unlink failed', err);
      }
    }
  }
  return NextResponse.json({ ok: true });
}
