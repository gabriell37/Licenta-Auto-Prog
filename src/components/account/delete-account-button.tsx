'use client';

import * as React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { deleteAccountAction } from '@/app/actions/account';

export function DeleteAccountButton() {
  const [open, setOpen] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState('');
  const [pending, start] = React.useTransition();

  return (
    <>
      <Button variant="outline" className="border-danger/40 text-danger hover:bg-danger-subtle" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" /> Șterge contul
      </Button>
      <Modal
        open={open} onClose={() => setOpen(false)} size="sm" title="Șterge contul definitiv"
        description="Toate datele tale — mașini, programări, recenzii — vor fi șterse ireversibil (dreptul GDPR la ștergere)."
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Anulează</Button>
          <Button variant="danger" disabled={confirmText !== 'STERGE' || pending} loading={pending}
            onClick={() => start(() => deleteAccountAction())}>
            Șterge definitiv
          </Button>
        </>}
      >
        <label htmlFor="confirm" className="text-sm text-fg-muted">Scrie <strong className="text-fg">STERGE</strong> pentru a confirma:</label>
        <Input id="confirm" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="mt-2" autoComplete="off" />
      </Modal>
    </>
  );
}
