import { z } from 'zod';
import {
  CONSENT_TYPES,
  DVI_SEVERITIES,
  ESTIMATE_LINE_KINDS,
  FUEL_TYPES,
  MEDIA_KINDS,
  PRICE_TYPES,
  VEHICLE_DOCUMENT_TYPES,
} from './enums';

// bcrypt only uses the first 72 bytes — longer passwords would be silently truncated.
const password = z
  .string()
  .min(8, 'Parola trebuie să aibă minim 8 caractere')
  .max(72, 'Parola poate avea maxim 72 de caractere');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Numele este prea scurt').max(80),
  email: z.string().trim().toLowerCase().email('Email invalid'),
  phone: z.string().trim().min(6).max(20).optional().or(z.literal('')),
  password,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email invalid'),
  password: z.string().min(1, 'Introdu parola').max(72),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Numele este prea scurt').max(80),
  phone: z.string().trim().min(6, 'Telefon invalid').max(20).optional().or(z.literal('')),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Introdu parola actuală').max(72),
  newPassword: password,
});

export const vehicleSchema = z.object({
  make: z.string().trim().min(1, 'Marca este obligatorie').max(40),
  model: z.string().trim().min(1, 'Modelul este obligatoriu').max(40),
  year: z.coerce.number().int().min(1950).max(2100).optional(),
  vin: z.string().trim().max(17).optional().or(z.literal('')),
  plate: z.string().trim().max(12).optional().or(z.literal('')),
  engine: z.string().trim().max(40).optional().or(z.literal('')),
  fuel: z.enum(FUEL_TYPES).optional(),
  mileage: z.coerce.number().int().min(0).max(2_000_000).optional(),
  color: z.string().trim().max(30).optional().or(z.literal('')),
  nickname: z.string().trim().max(40).optional().or(z.literal('')),
});
export type VehicleInput = z.infer<typeof vehicleSchema>;

export const vehicleDocumentSchema = z.object({
  vehicleId: z.string().min(1),
  type: z.enum(VEHICLE_DOCUMENT_TYPES),
  number: z.string().trim().max(60).optional().or(z.literal('')),
  expiresAt: z.string().trim().optional().or(z.literal('')),
});

export const bookingSchema = z.object({
  shopId: z.string().min(1),
  vehicleId: z.string().min(1, 'Alege un autovehicul'),
  serviceIds: z.array(z.string().min(1)).min(1, 'Alege cel puțin un serviciu').max(20),
  startAt: z.string().datetime({ message: 'Alege data și ora' }),
  resourceId: z.string().optional(),
  mode: z.enum(['DROP_OFF', 'WAIT']).default('DROP_OFF'),
  problemText: z.string().trim().max(2000).optional().or(z.literal('')),
  mediaIds: z.array(z.string().min(1)).max(20).optional(),
});
export type BookingInput = z.infer<typeof bookingSchema>;

export const mediaMetaSchema = z.object({
  kind: z.enum(MEDIA_KINDS),
  caption: z.string().max(200).optional(),
});

export const reviewSchema = z.object({
  appointmentId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  ratingPrice: z.coerce.number().int().min(1).max(5).optional(),
  ratingQuality: z.coerce.number().int().min(1).max(5).optional(),
  ratingTimeliness: z.coerce.number().int().min(1).max(5).optional(),
  ratingComms: z.coerce.number().int().min(1).max(5).optional(),
  body: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const estimateLineSchema = z.object({
  kind: z.enum(ESTIMATE_LINE_KINDS),
  description: z.string().trim().min(1, 'Descrierea este obligatorie').max(200),
  qty: z.coerce
    .number()
    .finite()
    .gt(0, 'Cantitatea trebuie să fie pozitivă')
    .max(999, 'Cantitate prea mare'),
  unitPriceRon: z.coerce
    .number()
    .finite()
    .min(0, 'Prețul nu poate fi negativ')
    .max(1_000_000, 'Preț prea mare'),
});

export const estimateSchema = z.object({
  appointmentId: z.string().min(1),
  note: z.string().trim().max(1000).optional().or(z.literal('')),
  lines: z.array(estimateLineSchema).min(1, 'Adaugă cel puțin o linie').max(100),
});

export const serviceSchema = z.object({
  name: z.string().trim().min(1, 'Numele este obligatoriu').max(120),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  durationMin: z.coerce.number().int().min(5, 'Durata minimă este 5 minute').max(480),
  priceRon: z.coerce.number().finite().min(0).max(1_000_000),
  priceType: z.enum(PRICE_TYPES),
  categoryId: z.string().optional().or(z.literal('')),
});

export const checkInSchema = z.object({
  appointmentId: z.string().min(1),
  mileageIn: z.coerce.number().int().min(0).max(2_000_000).optional(),
  fuelLevel: z.coerce.number().int().min(0).max(100).optional(),
  intakeNotes: z.string().trim().max(1000).optional().or(z.literal('')),
});

export const dviItemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  severity: z.enum(DVI_SEVERITIES),
  note: z.string().trim().max(500).optional().or(z.literal('')),
});

export const reviewReplySchema = z.object({
  reviewId: z.string().min(1),
  reply: z.string().trim().max(1000),
});

export const consentSchema = z.object({
  type: z.enum(CONSENT_TYPES),
  granted: z.boolean(),
});

export const shopSettingsSchema = z.object({
  name: z.string().trim().min(2, 'Numele este prea scurt').max(120),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  phone: z.string().trim().min(6, 'Telefon invalid').max(20).optional().or(z.literal('')),
  email: z.string().trim().toLowerCase().email('Email invalid').optional().or(z.literal('')),
  addressLine: z.string().trim().max(200).optional().or(z.literal('')),
  locality: z.string().trim().max(80).optional().or(z.literal('')),
  county: z.string().trim().max(80).optional().or(z.literal('')),
});

export const messageSchema = z.object({
  appointmentId: z.string().min(1),
  body: z.string().trim().min(1).max(2000),
});
