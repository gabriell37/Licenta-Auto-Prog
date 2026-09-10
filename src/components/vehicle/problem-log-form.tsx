'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toaster';
import { addProblemLogAction } from '@/app/actions/vehicles';

export function ProblemLogForm({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const [text, setText] = React.useState('');
  const [pending, start] = React.useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    start(async () => {
      const res = await addProblemLogAction(vehicleId, text);
      if (res.ok) {
        setText('');
        toast.success('Problemă adăugată în jurnal.');
        router.refresh();
      } else {
        toast.error('Nu am putut salva problema.');
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Descrie o problemă: ex. „zgomot la frânare dimineața”, „consum crescut”…"
        aria-label="Problemă nouă"
        rows={2}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" loading={pending} disabled={!text.trim()}>
          <Plus className="h-4 w-4" /> Adaugă problemă
        </Button>
      </div>
    </form>
  );
}
