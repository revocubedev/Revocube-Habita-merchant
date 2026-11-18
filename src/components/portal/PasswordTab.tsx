import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useUpdatePassword } from "@/api/api_controllers/userController";

const MIN_LENGTH = 8;

const inputClass =
  "w-full px-3 pr-10 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-text/20";
const inputStyle = {
  fontFamily: "Poppins",
  borderColor: "#e3e3e3",
  height: "40px",
};
const labelStyle = { fontFamily: "Poppins", color: "#4c4c4c" };

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder?: string;
}

const PasswordField = ({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
}: PasswordFieldProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-2"
        style={labelStyle}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className={inputClass}
          style={inputStyle}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

const PasswordTab = () => {
  const { user } = useAuth();
  const { updatePassword, isLoading } = useUpdatePassword(user?.id);

  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const tooShort = password.length > 0 && password.length < MIN_LENGTH;
  const mismatch = confirm.length > 0 && password !== confirm;
  const sameAsOld = password.length > 0 && password === oldPassword;

  const canSubmit =
    !!user?.id &&
    oldPassword !== "" &&
    password.length >= MIN_LENGTH &&
    password === confirm &&
    !sameAsOld &&
    !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updatePassword({ oldPassword, password });
      setOldPassword("");
      setPassword("");
      setConfirm("");
    } catch {
      // useApiManager already toasted the error; keep the form filled
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-lg p-6"
      style={{ borderColor: "#e3e3e3", borderRadius: "12px", border: "none" }}
    >
      <h2
        className="text-base font-medium mb-6"
        style={{ fontFamily: "Poppins", color: "#393939" }}
      >
        Change Password
      </h2>

      <div className="space-y-4 max-w-md">
        <PasswordField
          id="old-password"
          label="Current Password"
          value={oldPassword}
          onChange={setOldPassword}
          autoComplete="current-password"
          placeholder="Enter current password"
        />

        <div>
          <PasswordField
            id="new-password"
            label="New Password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            placeholder={`At least ${MIN_LENGTH} characters`}
          />
          {tooShort && (
            <p
              className="text-xs mt-1"
              style={{ fontFamily: "Poppins", color: "#f30100" }}
            >
              Password must be at least {MIN_LENGTH} characters.
            </p>
          )}
          {sameAsOld && (
            <p
              className="text-xs mt-1"
              style={{ fontFamily: "Poppins", color: "#f30100" }}
            >
              New password must be different from the current one.
            </p>
          )}
        </div>

        <div>
          <PasswordField
            id="confirm-password"
            label="Confirm New Password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            placeholder="Re-enter new password"
          />
          {mismatch && (
            <p
              className="text-xs mt-1"
              style={{ fontFamily: "Poppins", color: "#f30100" }}
            >
              Passwords do not match.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="submit"
          disabled={!canSubmit}
          className="text-sm text-white transition-colors px-6 py-2 disabled:opacity-60"
          style={{
            fontFamily: "Poppins",
            borderRadius: "8px",
            backgroundColor: "#f30100",
            border: "none",
            height: "40px",
          }}
        >
          {isLoading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  );
};

export default PasswordTab;