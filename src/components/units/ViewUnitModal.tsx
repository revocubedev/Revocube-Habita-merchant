import Modal, { Field, inputCls } from "@/components/ui/Modal";
import type { Unit } from "@/api/api_controllers/unitController";

interface ViewUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit?: Unit | null;
}

const formatCurrency = (value: number | string | undefined) => {
  const amount = Number(value ?? 0);

  return Number.isFinite(amount)
    ? `₦${amount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "—";
};

const formatLabel = (value?: string) => {
  if (!value) return "—";

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const ViewUnitModal = ({ isOpen, onClose, unit }: ViewUnitModalProps) => {
  if (!unit) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Unit Details"
      variant="drawer"
      bodyClassName="px-6 pt-5"
    >
      <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
        <Field label="Property">
          <input
            className={inputCls}
            value={unit.property?.name ?? unit.propertyId ?? "—"}
            readOnly
          />
        </Field>

        <Field label="Unit Name">
          <input className={inputCls} value={unit.name ?? "—"} readOnly />
        </Field>

        <div className="sm:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Unit Features
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Bedrooms">
              <input className={inputCls} value={unit.bedrooms ?? 0} readOnly />
            </Field>

            <Field label="Kitchens">
              <input className={inputCls} value={unit.kitchens ?? 0} readOnly />
            </Field>

            <Field label="Bathrooms">
              <input
                className={inputCls}
                value={unit.bathrooms ?? 0}
                readOnly
              />
            </Field>
          </div>
        </div>

        <div className="sm:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Rent Information
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Rent Type">
              <input
                className={inputCls}
                value={formatLabel(unit.rentType)}
                readOnly
              />
            </Field>

            <Field label="Rent Amount">
              <input
                className={inputCls}
                value={formatCurrency(unit.rentAmount)}
                readOnly
              />
            </Field>

            <Field label="Rent Duration">
              <input
                className={inputCls}
                value={unit.rentDuration ?? 0}
                readOnly
              />
            </Field>
          </div>
        </div>

        <div className="sm:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Deposit Information
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Deposit Type">
              <input
                className={inputCls}
                value={formatLabel(unit.depositType)}
                readOnly
              />
            </Field>

            <Field label="Deposit Amount">
              <input
                className={inputCls}
                value={formatCurrency(unit.depositAmount)}
                readOnly
              />
            </Field>
          </div>
        </div>

        <div className="sm:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Late Fee Information
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Late Fee Type">
              <input
                className={inputCls}
                value={formatLabel(unit.lateFeeType)}
                readOnly
              />
            </Field>

            <Field label="Late Fee Amount">
              <input
                className={inputCls}
                value={formatCurrency(unit.lateFeeAmount)}
                readOnly
              />
            </Field>
          </div>
        </div>

        <div className="sm:col-span-2">
          <Field label="Incident Receipt Amount">
            <input
              className={inputCls}
              value={formatCurrency(unit.incidentReceiptAmount)}
              readOnly
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Notes">
            <textarea
              className={`${inputCls} min-h-[120px] resize-none`}
              value={unit.notes ?? "No notes provided"}
              readOnly
            />
          </Field>
        </div>

        <div className="sm:col-span-2 sticky bottom-0 flex justify-end border-t border-border bg-card py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewUnitModal;