import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { VehicleForm } from '@/components/vehicle/vehicle-form';
import { requireUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Adaugă o mașină' };

export default async function NewVehiclePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  await requireUser('/garage/new');
  const { next: rawNext } = await searchParams;
  // same-origin paths only — `next` comes from the URL
  const next = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : undefined;

  return (
    <div className="container max-w-xl py-6 md:py-8">
      <Link
        href={next ?? '/garage'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" /> {next ? 'Înapoi la programare' : 'Înapoi la garaj'}
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Adaugă o mașină</CardTitle>
          <CardDescription>
            {next
              ? 'După salvare revii automat la programare, cu mașina deja selectată.'
              : 'Completează datele sau folosește VIN-ul pentru completare automată.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleForm next={next} />
        </CardContent>
      </Card>
    </div>
  );
}
