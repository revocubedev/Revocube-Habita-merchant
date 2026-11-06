import Modal from "@/components/ui/Modal";
import { useSuspendUser } from "@/api/api_controllers/userController";

interface SuspendUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; name: string };
}

const SuspendUserModal = ({ isOpen, onClose, user }: SuspendUserModalProps) => {
  const { suspendUser, isLoading } = useSuspendUser(user.id);

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  const handleSuspend = async () => {
    try {
      await suspendUser();
      onClose();
    } catch {
      // useApiManager already toasted the error; keep the modal open
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Suspend User" size="sm">
      <p
        className="text-sm mb-6"
        style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
      >
        Are you sure you want to suspend{" "}
        <span className="font-medium" style={{ color: "#393939" }}>
          "{user.name}"
        </span>
        ? They will lose access until reactivated.
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
          onClick={handleSuspend}
          disabled={isLoading}
          className="px-4 py-2 text-sm text-white transition-colors disabled:opacity-60"
          style={{
            fontFamily: "Poppins",
            borderRadius: "8px",
            backgroundColor: "#f30100",
            border: "none",
          }}
        >
          {isLoading ? "Suspending..." : "Suspend"}
        </button>
      </div>
    </Modal>
  );
};

export default SuspendUserModal;
