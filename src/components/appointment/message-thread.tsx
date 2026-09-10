'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toaster';
import { sendMessageAction } from '@/app/actions/appointments';
import { cn, formatDateTime } from '@/lib/utils';

type Msg = { id: string; body: string; createdAt: Date; senderId: string };

export function MessageThread({ appointmentId, messages, currentUserId }: { appointmentId: string; messages: Msg[]; currentUserId: string }) {
  const router = useRouter();
  const [text, setText] = React.useState('');
  const [pending, start] = React.useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const body = text;
    setText('');
    start(async () => {
      const res = await sendMessageAction(appointmentId, body);
      if (res.ok) router.refresh();
      else { toast.error('Mesajul nu a putut fi trimis.'); setText(body); }
    });
  }

  return (
    <div className="space-y-3">
      {messages.length > 0 && (
        <ul className="space-y-2">
          {messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <li key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[80%] rounded-2xl px-3.5 py-2', mine ? 'bg-brand text-fg-on-brand' : 'bg-surface-3 text-fg')}>
                  <p className="text-sm">{m.body}</p>
                  <p className={cn('mt-0.5 text-[10px]', mine ? 'text-brand-subtle/80' : 'text-fg-subtle')}>{formatDateTime(m.createdAt)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <form onSubmit={submit} className="flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Scrie un mesaj către service…" aria-label="Mesaj nou" />
        <Button type="submit" size="icon" loading={pending} disabled={!text.trim()} aria-label="Trimite mesajul">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
