import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import { CardContent } from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import RowActionsMenu, { RowAction } from "@/components/ui/RowActionsMenu";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  type Member,
  type MemberRelation,
  useGetMembers,
  useRemoveEstateMember,
  useRestoreEstateMember,
  useSuspendEstateMember,
  useUnsuspendEstateMember,
} from "@/api/api_controllers/members";

const relationName = (
  relation: MemberRelation | MemberRelation[] | null | undefined
) => {
  const values = Array.isArray(relation)
    ? relation
    : relation
    ? [relation]
    : [];
  const names = values
    .map((value) => (typeof value === "string" ? value : value.name))
    .filter(Boolean);
  return names.length ? names.join(", ") : "—";
};

type ActionStatus = {
  phase: "pending" | "success" | "error";
  message: string;
};

const backendStatus = (member: Member): ActionStatus => {
  if (member.isRemoved || member.removed)
    return { phase: "error", message: "Removed" };
  if (
    member.isSuspended ||
    member.suspended ||
    member.status?.toLowerCase() === "suspended"
  ) {
    return { phase: "error", message: "Suspended" };
  }
  return { phase: "success", message: member.status ?? "Active" };
};

/** Each menu uses the row's member.id for all membership-state requests. */
const MemberActions = ({
  memberId,
  onStatusChange,
}: {
  memberId: string;
  onStatusChange: (memberId: string, status: ActionStatus) => void;
}) => {
  const remove = useRemoveEstateMember(memberId);
  const restore = useRestoreEstateMember(memberId);
  const suspend = useSuspendEstateMember(memberId);
  const unsuspend = useUnsuspendEstateMember(memberId);
  const isBusy =
    remove.isLoading ||
    restore.isLoading ||
    suspend.isLoading ||
    unsuspend.isLoading;

  const run = async (
    action: () => Promise<unknown>,
    label: string,
    successLabel: string,
    close: () => void,
    confirm = false
  ) => {
    if (confirm && !window.confirm(`${label} this member?`)) return;
    close();
    onStatusChange(memberId, { phase: "pending", message: label });
    try {
      await action();
      onStatusChange(memberId, { phase: "success", message: successLabel });
    } catch (error) {
      onStatusChange(memberId, {
        phase: "error",
        message: error instanceof Error ? error.message : "Action failed",
      });
    }
  };

  return (
    <RowActionsMenu
      label="Member actions"
      triggerIcon={
        <img src="/assets/ellipsis.svg" alt="" width={18} height={18} />
      }
    >
      {(close) => (
        <>
          <RowAction
            disabled={isBusy}
            onClick={() =>
              run(
                suspend.suspendEstateMember,
                "Suspending",
                "Suspended",
                close,
                true
              )
            }
          >
            <img src="/assets/edit.svg" alt="" width={16} height={16} />
            {suspend.isLoading ? "Suspending..." : "Suspend"}
          </RowAction>
          <RowAction
            disabled={isBusy}
            onClick={() =>
              run(
                unsuspend.unsuspendEstateMember,
                "Unsuspending",
                "Active",
                close
              )
            }
          >
            <img src="/assets/edit.svg" alt="" width={16} height={16} />
            {unsuspend.isLoading ? "Unsuspending..." : "Unsuspend"}
          </RowAction>
          <RowAction
            disabled={isBusy}
            onClick={() =>
              run(restore.restoreEstateMember, "Restoring", "Active", close)
            }
          >
            <img src="/assets/view.svg" alt="" width={16} height={16} />
            {restore.isLoading ? "Restoring..." : "Restore"}
          </RowAction>
          <RowAction
            danger
            disabled={isBusy}
            onClick={() =>
              run(remove.removeEstateMember, "Removing", "Removed", close, true)
            }
          >
            <img src="/assets/delete.svg" alt="" width={16} height={16} />
            {remove.isLoading ? "Removing..." : "Remove"}
          </RowAction>
        </>
      )}
    </RowActionsMenu>
  );
};

const Members = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([
    "Member Name",
    "Phone Number",
    "Address",
    "Property",
    "Unit",
    "Status",
    "Actions",
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [memberStatuses, setMemberStatuses] = useState<
    Record<string, ActionStatus>
  >({});
  const { data, isLoading, isError } = useGetMembers({
    page: currentPage,
    perPage: pageSize,
    search: searchQuery,
  });

  const currentMembers = data?.data ?? [];

  const columns = [
    { id: "Member Name", label: "Member Name" },
    { id: "Phone Number", label: "Phone Number" },
    { id: "Address", label: "Address" },
    { id: "Property", label: "Property" },
    { id: "Unit", label: "Unit" },
    { id: "Status", label: "Status" },
    { id: "Actions", label: "Actions" },
  ];

  const totalPages = Math.max(1, data?.meta?.totalPages ?? 1);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".column-menu-container") &&
        !target.closest(".export-menu-container")
      ) {
        setShowColumnMenu(false);
        setShowExportMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="space-y-5 px-1 pb-8"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2
          className="text-[16px] font-display font-medium text-foreground"
          style={{ fontFamily: "Poppins", fontWeight: 500, color: "#4c4c4c" }}
        >
          Members List
        </h2>
        <Button variant="outline" onClick={() => navigate("join-requests")}>
          Join Requests
        </Button>
      </div>

      <Card
        className="overflow-visible border-[#eaeaea] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
        style={{ borderRadius: "10px" }}
      >
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 px-6 pt-6">
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={
                <img src="/assets/search.svg" alt="" width={18} height={18} />
              }
              className="h-11 w-[226px] border-[#eaeaea] bg-white text-sm placeholder:text-[#a1a1a1]"
            />

            {/* Column Visibility Dropdown */}
            <div className="relative column-menu-container">
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg bg-card hover:bg-muted transition-colors"
                style={{
                  fontFamily: "Poppins",
                  borderRadius: "8px",
                  borderColor: "#e3e3e3",
                }}
              >
                Column Visibility
                <ChevronDown className="w-4 h-4" />
              </button>
              {showColumnMenu && (
                <div
                  className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg p-2 z-10"
                  style={{ borderColor: "#e3e3e3", borderRadius: "8px" }}
                >
                  {columns.map((col) => (
                    <label
                      key={col.id}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-muted rounded"
                      style={{ fontFamily: "Poppins" }}
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setVisibleColumns([...visibleColumns, col.id]);
                          } else {
                            setVisibleColumns(
                              visibleColumns.filter((c) => c !== col.id)
                            );
                          }
                        }}
                        className="rounded border-gray-300"
                        style={{ accentColor: "#f30100" }}
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Export Dropdown */}
            <div className="relative export-menu-container">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg bg-card hover:bg-muted transition-colors"
                style={{
                  fontFamily: "Poppins",
                  borderRadius: "8px",
                  borderColor: "#e3e3e3",
                }}
              >
                Export
                <ChevronDown className="w-4 h-4" />
              </button>
              {showExportMenu && (
                <div
                  className="absolute top-full left-0 mt-1 w-32 bg-card border border-border rounded-lg shadow-lg p-1 z-10"
                  style={{ borderColor: "#e3e3e3", borderRadius: "8px" }}
                >
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded"
                    style={{ fontFamily: "Poppins" }}
                  >
                    Excel
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded"
                    style={{ fontFamily: "Poppins" }}
                  >
                    PDF
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded"
                    style={{ fontFamily: "Poppins" }}
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 border-y border-[#eaeaea]">
            <Table className="min-w-[940px]">
              <TableHeader>
                <TableRow>
                  {columns
                    .filter((col) => visibleColumns.includes(col.id))
                    .map((col) => (
                      <TableHead
                        key={col.id}
                        className="h-11 px-6 text-sm font-semibold text-[#4c4c4c]"
                      >
                        {col.label}
                      </TableHead>
                    ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(isLoading || isError || currentMembers.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="py-12 text-center text-[#727272]"
                    >
                      {isLoading
                        ? "Loading members..."
                        : isError
                        ? "Could not load members."
                        : "No members found."}
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  currentMembers.map((member) => (
                    <TableRow
                      key={member.id}
                      className="h-16 hover:bg-transparent"
                    >
                      {visibleColumns.includes("Member Name") && (
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                              {(member.firstName ?? member.name ?? "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            {member.name ??
                              (`${member.firstName ?? ""} ${
                                member.lastName ?? ""
                              }`.trim() ||
                                "—")}
                          </div>
                        </TableCell>
                      )}
                      {visibleColumns.includes("Phone Number") && (
                        <TableCell className="px-6 text-[#5f5f5f]">
                          {member.phoneNumber ?? member.phone ?? "—"}
                        </TableCell>
                      )}
                      {visibleColumns.includes("Address") && (
                        <TableCell className="px-6 text-[#5f5f5f]">
                          {member.streetAddress ?? "—"}
                        </TableCell>
                      )}
                      {visibleColumns.includes("Property") && (
                        <TableCell className="px-6 text-[#5f5f5f]">
                          {relationName(member.properties)}
                        </TableCell>
                      )}
                      {visibleColumns.includes("Unit") && (
                        <TableCell className="px-6 text-[#5f5f5f]">
                          {relationName(member.units)}
                        </TableCell>
                      )}
                      {visibleColumns.includes("Status") &&
                        (() => {
                          const status =
                            memberStatuses[member.id] ?? backendStatus(member);
                          return (
                            <TableCell className="px-6">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                  status.phase === "pending"
                                    ? "bg-blue-50 text-blue-700"
                                    : status.phase === "error"
                                    ? "bg-red-50 text-red-600"
                                    : "bg-green-50 text-green-700"
                                }`}
                              >
                                {status.message}
                              </span>
                            </TableCell>
                          );
                        })()}
                      {visibleColumns.includes("Actions") && (
                        <TableCell className="px-6">
                          <MemberActions
                            memberId={member.id}
                            onStatusChange={(id, status) =>
                              setMemberStatuses((current) => ({
                                ...current,
                                [id]: status,
                              }))
                            }
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-sm text-muted-foreground"
            style={{ fontFamily: "Poppins" }}
          >
            Show
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 text-sm border border-border rounded bg-card"
            style={{
              fontFamily: "Poppins",
              borderRadius: "6px",
              borderColor: "#e3e3e3",
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span
            className="text-sm text-muted-foreground"
            style={{ fontFamily: "Poppins" }}
          >
            entries per page
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50"
            style={{
              fontFamily: "Poppins",
              borderRadius: "6px",
              borderColor: "#e3e3e3",
            }}
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50"
            style={{
              fontFamily: "Poppins",
              borderRadius: "6px",
              borderColor: "#e3e3e3",
            }}
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted"
                style={{
                  fontFamily: "Poppins",
                  borderRadius: "6px",
                  borderColor: "#e3e3e3",
                  backgroundColor:
                    currentPage === pageNum ? "#f30100" : "white",
                  color: currentPage === pageNum ? "white" : "inherit",
                }}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50"
            style={{
              fontFamily: "Poppins",
              borderRadius: "6px",
              borderColor: "#e3e3e3",
            }}
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50"
            style={{
              fontFamily: "Poppins",
              borderRadius: "6px",
              borderColor: "#e3e3e3",
            }}
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

export default Members;
