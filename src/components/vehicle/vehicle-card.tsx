import Link from 'next/link';
import { Car, Gauge, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FUEL_LABELS_RO, type FuelType } from '@/lib/enums';

type V = {
  id: string; make: string; model: string; year: number | null; plate: string | null;
  fuel: string | null; mileage: number | null; nickname: string | null;
  _count?: { appointments: number };
};

export function VehicleCard({ vehicle }: { vehicle: V }) {
  return (
    <Link
      href={`/garage/${vehicle.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-subtle text-brand">
        <Car className="h-7 w-7" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-display font-semibold text-fg">
            {vehicle.make} {vehicle.model}
          </p>
          {vehicle.year && <span className="text-sm text-fg-subtle">{vehicle.year}</span>}
        </div>
        {vehicle.nickname && <p className="truncate text-sm text-fg-muted">{vehicle.nickname}</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
          {vehicle.plate && <Badge variant="outline" className="font-mono uppercase">{vehicle.plate}</Badge>}
          {vehicle.fuel && <span>{FUEL_LABELS_RO[vehicle.fuel as FuelType] ?? vehicle.fuel}</span>}
          {vehicle.mileage != null && (
            <span className="inline-flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {vehicle.mileage.toLocaleString('ro-RO')} km</span>
          )}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}
