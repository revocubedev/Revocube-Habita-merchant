import { useEffect, type ElementType } from "react";
import {
  X,
  UserRound,
  Mail,
  Phone,
  MapPin,
  Building2,
  CalendarDays,
  FileText,
  BadgeCheck,
  Clock,
} from "lucide-react";

interface JoinRequest {
  id: string;
  userId: string;
  estateId: string;
  unitApartmentId: string;
  notes: string | null;
  status: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    address?: string | null;
    occupation?: string | null;
  };
}

interface ViewJoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: JoinRequest | null;
}

const formatDate = (date?: string | null) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusStyle = (status: string) => {
  switch (status.toUpperCase()) {
    case "APPROVED":
      return "bg-green-100 text-green-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "MOVED_OUT":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

const DetailItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value?: string | null;
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 rounded-lg bg-gray-100 p-2 text-gray-500">
      <Icon size={17} />
    </div>

    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-gray-800">
        {value || "—"}
      </p>
    </div>
  </div>
);

export default function ViewJoinRequestModal({
  isOpen,
  onClose,
  request,
}: ViewJoinRequestModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !request) return null;

  const applicant = request.user;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-request-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div>
            <h2
              id="view-request-title"
              className="text-lg font-semibold text-gray-900"
            >
              Join Request Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View applicant and request information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Applicant */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Applicant Information
              </h3>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                  request.status
                )}`}
              >
                {request.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 rounded-xl border border-gray-100 p-4 sm:grid-cols-2">
              <DetailItem
                icon={UserRound}
                label="Full Name"
                value={applicant?.fullName}
              />

              <DetailItem
                icon={Mail}
                label="Email Address"
                value={applicant?.email}
              />

              <DetailItem
                icon={Phone}
                label="Phone Number"
                value={applicant?.phoneNumber}
              />

              <DetailItem
                icon={MapPin}
                label="Residential Address"
                value={applicant?.address}
              />

              <DetailItem
                icon={UserRound}
                label="Occupation"
                value={applicant?.occupation}
              />
            </div>
          </section>

          {/* Request Information */}
          <section>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Request Information
            </h3>

            <div className="grid grid-cols-1 gap-5 rounded-xl border border-gray-100 p-4 sm:grid-cols-2">
              <DetailItem
                icon={Building2}
                label="Requested Unit ID"
                value={request.unitApartmentId}
              />

              <DetailItem
                icon={CalendarDays}
                label="Request Date"
                value={formatDate(request.createdAt)}
              />

              <DetailItem
                icon={Clock}
                label="Last Updated"
                value={formatDate(request.updatedAt)}
              />

              <DetailItem
                icon={FileText}
                label="Request ID"
                value={request.id}
              />
            </div>
          </section>

          {/* Notes */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Applicant's Notes
            </h3>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {request.notes || "No additional notes provided."}
              </p>
            </div>
          </section>

          {/* Review Information */}
          <section>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Review Information
            </h3>

            <div className="grid grid-cols-1 gap-5 rounded-xl border border-gray-100 p-4 sm:grid-cols-2">
              <DetailItem
                icon={BadgeCheck}
                label="Reviewed By"
                value={request.reviewedBy}
              />

              <DetailItem
                icon={CalendarDays}
                label="Reviewed At"
                value={formatDate(request.reviewedAt)}
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#F30100] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
