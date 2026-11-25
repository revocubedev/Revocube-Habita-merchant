import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { estatePath } from "@/lib/estateRoutes";
import { Check, X, LogOut, Eye } from "lucide-react";
import RowActionsMenu, { RowAction } from "@/components/ui/RowActionsMenu";
import {
  useApproveEstateJoinRequest,
  useGetEstateJoinRequests,
  useMoveOutResident,
  useRejectEstateJoinRequest,
  type EstateJoinRequest,
} from "@/api/api_controllers/joinRequests";
import ViewJoinRequestModal from "../portal/ViewJoinRequestModal";

const requestDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

type RequestActionType = "APPROVE" | "REJECT" | "MOVE_OUT";

interface RequestActionProps {
  request: EstateJoinRequest;
  onView: (request: EstateJoinRequest) => void;
}

const RequestAction = ({ request, onView }: RequestActionProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<RequestActionType | null>(null);

  const { approve, isLoading: approving } = useApproveEstateJoinRequest(
    request.id
  );

  const { moveOut, isLoading: movingOut } = useMoveOutResident(request.id);

  const { reject, isLoading: rejecting } = useRejectEstateJoinRequest(
    request.id
  );

  const isPending = request.status === "PENDING";
  const isApproved = request.status === "APPROVED";

  const isSubmitting = approving || movingOut || rejecting;

  const actionDetails = {
    APPROVE: {
      title: "Approve Join Request",
      description: `Approve ${
        request.user?.fullName ?? "this applicant"
      } and register them as a resident?`,
      button: "Approve Request",
    },
    REJECT: {
      title: "Reject Join Request",
      description: `Are you sure you want to reject ${
        request.user?.fullName ?? "this applicant"
      }'s join request?`,
      button: "Reject Request",
    },
    MOVE_OUT: {
      title: "Move Out Resident",
      description: `Mark ${
        request.user?.fullName ?? "this resident"
      } as moved out? Their apartment will become available for a new join request.`,
      button: "Confirm Move Out",
    },
  };

  const openConfirmation = (action: RequestActionType, close: () => void) => {
    close();
    setActionType(action);
    setConfirmOpen(true);
  };

  const confirm = async () => {
    if (!actionType) return;

    try {
      if (actionType === "APPROVE") {
        await approve();
      } else if (actionType === "REJECT") {
        await reject();
      } else {
        await moveOut();
      }

      setConfirmOpen(false);
      setActionType(null);
    } catch {
      // Keep the confirmation open if the request fails.
      // The API manager handles error notifications.
    }
  };

  return (
    <>
      <RowActionsMenu
        label="Request actions"
        triggerIcon={
          <img src="/assets/ellipsis.svg" alt="" width={18} height={18} />
        }
      >
        {(close) => (
          <>
            {isPending && (
              <>
                <RowAction onClick={() => openConfirmation("APPROVE", close)}>
                  <Check className="h-4 w-4 text-green-600" />
                  Approve
                </RowAction>

                <RowAction
                  danger
                  onClick={() => openConfirmation("REJECT", close)}
                >
                  <X className="h-4 w-4" />
                  Reject
                </RowAction>
              </>
            )}

            {isApproved && (
              <RowAction
                danger
                onClick={() => openConfirmation("MOVE_OUT", close)}
              >
                <LogOut className="h-4 w-4" />
                Move Out
              </RowAction>
            )}

            <RowAction
              onClick={() => {
                close();
                onView(request);
              }}
            >
              <Eye className="h-4 w-4" />
              View Details
            </RowAction>
          </>
        )}
      </RowActionsMenu>

      <Modal
        isOpen={confirmOpen}
        onClose={() => {
          if (!isSubmitting) {
            setConfirmOpen(false);
            setActionType(null);
          }
        }}
        title={actionType ? actionDetails[actionType].title : "Confirm Action"}
        size="sm"
      >
        <p className="text-sm text-muted-foreground">
          {actionType ? actionDetails[actionType].description : ""}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => {
              setConfirmOpen(false);
              setActionType(null);
            }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            isLoading={isSubmitting}
            disabled={!actionType || isSubmitting}
            variant={
              actionType === "REJECT" || actionType === "MOVE_OUT"
                ? "outline"
                : "primary"
            }
            onClick={confirm}
          >
            {actionType ? actionDetails[actionType].button : "Confirm"}
          </Button>
        </div>
      </Modal>
    </>
  );
};

const JoinRequests = () => {
  const { estateCode = "" } = useParams();

  const { items, pagination, isLoading, isError } = useGetEstateJoinRequests();

  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<EstateJoinRequest | null>(null);

  const term = search.trim().toLowerCase();

  const visible = items.filter(
    (request) =>
      request.user?.fullName?.toLowerCase().includes(term) ||
      request.user?.email?.toLowerCase().includes(term) ||
      request.status.toLowerCase().includes(term)
  );

  return (
    <div
      className="space-y-5 px-1 pb-8"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to={estatePath(estateCode, "/members")}
            className="mb-2 block text-sm text-muted-foreground hover:text-foreground"
          >
            ← Members
          </Link>

          <h2 className="text-base font-medium text-foreground">
            Estate Join Requests
          </h2>
        </div>

        <span className="text-sm text-muted-foreground">
          {pagination
            ? `${items.length} of ${pagination.totalItems} requests`
            : `${items.length} requests`}
        </span>
      </div>

      {pagination && pagination.totalItems > items.length && (
        <p className="text-sm text-muted-foreground">
          The API returned one batch. More requests may require pagination
          support.
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
              {isLoading && (
                <tr>
                  <td colSpan={8} className="p-6 text-center">
                    Loading requests...
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-destructive">
                    Could not load join requests.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && visible.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-6 text-center text-muted-foreground"
                  >
                    No join requests found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                visible.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="p-3">
                      <div className="font-medium">
                        {request.user?.fullName ?? "—"}
                      </div>

                      <div className="text-muted-foreground">
                        {request.user?.email ?? "—"}
                      </div>
                    </td>

                    <td className="p-3">{request.user?.phoneNumber ?? "—"}</td>

                    <td className="max-w-[220px] break-words p-3">
                      {request.user?.address || "—"}
                    </td>

                    <td className="p-3">{requestDate(request.createdAt)}</td>

                    <td className="p-3">{request.status.replace(/_/g, " ")}</td>

                    <td className="p-3">
                      {request.reviewedAt
                        ? requestDate(request.reviewedAt)
                        : "—"}
                    </td>

                    <td className="max-w-[200px] break-words p-3">
                      {request.notes || "—"}
                    </td>

                    <td className="p-3">
                      <RequestAction
                        request={request}
                        onView={setSelectedRequest}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Join Request Modal */}
      <ViewJoinRequestModal
        isOpen={!!selectedRequest}
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
};

export default JoinRequests;
