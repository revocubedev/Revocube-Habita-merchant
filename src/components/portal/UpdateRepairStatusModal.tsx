import Select from '@/components/ui/Select';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useUpdateRepairStatus } from '@/api/api_controllers/repairsController';

// Confirm the real values with your backend
export const REPAIR_STATUSES = ['PENDING', 'APPROVED', 'COMPLETED'];

const prettyLabel = (value?: string | null) =>
  value
    ? value
        .toLowerCase()
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : '—';

interface UpdateRepairStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  repair: { id: string; status: string; issueType?: string };
}

const UpdateRepairStatusModal = ({
  isOpen,
  onClose,
  repair,
}: UpdateRepairStatusModalProps) => {
  const [status, setStatus] = useState(repair.status);
  const { updateRepairStatus, isLoading } = useUpdateRepairStatus(repair.id);

  // Keep the current status selectable even if it isn't in the list
  const options =
    !repair.status || REPAIR_STATUSES.includes(repair.status)
      ? REPAIR_STATUSES
      : [repair.status, ...REPAIR_STATUSES];

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateRepairStatus(status);
      onClose();
    } catch {
      // useApiManager already toasted the error; keep the modal open
    }
  };

  const canSubmit = status !== '' && status !== repair.status && !isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Request Status"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p
          className="text-sm"
          style={{ fontFamily: 'Poppins', color: '#4c4c4c' }}
        >
          Change the status of this{' '}
          <span className="font-medium" style={{ color: '#393939' }}>
            {prettyLabel(repair.issueType)}
          </span>{' '}
          request. It is currently{' '}
          <span className="font-medium" style={{ color: '#393939' }}>
            {prettyLabel(repair.status)}
          </span>
          .
        </p>

        <div>
          <label
            htmlFor="repair-status"
            className="block text-sm font-medium mb-2"
            style={{ fontFamily: 'Poppins', color: '#4c4c4c' }}
          >
            Status
          </label>
          <div className="relative">
            <Select
              id="repair-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 appearance-none"
              style={{
                fontFamily: 'Poppins',
                borderColor: '#e3e3e3',
                height: '48px',
              }}
            >
              {options.map((s) => (
                <option key={s} value={s}>
                  {prettyLabel(s)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm border transition-colors hover:bg-muted disabled:opacity-60"
            style={{
              fontFamily: 'Poppins',
              borderRadius: '8px',
              borderColor: '#e3e3e3',
              color: '#4c4c4c',
              backgroundColor: 'transparent',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-4 py-2 text-sm text-white transition-colors disabled:opacity-60"
            style={{
              fontFamily: 'Poppins',
              borderRadius: '8px',
              backgroundColor: '#f30100',
              border: 'none',
            }}
          >
            {isLoading ? 'Saving...' : 'Update Status'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateRepairStatusModal;
