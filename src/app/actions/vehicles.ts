'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { vehicleSchema, vehicleDocumentSchema } from '@/lib/validators';
import { decodeVin } from '@/lib/vin';

export type VehicleFormState = { error?: string; fieldErrors?: Record<string, string>; ok?: boolean };

function parseForm(formData: FormData) {
  const raw = Object.fromEntries(formData);
  // strip empties so optional coercions don't choke
  for (const k of Object.keys(raw)) if (raw[k] === '') delete raw[k];
  return vehicleSchema.safeParse(raw);
}

/** Only same-origin paths — a tampered `next` must never leave the site. */
function safeReturnPath(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null;
  return value.startsWith('/') && !value.startsWith('//') ? value : null;
}

export async function addVehicleAction(_prev: VehicleFormState, formData: FormData): Promise<VehicleFormState> {
  const user = await requireUser('/garage');
  const parsed = parseForm(formData);
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues) fe[String(i.path[0])] = i.message;
    return { fieldErrors: fe, error: 'Verifică datele introduse.' };
  }
  const v = parsed.data;
  const created = await prisma.vehicle.create({
    data: {
      userId: user.id,
      make: v.make, model: v.model, year: v.year ?? null,
      vin: v.vin || null, plate: v.plate || null, engine: v.engine || null,
      fuel: v.fuel ?? null, mileage: v.mileage ?? null, color: v.color || null, nickname: v.nickname || null,
    },
  });
  revalidatePath('/garage');
  // Came from a flow (e.g. booking)? Send the user straight back, with the new
  // car identified so the flow can preselect it.
  const next = safeReturnPath(formData.get('next'));
  if (next) {
    redirect(`${next}${next.includes('?') ? '&' : '?'}vehicle=${created.id}`);
  }
  redirect('/garage');
}

export async function updateVehicleAction(id: string, _prev: VehicleFormState, formData: FormData): Promise<VehicleFormState> {
  const user = await requireUser('/garage');
  const owned = await prisma.vehicle.findFirst({ where: { id, userId: user.id } });
  if (!owned) return { error: 'Autovehicul negăsit.' };
  const parsed = parseForm(formData);
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues) fe[String(i.path[0])] = i.message;
    return { fieldErrors: fe };
  }
  const v = parsed.data;
  await prisma.vehicle.update({
    where: { id },
    data: {
      make: v.make, model: v.model, year: v.year ?? null,
      vin: v.vin || null, plate: v.plate || null, engine: v.engine || null,
      fuel: v.fuel ?? null, mileage: v.mileage ?? null, color: v.color || null, nickname: v.nickname || null,
    },
  });
  revalidatePath(`/garage/${id}`);
  revalidatePath('/garage');
  redirect(`/garage/${id}`);
}

export async function deleteVehicleAction(id: string): Promise<void> {
  const user = await requireUser('/garage');
  await prisma.vehicle.deleteMany({ where: { id, userId: user.id } });
  revalidatePath('/garage');
  redirect('/garage');
}

export async function decodeVinAction(vin: string) {
  return decodeVin(vin);
}

export async function addVehicleDocumentAction(input: {
  vehicleId: string;
  type: string;
  number?: string;
  expiresAt?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser('/garage');
  const parsed = vehicleDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Verifică datele introduse.' };
  }
  const { vehicleId, type, number, expiresAt } = parsed.data;
  const owned = await prisma.vehicle.findFirst({ where: { id: vehicleId, userId: user.id } });
  if (!owned) return { ok: false, error: 'Autovehicul negăsit.' };

  let expires: Date | null = null;
  if (expiresAt) {
    const d = new Date(expiresAt);
    if (Number.isNaN(d.getTime())) return { ok: false, error: 'Data de expirare este invalidă.' };
    expires = d;
  }
  await prisma.vehicleDocument.create({
    data: { vehicleId, type, number: number || null, expiresAt: expires },
  });
  revalidatePath(`/garage/${vehicleId}`);
  return { ok: true };
}

export async function deleteVehicleDocumentAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser('/garage');
  const doc = await prisma.vehicleDocument.findFirst({
    where: { id, vehicle: { userId: user.id } },
    select: { id: true, vehicleId: true },
  });
  if (!doc) return { ok: false, error: 'Document negăsit.' };
  await prisma.vehicleDocument.delete({ where: { id: doc.id } });
  revalidatePath(`/garage/${doc.vehicleId}`);
  return { ok: true };
}

export async function addProblemLogAction(vehicleId: string, text: string): Promise<{ ok: boolean }> {
  const user = await requireUser('/garage');
  const owned = await prisma.vehicle.findFirst({ where: { id: vehicleId, userId: user.id } });
  if (!owned || !text.trim()) return { ok: false };
  await prisma.problemLog.create({ data: { vehicleId, userId: user.id, text: text.trim() } });
  revalidatePath(`/garage/${vehicleId}`);
  return { ok: true };
}
