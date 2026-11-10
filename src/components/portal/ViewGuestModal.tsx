import Modal from "@/components/ui/Modal";
import { useGetGuest, extractGuest } from "@/api/api_controllers/guests";
import {
  combine,
  formatDate,
  prettyStatus,
  getStatusBadgeStyle,
} from "@/lib/guestUtils";

interface ViewGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestId: string;
}

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <div
      className="text-xs text-muted-foreground mb-1"
      style={{ fontFamily: "Poppins" }}
    >
      {label}
    </div>
    <div
      className="text-sm font-medium text-foreground"
      style={{ fontFamily: "Poppins" }}
    >
      {value || "—"}
    </div>
  </div>
);

const ViewGuestModal = ({ isOpen, onClose, guestId }: ViewGuestModalProps) => {
  const { data, isLoading, isError, error } = useGetGuest(guestId, isOpen);
  const guest = extractGuest(data);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Guest Details" size="md">
      {isLoading && (
        <p
          className="text-sm text-muted-foreground"
          style={{ fontFamily: "Poppins" }}
        >
          Loading guest...
        </p>
      )}

      {isError && (
        <p
          className="text-sm"
          style={{ fontFamily: "Poppins", color: "#f30100" }}
        >
          {(error as Error)?.message || "Failed to load guest"}
        </p>
      )}

      {!isLoading && !isError && guest && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div
              className="text-base font-medium"
              style={{ fontFamily: "Poppins", color: "#393939" }}
            >
              {guest.fullName ?? "—"}
            </div>
            {guest.status && (
              <span
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  fontFamily: "Poppins",
                  ...getStatusBadgeStyle(guest.status),
                }}
              >
                {prettyStatus(guest.status)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Guest Code" value={guest.guestCode} />
            <Field label="Phone Number" value={guest.phoneNumber} />
            <Field
              label="Check In"
              value={formatDate(combine(guest.checkInDate, guest.checkInTime))}
            />
            <Field
              label="Check Out"
              value={formatDate(
                combine(guest.checkOutDate, guest.checkOutTime)
              )}
            />
            <Field label="Created" value={formatDate(guest.createdAt)} />
          </div>
        </div>
      )}

      <div className="flex justify-end pt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm border transition-colors hover:bg-muted"
          style={{
            fontFamily: "Poppins",
            borderRadius: "8px",
            borderColor: "#e3e3e3",
            color: "#4c4c4c",
            backgroundColor: "transparent",
          }}
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ViewGuestModal;
