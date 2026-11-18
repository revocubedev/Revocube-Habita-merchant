import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Modal from "@/components/ui/Modal";
import {
  useUpdateStaffCodeStatus,
  type StaffCodeStatus,
} from "@/api/api_controllers/staffController";

const STATUS_OPTIONS: { value: StaffCodeStatus; label: string }[] = [
  { value: "CHECKED_IN", label: "Check in" },
  { value: "CHECKED_OUT", label: "Check out" },
];

const prettyStatus = (status?: string | null) =>
  status
    ? status
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "—";

interface UpdateStaffStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: { staffCode: string; fullName?: string; status?: string | null };
}

const UpdateStaffStatusModal = ({
  isOpen,
  onClose,
  staff,
}: UpdateStaffStatusModalProps) => {
  // Default to the action that makes sense: checked in -> check out, otherwise check in
  const [status, setStatus] = useState<StaffCodeStatus>(
    staff.status === "CHECKED_IN" ? "CHECKED_OUT" : "CHECKED_IN"
  );
  const { updateStatus, isLoading } = useUpdateStaffCodeStatus(staff.staffCode);

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStatus(status);
      onClose();
    } catch {
      // useApiManager already toasted the error; keep the modal open
    }
  };

  const canSubmit = !isLoading && status !== staff.status;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Staff Status"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p
          className="text-sm"
          style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
        >
          Change the status for{" "}
          <span className="font-medium" style={{ color: "#393939" }}>
            {staff.fullName || "this staff member"}
          </span>{" "}
          (code {staff.staffCode}). Current status:{" "}
          <span className="font-medium" style={{ color: "#393939" }}>
            {prettyStatus(staff.status)}
          </span>
          .
        </p>

        <div>
          <label
            htmlFor="staff-status"
            className="block text-sm font-medium mb-2"
            style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
          >
            Status
          </label>
          <div className="relative">
            <select
              id="staff-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as StaffCodeStatus)}
              className="w-full px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 appearance-none"
              style={{
                fontFamily: "Poppins",
                borderColor: "#e3e3e3",
                height: "48px",
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
            {isLoading ? "Updating..." : "Update Status"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateStaffStatusModal;
