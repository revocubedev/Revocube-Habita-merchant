import Modal from "@/components/ui/Modal";
import { useDeactivateStaffCode } from "@/api/api_controllers/staffController";

interface DeactivateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: { staffCode: string; fullName?: string };
}

const DeactivateStaffModal = ({
  isOpen,
  onClose,
  staff,
}: DeactivateStaffModalProps) => {
  const { deactivateStaffCode, isLoading } = useDeactivateStaffCode(
    staff.staffCode
  );

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  const handleDeactivate = async () => {
    try {
      await deactivateStaffCode();
      onClose();
    } catch {
      // useApiManager already toasted the error; keep the modal open
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Deactivate Access Code"
      size="sm"
    >
      <p
        className="text-sm mb-6"
        style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
      >
        Are you sure you want to deactivate the access code{" "}
        <span className="font-medium" style={{ color: "#393939" }}>
          {staff.staffCode}
        </span>
        {staff.fullName ? (
          <>
            {" "}
            for{" "}
            <span className="font-medium" style={{ color: "#393939" }}>
              "{staff.fullName}"
            </span>
          </>
        ) : null}
        ? It will stop working immediately.
      </p>

      <div className="flex justify-end gap-3">
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
          type="button"
          onClick={handleDeactivate}
          disabled={isLoading}
          className="px-4 py-2 text-sm text-white transition-colors disabled:opacity-60"
          style={{
            fontFamily: "Poppins",
            borderRadius: "8px",
            backgroundColor: "#f30100",
            border: "none",
          }}
        >
          {isLoading ? "Deactivating..." : "Deactivate"}
        </button>
      </div>
    </Modal>
  );
};

export default DeactivateStaffModal;