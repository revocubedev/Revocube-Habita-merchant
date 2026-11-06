import { useEffect, useState } from 'react';
import { Plus, Landmark } from 'lucide-react';
import Modal, { Field, inputCls } from '@/components/ui/Modal';
import {
  useCreateReceivingAccount,
  useGetReceivingAccounts,
  ReceivingAccount,
} from '@/api/api_controllers/receivingAccountController';

/** "Add Bank Account Details" popup. */
export const AddBankAccountModal = ({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (acc: ReceivingAccount) => void;
}) => {
  const { createAccount, isLoading } = useCreateReceivingAccount();
  const [form, setForm] = useState({
    accountNumber: '',
    accountName: '',
    bankName: '',
  });

  useEffect(() => {
    if (isOpen) setForm({ accountNumber: '', accountName: '', bankName: '' });
  }, [isOpen]);

  const valid =
    /^\d{10}$/.test(form.accountNumber) &&
    form.accountName.trim() &&
    form.bankName.trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    try {
      const res = await createAccount({
        accountNumber: form.accountNumber,
        accountName: form.accountName.trim(),
        bankName: form.bankName.trim(),
      });
      onCreated?.(res?.data);
      onClose();
    } catch {
      /* toast shown by api manager */
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Bank Account Details" size="md">
      <form onSubmit={submit} className="space-y-5" autoComplete="off">
        <Field label="Account Number">
          <input
            className={inputCls}
            placeholder="Enter account no"
            inputMode="numeric"
            maxLength={10}
            value={form.accountNumber}
            onChange={(e) => setForm({ ...form, accountNumber: e.target.value.replace(/\D/g, '') })}
          />
          {form.accountNumber && form.accountNumber.length !== 10 && (
            <span className="text-xs text-destructive mt-1 block">Account number must be 10 digits</span>
          )}
        </Field>
        <Field label="Bank">
          <input
            className={inputCls}
            placeholder="Bank Name"
            value={form.bankName}
            onChange={(e) => setForm({ ...form, bankName: e.target.value })}
          />
        </Field>
        <Field label="Account Name">
          <input
            className={inputCls}
            placeholder="Account holder name"
            value={form.accountName}
            onChange={(e) => setForm({ ...form, accountName: e.target.value })}
          />
        </Field>
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={!valid || isLoading}
            className="px-8 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#f30100' }}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/** Receiving account picker list + "Add New Account" link (used in invoice forms). */
export const ReceivingAccountPicker = ({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (id: string) => void;
}) => {
  const { accounts, isLoading, isError } = useGetReceivingAccounts();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {isLoading && <p className="p-4 text-sm text-muted-foreground">Loading accounts...</p>}
        {isError && <p className="p-4 text-sm text-destructive">Couldn't load receiving accounts.</p>}
        {!isLoading && !isError && accounts.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">No receiving account yet. Add one below.</p>
        )}
        {accounts.map((a) => (
          <label key={a.id} className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{a.accountName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {a.accountNumber}, {a.bankName} · {a.gateway}
              </p>
            </div>
            {onChange && (
              <input
                type="radio"
                name="receivingAccount"
                checked={value === a.id}
                onChange={() => onChange(a.id)}
                className="w-4 h-4"
                style={{ accentColor: '#f30100' }}
              />
            )}
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setAddOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium"
        style={{ color: '#f30100' }}
      >
        <Plus className="w-4 h-4" /> Add New Account
      </button>
      <AddBankAccountModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(acc) => acc?.id && onChange?.(acc.id)}
      />
    </div>
  );
};

/** Standalone popup to view/add receiving accounts from the Invoices page. */
export const ReceivingAccountsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Receiving Accounts" size="md">
    <ReceivingAccountPicker />
  </Modal>
);
