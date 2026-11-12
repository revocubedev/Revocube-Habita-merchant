import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Modal from "@/components/ui/Modal";
import {
  useCreateUser,
  useUpdateUser,
} from "@/api/api_controllers/userController";
import {
  extractRoles,
  useGetAdminRoles,
} from "@/api/api_controllers/adminController";
import { prettyRole } from "@/lib/userUtilis";


export interface UserRecord {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phoneNumber?: string | null;
  roleId?: string;
  roles?: { id: string; name: string }[];
  role?: string | { id?: string; name?: string };
  status?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserRecord | null; // present = edit, absent = create
}

const inputClass =
  "w-full px-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors";
const inputStyle = {
  fontFamily: "Poppins",
  borderColor: "#e3e3e3",
  height: "48px",
};
const labelStyle = { fontFamily: "Poppins", color: "#4c4c4c" };

const initialRoleId = (user?: UserRecord | null) =>
  user?.roleId ??
  user?.roles?.[0]?.id ??
  (typeof user?.role === "object" ? user.role?.id : undefined) ??
  "";

const splitName = (user?: UserRecord | null) => {
  if (user?.firstName || user?.lastName) {
    return { first: user.firstName ?? "", last: user.lastName ?? "" };
  }
  const [first = "", ...rest] = (user?.name ?? "").split(" ");
  return { first, last: rest.join(" ") };
};

const UserModal = ({ isOpen, onClose, user }: UserModalProps) => {
  const isEdit = !!user;
  const names = splitName(user);

  const [firstName, setFirstName] = useState(names.first);
  const [lastName, setLastName] = useState(names.last);
  const [email, setEmail] = useState(user?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
  const [roleId, setRoleId] = useState(initialRoleId(user));
  const [password, setPassword] = useState("");

  const { data: rolesData, isLoading: rolesLoading } = useGetAdminRoles({
    page: 1,
    perPage: 100,
    enabled: isOpen,
  });
  const roles: { id: string; name: string }[] = extractRoles(rolesData);

  const { createUser, isLoading: creating } = useCreateUser();
  const { updateUser, isLoading: updating } = useUpdateUser(user?.id);
  const isLoading = creating || updating;

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const base = {
      roleId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim(),
    };

    try {
      if (isEdit) {
        await updateUser(base); // email can't be changed, so it isn't sent
      } else {
        await createUser({ ...base, email: email.trim(), password });
      }
      onClose();
    } catch {
      // useApiManager already toasted the error; keep the modal open
    }
  };

  const unchanged =
    isEdit &&
    firstName.trim() === names.first &&
    lastName.trim() === names.last &&
    phoneNumber.trim() === (user!.phoneNumber ?? "") &&
    roleId === initialRoleId(user);

  const canSubmit =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    email.trim() !== "" &&
    roleId !== "" &&
    (isEdit || password.length >= 8) &&
    !unchanged &&
    !isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? "Edit User" : "Create User"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="user-first-name"
              className="block text-sm font-medium mb-2"
              style={labelStyle}
            >
              First Name
            </label>
            <input
              id="user-first-name"
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              htmlFor="user-last-name"
              className="block text-sm font-medium mb-2"
              style={labelStyle}
            >
              Last Name
            </label>
            <input
              id="user-last-name"
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="user-email"
            className="block text-sm font-medium mb-2"
            style={labelStyle}
          >
            Email Address
          </label>
          <input
            id="user-email"
            type="email"
            disabled={isEdit}
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`}
            style={inputStyle}
          />
        </div>

        <div>
          <label
            htmlFor="user-phone"
            className="block text-sm font-medium mb-2"
            style={labelStyle}
          >
            Phone Number
          </label>
          <input
            id="user-phone"
            type="tel"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label
            htmlFor="user-role"
            className="block text-sm font-medium mb-2"
            style={labelStyle}
          >
            Assign Role
          </label>
          <div className="relative">
            <select
              id="user-role"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              disabled={rolesLoading}
              required
              className={`${inputClass} appearance-none bg-background disabled:opacity-60`}
              style={inputStyle}
            >
              <option value="">
                {rolesLoading ? "Loading roles..." : "Select role..."}
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {prettyRole(role.name)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {!isEdit && (
          <div>
            <label
              htmlFor="user-password"
              className="block text-sm font-medium mb-2"
              style={labelStyle}
            >
              Password
            </label>
            <input
              id="user-password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
              style={inputStyle}
            />
          </div>
        )}

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
              : "Create User"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;
