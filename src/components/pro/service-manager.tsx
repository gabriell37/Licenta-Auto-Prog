'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toaster';
import { formatRON, formatDuration, cn } from '@/lib/utils';
import { createServiceAction, updateServiceAction, toggleServiceActiveAction, deleteServiceAction } from '@/app/actions/services';

type Service = { id: string; name: string; categoryId: string | null; durationMin: number; priceFromBani: number; priceType: string; active: boolean };
type Category = { id: string; nameRo: string };

export function ServiceManager({ shopId, services, categories }: { shopId: string; services: Service[]; categories: Category[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<Service | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [pending, start] = React.useTransition();

  const empty = { name: '', categoryId: '', durationMin: '60', priceRon: '', priceType: 'FROM' };
  const [form, setForm] = React.useState(empty);

  function openAdd() { setForm(empty); setAdding(true); }
  function openEdit(s: Service) {
    setForm({ name: s.name, categoryId: s.categoryId ?? '', durationMin: String(s.durationMin), priceRon: String(s.priceFromBani / 100), priceType: s.priceType });
    setEditing(s);
  }

  function save() {
    const input = { name: form.name, categoryId: form.categoryId, durationMin: Number(form.durationMin), priceRon: Number(form.priceRon), priceType: form.priceType };
    start(async () => {
      const res = editing ? await updateServiceAction(editing.id, input) : await createServiceAction(shopId, input);
      if (res.ok) { toast.success(editing ? 'Serviciu actualizat.' : 'Serviciu adăugat.'); setAdding(false); setEditing(null); router.refresh(); }
      else toast.error(res.error ?? 'Eroare.');
    });
  }

  function toggle(s: Service) {
    start(async () => {
      const r = await toggleServiceActiveAction(s.id);
      if (r.ok) { toast.success(s.active ? 'Serviciu dezactivat.' : 'Serviciu activat.'); router.refresh(); }
      else toast.error(r.error ?? 'Eroare.');
    });
  }
  function remove(s: Service) {
    if (!confirm(`Ștergi serviciul „${s.name}”?`)) return;
    start(async () => {
      const r = await deleteServiceAction(s.id);
      if (r.ok) { toast.success('Serviciu șters.'); router.refresh(); }
      else toast.error(r.error ?? 'Eroare.');
    });
  }

  const open = adding || !!editing;
  const close = () => { setAdding(false); setEditing(null); };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openAdd}><Plus className="h-4 w-4" /> Adaugă serviciu</Button>
      </div>

      <div className="space-y-2">
        {services.map((s) => (
          <div key={s.id} className={cn('flex items-center gap-3 rounded-xl border border-border bg-surface p-3', !s.active && 'opacity-60')}>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-fg">{s.name}</p>
              <p className="text-sm text-fg-muted">{formatDuration(s.durationMin)} · {s.priceFromBani > 0 ? formatRON(s.priceFromBani, { from: s.priceType === 'FROM' }) : 'la evaluare'}</p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => toggle(s)} aria-label={s.active ? 'Dezactivează' : 'Activează'} disabled={pending}>
              {s.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-fg-subtle" />}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(s)} aria-label="Editează"><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon-sm" onClick={() => remove(s)} aria-label="Șterge"><Trash2 className="h-4 w-4 text-danger" /></Button>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={close} title={editing ? 'Editează serviciul' : 'Adaugă serviciu'}
        footer={<><Button variant="ghost" onClick={close}>Anulează</Button><Button onClick={save} loading={pending} disabled={!form.name.trim()}>Salvează</Button></>}>
        <div className="space-y-3">
          <Field label="Nume serviciu" htmlFor="sname" required>
            <Input id="sname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex: Schimb ulei + filtru" />
          </Field>
          <Field label="Categorie" htmlFor="scat">
            <Select id="scat" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Fără categorie</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nameRo}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Durată (min)" htmlFor="sdur"><Input id="sdur" type="number" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} min={5} step={5} /></Field>
            <Field label="Preț (RON)" htmlFor="sprice"><Input id="sprice" type="number" value={form.priceRon} onChange={(e) => setForm({ ...form, priceRon: e.target.value })} min={0} /></Field>
          </div>
          <Field label="Tip preț" htmlFor="sptype">
            <Select id="sptype" value={form.priceType} onChange={(e) => setForm({ ...form, priceType: e.target.value })}>
              <option value="FROM">De la (orientativ)</option>
              <option value="FIXED">Fix</option>
              <option value="QUOTE">La evaluare</option>
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
