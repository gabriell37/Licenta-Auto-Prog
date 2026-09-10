// Centralized "enum" definitions (SQLite has no native enums).
// Each is a const tuple + a TS union type + display metadata (RO labels, status color token).

export const APPOINTMENT_STATUSES = [
  'REQUESTED',
  'CONFIRMED',
  'RECEIVED',
  'DIAGNOSING',
  'AWAITING_APPROVAL',
  'IN_PROGRESS',
  'READY',
  'DELIVERED',
  'CANCELLED',
  'NO_SHOW',
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** ordered pipeline used for progress UI (excludes terminal cancelled/no-show) */
export const PIPELINE: AppointmentStatus[] = [
  'CONFIRMED',
  'RECEIVED',
  'DIAGNOSING',
  'AWAITING_APPROVAL',
  'IN_PROGRESS',
  'READY',
  'DELIVERED',
];

export const APPOINTMENT_STATUS_META: Record<
  AppointmentStatus,
  { ro: string; en: string; token: string }
> = {
  REQUESTED: { ro: 'Solicitată', en: 'Requested', token: 'st-received' },
  CONFIRMED: { ro: 'Confirmată', en: 'Confirmed', token: 'st-received' },
  RECEIVED: { ro: 'Mașină primită', en: 'Received', token: 'st-received' },
  DIAGNOSING: { ro: 'Diagnoză', en: 'Diagnosing', token: 'st-diagnosing' },
  AWAITING_APPROVAL: { ro: 'Așteaptă aprobare', en: 'Awaiting approval', token: 'st-awaiting' },
  IN_PROGRESS: { ro: 'În lucru', en: 'In progress', token: 'st-inprogress' },
  READY: { ro: 'Gata de ridicare', en: 'Ready', token: 'st-ready' },
  DELIVERED: { ro: 'Predată', en: 'Delivered', token: 'st-delivered' },
  CANCELLED: { ro: 'Anulată', en: 'Cancelled', token: 'st-cancelled' },
  NO_SHOW: { ro: 'Neprezentare', en: 'No-show', token: 'st-cancelled' },
};

/** Statuses from which no further transition is allowed. */
export const TERMINAL_STATUSES: AppointmentStatus[] = ['DELIVERED', 'CANCELLED', 'NO_SHOW'];

/**
 * Allowed status transitions (server-enforced). Keeps the pipeline honest:
 * no resurrecting delivered/cancelled appointments, no skipping to arbitrary states.
 */
export const APPOINTMENT_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  REQUESTED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['RECEIVED', 'CANCELLED', 'NO_SHOW'],
  RECEIVED: ['DIAGNOSING', 'AWAITING_APPROVAL', 'IN_PROGRESS', 'CANCELLED'],
  DIAGNOSING: ['AWAITING_APPROVAL', 'IN_PROGRESS', 'READY', 'CANCELLED'],
  AWAITING_APPROVAL: ['IN_PROGRESS', 'READY', 'CANCELLED'],
  IN_PROGRESS: ['AWAITING_APPROVAL', 'READY', 'CANCELLED'],
  READY: ['IN_PROGRESS', 'DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export function canTransition(from: string, to: string): boolean {
  return (APPOINTMENT_TRANSITIONS[from as AppointmentStatus] ?? []).includes(
    to as AppointmentStatus
  );
}

export const SHOP_STATUSES = ['DRAFT', 'PENDING', 'VERIFIED', 'SUSPENDED'] as const;
export type ShopStatus = (typeof SHOP_STATUSES)[number];

export const USER_ROLES = ['CUSTOMER', 'STAFF', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ESTIMATE_LINE_KINDS = ['LABOR', 'PART', 'SUBLET'] as const;
export type EstimateLineKind = (typeof ESTIMATE_LINE_KINDS)[number];

export const CONSENT_TYPES = ['MARKETING_EMAIL', 'MARKETING_SMS', 'TERMS', 'PRIVACY'] as const;
export type ConsentType = (typeof CONSENT_TYPES)[number];

export const VEHICLE_DOCUMENT_TYPES = ['ITP', 'RCA', 'REGISTRATION', 'ROVINIETA', 'OTHER'] as const;
export type VehicleDocumentType = (typeof VEHICLE_DOCUMENT_TYPES)[number];
export const VEHICLE_DOCUMENT_LABELS_RO: Record<VehicleDocumentType, string> = {
  ITP: 'ITP (inspecție tehnică)',
  RCA: 'RCA (asigurare)',
  REGISTRATION: 'Certificat de înmatriculare',
  ROVINIETA: 'Rovinietă',
  OTHER: 'Alt document',
};

export const MEMBERSHIP_ROLES = ['OWNER', 'MANAGER', 'ADVISOR', 'MECHANIC'] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

export const RESOURCE_TYPES = ['BAY', 'LIFT', 'RAMP', 'ALIGNMENT', 'PAINT', 'WASH', 'MECHANIC'] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const MEDIA_KINDS = ['IMAGE', 'VIDEO', 'AUDIO'] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const FUEL_TYPES = ['petrol', 'diesel', 'hybrid', 'ev', 'lpg'] as const;
export type FuelType = (typeof FUEL_TYPES)[number];
export const FUEL_LABELS_RO: Record<FuelType, string> = {
  petrol: 'Benzină',
  diesel: 'Diesel',
  hybrid: 'Hibrid',
  ev: 'Electric',
  lpg: 'GPL',
};

export const PRICE_TYPES = ['FIXED', 'FROM', 'QUOTE'] as const;
export type PriceType = (typeof PRICE_TYPES)[number];

export const DVI_SEVERITIES = ['OK', 'ADVISE', 'URGENT'] as const;
export type DviSeverity = (typeof DVI_SEVERITIES)[number];
export const DVI_SEVERITY_META: Record<DviSeverity, { ro: string; token: string }> = {
  OK: { ro: 'În regulă', token: 'success' },
  ADVISE: { ro: 'De urmărit', token: 'warning' },
  URGENT: { ro: 'Urgent', token: 'danger' },
};

// Auto-service categories (consumer marketplace taxonomy)
export const CATEGORIES = [
  { slug: 'repair', nameRo: 'Service general & mecanică', nameEn: 'General repair', icon: 'wrench' },
  { slug: 'tires', nameRo: 'Anvelope & vulcanizare', nameEn: 'Tires & vulcanizare', icon: 'circle-dot' },
  { slug: 'oil', nameRo: 'Schimb ulei & filtre', nameEn: 'Oil & filters', icon: 'droplet' },
  { slug: 'brakes', nameRo: 'Frâne & suspensie', nameEn: 'Brakes & suspension', icon: 'disc' },
  { slug: 'diagnostics', nameRo: 'Diagnoză & electrică', nameEn: 'Diagnostics & electrical', icon: 'activity' },
  { slug: 'ac', nameRo: 'Climatizare & AC', nameEn: 'AC service', icon: 'snowflake' },
  { slug: 'body', nameRo: 'Tinichigerie & vopsitorie', nameEn: 'Bodywork & paint', icon: 'spray-can' },
  { slug: 'detailing', nameRo: 'Detailing & spălătorie', nameEn: 'Detailing & wash', icon: 'sparkles' },
  { slug: 'itp', nameRo: 'ITP & pregătire ITP', nameEn: 'ITP inspection', icon: 'clipboard-check' },
  { slug: 'ev', nameRo: 'Service auto electric (EV)', nameEn: 'EV service', icon: 'plug-zap' },
] as const;
export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

export const AMENITIES = [
  { key: 'waiting_area', ro: 'Sală de așteptare' },
  { key: 'wifi', ro: 'Wi-Fi gratuit' },
  { key: 'courtesy_car', ro: 'Mașină de curtoazie' },
  { key: 'pickup', ro: 'Preluare & predare' },
  { key: 'card', ro: 'Plată cu cardul' },
  { key: 'efactura', ro: 'e-Factura' },
  { key: 'ev_charger', ro: 'Încărcare EV' },
  { key: 'tire_hotel', ro: 'Hotel anvelope' },
] as const;
