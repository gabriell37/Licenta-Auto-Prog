import Link from 'next/link';
import type { Metadata } from 'next';
import { Car, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { VehicleCard } from '@/components/vehicle/vehicle-card';
import { requireUser } from '@/lib/auth';
import { getUserVehicles } from '@/lib/queries';

export const metadata: Metadata = { title: 'Garajul meu' };

export default async function GaragePage() {
  const user = await requireUser('/garage');
  const vehicles = await getUserVehicles(user.id);

  return (
    <div className="container max-w-3xl py-6 md:py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Garajul meu</h1>
          <p className="mt-1 text-fg-muted">Mașinile tale și istoricul lor de service.</p>
        </div>
        {vehicles.length > 0 && (
          <Button asChild className="shrink-0">
            <Link href="/garage/new"><Plus className="h-4 w-4" /> Adaugă</Link>
          </Button>
        )}
      </div>

      <div className="mt-6">
        {vehicles.length === 0 ? (
          <EmptyState
            icon={Car}
            title="Garajul tău e gol"
            description="Adaugă prima ta mașină ca să te programezi mai rapid și să-i urmărești istoricul de service."
            action={
              <Button asChild>
                <Link href="/garage/new"><Plus className="h-4 w-4" /> Adaugă o mașină</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
