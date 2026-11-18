import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Plus, Search } from "lucide-react";
import * as XLSX from "xlsx";
import RowActionsMenu, { RowAction } from "@/components/ui/RowActionsMenu";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useGetExpenseTypes, extractTypes } from "@/api/api_controllers/types";
import {
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  useGetExpensesCall,
  type Expense as ApiExpense,
  type ExpenseInput,
} from "@/api/api_controllers/expenses";

type Mode = "create" | "edit" | "view";

type ExpenseForm = {
  title: string;
  issueType: string;
  amount: string;
  date: string;
  notes: string;
  receipt: File | null;
  propertyId: string;
  unitId: string;
};

const emptyForm = (): ExpenseForm => ({
  title: "",
  issueType: "",
  amount: "",
  date: "",
  notes: "",
  receipt: null,
  propertyId: "",
  unitId: "",
});

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-60";

const buttonClass =
  "rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50";

const columns = [
  "Expense",
  "Title",
  "Property",
  "Unit",
  "Type",
  "Date",
  "Amount",
  "Receipt",
];

function cleanAmount(input: string): string {
  const cleaned = input.replace(/[^\d.]/g, "");
  const [int, ...rest] = cleaned.split(".");
  return rest.length ? `${int}.${rest.join("").slice(0, 2)}` : int;
}

function formatAmount(value: string): string {
  const cleaned = cleanAmount(value);
  if (!cleaned) return "";

  const decimalIndex = cleaned.indexOf(".");

  if (decimalIndex === -1) {
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const integerPart = cleaned.slice(0, decimalIndex);
  const decimalPart = cleaned.slice(decimalIndex + 1);

  return `${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${decimalPart}`;
}

function parseAmount(value: string): number {
  return Number(value.replace(/,/g, ""));
}

function labelOf(value: unknown): string {
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    const v = value as { name?: unknown; unitNumber?: unknown };
    return String(v.name ?? v.unitNumber ?? "");
  }

  return "";
}

function idOf(direct: unknown, nested: unknown): string {
  if (typeof direct === "string" && direct) return direct;

  if (nested && typeof nested === "object" && "id" in nested) {
    return String((nested as { id: unknown }).id ?? "");
  }

  return "";
}

type NamedOption = { id: string; name: string };

function uniqueOptions(items: NamedOption[]): NamedOption[] {
  const seen = new Map<string, NamedOption>();

  for (const item of items) {
    if (item.id && !seen.has(item.id)) seen.set(item.id, item);
  }

  return [...seen.values()];
}

function typeLabel(
  expense: ApiExpense,
  options: { id: string; value: string }[]
): string {
  const direct = expense.issueType ?? expense.type;

  const raw =
    typeof direct === "string"
      ? direct
      : direct && typeof direct === "object"
        ? String(direct.value ?? direct.name ?? "")
        : "";

  if (raw) return raw;

  return options.find((o) => o.id === expense.issueTypeId)?.value ?? "";
}

function receiptOf(expense: ApiExpense): string | null | undefined {
  return expense.receiptUrl ?? expense.receipt;
}

function currency(value: number | string): string {
  const amount = Number(value);

  return Number.isFinite(amount)
    ? `₦${amount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : String(value);
}

function displayDate(value?: string): string {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function inputDate(value?: string): string {
  if (!value) return "";

  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  return match?.[0] ?? "";
}

function receiptLink(value?: string | null): string | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value, window.location.origin);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.href;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function errorText(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm">{label}</span>
      {children}
    </label>
  );
}

function ExpenseActions({
  id,
  onView,
  onEdit,
}: {
  id: string;
  onView: () => void;
  onEdit: () => void;
}) {
  const { deleteExpense, isLoading } = useDeleteExpense(id);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const triggerRef = useRef<HTMLSpanElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;

      triggerRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    };
  }, [isOpen]);

  const handleDelete = async () => {
    if (isLoading) return;

    setError("");

    try {
      await deleteExpense();
      setIsOpen(false);
    } catch (err) {
      setError(errorText(err));
    }
  };

  return (
    <span ref={triggerRef}>
      <RowActionsMenu
        label={`Actions for expense ${id}`}
        panelWidth={186}
        triggerClassName="h-6 w-6 rounded text-[#5f5f5f] hover:bg-transparent hover:text-[#393939]"
        triggerIcon={
          <img src="/assets/ellipsis.svg" alt="" width={24} height={24} />
        }
        panelClassName="flex flex-col gap-2 rounded-[5px] bg-white px-3 py-[15px] shadow-[0_10px_20px_rgba(0,0,0,0.05)]"
        panelStyle={{ borderRadius: 5, borderColor: "#eaecf0" }}
      >
        {(close) => (
          <>
            <RowAction
              disabled={isLoading}
              className="h-9 whitespace-nowrap rounded-[5px] px-4 text-[#5f5f5f]"
              onClick={() => {
                close();
                onView();
              }}
            >
              <img src="/assets/view.svg" alt="" width={14} height={14} />
              View
            </RowAction>

            <RowAction
              disabled={isLoading}
              className="h-9 whitespace-nowrap rounded-[5px] px-4 text-[#5f5f5f]"
              onClick={() => {
                close();
                onEdit();
              }}
            >
              <img src="/assets/edit.svg" alt="" width={14} height={14} />
              Edit
            </RowAction>

            <RowAction
              disabled={isLoading}
              className="h-9 whitespace-nowrap rounded-[5px] px-4 text-[#ff383c] hover:bg-[#fff5f5]"
              onClick={() => {
                close();
                setError("");
                setIsOpen(true);
              }}
            >
              <img src="/assets/delete.svg" alt="" width={14} height={14} />
              Delete
            </RowAction>
          </>
        )}
      </RowActionsMenu>

      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-4"
            style={{ fontFamily: "Poppins, sans-serif" }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isLoading) {
                setIsOpen(false);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape" && !isLoading) {
                setIsOpen(false);
              }

              if (event.key === "Tab") {
                event.preventDefault();

                const next =
                  document.activeElement === cancelRef.current
                    ? deleteRef.current
                    : cancelRef.current;

                next?.focus();
              }
            }}
          >
            <section
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={`delete-expense-title-${id}`}
              aria-describedby={`delete-expense-description-${id}`}
              aria-busy={isLoading}
              className="w-full max-w-[616px] rounded-lg border border-[#e9e9e9] bg-white px-5 pb-[54px] pt-8 text-center shadow-[0_8px_8px_0_rgba(0,0,0,0.1)] sm:px-8"
            >
              <div className="mx-auto mb-6 flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#fff4ca] shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
                <img
                  src="/assets/expense-delete-warning.svg"
                  alt=""
                  width={38}
                  height={38}
                />
              </div>

              <h2
                id={`delete-expense-title-${id}`}
                className="text-2xl font-semibold leading-[1.4] text-[#393939]"
              >
                Are you sure you want to delete this record?
              </h2>

              <p
                id={`delete-expense-description-${id}`}
                className="mx-auto mt-[6px] max-w-[378px] text-base leading-[1.4] text-[#4c4c4c]"
              >
                This record can not be restored after delete. Do you want to
                confirm?
              </p>

              {error && (
                <p role="alert" className="mt-4 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="mt-10 flex justify-center gap-3">
                <Button
                  ref={cancelRef}
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => setIsOpen(false)}
                  className="h-11 w-[109px] border-[#eaeaea] bg-white font-semibold text-[#4c4c4c]"
                >
                  Cancel
                </Button>

                <Button
                  ref={deleteRef}
                  type="button"
                  disabled={isLoading}
                  onClick={() => void handleDelete()}
                  className="h-11 w-[109px] bg-brand-text font-semibold text-white hover:bg-brand-text/90"
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </section>
          </div>,
          document.body
        )}
    </span>
  );
}

function ExpenseModal({
  mode,
  expense,
  onClose,
  expenses = [],
}: {
  mode: Mode;
  expense?: ApiExpense;
  onClose: () => void;
  expenses?: ApiExpense[];
}) {
  const readOnly = mode === "view";

  const [form, setForm] = useState<ExpenseForm>(() =>
    expense
      ? {
          title: expense.title,
          issueType: typeLabel(expense, []),
          amount:
            expense.amount === undefined || expense.amount === null
              ? ""
              : cleanAmount(String(expense.amount)),
          date: inputDate(expense.date),
          notes: expense.notes ?? "",
          receipt: null,
          propertyId: idOf(expense.propertyId, expense.property),
          unitId: idOf(expense.unitId, expense.unit),
        }
      : emptyForm()
  );

  const [error, setError] = useState("");

  const create = useCreateExpense();
  const update = useUpdateExpense(expense?.id);

  const busy = create.isLoading || update.isLoading;

  const typesQuery = useGetExpenseTypes(!readOnly);
  const issueTypes = extractTypes(typesQuery.data);

  const selectedIssueType = form.issueType
    ? issueTypes.find(
        (t) =>
          t.id === form.issueType ||
          t.value.toUpperCase() === form.issueType.toUpperCase()
      )?.id ?? form.issueType
    : expense?.issueTypeId ??
      (typeof expense?.issueType === "object" && expense.issueType
        ? expense.issueType.id ?? ""
        : "");

  const allExpenses = expense ? [expense, ...expenses] : expenses;

  const properties = uniqueOptions(
    allExpenses.map((e) => ({
      id: idOf(e.propertyId, e.property),
      name: labelOf(e.property),
    }))
  );

  const units = uniqueOptions(
    allExpenses
      .filter((e) => idOf(e.propertyId, e.property) === form.propertyId)
      .map((e) => ({
        id: idOf(e.unitId, e.unit),
        name: labelOf(e.unit),
      }))
  );

  function change<K extends keyof ExpenseForm>(key: K, value: ExpenseForm[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (readOnly || busy) return;

    setError("");

    const amount = parseAmount(form.amount);
    const title = form.title.trim();
    const notes = form.notes.trim();
    const issueType = selectedIssueType.trim();

    if (!title) {
      setError("Please enter an expense title.");
      return;
    }

    if (!notes) {
      setError("Please enter expense notes.");
      return;
    }

    if (!issueType) {
      setError("Please select a valid expense type.");
      return;
    }

    if (!form.amount.trim() || !Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    const payload: ExpenseInput = {
      title,
      issueType,
      amount,
      date: form.date,
      notes,
      receipt: form.receipt ?? undefined,
      ...(form.propertyId ? { propertyId: form.propertyId } : {}),
      ...(form.unitId ? { unitId: form.unitId } : {}),
    };

    try {
      if (mode === "edit") {
        await update.updateExpense(payload);
      } else {
        await create.createExpense(payload);
      }

      onClose();
    } catch (err) {
      setError(errorText(err));
    }
  };

  const receipt = receiptLink(expense ? receiptOf(expense) : undefined);

  if (mode === "edit") {
    const controlClass =
      "h-12 border-[#eaeaea] bg-white px-5 text-base leading-[1.4] text-[#4c4c4c] placeholder:text-[#a1a1a1]";

    const expenseNumber = expense?.expenseNumber || `#EXP-${expense?.id ?? ""}`;

    const numberParts = expenseNumber.match(/^(#EXP-0*)(.+)$/);

    const selectArrow = (
      <img
        src="/assets/expense-edit-chevron.svg"
        alt=""
        width={18}
        height={18}
        className="pointer-events-none absolute right-5 top-[15px]"
      />
    );

    return (
      <Modal
        isOpen
        onClose={() => {
          if (!busy) onClose();
        }}
        title="Edit Expense"
        presentation="drawer"
        closeIcon={
          <img
            src="/assets/expense-edit-close.svg"
            alt=""
            width={14}
            height={14}
          />
        }
        bodyClassName="relative px-5 pb-8 pt-[35px] sm:px-8"
      >
        <div className="pointer-events-none absolute right-0 top-[259px] h-[50.301px] w-[16.04px] overflow-hidden">
          <img
            src="/assets/expense-edit-edge.svg"
            alt=""
            width={32}
            height={32}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <p role="alert" className="mb-5 text-sm text-red-600">
              {error}
            </p>
          )}

          {typesQuery.isError && (
            <p role="alert" className="mb-4 text-sm text-red-600">
              Unable to load expense types. Please try again.
            </p>
          )}

          <fieldset
            disabled={busy}
            className="space-y-5 [&_label>span]:mb-2 [&_label>span]:leading-5 [&_label>span]:text-[#4c4c4c]"
          >
            <Field label="Expense Title">
              <Input
                autoFocus
                required
                value={form.title}
                onChange={(event) => change("title", event.target.value)}
                className={controlClass}
                placeholder="Expense title"
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Expense Number">
                <div className="flex h-12 overflow-hidden rounded-lg border border-[#eaeaea] text-base">
                  <span className="flex shrink-0 items-center bg-[#eaeaea] px-4 text-[#727272]">
                    {numberParts?.[1] ?? "#EXP-"}
                  </span>

                  <input
                    aria-label="Expense Number"
                    readOnly
                    value={
                      numberParts?.[2] ?? expenseNumber.replace(/^#EXP-/, "")
                    }
                    className="min-w-0 w-full bg-white px-6 text-[#898989] outline-none"
                  />
                </div>
              </Field>

              <Field label="Issue Type">
                <div className="relative">
                  <select
                    required
                    value={selectedIssueType}
                    disabled={typesQuery.isLoading || typesQuery.isError}
                    onChange={(event) =>
                      change("issueType", event.target.value)
                    }
                    className={`w-full appearance-none rounded-lg border pr-12 ${controlClass}`}
                  >
                    <option value="" disabled>
                      {typesQuery.isLoading ? "Loading types..." : "Select type"}
                    </option>

                    {form.issueType &&
                      !issueTypes.some((t) => t.id === selectedIssueType) && (
                        <option value={form.issueType}>{form.issueType}</option>
                      )}

                    {issueTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>

                  {selectArrow}
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Property">
                <div className="relative">
                  <select
                    value={form.propertyId}
                    onChange={(event) => {
                      change("propertyId", event.target.value);
                      change("unitId", "");
                    }}
                    className={`w-full appearance-none rounded-lg border pr-12 ${controlClass}`}
                  >
                    <option value="">Select property</option>

                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>

                  {selectArrow}
                </div>
              </Field>

              <Field label="Unit">
                <div className="relative">
                  <select
                    value={form.unitId}
                    onChange={(event) => change("unitId", event.target.value)}
                    className={`w-full appearance-none rounded-lg border pr-12 ${controlClass}`}
                  >
                    <option value="">Select unit</option>

                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>

                  {selectArrow}
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Date">
                <div className="relative">
                  <Input
                    required
                    type="date"
                    value={form.date}
                    onChange={(event) => change("date", event.target.value)}
                    className={`${controlClass} pr-12 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-5 [&::-webkit-calendar-picker-indicator]:z-10 [&::-webkit-calendar-picker-indicator]:opacity-0`}
                  />

                  {selectArrow}
                </div>
              </Field>

              <Field label="Amount">
                <Input
                  required
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={formatAmount(form.amount)}
                  onChange={(event) =>
                    change("amount", cleanAmount(event.target.value))
                  }
                  className={controlClass}
                />
              </Field>
            </div>

            <Field label="Receipt">
              <input
                aria-label="Receipt"
                type="file"
                onChange={(event) =>
                  change("receipt", event.target.files?.[0] ?? null)
                }
                className="block h-12 w-full overflow-hidden rounded-lg border border-[#eaeaea] bg-white text-base leading-[46px] text-[#4c4c4c] file:mr-6 file:h-[46px] file:w-[124px] file:border-0 file:bg-[#eaeaea] file:px-4 file:text-base file:text-[#727272]"
              />

              {receipt && (
                <a
                  href={receipt}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-xs text-brand-text underline"
                >
                  Open current receipt
                </a>
              )}
            </Field>

            <Field label="Note">
              <div className="relative">
                <textarea
                  value={form.notes}
                  onChange={(event) => change("notes", event.target.value)}
                  className={`block h-[126px] w-full resize-none rounded-lg border py-3 pr-12 ${controlClass.replace(
                    "h-12 ",
                    ""
                  )}`}
                />

                <img
                  src="/assets/expense-edit-note.svg"
                  alt=""
                  width={18}
                  height={18}
                  className="pointer-events-none absolute right-5 top-3"
                />
              </div>
            </Field>
          </fieldset>

          <div className="mt-12 flex justify-end sm:mt-[179px]">
            <Button
              type="submit"
              disabled={busy || typesQuery.isError || issueTypes.length === 0}
              className="h-11 min-w-[101px] bg-brand-text px-6 font-semibold text-white hover:bg-brand-text/90"
            >
              {busy ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-dialog-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-card p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="expense-dialog-title" className="text-lg font-medium">
            {mode === "create" ? "Create Expense" : "View Expense"}
          </h2>

          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className={buttonClass}
          >
            Close
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-4 text-sm text-red-600">
            {error}
          </p>
        )}

        {typesQuery.isError && !readOnly && (
          <p role="alert" className="mb-4 text-sm text-red-600">
            Unable to load expense types. Please try again.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={readOnly || busy} className="space-y-4">
            <label className="block space-y-1">
              <span>Title</span>

              <input
                required
                value={form.title}
                onChange={(event) => change("title", event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block space-y-1">
              <span>Issue Type</span>

              <select
                required
                value={selectedIssueType}
                disabled={
                  typesQuery.isLoading ||
                  typesQuery.isError ||
                  issueTypes.length === 0
                }
                onChange={(event) => change("issueType", event.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  {typesQuery.isLoading
                    ? "Loading types..."
                    : typesQuery.isError
                      ? "Unable to load types"
                      : "Select an issue type"}
                </option>

                {form.issueType &&
                  !issueTypes.some((t) => t.id === selectedIssueType) && (
                    <option value={form.issueType}>{form.issueType}</option>
                  )}

                {issueTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span>Property</span>

                <select
                  value={form.propertyId}
                  onChange={(event) => {
                    change("propertyId", event.target.value);
                    change("unitId", "");
                  }}
                  className={inputClass}
                >
                  <option value="">Select property</option>

                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span>Unit</span>

                <select
                  value={form.unitId}
                  onChange={(event) => change("unitId", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select unit</option>

                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span>Amount</span>

                <input
                  required
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={formatAmount(form.amount)}
                  onChange={(event) =>
                    change("amount", cleanAmount(event.target.value))
                  }
                  className={inputClass}
                />
              </label>

              <label className="block space-y-1">
                <span>Date</span>

                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(event) => change("date", event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span>Notes</span>

              <textarea
                required={mode === "create"}
                rows={3}
                value={form.notes}
                onChange={(event) => change("notes", event.target.value)}
                className={inputClass}
              />
            </label>

            {!readOnly && (
              <label className="block space-y-1">
                <span>Receipt</span>

                <input
                  type="file"
                  onChange={(event) =>
                    change("receipt", event.target.files?.[0] ?? null)
                  }
                  className={inputClass}
                />
              </label>
            )}
          </fieldset>

          {receipt && (
            <a
              href={receipt}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-red-600 underline"
            >
              Open current receipt
            </a>
          )}

          {!readOnly && (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={onClose}
                className={buttonClass}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  busy ||
                  typesQuery.isError ||
                  typesQuery.isLoading ||
                  issueTypes.length === 0
                }
                className="rounded-lg bg-[#f30100] px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save Expense"}
              </button>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}

export default function Expense() {
  const code = localStorage.getItem("code") ?? "";
  const query = useGetExpensesCall();

  const typesQuery = useGetExpenseTypes();
  const typeOptions = extractTypes(typesQuery.data);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showColumns, setShowColumns] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns);

  const [modal, setModal] = useState<{
    mode: Mode;
    expense?: ApiExpense;
  } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !(event.target as HTMLElement).closest(".expense-column-menu-container")
      ) {
        setShowColumns(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const response = query.data;

  const loadError = !code.trim()
    ? "Estate code is missing. Select or sign in to your estate first."
    : query.error
      ? errorText(query.error)
      : "";

  const expenses = !loadError ? response?.data ?? [] : [];

  const term = search.trim().toLowerCase();

  const filtered = expenses.filter((expense) =>
    [
      expense.expenseNumber,
      expense.title,
      labelOf(expense.property),
      labelOf(expense.unit),
      typeLabel(expense, typeOptions),
    ].some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(term)
    )
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const activePage = Math.min(page, totalPages);
  const start = (activePage - 1) * pageSize;
  const currentExpenses = filtered.slice(start, start + pageSize);

  const loading = Boolean(code.trim()) && query.isLoading;

  const shownColumns = columns.filter((name) => visibleColumns.includes(name));

  const cellValue = (expense: ApiExpense, column: string): string => {
    switch (column) {
      case "Expense":
        return expense.expenseNumber || `#EXP-${expense.id}`;
      case "Title":
        return expense.title;
      case "Property":
        return labelOf(expense.property) || "—";
      case "Unit":
        return labelOf(expense.unit) || "—";
      case "Type":
        return typeLabel(expense, typeOptions) || "—";
      case "Date":
        return displayDate(expense.date);
      case "Amount":
        return currency(expense.amount);
      case "Receipt":
        return receiptOf(expense) ? "Attached" : "—";
      default:
        return "";
    }
  };

  const exportXlsx = () => {
    const rows = filtered.map((expense) => {
      const row: Record<string, string | number> = {};

      for (const column of shownColumns) {
        row[column] =
          column === "Amount"
            ? Number.isFinite(Number(expense.amount))
              ? Number(expense.amount)
              : ""
            : cellValue(expense, column);
      }

      return row;
    });

    const sheet = XLSX.utils.json_to_sheet(rows, { header: shownColumns });

    sheet["!cols"] = shownColumns.map((column) => ({
      wch:
        Math.max(
          column.length,
          ...rows.map((row) => {
            const value = row[column];

            if (column === "Amount" && typeof value === "number") {
              return `₦${value.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`.length;
            }

            return String(value ?? "").length;
          })
        ) + 4,
    }));

    const amountCol = shownColumns.indexOf("Amount");

    if (amountCol !== -1) {
      rows.forEach((_, i) => {
        const cell = sheet[XLSX.utils.encode_cell({ r: i + 1, c: amountCol })];
        if (cell) cell.z = '"₦"#,##0.00';
      });
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Expenses");
    XLSX.writeFile(workbook, "expenses.xlsx");
  };

  const exportPdf = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to export the PDF.");
      return;
    }

    const escapeHtml = (value: string) =>
      value.replace(/[&<>"']/g, (char) => {
        const entities: Record<string, string> = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };

        return entities[char];
      });

    const tableHeaders = shownColumns
      .map((column) => `<th>${escapeHtml(column)}</th>`)
      .join("");

    const tableRows = filtered
      .map((expense) => {
        const cells = shownColumns
          .map(
            (column) =>
              `<td>${escapeHtml(cellValue(expense, column))}</td>`
          )
          .join("");

        return `<tr>${cells}</tr>`;
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Expenses Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #393939;
            }

            h1 {
              font-size: 22px;
              margin-bottom: 8px;
            }

            p {
              color: #727272;
              font-size: 12px;
              margin-bottom: 24px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }

            th, td {
              border: 1px solid #e3e3e3;
              padding: 10px;
              text-align: left;
            }

            th {
              background: #f5f5f5;
              font-weight: bold;
            }

            tr {
              page-break-inside: avoid;
            }

            @media print {
              body {
                padding: 0;
              }

              @page {
                size: landscape;
                margin: 15mm;
              }
            }
          </style>
        </head>
        <body>
          <h1>Expenses Report</h1>
          <p>
            Generated: ${new Date().toLocaleString()} |
            Total records: ${filtered.length}
          </p>

          <table>
            <thead>
              <tr>${tableHeaders}</tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  const copyData = async () => {
    const headers = shownColumns.join("\t");

    const rows = filtered.map((expense) =>
      shownColumns
        .map((column) => cellValue(expense, column))
        .join("\t")
    );

    const textToCopy = [headers, ...rows].join("\n");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement("textarea");

        textarea.value = textToCopy;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.select();

        const copied = document.execCommand("copy");
        textarea.remove();

        if (!copied) {
          throw new Error("Copy failed");
        }
      }

      alert("Expenses copied successfully!");
    } catch (error) {
      console.error("Copy error:", error);
      alert("Unable to copy expenses. Please try again.");
    }
  };

  return (
    <main className="space-y-9" style={{ fontFamily: "Poppins" }}>
      <nav aria-label="Breadcrumb" className="flex items-center gap-3 text-xs">
        <span className="text-[#5f5f5f]">Finance</span>
        <ChevronDown className="h-4 w-4 -rotate-90 text-[#5f5f5f]" />
        <span className="text-[#f30100]">Expenses</span>
      </nav>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-medium leading-7 text-[#393939]">
          Expense List
        </h1>

        <Button
          type="button"
          disabled={!code.trim()}
          onClick={() => setModal({ mode: "create" })}
          leftIcon={<Plus className="h-[18px] w-[18px]" />}
          className="h-11 bg-[#f30100] px-4 text-sm font-medium text-white hover:bg-[#d90100]"
        >
          Create Expense
        </Button>
      </div>

      {loadError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
        >
          {loadError}
        </p>
      )}

      {typesQuery.isError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          Unable to load expense types. The issue type list is currently unavailable.
        </p>
      )}

      <section className="overflow-hidden rounded-[10px] border border-[#eaeaea] bg-white pt-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="mb-6 flex flex-wrap items-center gap-3 px-6">
          <div className="relative w-full max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a1a1]" />

            <input
              aria-label="Search expenses"
              placeholder="Search by name..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-[#e3e3e3] bg-white pl-9 pr-3 text-sm text-[#5f5f5f] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f30100]/20"
              style={{ fontFamily: "Poppins" }}
            />
          </div>

          <div className="relative expense-column-menu-container">
            <button
              type="button"
              onClick={() => setShowColumns((value) => !value)}
              className="flex h-10 items-center gap-2 rounded-lg border border-[#e3e3e3] bg-white px-3 text-sm text-[#5f5f5f] transition-colors hover:bg-[#fafafa]"
              style={{ fontFamily: "Poppins" }}
            >
              Column Visibility
              <ChevronDown className="h-4 w-4" />
            </button>

            {showColumns && (
              <div
                className="absolute left-0 top-full z-30 mt-1 w-48 rounded-lg border border-[#e3e3e3] bg-white p-2 shadow-lg"
                style={{ fontFamily: "Poppins" }}
              >
                {columns.map((column) => (
                  <label
                    key={column}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-[#5f5f5f] hover:bg-[#fafafa]"
                  >
                    <input
                      type="checkbox"
                      aria-label={`Show ${column} column`}
                      checked={visibleColumns.includes(column)}
                      onChange={(event) => {
                        const checked = event.target.checked;

                        setVisibleColumns((previous) =>
                          checked
                            ? [...previous, column]
                            : previous.filter((item) => item !== column)
                        );
                      }}
                      className="rounded border-gray-300"
                      style={{ accentColor: "#f30100" }}
                    />
                    {column}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu((value) => !value)}
              disabled={!code.trim() || filtered.length === 0}
              className="flex h-10 items-center gap-2 rounded-lg border border-[#e3e3e3] bg-white px-3 text-sm text-[#5f5f5f] transition-colors hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ fontFamily: "Poppins" }}
            >
              Export
              <ChevronDown className="h-4 w-4" />
            </button>

            {showExportMenu && (
              <div
                className="absolute left-0 top-full z-30 mt-1 w-32 rounded-lg border border-[#e3e3e3] bg-white p-1 shadow-lg"
                style={{ fontFamily: "Poppins" }}
              >
                <button
                  type="button"
                  onClick={() => {
                    exportXlsx();
                    setShowExportMenu(false);
                  }}
                  className="w-full rounded px-3 py-2 text-left text-sm text-[#5f5f5f] hover:bg-[#fafafa]"
                >
                  Excel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    exportPdf();
                    setShowExportMenu(false);
                  }}
                  className="w-full rounded px-3 py-2 text-left text-sm text-[#5f5f5f] hover:bg-[#fafafa]"
                >
                  PDF
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await copyData();
                    setShowExportMenu(false);
                  }}
                  className="w-full rounded px-3 py-2 text-left text-sm text-[#5f5f5f] hover:bg-[#fafafa]"
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <p className="px-6 py-4 text-sm text-[#5f5f5f]">
            Loading expenses...
          </p>
        )}

        <div className="overflow-x-auto border-y border-[#eaeaea]">
          <table className="min-w-[1050px] w-full table-fixed text-left text-sm">
            <thead>
              <tr className="border-b border-[#eaeaea]">
                {shownColumns.map((column) => (
                  <th
                    key={column}
                    className="h-11 px-6 text-left text-sm font-semibold text-[#4c4c4c]"
                  >
                    {column}
                  </th>
                ))}

                <th className="h-11 px-6 text-left text-sm font-semibold text-[#4c4c4c]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                currentExpenses.map((expense) => {
                  const receipt = receiptLink(receiptOf(expense));

                  return (
                    <tr
                      key={expense.id}
                      className="h-16 border-b border-[#eaeaea] last:border-b-0"
                    >
                      {shownColumns.map((column) => (
                        <td
                          key={column}
                          className="truncate px-6 text-sm font-medium text-[#5f5f5f]"
                        >
                          {column === "Receipt" && receipt ? (
                            <a
                              href={receipt}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#f30100] hover:underline"
                            >
                              Attached
                            </a>
                          ) : (
                            cellValue(expense, column)
                          )}
                        </td>
                      ))}

                      <td className="px-6">
                        <ExpenseActions
                          id={expense.id}
                          onView={() => setModal({ mode: "view", expense })}
                          onEdit={() => setModal({ mode: "edit", expense })}
                        />
                      </td>
                    </tr>
                  );
                })}

              {!loading && !loadError && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={shownColumns.length + 1}
                    className="h-16 px-6 text-center text-sm text-[#5f5f5f]"
                  >
                    {search ? "No matching expenses." : "No expenses found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm">
            Show
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className={buttonClass}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            entries per page
          </label>

          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              disabled={activePage === 1}
              onClick={() => setPage(activePage - 1)}
              className={buttonClass}
            >
              Previous
            </button>

            <span>
              Page {activePage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={activePage === totalPages}
              onClick={() => setPage(activePage + 1)}
              className={buttonClass}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {totalPages > 1 && response?.meta && (
        <p className="text-sm text-muted-foreground">
          Showing {expenses.length} loaded records out of{" "}
          {response.meta.totalItems} total.
        </p>
      )}

      {modal && (
        <ExpenseModal
          mode={modal.mode}
          expense={modal.expense}
          expenses={expenses}
          onClose={() => setModal(null)}
        />
      )}
    </main>
  );
}