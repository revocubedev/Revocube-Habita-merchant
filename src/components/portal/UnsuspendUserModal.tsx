import Modal from "@/components/ui/Modal";
import { useUnsuspendUser } from "@/api/api_controllers/userController";

interface UnsuspendUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; name: string };
}

const UnsuspendUserModal = ({
  isOpen,
  onClose,
  user,
}: UnsuspendUserModalProps) => {
  const { unsuspendUser, isLoading } = useUnsuspendUser(user.id);

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  const handleUnsuspend = async () => {
    try {
      await unsuspendUser();
      onClose();
    } catch {
      // useApiManager already toasted the error; keep the modal open
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Unsuspend User"
      size="sm"
    >
      <p
        className="text-sm mb-6"
        style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
      >
        Are you sure you want to unsuspend{" "}
        <span className="font-medium" style={{ color: "#393939" }}>
          "{user.name}"
        </span>
        ? They will regain access immediately.
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
          onClick={handleUnsuspend}
          disabled={isLoading}
          className="px-4 py-2 text-sm text-white transition-colors disabled:opacity-60"
          style={{
            fontFamily: "Poppins",
            borderRadius: "8px",
            backgroundColor: "#27964F",
            border: "none",
          }}
        >
          {isLoading ? "Unsuspending..." : "Unsuspend"}
        </button>
      </div>
    </Modal>
  );
};

export default UnsuspendUserModal;
