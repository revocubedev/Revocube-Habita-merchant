
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

import Button from '@/components/ui/Button';
import Modal, { Field, inputCls } from '@/components/ui/Modal';
import { ReceivingAccountPicker } from './ReceivingAccountModals';
import { InvoiceSummary } from './InvoiceDetails';

import { useGetPropertyOptions } from '@/api/api_controllers/unitController';
import { useGetReceivingAccounts } from '@/api/api_controllers/receivingAccountController';
import {
  useInvoiceUnitOptions,
  useSaveInvoice,
} from '@/api/api_controllers/invoiceController';

import {
  FREQUENCIES,
  INVOICE_TYPES,
  Invoice,
  InvoiceValues,
  invoiceLabel,
  invoiceSchema,
} from '@/lib/invoices';


export default function InvoiceFormDrawer({
  invoice,
  onClose,
  onSaved,
}: {
  invoice?: Invoice;
  onClose: () => void;
  onSaved: (invoice: Invoice) => void;
}) {
  const [form, setForm] = useState<InvoiceValues>(() =>
    invoice
      ? {
          type: invoice.type,
          payment: invoice.payment,
          frequency: invoice.frequency,
          amount: Number(invoice.amount),
          invoiceMonth: invoice.invoiceMonth.slice(0, 10),
          dueDate: invoice.dueDate.slice(0, 10),
          description: invoice.description || '',
          propertyScope: invoice.propertyScope,
          propertyIds: invoice.properties.map(p => p.id),
          unitScope: invoice.unitScope,
          unitIds: invoice.units.map(u => u.id),
          receivingAccountId:
            invoice.receivingAccountId || invoice.receivingAccount?.id || '',
        }
      : {
          type: 'SECURITY',
          payment: 'RECURRING_PAYMENT',
          frequency: 'MONTHLY',
          amount: 0,
          invoiceMonth: '',
          dueDate: '',
          description: '',
          propertyScope: 'ENTIRE_ESTATE',
          propertyIds: [],
          unitScope: 'ALL_UNITS',
          unitIds: [],
          receivingAccountId: '',
        }
  );

  const [preview, setPreview] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [propertySearch, setPropertySearch] = useState('');
  const [unitSearch, setUnitSearch] = useState('');

  const propertyQuery = useGetPropertyOptions();
  const unitQuery = useInvoiceUnitOptions();

  const { accounts } = useGetReceivingAccounts();

  const save = useSaveInvoice(invoice?.id);


  const set = <K extends keyof InvoiceValues>(
    key: K,
    value: InvoiceValues[K]
  ) => setForm(f => ({ ...f, [key]: value }));


  const properties = [
    ...propertyQuery.properties,
    ...(
      invoice?.properties.filter(
        p => !propertyQuery.properties.some(o => o.id === p.id)
      ) || []
    ),
  ];


  const units = [
    ...unitQuery.units,
    ...(
      invoice?.units
        .filter(u => !unitQuery.units.some(o => o.id === u.id))
        .map(u => ({ ...u, propertyId: u.propertyId || '' })) || []
    ),
  ];


  const eligibleUnits = units.filter(
    u =>
      form.propertyScope === 'ENTIRE_ESTATE' ||
      form.propertyIds?.includes(u.propertyId)
  );


  const toggle = (key: 'propertyIds' | 'unitIds', id: string) => {
    setForm(f => ({
      ...f,

      [key]: f[key]?.includes(id)
        ? f[key]?.filter(v => v !== id)
        : [...(f[key] || []), id],

      ...(key === 'propertyIds' ? { unitIds: [] } : {}),
    }));
  };


  const check = () => {
    const result = invoiceSchema.safeParse(form);

    if (!result.success) {
      setValidationError(
        result.error.issues[0]?.message || 'Check invoice details.'
      );

      return false;
    }

    setValidationError('');

    return true;
  };


  const submit = async () => {
    if (!check()) return;

    try {
      onSaved(await save.save(form));
    } catch {
      /* API toast; keep draft */
    }
  };


  const summary: Invoice = {
    ...form,

    id: invoice?.id || '',
    invoiceNumber: invoice?.invoiceNumber || '',
    status: invoice?.status || 'PENDING',

    properties: properties.filter(
      p => form.propertyIds?.includes(p.id)
    ),

    units: eligibleUnits.filter(
      u => form.unitIds?.includes(u.id)
    ),

    receivingAccount:
      accounts.find(a => a.id === form.receivingAccountId) ||
      invoice?.receivingAccount,
  };


  return (
    <Modal
      isOpen
      onClose={() => {
        if (!save.isLoading) onClose();
      }}
      title={preview ? 'Invoice Preview' : invoice ? 'Edit Invoice' : 'Create Invoice'}
      variant="drawer"
      bodyClassName="p-0 flex flex-col"
    >
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
        {preview ? (
          <InvoiceSummary invoice={summary} />
        ) : (
          <form
            id="invoice-form"
            onSubmit={e => {
              e.preventDefault();

              if (check()) setPreview(true);
            }}
            className="space-y-5"
          >
            <fieldset>
              <legend className="text-sm font-medium text-muted-foreground mb-2">
                Payment Type
              </legend>

              <div className="grid grid-cols-2 gap-3">
                {(['ONE_TIME_PAYMENT', 'RECURRING_PAYMENT'] as const).map(p => (
                  <label
                    key={p}
                    className="flex gap-2 items-center text-sm"
                  >
                    <input
                      type="radio"
                      name="invoicePayment"
                      className="accent-brand-text"
                      checked={form.payment === p}
                      onChange={() => set('payment', p)}
                    />
                    {invoiceLabel(p)}
                  </label>
                ))}
              </div>
            </fieldset>


            <Field label="Type">
              <select
                className={inputCls}
                value={form.type}
                onChange={e => set('type', e.target.value)}
              >
                {[...new Set([...INVOICE_TYPES, form.type])].map(t => (
                  <option key={t} value={t}>
                    {invoiceLabel(t)}
                  </option>
                ))}
              </select>
            </Field>


            <Field label="Property">
              <select
                className={inputCls}
                value={form.propertyScope}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    propertyScope: e.target.value as InvoiceValues['propertyScope'],
                    propertyIds: [],
                    unitIds: [],
                  }))
                }
              >
                <option value="ENTIRE_ESTATE">
                  Entire Estate
                </option>

                <option value="SELECTED_PROPERTIES">
                  Selected Properties
                </option>
              </select>
            </Field>


            {form.propertyScope === 'SELECTED_PROPERTIES' && (
              <div className="space-y-2">
                <input
                  aria-label="Search properties"
                  className={inputCls}
                  placeholder="Search properties"
                  value={propertySearch}
                  onChange={e => setPropertySearch(e.target.value)}
                />

                <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-3 space-y-2">
                  {propertyQuery.isLoading && (
                    <p className="text-sm">
                      Loading properties…
                    </p>
                  )}

                  {propertyQuery.isError && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => propertyQuery.refetch()}
                    >
                      Retry properties
                    </Button>
                  )}

                  {properties
                    .filter(p =>
                      p.name
                        .toLowerCase()
                        .includes(propertySearch.toLowerCase())
                    )
                    .map(p => (
                      <label
                        className="flex items-center gap-2 text-sm"
                        key={p.id}
                      >
                        <input
                          type="checkbox"
                          className="accent-brand-text"
                          checked={!!form.propertyIds?.includes(p.id)}
                          onChange={() => toggle('propertyIds', p.id)}
                        />
                        {p.name}
                      </label>
                    ))}

                  {!propertyQuery.isLoading && !properties.length && (
                    <p className="text-sm text-muted-foreground">
                      No properties available.
                    </p>
                  )}
                </div>
              </div>
            )}


            <Field label="Apply to">
              <select
                className={inputCls}
                value={form.unitScope}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    unitScope: e.target.value as InvoiceValues['unitScope'],
                    unitIds: [],
                  }))
                }
              >
                <option value="ALL_UNITS">
                  All property units
                </option>

                <option value="SELECTED_UNITS">
                  Selected units
                </option>
              </select>
            </Field>


            {form.unitScope === 'SELECTED_UNITS' && (
              <div className="space-y-2">
                <input
                  aria-label="Search units"
                  className={inputCls}
                  placeholder="Search units"
                  value={unitSearch}
                  onChange={e => setUnitSearch(e.target.value)}
                />

                <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-3 space-y-2">
                  {unitQuery.isLoading && (
                    <p className="text-sm">
                      Loading units…
                    </p>
                  )}

                  {unitQuery.isError && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => unitQuery.refetch()}
                    >
                      Retry units
                    </Button>
                  )}

                  {eligibleUnits
                    .filter(u =>
                      u.name
                        .toLowerCase()
                        .includes(unitSearch.toLowerCase())
                    )
                    .map(u => (
                      <label
                        className="flex items-center gap-2 text-sm"
                        key={u.id}
                      >
                        <input
                          className="accent-brand-text"
                          type="checkbox"
                          checked={!!form.unitIds?.includes(u.id)}
                          onChange={() => toggle('unitIds', u.id)}
                        />
                        {properties.find(p => p.id === u.propertyId)?.name} · {u.name}
                      </label>
                    ))}

                  {!unitQuery.isLoading && !eligibleUnits.length && (
                    <p className="text-sm text-muted-foreground">
                      No units available for this selection.
                    </p>
                  )}
                </div>
              </div>
            )}


            <Field label="Amount (₦)">
              <input
                className={inputCls}
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.amount || ''}
                onChange={e => set('amount', Number(e.target.value))}
              />
            </Field>


            <Field label="Frequency">
              <select
                className={inputCls}
                value={form.frequency}
                onChange={e =>
                  set('frequency', e.target.value as InvoiceValues['frequency'])
                }
              >
                {FREQUENCIES.map(f => (
                  <option key={f} value={f}>
                    {invoiceLabel(f)}
                  </option>
                ))}
              </select>
            </Field>


            <Field label="Invoice Month">
              <input
                className={inputCls}
                type="month"
                required
                value={form.invoiceMonth.slice(0, 7)}
                onChange={e =>
                  set(
                    'invoiceMonth',
                    e.target.value ? `${e.target.value}-01` : ''
                  )
                }
              />
            </Field>


            <Field label="Due Date">
              <input
                className={inputCls}
                type="date"
                required
                value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)}
              />
            </Field>


            <fieldset>
              <legend className="text-sm font-medium text-muted-foreground mb-2">
                Receiving Account
              </legend>

              <ReceivingAccountPicker
                value={form.receivingAccountId}
                onChange={id => set('receivingAccountId', id)}
              />
            </fieldset>


            <Field label="Note">
              <textarea
                className={`${inputCls} min-h-24`}
                value={form.description}
                placeholder="Enter notes"
                onChange={e => set('description', e.target.value)}
              />
            </Field>
          </form>
        )}

        {validationError && (
          <p
            role="alert"
            className="text-sm text-danger mt-4"
          >
            {validationError}
          </p>
        )}
      </div>


      <div className="shrink-0 p-4 border-t border-border bg-card flex flex-wrap justify-end gap-3">
        {preview ? (
          <>
            <Button
              variant="outline"
              disabled={save.isLoading}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => setPreview(false)}
            >
              Back
            </Button>

            <Button
              className="bg-brand-text text-primary-foreground hover:bg-brand-text/90"
              isLoading={save.isLoading}
              leftIcon={<Save className="w-4 h-4" />}
              onClick={submit}
            >
              {invoice ? 'Save Changes' : 'Create Invoice'}
            </Button>
          </>
        ) : (
          <Button
            form="invoice-form"
            type="submit"
            className="bg-brand-text text-primary-foreground hover:bg-brand-text/90"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Continue To Invoice Preview
          </Button>
        )}
      </div>
    </Modal>
  );
}
