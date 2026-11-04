import { useEffect, useState } from "react";
import Modal, { inputCls } from "@/components/ui/Modal";
import {
  useCreateMaintainer,
  useUpdateMaintainer,
  type Maintainer,
  type MaintainerFormValues,
} from "@/api/api_controllers/maintainerController";

const TYPES = ["PLUMBER", "ELECTRICIAN", "CARPENTER", "CLEANER", "SECURITY", "OTHER"];

const empty: MaintainerFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  maintainerType: "OTHER",
  profileImage: null,
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  maintainer?: Maintainer | null;
}


const MaintainerFormModal = ({ isOpen, onClose, maintainer }: Props) => {
  const isEdit = !!maintainer;
  const [values, setValues] = useState<MaintainerFormValues>(empty);
  const { createMaintainer, isLoading: creating } = useCreateMaintainer();
  const { updateMaintainer, isLoading: updating } = useUpdateMaintainer(maintainer?.id);

  useEffect(() => {
    if (!isOpen) return;
    setValues(
      maintainer
        ? {
            firstName: maintainer.firstName,
            lastName: maintainer.lastName,
            email: maintainer.email,
            phoneNumber: maintainer.phoneNumber,
            password: "",
            maintainerType: maintainer.maintainerType,
            profileImage: null,
          }
        : empty
    );
  }, [isOpen, maintainer]);

  const set = (k: keyof MaintainerFormValues, v: any) => setValues((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) await updateMaintainer(values);
      else await createMaintainer(values);
      onClose();
    } catch {
      /* toast handled by api manager */
    }
  };

  const busy = creating || updating;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Maintainer" : "Create Maintainer"} size="lg">
      <form onSubmit={onSubmit} autoComplete="off" className="grid grid-cols-2 gap-x-5 gap-y-4">
        <>
          <label className="text-sm space-y-2 block">
            <span className="block font-medium text-muted-foreground">First name</span>
            <input required className={inputCls} value={values.firstName} onChange={(e) => set("firstName", e.target.value)} />
          </label>
          <label className="text-sm space-y-2 block">
            <span className="block font-medium text-muted-foreground">Last name</span>
            <input required className={inputCls} value={values.lastName} onChange={(e) => set("lastName", e.target.value)} />
          </label>
        </>
        <label className="text-sm space-y-2 block">
          <span className="block font-medium text-muted-foreground">Email</span>
          <input required type="email" name="maintainer-email" autoComplete="off" className={inputCls} value={values.email} onChange={(e) => set("email", e.target.value)} />
        </label>
        <label className="text-sm space-y-2 block">
          <span className="block font-medium text-muted-foreground">Phone number</span>
          <input required className={inputCls} value={values.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} />
        </label>
        <label className="text-sm space-y-2 block">
          <span className="block font-medium text-muted-foreground">Password {isEdit && <span className="text-muted-foreground">(leave blank to keep)</span>}</span>
          <input
            type="password"
            name="maintainer-new-password"
            autoComplete="new-password"
            required={!isEdit}
            className={inputCls}
            value={values.password}
            onChange={(e) => set("password", e.target.value)}
          />
        </label>
        <label className="text-sm space-y-2 block">
          <span className="block font-medium text-muted-foreground">Maintainer type</span>
          <select className={inputCls} value={values.maintainerType} onChange={(e) => set("maintainerType", e.target.value)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <div className="text-sm space-y-2 col-span-2">
          <span className="block font-medium text-muted-foreground">Profile image</span>
          <label className="flex items-center gap-4 p-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
            {values.profileImage ? (
              <img src={URL.createObjectURL(values.profileImage)} alt="Preview" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xl">+</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {values.profileImage ? values.profileImage.name : "Click to upload a photo"}
              </p>
              <p className="text-xs text-muted-foreground">PNG or JPG</p>
            </div>
            <span className="px-4 py-2 rounded-lg border border-border text-foreground font-medium">
              {values.profileImage ? "Change" : "Choose file"}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => set("profileImage", e.target.files?.[0] ?? null)} />
          </label>
        </div>
        <div className="col-span-2 flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm border border-border rounded-lg">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2.5 text-sm text-white rounded-lg disabled:opacity-60"
            style={{ backgroundColor: "#f30100" }}
          >
            {busy ? "Saving..." : isEdit ? "Save changes" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MaintainerFormModal;
