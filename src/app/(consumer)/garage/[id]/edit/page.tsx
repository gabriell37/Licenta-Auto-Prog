import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleForm } from '@/components/vehicle/vehicle-form';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Editează mașina' };

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser('/garage');
  const vehicle = await prisma.vehicle.findFirst({ where: { id, userId: user.id } });
  if (!vehicle) notFound();

  return (
    <div className="container max-w-xl py-6 md:py-8">
      <Link href={`/garage/${id}`} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Înapoi
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Editează {vehicle.make} {vehicle.model}</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleForm vehicle={vehicle} />
        </CardContent>
      </Card>
    </div>
  );
}
