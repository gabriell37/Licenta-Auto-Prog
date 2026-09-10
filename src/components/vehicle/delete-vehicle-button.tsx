'use client';

import * as React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toaster';
import { deleteVehicleAction } from '@/app/actions/vehicles';

export function DeleteVehicleButton({ id, label }: { id: string; label: string }) {
  const [open, setOpen] = React.useState(false);
  const [pending, start] = React.useTransition();

  function confirm() {
    start(async () => {
      try {
        await deleteVehicleAction(id);
        // redirect happens server-side; toast may not show, but keep for safety
      } catch {
        toast.error('Nu am putut șterge mașina.');
      }
    });
  }

  return (
    <>
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)} aria-label="Șterge mașina">
        <Trash2 className="h-4 w-4 text-danger" />
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Ștergi această mașină?"
        description={`„${label}” și istoricul ei vor fi eliminate din garaj. Această acțiune nu poate fi anulată.`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Anulează</Button>
            <Button variant="danger" onClick={confirm} loading={pending}>Șterge definitiv</Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">Programările viitoare asociate nu vor mai fi legate de această mașină.</p>
      </Modal>
    </>
  );
}
