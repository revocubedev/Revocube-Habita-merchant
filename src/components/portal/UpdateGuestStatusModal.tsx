import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useUpdateGuestStatus } from "@/api/api_controllers/guests";
import { GUEST_STATUSES, prettyStatus } from "@/lib/guestUtils";

interface UpdateGuestStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: { code: string; visitor: string; status: string };
}

const UpdateGuestStatusModal = ({
  isOpen,
  onClose,
  guest,
}: UpdateGuestStatusModalProps) => {
  const [status, setStatus] = useState(guest.status);
  const { updateGuestStatus, isLoading } = useUpdateGuestStatus(guest.code);

  // Keep the guest's current status selectable even if it isn't in the list
  const options =
    GUEST_STATUSES.includes(guest.status) || !guest.status
      ? GUEST_STATUSES
      : [guest.status, ...GUEST_STATUSES];

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateGuestStatus(status);
      onClose();
    } catch {
      // useApiManager already toasted the error; keep the modal open
    }
  };

  const canSubmit = status !== "" && status !== guest.status && !isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Guest Status"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p
          className="text-sm"
          style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
        >
          Change the status for{" "}
          <span className="font-medium" style={{ color: "#393939" }}>
            "{guest.visitor}"
          </span>
          .
        </p>

        <div>
          <label
            htmlFor="guest-status"
            className="block text-sm font-medium mb-2"
            style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
          >
            Status
          </label>
          <div className="relative">
            <select
              id="guest-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 appearance-none"
              style={{
                fontFamily: "Poppins",
                borderColor: "#e3e3e3",
                height: "48px",
              }}
            >
              {options.map((s) => (
                <option key={s} value={s}>
                  {prettyStatus(s)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm border transition-colors hover:bg-muted disabled:opacity-60"
            style={{
              fontFamily: "Poppins",
              borderRadius: "8px",
              borderColor: "#e3e3e3",
              color: "#4c4c4c",
              backgroundColor: "transparent",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-4 py-2 text-sm text-white transition-colors disabled:opacity-60"
            style={{
              fontFamily: "Poppins",
              borderRadius: "8px",
              backgroundColor: "#f30100",
              border: "none",
            }}
          >
            {isLoading ? "Saving..." : "Update Status"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateGuestStatusModal;
