// Lightweight VIN/plate decoder.
// NOTE: This is a heuristic stub for demo. Production would call a real VIN-decode
// provider (see integrations spec). The interface is kept identical so it can be swapped.

import type { FuelType } from './enums';

const WMI: Record<string, string> = {
  UU1: 'Dacia', UU6: 'Dacia', VF1: 'Renault', VF3: 'Peugeot', VF7: 'Citroën',
  WVW: 'Volkswagen', WV1: 'Volkswagen', WAU: 'Audi', WBA: 'BMW', WDB: 'Mercedes-Benz',
  WDD: 'Mercedes-Benz', WF0: 'Ford', TMB: 'Škoda', ZFA: 'Fiat', VSS: 'SEAT',
  KMH: 'Hyundai', KNA: 'Kia', JTD: 'Toyota', SJN: 'Nissan', VNK: 'Toyota',
};

const YEAR_CODES = 'ABCDEFGHJKLMNPRSTVWXY123456789';

export type DecodedVehicle = {
  make?: string;
  year?: number;
  fuel?: FuelType;
  source: 'vin' | 'plate' | 'none';
};

export function decodeVin(vinRaw: string): DecodedVehicle {
  const vin = vinRaw.trim().toUpperCase();
  if (vin.length < 11) return { source: 'none' };
  const wmi = vin.slice(0, 3);
  const make = WMI[wmi] ?? WMI[vin.slice(0, 2) + '*'];
  // 10th char encodes model year (2010-2039 cycle)
  const yc = vin[9];
  let year: number | undefined;
  if (yc) {
    const idx = YEAR_CODES.indexOf(yc);
    if (idx >= 0) year = 2010 + idx;
    if (year && year > new Date().getFullYear() + 1) year -= 30;
  }
  return { make, year, source: 'vin' };
}

/** RO plate format e.g. "B 123 ABC" or "CJ 12 XYZ" — we can only infer county, not the car. */
const COUNTY_PREFIX: Record<string, string> = {
  B: 'București', CJ: 'Cluj', TM: 'Timiș', IS: 'Iași', BV: 'Brașov', CT: 'Constanța',
  IF: 'Ilfov', AG: 'Argeș', DJ: 'Dolj', BH: 'Bihor', MM: 'Maramureș', SB: 'Sibiu',
};

export function decodePlate(plateRaw: string): { county?: string; source: 'plate' } {
  const plate = plateRaw.trim().toUpperCase().replace(/\s+/g, ' ');
  const prefix = plate.split(' ')[0] ?? '';
  return { county: COUNTY_PREFIX[prefix], source: 'plate' };
}
