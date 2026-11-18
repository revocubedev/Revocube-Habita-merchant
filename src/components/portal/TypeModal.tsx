import { useState } from "react";
import Modal from "@/components/ui/Modal";
import {
  useCreateType,
  useUpdateType,
  type TypeCategory,
  type TypeOption,
} from "@/api/api_controllers/types";

// "Air conditioning" -> "AIR_CONDITIONING", matching the stored values
const normalize = (input: string) =>
  input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

interface TypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: TypeCategory;
  categoryLabel: string;
  type?: TypeOption | null; // present = edit, absent = create
}

const TypeModal = ({
  isOpen,
  onClose,
  category,
  categoryLabel,
  type,
}: TypeModalProps) => {
  const isEdit = !!type;
  const [name, setName] = useState(type?.label ?? "");

  const { createType, isLoading: creating } = useCreateType();
  const { updateType, isLoading: updating } = useUpdateType(type?.id);
  const isLoading = creating || updating;

  const value = normalize(name);

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateType({ value });
      } else {
        await createType({ category, value });
      }
      onClose();
    } catch {
      // useApiManager already toasted the error; keep the modal open
    }
  };

  const canSubmit =
    value !== "" && (!isEdit || value !== type!.value) && !isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`${isEdit ? "Edit" : "Create"} ${categoryLabel} Type`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="type-name"
            className="block text-sm font-medium mb-2"
            style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
          >
            Name
          </label>
          <input
            id="type-name"
            type="text"
            autoFocus
            placeholder="e.g. Plumbing"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors"
            style={{
              fontFamily: "Poppins",
              borderColor: "#e3e3e3",
              height: "48px",
            }}
          />
          {value && (
            <p
              className="text-xs mt-2 text-muted-foreground"
              style={{ fontFamily: "Poppins" }}
            >
              Saved as <span className="font-medium">{value}</span>
            </p>
          )}
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
            {isLoading
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
              ? "Save Changes"
              : "Create Type"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TypeModal;
