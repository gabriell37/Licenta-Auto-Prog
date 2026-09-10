'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { setReviewStatusAction } from '@/app/actions/admin';

export function ReviewModeration({ reviewId, status }: { reviewId: string; status: string }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const hidden = status === 'HIDDEN';

  function toggle() {
    if (!hidden && !confirm('Sigur ascunzi această recenzie? Nu va mai fi vizibilă public și nu va mai conta în nota service-ului.')) return;
    start(async () => {
      const res = await setReviewStatusAction(reviewId, hidden ? 'PUBLISHED' : 'HIDDEN');
      if (res.ok) { toast.success(hidden ? 'Recenzie publicată.' : 'Recenzie ascunsă.'); router.refresh(); }
      else toast.error(res.error ?? 'Eroare.');
    });
  }

  return (
    <Button size="sm" variant="outline" onClick={toggle} disabled={pending}>
      {hidden ? <><Eye className="h-4 w-4" /> Publică</> : <><EyeOff className="h-4 w-4" /> Ascunde</>}
    </Button>
  );
}
