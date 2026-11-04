import { useState } from "react";
import Modal from "@/components/ui/Modal"; // adjust to where your Modal lives
import { useCreateNotice } from "@/api/api_controllers/noticeController";

interface AddNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputStyle = {
  fontFamily: "Poppins",
  borderColor: "#e3e3e3",
};

const AddNoticeModal = ({ isOpen, onClose }: AddNoticeModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { createNotice, isLoading } = useCreateNotice();

  const handleClose = () => {
    if (isLoading) return;
    setTitle("");
    setDescription("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createNotice({
        title: title.trim(),
        description: description.trim(),
      });
      // useApiManager already toasts success and refreshes the list
      handleClose();
    } catch {
      // useApiManager already toasted the error; keep the modal open
    }
  };

  const canSubmit =
    title.trim() !== "" && description.trim() !== "" && !isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Notice"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="notice-title"
            className="block text-sm font-medium mb-2"
            style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
          >
            Title
          </label>
          <input
            id="notice-title"
            type="text"
            placeholder="Enter notice title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors"
            style={{ ...inputStyle, height: "48px" }}
          />
        </div>

        <div>
          <label
            htmlFor="notice-description"
            className="block text-sm font-medium mb-2"
            style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
          >
            Description
          </label>
          <textarea
            id="notice-description"
            placeholder="Enter notice description"
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
            {isLoading ? "Creating..." : "Create Notice"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddNoticeModal;
