import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { requireUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Cont în așteptare' };

export default async function ProOnboardingPage() {
  const user = await requireUser('/pro/onboarding');
  // Accounts that already have a shop (or platform admins) don't belong here.
  if (user.role === 'ADMIN' || user.memberships.length > 0) redirect('/pro');

  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-2xl items-center">
      <EmptyState
        className="w-full"
        icon={Building2}
        title="Contul tău nu este încă asociat unui service"
        description="Pentru a folosi AutoProg Pro, contul tău trebuie adăugat ca membru al unui service de către administratorul platformei. Contactează administratorul pentru activare."
        action={
          <Button asChild variant="outline"><Link href="/">Înapoi la pagina principală</Link></Button>
        }
      />
    </div>
  );
}
