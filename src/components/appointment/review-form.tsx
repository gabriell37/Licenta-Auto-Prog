'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toaster';
import { submitReviewAction } from '@/app/actions/appointments';
import { cn } from '@/lib/utils';

export function ReviewForm({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [body, setBody] = React.useState('');
  const [pending, start] = React.useTransition();

  function submit() {
    if (rating === 0) { toast.error('Alege o notă.'); return; }
    start(async () => {
      try {
        const res = await submitReviewAction({ appointmentId, rating, body });
        if (res.ok) { toast.success('Mulțumim pentru recenzie! 🙌'); router.refresh(); }
        else toast.error(res.error ?? 'Eroare.');
      } catch {
        toast.error('A apărut o eroare. Reîncearcă.');
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Notă">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={rating === i}
            aria-label={`${i} stele`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(i)}
            className="p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Star className={cn('h-8 w-8 transition-colors', i <= (hover || rating) ? 'fill-accent text-accent' : 'fill-transparent text-border-strong')} />
          </button>
        ))}
      </div>
      <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Cum a fost experiența? (opțional)" aria-label="Recenzie" />
      <Button onClick={submit} loading={pending}>Trimite recenzia</Button>
    </div>
  );
}
