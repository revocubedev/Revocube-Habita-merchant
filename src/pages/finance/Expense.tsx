import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal, { Field } from "@/components/ui/Modal";
import RowActionsMenu, { RowAction } from "@/components/ui/RowActionsMenu";
import type { FormEvent } from "react";
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
  amount: number;
  date: string;
  notes: string;
  receipt: File | null;
  property: string;
  unit: string;
};

const emptyForm = (): ExpenseForm => ({
  title: "",
  issueType: "",
  amount: 0,
  date: "",
  notes: "",
  receipt: null,
  property: "",
  unit: "",
});

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

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

function currency(value: number | string): string {
  const amount = Number(value);

  return Number.isFinite(amount)
    ? `₦${amount.toLocaleString()}`
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

/*
 * Each row owns its delete hook so the ID is available
 * before the user clicks Delete.
 */
function ExpenseActions({ id, onView, onEdit }: { id: string; onView: () => void; onEdit: () => void }) {
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
      // The controller invalidates get_expenses automatically.
    } catch (err) {
      setError(errorText(err));
    }
  };

  return (
    <span ref={triggerRef}>
      <RowActionsMenu
        label={`Actions for expense ${id}`}
        panelWidth={186}
        triggerIcon={<img src="/assets/ellipsis.svg" alt="" width={24} height={24} />}
        panelClassName="flex flex-col gap-2 rounded-[5px] bg-white px-3 py-[15px] shadow-[0_10px_20px_rgba(0,0,0,0.05)]"
        panelStyle={{ borderRadius: 5, borderColor: "#eaecf0" }}
      >
        {(close) => <>
          <RowAction disabled={isLoading} className="h-9 whitespace-nowrap rounded-[5px] px-4 text-[#5f5f5f]" onClick={() => { close(); onView(); }}>
            <img src="/assets/view.svg" alt="" width={14} height={14} />View
          </RowAction>
          <RowAction disabled={isLoading} className="h-9 whitespace-nowrap rounded-[5px] px-4 text-[#5f5f5f]" onClick={() => { close(); onEdit(); }}>
            <img src="/assets/edit.svg" alt="" width={14} height={14} />Edit
          </RowAction>
          <RowAction disabled={isLoading} className="h-9 whitespace-nowrap rounded-[5px] bg-[#ffedee] px-4 text-[#ff383c] hover:bg-[#ffdde0]" onClick={() => { close(); setError(""); setIsOpen(true); }}>
            <img src="/assets/delete.svg" alt="" width={14} height={14} />Delete
          </RowAction>
        </>}
      </RowActionsMenu>

      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-4"
          style={{ fontFamily: "Poppins, sans-serif" }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isLoading) setIsOpen(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !isLoading) setIsOpen(false);
            if (event.key === "Tab") {
              event.preventDefault();
              const next = document.activeElement === cancelRef.current
                ? deleteRef.current : cancelRef.current;
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
              <img src="/assets/expense-delete-warning.svg" alt="" width={38} height={38} />
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
              This record can not be restored after delete. Do you want to confirm?
            </p>
            {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
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
        document.body,
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
        issueType: expense.issueType ?? expense.type ?? "",
        amount: Number(expense.amount),
        date: inputDate(expense.date),
        notes: expense.notes ?? "",
        receipt: null,
        property: expense.property ?? "",
        unit: expense.unit ?? "",
      }
      : emptyForm(),
  );

  const [error, setError] = useState("");

  const create = useCreateExpense();
  const update = useUpdateExpense(expense?.id);

  const busy = create.isLoading || update.isLoading;

  function change<K extends keyof ExpenseForm>(
    key: K,
    value: ExpenseForm[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (readOnly || busy) return;

    setError("");

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    const payload: ExpenseInput = {
      title: form.title.trim(),
      issueType: form.issueType.trim().toUpperCase(),
      amount,
      date: form.date,
      // Preserve empty strings so users can clear existing notes.
      notes: form.notes,
      receipt: form.receipt ?? undefined,
      ...(mode === "edit" ? { property: form.property, unit: form.unit } : {}),
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

  const receipt = receiptLink(expense?.receipt);

  if (mode === "edit") {
    const controlClass = "h-12 border-[#eaeaea] bg-white px-5 text-base leading-[1.4] text-[#4c4c4c] placeholder:text-[#a1a1a1]";
    const properties = [...new Set([form.property, ...expenses.map((item) => item.property)].filter((value): value is string => Boolean(value)))];
    const units = [...new Set([form.unit, ...expenses.filter((item) => item.property === form.property).map((item) => item.unit)].filter((value): value is string => Boolean(value)))];
    const expenseNumber = expense?.expenseNumber || `#EXP-${expense?.id ?? ""}`;
    const numberParts = expenseNumber.match(/^(#EXP-0*)(.+)$/);
    const selectArrow = <img src="/assets/expense-edit-chevron.svg" alt="" width={18} height={18} className="pointer-events-none absolute right-5 top-[15px]" />;

    return (
      <Modal
        isOpen
        onClose={() => { if (!busy) onClose(); }}
        title="Edit Expense"
        presentation="drawer"
        closeIcon={<img src="/assets/expense-edit-close.svg" alt="" width={14} height={14} />}
        bodyClassName="relative px-5 pb-8 pt-[35px] sm:px-8"
      >
        <div className="pointer-events-none absolute right-0 top-[259px] h-[50.301px] w-[16.04px] overflow-hidden">
          <img src="/assets/expense-edit-edge.svg" alt="" width={32} height={32} />
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p role="alert" className="mb-5 text-sm text-red-600">{error}</p>}
          <fieldset disabled={busy} className="space-y-5 [&_label>span]:mb-2 [&_label>span]:leading-5 [&_label>span]:text-[#4c4c4c]">
            <Field label="Expense Title">
              <Input autoFocus required value={form.title} onChange={(event) => change("title", event.target.value)} className={controlClass} placeholder="Expense title" />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Expense Number">
                <div className="flex h-12 overflow-hidden rounded-lg border border-[#eaeaea] text-base">
                  <span className="flex shrink-0 items-center bg-[#eaeaea] px-4 text-[#727272]">{numberParts?.[1] ?? "#EXP-"}</span>
                  <input aria-label="Expense Number" readOnly value={numberParts?.[2] ?? expenseNumber.replace(/^#EXP-/, "")} className="min-w-0 w-full bg-white px-6 text-[#898989] outline-none" />
                </div>
              </Field>
              <Field label="Issue Type">
                <div className="relative">
                  <select required value={form.issueType} onChange={(event) => change("issueType", event.target.value)} className={`w-full appearance-none rounded-lg border pr-12 ${controlClass}`}>
                    <option value="" disabled>Select type</option>
                    {form.issueType && !["security", "diesel", "power", "water", "cleaning", "repair", "others"].includes(form.issueType) && <option value={form.issueType}>{form.issueType}</option>}
                    <option value="security">Security</option><option value="diesel">Diesel</option><option value="power">Power</option><option value="water">Water</option><option value="cleaning">Cleaning</option><option value="repair">Repair</option><option value="others">Others</option>
                  </select>
                  {selectArrow}
                </div>
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Property">
                <div className="relative">
                  <select value={form.property} onChange={(event) => { change("property", event.target.value); change("unit", ""); }} className={`w-full appearance-none rounded-lg border pr-12 ${controlClass}`}>
                    <option value="">Select property</option>
                    {properties.map((property) => <option key={property} value={property}>{property}</option>)}
                  </select>
                  {selectArrow}
                </div>
              </Field>
              <Field label="Unit">
                <div className="relative">
                  <select value={form.unit} onChange={(event) => change("unit", event.target.value)} className={`w-full appearance-none rounded-lg border pr-12 ${controlClass}`}>
                    <option value=""></option>
                    {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                  {selectArrow}
                </div>
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Date">
                <div className="relative">
                  <Input required type="date" value={form.date} onChange={(event) => change("date", event.target.value)} className={`${controlClass} pr-12 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-5 [&::-webkit-calendar-picker-indicator]:z-10 [&::-webkit-calendar-picker-indicator]:opacity-0`} />
                  {selectArrow}
                </div>
              </Field>
              <Field label="Amount">
                <Input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => change("amount", Number(event.target.value))} className={controlClass} />
              </Field>
            </div>
            <Field label="Receipt">
              <input aria-label="Receipt" type="file" onChange={(event) => change("receipt", event.target.files?.[0] ?? null)} className="block h-12 w-full overflow-hidden rounded-lg border border-[#eaeaea] bg-white text-base leading-[46px] text-[#4c4c4c] file:mr-6 file:h-[46px] file:w-[124px] file:border-0 file:bg-[#eaeaea] file:px-4 file:text-base file:text-[#727272]" />
              {receipt && <a href={receipt} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs text-brand-text underline">Open current receipt</a>}
            </Field>
            <Field label="Note">
              <div className="relative">
                <textarea value={form.notes} onChange={(event) => change("notes", event.target.value)} className={`block h-[126px] w-full resize-none rounded-lg border py-3 pr-12 ${controlClass.replace("h-12 ", "")}`} />
                <img src="/assets/expense-edit-note.svg" alt="" width={18} height={18} className="pointer-events-none absolute right-5 top-3" />
              </div>
            </Field>
          </fieldset>
          <div className="mt-12 flex justify-end sm:mt-[179px]">
            <Button type="submit" disabled={busy} className="h-11 min-w-[101px] bg-brand-text px-6 font-semibold text-white hover:bg-brand-text/90">{busy ? "Updating..." : "Update"}</Button>
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
            {mode === "create"
              ? "Create Expense"
              : "View Expense"}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={readOnly || busy} className="space-y-4">
            <label className="block space-y-1">
              <span>Title</span>
              <input
                required
                value={form.title}
                onChange={(e) => change("title", e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block space-y-1">
              <span>Issue Type</span>

              <select
                required
                value={form.issueType}
                onChange={(e) => change("issueType", e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  Select an issue type
                </option>

                <option value="security">SECURITY</option>
                <option value="diesel">DIESEL</option>
                <option value="power">POWER</option>
                <option value="water">WATER</option>
                <option value="cleaning">CLEANING</option>
                <option value="repair">REPAIRr</option>
                <option value="others">OTHERS</option>

                {/* Add other issue types supported by your backend here. */}
              </select>
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span>Amount</span>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => change("amount", Number(e.target.value))}
                  className={inputClass}
                />
              </label>

              <label className="block space-y-1">
                <span>Date</span>
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(e) => change("date", e.target.value)}
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
                onChange={(e) => change("notes", e.target.value)}
                className={inputClass}
              />
            </label>

            {!readOnly && (
              <label className="block space-y-1">
                <span>Receipt</span>
                <input
                  type="file"
                  onChange={(e) =>
                    change("receipt", e.target.files?.[0] ?? null)
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
                disabled={busy}
                className="rounded-lg bg-[#f30100] px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {busy
                  ? "Saving..."
                  : "Save Expense"}
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

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showColumns, setShowColumns] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns);
  const [modal, setModal] = useState<{
    mode: Mode;
    expense?: ApiExpense;
  } | null>(null);

  const response = query.data;

  const loadError = !code.trim()
    ? "Estate code is missing. Select or sign in to your estate first."
    : query.error
      ? errorText(query.error)
      : "";

  const expenses =
    !loadError ? response?.data ?? [] : [];

  const term = search.trim().toLowerCase();

  const filtered = expenses.filter((expense) =>
    [
      expense.expenseNumber,
      expense.title,
      expense.property,
      expense.unit,
      expense.issueType,
      expense.type,
    ].some((value) => String(value ?? "").toLowerCase().includes(term)),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const activePage = Math.min(page, totalPages);
  const start = (activePage - 1) * pageSize;
  const currentExpenses = filtered.slice(start, start + pageSize);

  const loading = Boolean(code.trim()) && query.isLoading;
  const shownColumns = columns.filter((name) =>
    visibleColumns.includes(name),
  );

  const cellValue = (expense: ApiExpense, column: string): string => {
    switch (column) {
      case "Expense":
        return expense.expenseNumber || `#EXP-${expense.id}`;
      case "Title":
        return expense.title;
      case "Property":
        return expense.property || "—";
      case "Unit":
        return expense.unit || "—";
      case "Type":
        return expense.issueType || expense.type || "—";
      case "Date":
        return displayDate(expense.date);
      case "Amount":
        return currency(expense.amount);
      case "Receipt":
        return expense.receipt ? "Attached" : "—";
      default:
        return "";
    }
  };

  const exportCsv = () => {
    const escapeCell = (value: string) => {
      // Prevent spreadsheet formulas from executing in exported text.
      const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
      return `"${safe.replace(/"/g, '""')}"`;
    };

    const lines = [
      shownColumns.map(escapeCell).join(","),
      ...filtered.map((expense) =>
        shownColumns
          .map((column) => escapeCell(cellValue(expense, column)))
          .join(","),
      ),
    ];

    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "expenses.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <main className="space-y-4" style={{ fontFamily: "Poppins" }}>
      <p className="text-sm text-muted-foreground">
        Finance / <span className="text-[#f30100]">Expenses</span>
      </p>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-medium">Expense List</h1>
        <button
          type="button"
          disabled={!code.trim()}
          onClick={() => setModal({ mode: "create" })}
          className="rounded-lg bg-[#f30100] px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          + Create Expense
        </button>
      </div>

      {loadError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {loadError}
        </p>
      )}

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            aria-label="Search expenses"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={`${inputClass} max-w-sm`}
          />

          <button
            type="button"
            onClick={() => setShowColumns((value) => !value)}
            className={buttonClass}
          >
            Column Visibility
          </button>

          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className={buttonClass}
          >
            Export CSV
          </button>

          <button
            type="button"
            disabled={!code.trim() || query.isFetching}
            onClick={() => void query.refetch()}
            className={buttonClass}
          >
            {query.isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {showColumns && (
          <div className="mb-4 flex flex-wrap gap-4 rounded-lg border p-3">
            {columns.map((column) => (
              <label key={column} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(column)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setVisibleColumns((previous) =>
                      checked
                        ? [...previous, column]
                        : previous.filter((item) => item !== column),
                    );
                  }}
                />
                {column}
              </label>
            ))}
          </div>
        )}

        {loading && <p className="py-4 text-sm">Loading expenses...</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                {shownColumns.map((column) => (
                  <th key={column} className="p-3 font-medium">
                    {column}
                  </th>
                ))}
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                currentExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b">
                    {shownColumns.map((column) => {
                      const receipt = receiptLink(expense.receipt);

                      return (
                        <td key={column} className="p-3">
                          {column === "Receipt" && receipt ? (
                            <a
                              href={receipt}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#f30100] underline"
                            >
                              Open receipt
                            </a>
                          ) : (
                            cellValue(expense, column)
                          )}
                        </td>
                      );
                    })}

                    <td className="p-3">
                      <ExpenseActions
                        id={expense.id}
                        onView={() => setModal({ mode: "view", expense })}
                        onEdit={() => setModal({ mode: "edit", expense })}
                      />
                    </td>
                  </tr>
                ))}

              {!loading && !loadError && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={shownColumns.length + 1}
                    className="p-6 text-center text-muted-foreground"
                  >
                    {search ? "No matching expenses." : "No expenses found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          Show
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
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

      {response?.meta && (
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
