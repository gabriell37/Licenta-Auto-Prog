'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { toast } from '@/components/ui/toaster';
import { addVehicleAction, updateVehicleAction, decodeVinAction, type VehicleFormState } from '@/app/actions/vehicles';
import { FUEL_TYPES, FUEL_LABELS_RO } from '@/lib/enums';

type V = {
  id?: string;
  make?: string; model?: string; year?: number | null; vin?: string | null;
  plate?: string | null; engine?: string | null; fuel?: string | null; mileage?: number | null;
  color?: string | null; nickname?: string | null;
};

export function VehicleForm({ vehicle, next }: { vehicle?: V; next?: string }) {
  const isEdit = !!vehicle?.id;
  const action = isEdit ? updateVehicleAction.bind(null, vehicle!.id!) : addVehicleAction;
  const [state, formAction, pending] = useActionState<VehicleFormState, FormData>(action, {});

  const [fields, setFields] = React.useState({
    make: vehicle?.make ?? '', model: vehicle?.model ?? '', year: vehicle?.year?.toString() ?? '',
    vin: vehicle?.vin ?? '', plate: vehicle?.plate ?? '', engine: vehicle?.engine ?? '',
    fuel: vehicle?.fuel ?? '', mileage: vehicle?.mileage?.toString() ?? '', color: vehicle?.color ?? '',
    nickname: vehicle?.nickname ?? '',
  });
  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  const [decoding, startDecode] = React.useTransition();
  function decode() {
    if (fields.vin.trim().length < 11) {
      toast.error('Introdu un VIN valid (17 caractere) pentru decodare.');
      return;
    }
    startDecode(async () => {
      const res = await decodeVinAction(fields.vin);
      if (res.make || res.year) {
        setFields((f) => ({
          ...f,
          make: res.make ?? f.make,
          year: res.year?.toString() ?? f.year,
          fuel: res.fuel ?? f.fuel,
        }));
        toast.success('Date completate din VIN. Verifică și ajustează dacă e nevoie.');
      } else {
        toast.message('Nu am putut decoda VIN-ul. Completează manual.');
      }
    });
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {!isEdit && next && <input type="hidden" name="next" value={next} />}
      {state.error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-subtle px-3 py-2.5 text-sm text-danger-fg">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{state.error}</span>
        </div>
      )}

      {/* VIN decode helper */}
      <div className="rounded-xl border border-dashed border-border-strong bg-surface-2 p-4">
        <Field label="Serie șasiu (VIN)" htmlFor="vin" hint="Opțional — completează automat marca, anul și combustibilul">
          <div className="flex gap-2">
            <Input id="vin" name="vin" value={fields.vin} onChange={set('vin')} placeholder="ex: UU1DJF00G12345678" maxLength={17} className="font-mono uppercase" />
            <Button type="button" variant="secondary" onClick={decode} loading={decoding} className="shrink-0">
              <Sparkles className="h-4 w-4" /> Decodează
            </Button>
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Marca" htmlFor="make" required error={state.fieldErrors?.make}>
          <Input id="make" name="make" value={fields.make} onChange={set('make')} placeholder="Dacia" required aria-invalid={!!state.fieldErrors?.make} />
        </Field>
        <Field label="Model" htmlFor="model" required error={state.fieldErrors?.model}>
          <Input id="model" name="model" value={fields.model} onChange={set('model')} placeholder="Logan" required aria-invalid={!!state.fieldErrors?.model} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="An fabricație" htmlFor="year" error={state.fieldErrors?.year}>
          <Input id="year" name="year" value={fields.year} onChange={set('year')} type="number" inputMode="numeric" placeholder="2018" min={1950} max={2100} />
        </Field>
        <Field label="Combustibil" htmlFor="fuel">
          <Select id="fuel" name="fuel" value={fields.fuel} onChange={set('fuel')}>
            <option value="">Alege…</option>
            {FUEL_TYPES.map((f) => (
              <option key={f} value={f}>{FUEL_LABELS_RO[f]}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Motorizare" htmlFor="engine">
          <Input id="engine" name="engine" value={fields.engine} onChange={set('engine')} placeholder="1.5 dCi" />
        </Field>
        <Field label="Kilometraj" htmlFor="mileage" hint="km la bord">
          <Input id="mileage" name="mileage" value={fields.mileage} onChange={set('mileage')} type="number" inputMode="numeric" placeholder="124000" min={0} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Număr înmatriculare" htmlFor="plate">
          <Input id="plate" name="plate" value={fields.plate} onChange={set('plate')} placeholder="B 123 ABC" className="uppercase" />
        </Field>
        <Field label="Culoare" htmlFor="color">
          <Input id="color" name="color" value={fields.color} onChange={set('color')} placeholder="Gri" />
        </Field>
      </div>

      <Field label="Poreclă" htmlFor="nickname" hint="Opțional — ca să o recunoști ușor în garaj">
        <Input id="nickname" name="nickname" value={fields.nickname} onChange={set('nickname')} placeholder="Mașina de oraș" />
      </Field>

      <div className="flex gap-2 pt-2">
        <Button type="submit" size="lg" loading={pending} className="flex-1">
          {isEdit ? 'Salvează modificările' : 'Adaugă în garaj'}
        </Button>
      </div>
    </form>
  );
}
