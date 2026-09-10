import Link from 'next/link';
import { Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

/** Shown on (pro) pages when the account has no active shop (e.g. ADMIN without membership). */
export function NoShopState({ isAdmin }: { isAdmin?: boolean }) {
  return (
    <div className="mx-auto max-w-2xl">
      <EmptyState
        icon={Store}
        title="Niciun service asociat acestui cont"
        description="Contul tău nu este asociat unui service activ, așa că nu există date de afișat aici."
        action={
          isAdmin ? (
            <Button asChild><Link href="/admin">Mergi la administrare</Link></Button>
          ) : (
            <Button asChild variant="outline"><Link href="/">Înapoi la site</Link></Button>
          )
        }
      />
    </div>
  );
}
