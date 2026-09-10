'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toaster';
import { replyReviewAction } from '@/app/actions/pro';

export function ReviewReply({ reviewId, existing }: { reviewId: string; existing?: string | null }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState(existing ?? '');
  const [pending, start] = React.useTransition();

  if (existing && !open) {
    return (
      <div className="mt-3 rounded-lg border-l-2 border-brand bg-brand-subtle/40 p-3">
        <p className="text-xs font-semibold text-brand-fg">Răspunsul tău</p>
        <p className="mt-1 text-sm text-fg-muted">{existing}</p>
        <button onClick={() => setOpen(true)} className="mt-1 text-xs font-medium text-brand hover:underline">Editează</button>
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="ghost" size="sm" className="mt-2" onClick={() => setOpen(true)}>
        <Reply className="h-4 w-4" /> Răspunde
      </Button>
    );
  }

  function save() {
    start(async () => {
      const res = await replyReviewAction(reviewId, text);
      if (res.ok) { toast.success(text.trim() ? 'Răspuns publicat.' : 'Răspuns șters.'); setOpen(false); router.refresh(); }
      else toast.error(res.error ?? 'Eroare.');
    });
  }

  return (
    <div className="mt-3 space-y-2">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="Mulțumește clientului sau răspunde la feedback…" aria-label="Răspuns" />
      <div className="flex gap-2">
        <Button size="sm" onClick={save} loading={pending}>Publică răspunsul</Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Anulează</Button>
      </div>
    </div>
  );
}
