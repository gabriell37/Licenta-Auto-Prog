'use client';

import * as React from 'react';
import { Play, Mic, X } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import type { MediaKind } from '@/lib/enums';

type M = { id: string; kind: string; url: string; caption: string | null };

export function MediaGallery({ media }: { media: M[] }) {
  const [active, setActive] = React.useState<M | null>(null);
  if (media.length === 0) return null;

  return (
    <>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {media.map((m) => (
          <li key={m.id}>
            <button
              onClick={() => setActive(m)}
              className="group relative block aspect-square w-full overflow-hidden rounded-lg border border-border bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Deschide ${m.kind === 'AUDIO' ? 'înregistrarea audio' : m.kind === 'VIDEO' ? 'filmulețul' : 'imaginea'}`}
            >
              <Thumb m={m as M & { kind: MediaKind }} />
            </button>
          </li>
        ))}
      </ul>

      <Modal open={!!active} onClose={() => setActive(null)} size="lg" sheetOnMobile={false}>
        {active && (
          <div className="space-y-3">
            {active.kind === 'IMAGE' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={active.url} alt={active.caption ?? ''} className="mx-auto max-h-[70vh] rounded-lg" />
            )}
            {active.kind === 'VIDEO' && <video src={active.url} controls autoPlay className="mx-auto max-h-[70vh] w-full rounded-lg" />}
            {active.kind === 'AUDIO' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-subtle text-brand"><Mic className="h-8 w-8" /></span>
                <audio src={active.url} controls autoPlay className="w-full max-w-md" />
              </div>
            )}
            {active.caption && <p className="text-center text-sm text-fg-muted">{active.caption}</p>}
          </div>
        )}
      </Modal>
    </>
  );
}

function Thumb({ m }: { m: M & { kind: MediaKind } }) {
  if (m.kind === 'IMAGE')
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={m.url} alt={m.caption ?? ''} className="h-full w-full object-cover transition-transform group-hover:scale-105" />;
  if (m.kind === 'VIDEO')
    return (
      <div className="relative h-full w-full">
        <video src={m.url} className="h-full w-full object-cover" muted />
        <span className="absolute inset-0 m-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/50 text-white"><Play className="h-4 w-4" /></span>
      </div>
    );
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-brand-subtle text-brand">
      <Mic className="h-6 w-6" />
      <span className="text-[10px] font-medium">Audio</span>
    </div>
  );
}
