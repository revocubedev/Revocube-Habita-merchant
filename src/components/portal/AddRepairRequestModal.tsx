import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import type { TypeOption } from "@/api/api_controllers/types";

export interface RepairOption {
  id: string;
  name: string;
}

export interface RepairUnitOption extends RepairOption {
  propertyId: string;
}

interface CreateRepairRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting?: boolean;
  isLoadingOptions?: boolean;
  members: RepairOption[];
  properties: RepairOption[];
  units: RepairUnitOption[];
  maintainers: RepairOption[];
  // issueTypes: RepairIssueTypeOption[];
  isLoadingIssueTypes?: boolean;
  issueTypes: TypeOption[];
}

export interface RepairIssueTypeOption {
  id: string;
  value: string;
  label: string;
}

const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000).toISOString().split("T")[0];
};

const CreateRepairRequestModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  isLoadingOptions = false,
  members,
  properties,
  units,
  maintainers,
  issueTypes,
  isLoadingIssueTypes = false,
}: CreateRepairRequestModalProps) => {
  const [requestDate, setRequestDate] = useState(getToday());
  const [repairIssueTypeId, setRepairIssueTypeId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [maintainerId, setMaintainerId] = useState("");
  const [notes, setNotes] = useState("");
  const [issueDocument, setIssueDocument] = useState<File | null>(null);

  const filteredUnits = useMemo(
    () => units.filter((unit) => unit.propertyId === propertyId),
    [units, propertyId]
  );

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!repairIssueTypeId) {
      console.error("Please select a repair issue type");
      return;
    }

    const formData = new FormData();

    formData.append("requestDate", requestDate);
    formData.append("repairIssueTypeId", repairIssueTypeId);
    formData.append("memberId", memberId);
    formData.append("propertyId", propertyId);
    formData.append("unitId", unitId);
    formData.append("maintainerId", maintainerId);
    formData.append("notes", notes);

    if (issueDocument) {
      formData.append("issueDocument", issueDocument);
    }

    console.log("Repair request payload:");

    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    await onSubmit(formData);
  };

  useEffect(() => {
    if (issueTypes.length === 0) return;

    setRepairIssueTypeId((current) =>
      issueTypes.some((type) => type.id === current)
        ? current
        : issueTypes[0].id
    );
  }, [issueTypes]);

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#f30100] focus:ring-1 focus:ring-[#f30100] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";

  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Create Maintenance Request
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Fill in the details to create a repair request.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Request Date */}
            <div>
              <label className={labelClass}>Request Date *</label>
              <input
                type="date"
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
                className={inputClass}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Issue Type */}
            <div>
              <label className={labelClass}>Issue Type *</label>

              <select
                value={repairIssueTypeId}
                onChange={(e) => setRepairIssueTypeId(e.target.value)}
                className={inputClass}
                required
                disabled={
                  isLoadingIssueTypes || isSubmitting || issueTypes.length === 0
                }
              >
                <option value="" disabled>
                  Select issue type
                </option>

                {issueTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Member */}
            <div>
              <label className={labelClass}>Member *</label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className={inputClass}
                required
                disabled={
                  isLoadingOptions || isSubmitting || members.length === 0
                }
              >
                <option value="" disabled>
                  {isLoadingOptions
                    ? "Loading members..."
                    : members.length === 0
                    ? "No members available"
                    : "Select member"}
                </option>

                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Property */}
            <div>
              <label className={labelClass}>Property *</label>
              <select
                value={propertyId}
                onChange={(e) => {
                  setPropertyId(e.target.value);
                  setUnitId("");
                }}
                className={inputClass}
                required
                disabled={
                  isLoadingOptions || isSubmitting || properties.length === 0
                }
              >
                <option value="" disabled>
                  {isLoadingOptions
                    ? "Loading properties..."
                    : properties.length === 0
                    ? "No properties available"
                    : "Select property"}
                </option>

                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className={labelClass}>Unit *</label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className={inputClass}
                required
                disabled={
                  !propertyId ||
                  isLoadingOptions ||
                  isSubmitting ||
                  filteredUnits.length === 0
                }
              >
                <option value="" disabled>
                  {!propertyId
                    ? "Select a property first"
                    : isLoadingOptions
                    ? "Loading units..."
                    : filteredUnits.length === 0
                    ? "No units available"
                    : "Select unit"}
                </option>

                {filteredUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Maintainer */}
            <div>
              <label className={labelClass}>Assign Maintainer *</label>
              <select
                value={maintainerId}
                onChange={(e) => setMaintainerId(e.target.value)}
                className={inputClass}
                required
                disabled={
                  isLoadingOptions || isSubmitting || maintainers.length === 0
                }
              >
                <option value="" disabled>
                  {isLoadingOptions
                    ? "Loading maintainers..."
                    : maintainers.length === 0
                    ? "No maintainers available"
                    : "Select maintainer"}
                </option>

                {maintainers.map((maintainer) => (
                  <option key={maintainer.id} value={maintainer.id}>
                    {maintainer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description / Notes *</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Describe the maintenance issue..."
              className={`${inputClass} resize-none`}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Attachment */}
          <div>
            <label className={labelClass}>Attachment (Optional)</label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 p-4 hover:border-[#f30100]">
              <Upload className="shrink-0 text-gray-400" size={22} />

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-700">
                  {issueDocument?.name || "Upload an image or document"}
                </p>
                <p className="text-xs text-gray-400">
                  Choose a file from your device
                </p>
              </div>

              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                disabled={isSubmitting}
                onChange={(e) => setIssueDocument(e.target.files?.[0] ?? null)}
              />
            </label>

            {issueDocument && (
              <button
                type="button"
                onClick={() => setIssueDocument(null)}
                disabled={isSubmitting}
                className="mt-2 text-xs font-medium text-red-600 hover:underline"
              >
                Remove attachment
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingOptions ||
                isLoadingIssueTypes ||
                issueTypes.length === 0
              }
              className="flex items-center gap-2 rounded-lg bg-[#f30100] px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}

              {isSubmitting ? "Creating..." : "Create Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRepairRequestModal;
