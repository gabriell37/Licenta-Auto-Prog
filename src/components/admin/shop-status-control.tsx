'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Ban, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { setShopStatusAction } from '@/app/actions/admin';

export function ShopStatusControl({ shopId, status }: { shopId: string; status: string }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();

  function set(to: string, msg: string) {
    if (to === 'SUSPENDED' && !confirm('Sigur suspendezi acest service? Nu va mai fi vizibil sau rezervabil.')) return;
    start(async () => {
      const res = await setShopStatusAction(shopId, to);
      if (res.ok) { toast.success(msg); router.refresh(); }
      else toast.error(res.error ?? 'Eroare.');
    });
  }

  return (
    <div className="flex gap-1.5">
      {status !== 'VERIFIED' && (
        <Button size="sm" variant="outline" onClick={() => set('VERIFIED', 'Service verificat și publicat.')} disabled={pending}>
          <Check className="h-4 w-4 text-success" /> Verifică
        </Button>
      )}
      {status !== 'SUSPENDED' ? (
        <Button size="sm" variant="ghost" className="text-danger hover:bg-danger-subtle" onClick={() => set('SUSPENDED', 'Service suspendat.')} disabled={pending}>
          <Ban className="h-4 w-4" /> Suspendă
        </Button>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => set('VERIFIED', 'Service reactivat.')} disabled={pending}>
          <RotateCcw className="h-4 w-4" /> Reactivează
        </Button>
      )}
    </div>
  );
}
