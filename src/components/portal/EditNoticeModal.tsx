import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useUpdateNotice } from "@/api/api_controllers/noticeController";

interface EditNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  notice: { id: string; title: string; description: string };
}

const inputStyle = { fontFamily: "Poppins", borderColor: "#e3e3e3" };

const EditNoticeModal = ({ isOpen, onClose, notice }: EditNoticeModalProps) => {
  const [title, setTitle] = useState(notice.title ?? "");
  const [description, setDescription] = useState(notice.description ?? "");
  const { updateNotice, isLoading } = useUpdateNotice(notice.id);

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateNotice({
        title: title.trim(),
        description: description.trim(),
      });
      onClose();
    } catch {
      // useApiManager already toasted the error; keep the modal open
    }
  };

  const unchanged =
    title.trim() === (notice.title ?? "") &&
    description.trim() === (notice.description ?? "");
  const canSubmit =
    title.trim() !== "" &&
    description.trim() !== "" &&
    !unchanged &&
    !isLoading;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Notice" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="edit-notice-title"
            className="block text-sm font-medium mb-2"
            style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
          >
            Title
          </label>
          <input
            id="edit-notice-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors"
            style={{ ...inputStyle, height: "48px" }}
          />
        </div>

        <div>
          <label
            htmlFor="edit-notice-description"
            className="block text-sm font-medium mb-2"
            style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
          >
            Description
          </label>
          <textarea
            id="edit-notice-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors resize-none"
            style={inputStyle}
          />
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
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditNoticeModal;
