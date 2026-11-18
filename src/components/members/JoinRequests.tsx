import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { estatePath } from '@/lib/estateRoutes';
import {
  useApproveEstateJoinRequest,
  useGetEstateJoinRequests,
  useMoveOutResident,
  type EstateJoinRequest,
} from '@/api/api_controllers/joinRequests';

const requestDate = (value: string) => new Date(value).toLocaleDateString();

const RequestAction = ({ request }: { request: EstateJoinRequest }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { approve, isLoading: approving } = useApproveEstateJoinRequest(request.id);
  const { moveOut, isLoading: movingOut } = useMoveOutResident(request.id);
  const isApproval = request.status === 'PENDING';
  const isMoveOut = request.status === 'APPROVED';
  const isSubmitting = approving || movingOut;

  if (!isApproval && !isMoveOut) return <span className="text-muted-foreground">—</span>;

  const confirm = async () => {
    try {
      if (isApproval) await approve();
      else await moveOut();
      setConfirmOpen(false);
    } catch {
      // The API manager displays the error and the modal stays open.
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant={isMoveOut ? 'outline' : 'primary'}
        onClick={() => setConfirmOpen(true)}
      >
        {isApproval ? 'Approve' : 'Move Out'}
      </Button>
      <Modal
        isOpen={confirmOpen}
        onClose={() => {
          if (!isSubmitting) setConfirmOpen(false);
        }}
        title={isApproval ? 'Approve Join Request' : 'Move Out Resident'}
        size="sm"
      >
        <p className="text-sm text-muted-foreground">
          {isApproval
            ? `Approve ${request.user?.fullName ?? 'this applicant'} and register them as a resident?`
            : `Mark ${request.user?.fullName ?? 'this resident'} as moved out? Their apartment will become available for a new join request.`}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => setConfirmOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" isLoading={isSubmitting} onClick={confirm}>
            {isApproval ? 'Approve Request' : 'Confirm Move Out'}
          </Button>
        </div>
      </Modal>
    </>
  );
};

const JoinRequests = () => {
  const { estateCode = '' } = useParams();
  const { items, pagination, isLoading, isError } = useGetEstateJoinRequests();
  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();
  const visible = items.filter((request) =>
    request.user?.fullName?.toLowerCase().includes(term) ||
    request.user?.email?.toLowerCase().includes(term) ||
    request.status.toLowerCase().includes(term)
  );

  return (
    <div className="space-y-5 px-1 pb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to={estatePath(estateCode, '/members')} className="mb-2 block text-sm text-muted-foreground hover:text-foreground">
            ← Members
          </Link>
          <h2 className="text-base font-medium text-foreground">Estate Join Requests</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {pagination ? `${items.length} of ${pagination.totalItems} requests` : `${items.length} requests`}
        </span>
      </div>

      {pagination && pagination.totalItems > items.length && (
        <p className="text-sm text-muted-foreground">
          The API returned one batch. More requests may require pagination support.
        </p>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search returned requests"
          className="mb-4 w-full max-w-sm rounded-lg border border-border bg-card px-3 py-2 text-sm"
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="p-3">Applicant</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Address</th>
                <th className="p-3">Requested</th>
                <th className="p-3">Status</th>
                <th className="p-3">Reviewed</th>
                <th className="p-3">Notes</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={8} className="p-6 text-center">Loading requests...</td></tr>}
              {isError && <tr><td colSpan={8} className="p-6 text-center text-destructive">Could not load join requests.</td></tr>}
              {!isLoading && !isError && visible.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No join requests found.</td></tr>
              )}
              {!isLoading && !isError && visible.map((request) => (
                <tr key={request.id} className="border-b border-border last:border-0">
                  <td className="p-3">
                    <div className="font-medium">{request.user?.fullName ?? '—'}</div>
                    <div className="text-muted-foreground">{request.user?.email ?? '—'}</div>
                  </td>
                  <td className="p-3">{request.user?.phoneNumber ?? '—'}</td>
                  <td className="max-w-[220px] break-words p-3">{request.user?.address || '—'}</td>
                  <td className="p-3">{requestDate(request.createdAt)}</td>
                  <td className="p-3">{request.status.replace(/_/g, ' ')}</td>
                  <td className="p-3">{request.reviewedAt ? requestDate(request.reviewedAt) : '—'}</td>
                  <td className="max-w-[200px] break-words p-3">{request.notes || '—'}</td>
                  <td className="p-3"><RequestAction request={request} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JoinRequests;
