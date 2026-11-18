import Modal from "@/components/ui/Modal";
import useApiManager from "@/api/useApiManager"; // adjust to where your hook lives

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  endpoint: string; // e.g. `notices/${id}`
  queryKey?: string[]; // lists to refetch after delete
  itemName?: string; // shown in the message
  entity?: string; // "Notice", "Property", "Resident"...
  successMessage?: string;
  isCode?: boolean; // prefix the estate code (default true)
  onSuccess?: () => void;
}

const DeleteModal = ({
  isOpen,
  onClose,
  endpoint,
  queryKey = [],
  itemName,
  entity = "Item",
  successMessage,
  isCode = true,
  onSuccess,
}: DeleteModalProps) => {
  const { callApi, isLoading } = useApiManager({
    endpoint,
    queryKey,
    method: "DELETE",
    isAuth: true,
    isCode,
    successMessage: successMessage ?? `${entity} deleted successfully`,
  });

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  const handleDelete = async () => {
    try {
      await callApi(undefined);
      onSuccess?.();
      onClose();
    } catch {
      // useApiManager already toasted the error; keep the modal open
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Delete ${entity}`}
      size="sm"
    >
      <p
        className="text-sm mb-6"
        style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
      >
        Are you sure you want to delete{" "}
        {itemName ? (
          <span className="font-medium" style={{ color: "#393939" }}>
            "{itemName}"
          </span>
        ) : (
          `this ${entity.toLowerCase()}`
        )}
        ? This action cannot be undone.
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
          onClick={handleDelete}
          disabled={isLoading}
          className="px-4 py-2 text-sm text-white transition-colors disabled:opacity-60"
          style={{
            fontFamily: "Poppins",
            borderRadius: "8px",
            backgroundColor: "#f30100",
            border: "none",
          }}
        >
          {isLoading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
};

export default DeleteModal;
