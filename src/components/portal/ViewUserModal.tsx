import Modal from "@/components/ui/Modal";
import { useGetUser, extractUser } from "@/api/api_controllers/userController";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  profilePicture?: string | null;
}

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <div
      className="text-xs text-muted-foreground mb-1"
      style={{ fontFamily: "Poppins" }}
    >
      {label}
    </div>
    <div
      className="text-sm font-medium text-foreground"
      style={{ fontFamily: "Poppins" }}
    >
      {value || "—"}
    </div>
  </div>
);

const formatDate = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const ViewUserModal = ({ isOpen, onClose, userId }: ViewUserModalProps) => {
  const { data, isLoading, isError, error } = useGetUser(userId, isOpen);
  const user = extractUser(data);

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.name ||
    null;
  const role = typeof user?.role === "string" ? user.role : user?.role?.name;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="md">
      {isLoading && (
        <p
          className="text-sm text-muted-foreground"
          style={{ fontFamily: "Poppins" }}
        >
          Loading user...
        </p>
      )}

      {isError && (
        <p
          className="text-sm"
          style={{ fontFamily: "Poppins", color: "#f30100" }}
        >
          {(error as Error)?.message || "Failed to load user"}
        </p>
      )}

      {!isLoading && !isError && user && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2">
                <div
                  className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg text-muted-foreground overflow-hidden"
                  style={{ fontFamily: "Poppins" }}
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={name ?? "User profile"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (name ?? "?").charAt(0).toUpperCase()
                  )}
                </div>

                <div>
                  <div
                    className="text-base font-medium"
                    style={{ fontFamily: "Poppins", color: "#393939" }}
                  >
                    {name ?? "—"}
                  </div>

                  {role && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {role}
                    </span>
                  )}
                </div>
              </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email" value={user.email} />
            <Field label="Phone Number" value={user.phoneNumber} />
            <Field label="Status" value={user.status} />
            <Field label="Created" value={formatDate(user.createdAt)} />
          </div>
        </div>
      )}

      <div className="flex justify-end pt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm border transition-colors hover:bg-muted"
          style={{
            fontFamily: "Poppins",
            borderRadius: "8px",
            borderColor: "#e3e3e3",
            color: "#4c4c4c",
            backgroundColor: "transparent",
          }}
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ViewUserModal;
