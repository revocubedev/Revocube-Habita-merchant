import { Mail, Phone, CalendarDays, Wrench, UserRound } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Maintainer } from "@/api/api_controllers/maintainerController";

interface MaintainerViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintainer: Maintainer | null;
}

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);

  return isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
};

const DetailItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) => (
  <div className="flex items-start gap-3">
    <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
      <Icon className="w-4 h-4" />
    </div>

    <div className="min-w-0">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-700 break-words">
        {value || "—"}
      </p>
    </div>
  </div>
);

const MaintainerViewModal = ({
  isOpen,
  onClose,
  maintainer,
}: MaintainerViewModalProps) => {
  if (!maintainer) return null;

  const fullName = `${maintainer.firstName} ${maintainer.lastName}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Maintainer Details"
      size="md"
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-gray-100">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-50 mb-3">
            {maintainer.profileImage ? (
              <img
                src={maintainer.profileImage}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserRound className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-800">{fullName}</h3>

          <span className="mt-2 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
            {maintainer.maintainerTypeNew?.value?.replace(/_/g, " ") ||
              "Maintainer"}
          </span>
        </div>

        {/* Contact Details */}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-4">
            Contact Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DetailItem
              icon={Mail}
              label="Email Address"
              value={maintainer.email}
            />

            <DetailItem
              icon={Phone}
              label="Phone Number"
              value={maintainer.phoneNumber}
            />

            <DetailItem
              icon={Wrench}
              label="Maintainer Type"
              value={maintainer.maintainerTypeNew?.value?.replace(/_/g, " ")}
            />
          </div>
        </div>

        {/* Account Information */}
        <div className="pt-5 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-800 mb-4">
            Account Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DetailItem
              icon={CalendarDays}
              label="Date Created"
              value={formatDate(maintainer.createdAt)}
            />

            <DetailItem
              icon={CalendarDays}
              label="Last Updated"
              value={formatDate(maintainer.updatedAt)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm text-white rounded-lg"
            style={{ backgroundColor: "#f30100", fontFamily: "Poppins" }}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MaintainerViewModal;
