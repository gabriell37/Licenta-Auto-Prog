'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toaster';
import { addVehicleDocumentAction, deleteVehicleDocumentAction } from '@/app/actions/vehicles';
import {
  VEHICLE_DOCUMENT_TYPES,
  VEHICLE_DOCUMENT_LABELS_RO,
  type VehicleDocumentType,
} from '@/lib/enums';
import { formatDate } from '@/lib/utils';

export type VaultDocument = {
  id: string;
  type: string;
  number: string | null;
  expiresAt: Date | string | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function ExpiryBadge({ expiresAt }: { expiresAt: Date | string | null }) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff < 0) return <Badge variant="danger">Expirat</Badge>;
  if (diff <= 30 * DAY_MS) return <Badge variant="warning">Expiră curând</Badge>;
  return <Badge>Valid</Badge>;
}

export function DocumentVault({ vehicleId, documents }: { vehicleId: string; documents: VaultDocument[] }) {
  const router = useRouter();
  const [type, setType] = React.useState<VehicleDocumentType>('ITP');
  const [number, setNumber] = React.useState('');
  const [expiresAt, setExpiresAt] = React.useState('');
  const [toDelete, setToDelete] = React.useState<VaultDocument | null>(null);
  const [adding, startAdd] = React.useTransition();
  const [deleting, startDelete] = React.useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    startAdd(async () => {
      const res = await addVehicleDocumentAction({ vehicleId, type, number, expiresAt });
      if (res.ok) {
        toast.success('Document adăugat.');
        setNumber('');
        setExpiresAt('');
        router.refresh();
      } else {
        toast.error(res.error ?? 'Nu am putut adăuga documentul.');
      }
    });
  }

  function handleDeleteConfirm() {
    if (!toDelete) return;
    startDelete(async () => {
      const res = await deleteVehicleDocumentAction(toDelete.id);
      if (res.ok) {
        toast.success('Document șters.');
        setToDelete(null);
        router.refresh();
      } else {
        toast.error(res.error ?? 'Nu am putut șterge documentul.');
      }
    });
  }

  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <p className="text-sm text-fg-muted">
          Niciun document adăugat încă. Adaugă ITP, RCA sau rovinieta ca să vezi din timp când expiră.
        </p>
      ) : (
        <ul className="space-y-2">
          {documents.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand">
                  <FileText className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-fg">
                    {VEHICLE_DOCUMENT_LABELS_RO[d.type as VehicleDocumentType] ?? d.type}
                  </p>
                  <p className="truncate text-xs text-fg-muted">
                    {d.number && <span className="font-mono">Nr. {d.number}</span>}
                    {d.number && d.expiresAt && ' · '}
                    {d.expiresAt && <>Expiră la {formatDate(d.expiresAt)}</>}
                    {!d.number && !d.expiresAt && 'Fără detalii'}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ExpiryBadge expiresAt={d.expiresAt} />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setToDelete(d)}
                  aria-label={`Șterge documentul ${VEHICLE_DOCUMENT_LABELS_RO[d.type as VehicleDocumentType] ?? d.type}`}
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="space-y-3 border-t border-border pt-4">
        <p className="text-sm font-medium text-fg">Adaugă un document</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Tip" htmlFor="doc-type">
            <Select id="doc-type" value={type} onChange={(e) => setType(e.target.value as VehicleDocumentType)}>
              {VEHICLE_DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>{VEHICLE_DOCUMENT_LABELS_RO[t]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Număr (opțional)" htmlFor="doc-number">
            <Input
              id="doc-number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              maxLength={60}
              placeholder="ex. seria RCA"
            />
          </Field>
          <Field label="Expiră la (opțional)" htmlFor="doc-expires">
            <Input
              id="doc-expires"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="dark:[color-scheme:dark]"
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={adding}>
            <Plus className="h-4 w-4" /> Adaugă document
          </Button>
        </div>
      </form>

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Ștergi acest document?"
        description={
          toDelete
            ? `„${VEHICLE_DOCUMENT_LABELS_RO[toDelete.type as VehicleDocumentType] ?? toDelete.type}" va fi eliminat. Această acțiune nu poate fi anulată.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)} disabled={deleting}>Anulează</Button>
            <Button variant="danger" onClick={handleDeleteConfirm} loading={deleting}>Șterge definitiv</Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">Nu vei mai primi avertizări de expirare pentru acest document.</p>
      </Modal>
    </div>
  );
}
