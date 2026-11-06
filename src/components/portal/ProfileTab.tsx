import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  useGetProfile,
  useUpdateProfile,
  extractProfile,
} from "@/api/api_controllers/userController";

interface Profile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  profilePicture?: string | null;
}

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-text/20";
const inputStyle = {
  fontFamily: "Poppins",
  borderColor: "#e3e3e3",
  height: "40px",
};
const labelStyle = { fontFamily: "Poppins", color: "#4c4c4c" };

const ProfileForm = ({ id, profile }: { id: string; profile: Profile }) => {
  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [email, setEmail] = useState(profile.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { updateProfile, isLoading } = useUpdateProfile(id);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const avatar = preview ?? profile.profilePicture ?? null;

  const unchanged =
    !file &&
    firstName.trim() === (profile.firstName ?? "") &&
    lastName.trim() === (profile.lastName ?? "") &&
    email.trim() === (profile.email ?? "") &&
    phoneNumber.trim() === (profile.phoneNumber ?? "");

  const canSave =
    firstName.trim() !== "" && email.trim() !== "" && !unchanged && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("firstName", firstName.trim());
    formData.append("lastName", lastName.trim());
    formData.append("email", email.trim());
    formData.append("phoneNumber", phoneNumber.trim());
    if (file) formData.append("profilePicture", file);

    try {
      await updateProfile(formData);
      setFile(null);
    } catch {
      // useApiManager already toasted the error; keep the form as is
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        {avatar ? (
          <img
            src={avatar}
            alt="Profile"
            className="rounded-full object-cover"
            style={{ width: "56px", height: "56px" }}
          />
        ) : (
          <div
            className="rounded-full bg-muted flex items-center justify-center text-lg text-muted-foreground"
            style={{ width: "56px", height: "56px", fontFamily: "Poppins" }}
          >
            {(firstName || email || "?").charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="profile-first-name"
              className="block text-sm font-medium mb-2"
              style={labelStyle}
            >
              First Name
            </label>
            <input
              id="profile-first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              htmlFor="profile-last-name"
              className="block text-sm font-medium mb-2"
              style={labelStyle}
            >
              Last Name
            </label>
            <input
              id="profile-last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="profile-email"
            className="block text-sm font-medium mb-2"
            style={labelStyle}
          >
            Email Address
          </label>
          <input
            id="profile-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label
            htmlFor="profile-phone"
            className="block text-sm font-medium mb-2"
            style={labelStyle}
          >
            Phone Number
          </label>
          <input
            id="profile-phone"
            type="tel"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>
            Profile Picture
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              id="profile-upload"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <label
              htmlFor="profile-upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border cursor-pointer hover:bg-muted transition-colors"
              style={{
                fontFamily: "Poppins",
                borderColor: "#e3e3e3",
                height: "40px",
              }}
            >
              <Upload className="w-4 h-4" />
              Choose File
            </label>
            <span
              className="text-sm text-muted-foreground"
              style={{ fontFamily: "Poppins" }}
            >
              {file ? file.name : "No File Chosen"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="submit"
          disabled={!canSave}
          className="text-sm text-white transition-colors flex items-center gap-2 px-6 py-2 disabled:opacity-60"
          style={{
            fontFamily: "Poppins",
            borderRadius: "8px",
            backgroundColor: "#f30100",
            border: "none",
            height: "40px",
          }}
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

const ProfileTab = () => {
  const { user } = useAuth();
  const id = user?.id;

  const { data, isLoading, isError, error } = useGetProfile(id);
  const profile: Profile | null = extractProfile(data);

  return (
    <div
      className="bg-card border border-border rounded-lg p-6"
      style={{ borderColor: "#e3e3e3", borderRadius: "12px", border: "none" }}
    >
      <h2
        className="text-base font-medium mb-6"
        style={{ fontFamily: "Poppins", color: "#393939" }}
      >
        User Profile
      </h2>

      {!id && (
        <p
          className="text-sm"
          style={{ fontFamily: "Poppins", color: "#f30100" }}
        >
          Couldn't identify your account. Please log in again.
        </p>
      )}

      {isLoading && (
        <p
          className="text-sm text-muted-foreground"
          style={{ fontFamily: "Poppins" }}
        >
          Loading profile...
        </p>
      )}

      {isError && (
        <p
          className="text-sm"
          style={{ fontFamily: "Poppins", color: "#f30100" }}
        >
          {(error as Error)?.message || "Failed to load profile"}
        </p>
      )}

      {id && profile && <ProfileForm id={id} profile={profile} />}
    </div>
  );
};

export default ProfileTab;
