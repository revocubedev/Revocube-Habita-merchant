import { useGetMemberById } from "@/api/api_controllers/members";
import Modal, { Field, inputCls } from "@/components/ui/Modal";
import type { Member } from "@/api/api_controllers/members";

interface ViewMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string | null;
}

const relationList = (value: Member['properties']) =>
  (value == null ? [] : Array.isArray(value) ? value : [value]).map((relation, index) => {
    const record: Record<string, unknown> =
      typeof relation === 'string' ? { name: relation } : { ...relation };
    const text = (key: string) => {
      const value = record[key];
      return typeof value === 'string' ? value : '';
    };
    return {
      id: text('id') || String(index),
      name: text('name'),
      address: text('address'),
      city: text('city'),
      state: text('state'),
      propertyName: text('propertyName'),
    };
  });

const ViewMemberModal = ({
  isOpen,
  onClose,
  memberId,
}: ViewMemberModalProps) => {
  const {
    data: response,
    isLoading,
    isError,
  } = useGetMemberById(memberId ?? "", isOpen && !!memberId);

  // Depending on your API manager's response handling,
  // the member may be in response.data or response directly.
  const member: Member | undefined =
    response?.data ?? (response as unknown as Member | undefined);

  const properties = relationList(member?.properties);
  const units = relationList(member?.units);

  const inputClass = `${inputCls} bg-muted/30`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Member Details"
      variant="drawer"
      bodyClassName="px-6 pt-5"
    >
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading member details...
        </div>
      ) : isError || !member ? (
        <div className="py-12 text-center text-sm text-red-500">
          Unable to load member details.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Personal Information */}
          <section>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Personal Information
            </h3>

            <div className="space-y-4">
              <Field label="Full Name">
                <input
                  className={inputClass}
                  value={member.name ?? "—"}
                  readOnly
                />
              </Field>

              <Field label="Phone Number">
                <input
                  className={inputClass}
                  value={member.phoneNumber ?? "—"}
                  readOnly
                />
              </Field>

              <Field label="Street Address">
                <textarea
                  className={`${inputClass} min-h-[90px] resize-none`}
                  value={member.streetAddress?.trim() || "—"}
                  readOnly
                />
              </Field>
            </div>
          </section>

          {/* Properties */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Properties
              </h3>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                {properties.length}
              </span>
            </div>

            {properties.length ? (
              <div className="space-y-3">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="rounded-lg border border-border p-4"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {property.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {property.address || "Address not provided"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[property.city, property.state]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
                No properties assigned to this member.
              </p>
            )}
          </section>

          {/* Units */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Assigned Units
              </h3>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                {units.length}
              </span>
            </div>

            {units.length ? (
              <div className="space-y-3">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className="rounded-lg border border-border p-4"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {unit.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Property: {unit.propertyName || "—"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
                No units assigned to this member.
              </p>
            )}
          </section>

          <div className="sticky bottom-0 flex justify-end border-t border-border bg-card py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border text-white bg-red-500 border-border px-6 py-2.5 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ViewMemberModal;
