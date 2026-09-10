import Link from 'next/link';
import { Car, Clock, MapPin, ChevronRight } from 'lucide-react';
import { StatusPill } from '@/components/ui/status-pill';
import { formatDateTime } from '@/lib/utils';
import type { AppointmentStatus } from '@/lib/enums';

type A = {
  id: string;
  startAt: Date;
  status: string;
  shop: { name: string; locality: string | null };
  vehicle: { make: string; model: string } | null;
  items: { name: string }[];
};

export function AppointmentCard({ appointment: a }: { appointment: A }) {
  return (
    <Link
      href={`/appointments/${a.id}`}
      className="group block rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display font-semibold text-fg">{a.shop.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-fg-muted">
            <MapPin className="h-3.5 w-3.5" /> {a.shop.locality}
          </p>
        </div>
        <StatusPill status={a.status as AppointmentStatus} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fg-muted">
        <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {formatDateTime(a.startAt)}</span>
        {a.vehicle && <span className="inline-flex items-center gap-1.5"><Car className="h-4 w-4" /> {a.vehicle.make} {a.vehicle.model}</span>}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="truncate text-sm text-fg-muted">{a.items.map((i) => i.name).join(', ')}</p>
        <ChevronRight className="h-5 w-5 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />
      </div>
    </Link>
  );
}
