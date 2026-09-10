'use client';

import * as React from 'react';
import { ImagePlus, Video, Mic, Square, X, AlertCircle, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { cn, formatBytes } from '@/lib/utils';
import type { MediaKind } from '@/lib/enums';

type Item = {
  tempId: string;
  kind: MediaKind;
  status: 'uploading' | 'done' | 'error';
  progress: number;
  previewUrl: string;
  mediaId?: string;
  sizeBytes?: number;
  error?: string;
  file: File;
};

let counter = 0;
const uid = () => `m${++counter}_${Date.now()}`;

function kindOf(type: string): MediaKind | null {
  if (type.startsWith('image/')) return 'IMAGE';
  if (type.startsWith('video/')) return 'VIDEO';
  if (type.startsWith('audio/')) return 'AUDIO';
  return null;
}

/**
 * Media uploader: photos, videos and AUDIO (incl. in-browser recording).
 * Emits the list of successfully-uploaded media IDs via onChange.
 */
export function MediaUploader({
  appointmentId,
  vehicleId,
  onChange,
}: {
  appointmentId?: string;
  vehicleId?: string;
  onChange?: (mediaIds: string[]) => void;
}) {
  const [items, setItems] = React.useState<Item[]>([]);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const cameraRef = React.useRef<HTMLInputElement>(null);

  const emit = React.useCallback(
    (list: Item[]) => onChange?.(list.filter((i) => i.status === 'done' && i.mediaId).map((i) => i.mediaId!)),
    [onChange]
  );

  const upload = React.useCallback(
    (file: File) => {
      const kind = kindOf(file.type);
      if (!kind) {
        toast.error('Tip de fișier nesuportat.');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`„${file.name}” depășește 50MB.`);
        return;
      }
      const tempId = uid();
      const previewUrl = URL.createObjectURL(file);
      const item: Item = { tempId, kind, status: 'uploading', progress: 0, previewUrl, file, sizeBytes: file.size };
      setItems((prev) => [...prev, item]);

      const fd = new FormData();
      fd.append('file', file);
      if (appointmentId) fd.append('appointmentId', appointmentId);
      if (vehicleId) fd.append('vehicleId', vehicleId);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/media');
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setItems((prev) => prev.map((i) => (i.tempId === tempId ? { ...i, progress } : i)));
        }
      };
      xhr.onload = () => {
        setItems((prev) => {
          let next: Item[];
          if (xhr.status >= 200 && xhr.status < 300) {
            const res = JSON.parse(xhr.responseText);
            next = prev.map((i) => (i.tempId === tempId ? { ...i, status: 'done', progress: 100, mediaId: res.id } : i));
          } else {
            const msg = (() => { try { return JSON.parse(xhr.responseText).error; } catch { return 'Eroare la încărcare'; } })();
            next = prev.map((i) => (i.tempId === tempId ? { ...i, status: 'error', error: msg } : i));
          }
          emit(next);
          return next;
        });
      };
      xhr.onerror = () => {
        setItems((prev) => {
          const next = prev.map((i) => (i.tempId === tempId ? { ...i, status: 'error' as const, error: 'Conexiune întreruptă' } : i));
          return next;
        });
      };
      xhr.send(fd);
    },
    [appointmentId, vehicleId, emit]
  );

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach(upload);
    e.target.value = '';
  }

  function removeItem(tempId: string) {
    setItems((prev) => {
      const item = prev.find((i) => i.tempId === tempId);
      if (item?.mediaId) fetch(`/api/media?id=${item.mediaId}`, { method: 'DELETE' }).catch(() => {});
      if (item) URL.revokeObjectURL(item.previewUrl);
      const next = prev.filter((i) => i.tempId !== tempId);
      emit(next);
      return next;
    });
  }

  function retry(tempId: string) {
    const item = items.find((i) => i.tempId === tempId);
    if (item) {
      removeItem(tempId);
      upload(item.file);
    }
  }

  return (
    <div className="space-y-3">
      <input ref={fileRef} type="file" accept="image/*,video/*,audio/*" multiple className="hidden" onChange={onPick} />
      <input ref={cameraRef} type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={onPick} />

      <div className="grid grid-cols-3 gap-2">
        <UploadButton icon={ImagePlus} label="Foto / Video" onClick={() => fileRef.current?.click()} />
        <UploadButton icon={Video} label="Cameră" onClick={() => cameraRef.current?.click()} />
        <AudioRecorder onRecorded={upload} />
      </div>

      <p className="text-xs text-fg-subtle">
        Adaugă poze cu problema, un filmuleț sau o <strong>înregistrare audio cu zgomotul</strong> mașinii. Max 50MB / fișier.
      </p>

      {items.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.tempId}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-surface-3"
            >
              <Preview item={item} />

              {item.status === 'uploading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/50 text-white">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="mt-1 text-xs font-medium">{item.progress}%</span>
                </div>
              )}
              {item.status === 'error' && (
                <button
                  onClick={() => retry(item.tempId)}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-danger/80 text-white"
                  aria-label="Reîncearcă încărcarea"
                >
                  <AlertCircle className="h-5 w-5" />
                  <span className="mt-1 text-[10px] font-medium">Reîncearcă</span>
                </button>
              )}

              <button
                onClick={() => removeItem(item.tempId)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-950/60 text-white opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                aria-label="Elimină fișierul"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function UploadButton({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-strong bg-surface-2 py-4 text-fg-muted transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon className="h-5 w-5" aria-hidden />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function Preview({ item }: { item: Item }) {
  if (item.kind === 'IMAGE')
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />;
  if (item.kind === 'VIDEO')
    return (
      <div className="relative h-full w-full">
        <video src={item.previewUrl} className="h-full w-full object-cover" muted playsInline />
        <Play className="absolute inset-0 m-auto h-7 w-7 text-white drop-shadow" />
      </div>
    );
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-brand-subtle p-2 text-brand">
      <Mic className="h-6 w-6" />
      <span className="text-[10px] font-medium">{formatBytes(item.sizeBytes ?? 0)}</span>
    </div>
  );
}

/** Records audio in-browser via MediaRecorder and hands the blob to the uploader. */
function AudioRecorder({ onRecorded }: { onRecorded: (f: File) => void }) {
  const [recording, setRecording] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const recRef = React.useRef<MediaRecorder | null>(null);
  const chunks = React.useRef<Blob[]>([]);
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null);

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Înregistrarea audio nu este disponibilă pe acest dispozitiv.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunks.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks.current, { type: rec.mimeType || 'audio/webm' });
        const file = new File([blob], `inregistrare-${Date.now()}.webm`, { type: blob.type });
        onRecorded(file);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
      setSeconds(0);
      timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error('Acces la microfon refuzat. Permite microfonul pentru a înregistra.');
    }
  }

  function stop() {
    recRef.current?.stop();
    setRecording(false);
    if (timer.current) clearInterval(timer.current);
  }

  React.useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  if (recording) {
    return (
      <button
        type="button"
        onClick={stop}
        className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-danger bg-danger-subtle py-4 text-danger animate-pulse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Oprește înregistrarea (${seconds}s)`}
      >
        <Square className="h-5 w-5 fill-current" aria-hidden />
        <span className="text-xs font-semibold tabular-nums">{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</span>
      </button>
    );
  }

  return <UploadButton icon={Mic} label="Înregistrează" onClick={start} />;
}
