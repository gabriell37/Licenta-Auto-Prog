import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BookingWizard } from '@/components/booking/booking-wizard';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { getUserVehicles } from '@/lib/queries';

export const metadata: Metadata = { title: 'Programare' };

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopId: string }>;
  searchParams: Promise<{ service?: string; vehicle?: string }>;
}) {
  const { shopId } = await params;
  const { service, vehicle } = await searchParams;

  const user = await requireUser(`/book/${shopId}`);
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: { services: { where: { active: true }, orderBy: { sortOrder: 'asc' } } },
  });
  // only VERIFIED shops are bookable (mirrors the server-side check in createBookingAction)
  if (!shop || shop.status !== 'VERIFIED') notFound();

  const vehicles = await getUserVehicles(user.id);

  return (
    <div className="container max-w-2xl py-6 md:py-8">
      <Link href={`/shop/${shop.slug}`} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Înapoi la {shop.name}
      </Link>
      <Card>
        <CardContent className="pt-6">
          <BookingWizard
            shop={{ id: shop.id, name: shop.name, locality: shop.locality }}
            services={shop.services.map((s) => ({ id: s.id, name: s.name, durationMin: s.durationMin, priceFromBani: s.priceFromBani, priceType: s.priceType }))}
            vehicles={vehicles}
            preselectedServiceId={service}
            preselectedVehicleId={vehicle}
          />
        </CardContent>
      </Card>
    </div>
  );
}
