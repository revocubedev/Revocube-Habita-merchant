import { useEffect, useState } from 'react';
import Modal, { Field, inputCls } from '@/components/ui/Modal';
import {
  Unit,
  UnitFormValues,
  useCreateUnit,
  useUpdateUnit,
  useGetPropertyOptions,
} from '@/api/api_controllers/unitController';

const RENT_TYPES = ['MONTHLY', 'ANNUAL', 'OTHER'];
const DEPOSIT_TYPES = ['BANK', 'OTHER'];
const LATE_FEE_TYPES = ['PER_DAY', 'PER_MONTH', 'OTHER'];

const empty: UnitFormValues = {
  propertyId: '', name: '', bedrooms: 1, kitchens: 1, bathrooms: 1,
  rentType: 'MONTHLY', rentAmount: 0, rentDuration: 1,
  depositType: 'BANK', depositAmount: 0, lateFeeType: 'OTHER', lateFeeAmount: 0,
  incidentReceiptAmount: 0, notes: '',
};

const fromUnit = (u: Unit): UnitFormValues => ({
  propertyId: u.propertyId, name: u.name, bedrooms: u.bedrooms, kitchens: u.kitchens, bathrooms: u.bathrooms,
  rentType: u.rentType, rentAmount: Number(u.rentAmount), rentDuration: u.rentDuration,
  depositType: u.depositType, depositAmount: Number(u.depositAmount), lateFeeType: u.lateFeeType,
  lateFeeAmount: Number(u.lateFeeAmount), incidentReceiptAmount: Number(u.incidentReceiptAmount), notes: u.notes ?? '',
});

const UnitFormModal = ({ isOpen, onClose, unit }: { isOpen: boolean; onClose: () => void; unit?: Unit | null }) => {
  const isEdit = !!unit;
  const [form, setForm] = useState<UnitFormValues>(empty);
  const { createUnit, isLoading: creating } = useCreateUnit();
  const { updateUnit, isLoading: updating } = useUpdateUnit(unit?.id ?? '');
  const { properties } = useGetPropertyOptions();

  useEffect(() => {
    if (isOpen) setForm(unit ? fromUnit(unit) : empty);
  }, [isOpen, unit]);

  const set = <K extends keyof UnitFormValues>(k: K, v: UnitFormValues[K]) => setForm((f) => ({ ...f, [k]: v }));
  const num = (k: keyof UnitFormValues) => ({
    type: 'number', min: 0, className: inputCls, value: form[k] as number,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value) as never),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.propertyId || !form.name.trim()) return;
    try {
      if (isEdit) await updateUnit(form);
      else await createUnit(form);
      onClose();
    } catch { /* toast handled */ }
  };

  const loading = creating || updating;
  // Ensure the current property shows even if not in the options list
  const propOptions = unit?.property && !properties.some((p) => p.id === unit.property!.id)
    ? [{ id: unit.property.id, name: unit.property.name }, ...properties]
    : properties;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Unit' : 'Create Unit'} size="lg">
      <form onSubmit={submit} className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Field label="Property">
          {propOptions.length > 0 ? (
            <select className={inputCls} value={form.propertyId} onChange={(e) => set('propertyId', e.target.value)} required>
              <option value="">Select property</option>
              {propOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          ) : (
            <input className={inputCls} placeholder="Property ID" value={form.propertyId} onChange={(e) => set('propertyId', e.target.value)} required />
          )}
        </Field>
        <Field label="Unit Name">
          <input className={inputCls} placeholder="e.g. 1A" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </Field>
        <div className="col-span-2 grid grid-cols-3 gap-4">
          <Field label="Bedrooms"><input {...num('bedrooms')} /></Field>
          <Field label="Kitchens"><input {...num('kitchens')} /></Field>
          <Field label="Bathrooms"><input {...num('bathrooms')} /></Field>
        </div>
        <Field label="Rent Type">
          <select className={inputCls} value={form.rentType} onChange={(e) => set('rentType', e.target.value)}>
            {RENT_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</option>)}
          </select>
        </Field>
        <Field label="Rent Amount (₦)"><input {...num('rentAmount')} /></Field>
        <Field label="Rent Duration"><input {...num('rentDuration')} min={1} /></Field>
        <Field label="Deposit Type">
          <select className={inputCls} value={form.depositType} onChange={(e) => set('depositType', e.target.value)}>
            {DEPOSIT_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</option>)}
          </select>
        </Field>
        <Field label="Deposit Amount (₦)"><input {...num('depositAmount')} /></Field>
        <Field label="Late Fee Type">
          <select className={inputCls} value={form.lateFeeType} onChange={(e) => set('lateFeeType', e.target.value)}>
            {LATE_FEE_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</option>)}
          </select>
        </Field>
        <Field label="Late Fee Amount (₦)"><input {...num('lateFeeAmount')} /></Field>
        <Field label="Incident Receipt Amount (₦)"><input {...num('incidentReceiptAmount')} /></Field>
        <Field label="Notes" className="col-span-2">
          <textarea className={`${inputCls} min-h-[72px]`} placeholder="Enter notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </Field>
        <div className="col-span-2 flex justify-end gap-3 pt-3 sticky bottom-0 bg-card -mb-5 pb-5">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm border border-border">Cancel</button>
          <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: '#f30100' }}>
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Unit'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UnitFormModal;
