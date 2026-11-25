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
import * as XLSX from "xlsx";
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
import ViewMemberModal from "@/components/portal/ViewMemberModal";

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
  onView,
}: {
  memberId: string;
  onStatusChange: (memberId: string, status: ActionStatus) => void;
  onView: () => void;
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
            onClick={() => {
              close();
              onView();
            }}
          >
            <img src="/assets/view.svg" alt="" width={16} height={16} />
            View
          </RowAction>

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
    "joined Date",
    "Property",
    "Unit",
    "Status",
    "Actions",
  ]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
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
    { id: "Joined Date", label: "JoinedAt" },
    { id: "Property", label: "Property" },
    { id: "Unit", label: "Unit" },
    { id: "Status", label: "Status" },
    { id: "Actions", label: "Actions" },
  ];

  const totalPages = Math.max(1, data?.meta?.totalPages ?? 1);


  // Only export visible data columns. Actions is not an exportable data field.
  const exportColumns = columns.filter(
    (col) => visibleColumns.includes(col.id) && col.id !== "Actions"
  );

  // Get the value for each member column.
  const getMemberCellValue = (member: Member, column: string): string => {
    switch (column) {
      case "Member Name":
        return (
          (member.name ??
            `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() ??
            "—") ||
          "—"
        );

      case "Phone Number":
        return member.phoneNumber ?? member.phone ?? "—";

      case "Address":
        return member.streetAddress ?? "—";

      case "Joined Date":
        return member.joinedAt
          ? new Date(member.joinedAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—";

      case "Property":
        return relationName(member.properties);

      case "Unit":
        return relationName(member.units);

      case "Status":
        return (
          memberStatuses[member.id]?.message ?? backendStatus(member).message
        );

      default:
        return "—";
    }
  };

  // Export members to Excel.
  const exportExcel = () => {
    if (!currentMembers.length) {
      alert("There are no members to export.");
      return;
    }

    const headers = exportColumns.map((col) => col.label);

    const rows = currentMembers.map((member) =>
      exportColumns.map((col) => getMemberCellValue(member, col.id))
    );

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");

    XLSX.writeFile(workbook, "Members.xlsx");

    setShowExportMenu(false);
  };

  // Export members to PDF using the browser's print dialog.
  const exportPDF = () => {
    if (!currentMembers.length) {
      alert("There are no members to export.");
      return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to export the PDF.");
      return;
    }

    const escapeHTML = (value: string) =>
      value.replace(/[&<>"']/g, (char) => {
        const entities: Record<string, string> = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };

        return entities[char];
      });

    const headers = exportColumns
      .map((col) => `<th>${escapeHTML(col.label)}</th>`)
      .join("");

    const rows = currentMembers
      .map((member) => {
        const cells = exportColumns
          .map(
            (col) =>
              `<td>${escapeHTML(
                getMemberCellValue(member, col.id)
              )}</td>`
          )
          .join("");

        return `<tr>${cells}</tr>`;
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Members Report</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #393939;
            }

            h1 {
              font-size: 22px;
              margin-bottom: 8px;
            }

            p {
              color: #727272;
              font-size: 12px;
              margin-bottom: 24px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }

            th, td {
              border: 1px solid #e3e3e3;
              padding: 10px;
              text-align: left;
            }

            th {
              background: #f5f5f5;
              font-weight: bold;
            }

            tr {
              page-break-inside: avoid;
            }

            @media print {
              body {
                padding: 0;
              }

              @page {
                size: landscape;
                margin: 15mm;
              }
            }
          </style>
        </head>

        <body>
          <h1>Members Report</h1>

          <p>
            Generated: ${new Date().toLocaleString()} |
            Total records: ${currentMembers.length}
          </p>

          <table>
            <thead>
              <tr>${headers}</tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };

    setShowExportMenu(false);
  };

  // Copy members to clipboard.
  const copyMembers = async () => {
    if (!currentMembers.length) {
      alert("There are no members to copy.");
      return;
    }

    const headers = exportColumns.map((col) => col.label).join("\t");

    const rows = currentMembers.map((member) =>
      exportColumns
        .map((col) => getMemberCellValue(member, col.id))
        .join("\t")
    );

    const textToCopy = [headers, ...rows].join("\n");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement("textarea");

        textarea.value = textToCopy;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.select();

        const copied = document.execCommand("copy");

        textarea.remove();

        if (!copied) {
          throw new Error("Copy failed");
        }
      }

      alert("Members copied successfully!");
    } catch (error) {
      console.error("Copy error:", error);
      alert("Unable to copy members. Please try again.");
    }

    setShowExportMenu(false);
  };

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
          <div className="mb-6 flex flex-wrap items-center gap-3 px-6 pt-6">
            {/* Search */}
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
                type="button"
                onClick={() => {
                  setShowColumnMenu((value) => !value);
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted"
                style={{
                  fontFamily: "Poppins",
                  borderRadius: "8px",
                  borderColor: "#e3e3e3",
                }}
              >
                Column Visibility
                <ChevronDown className="h-4 w-4" />
              </button>

              {showColumnMenu && (
                <div
                  className="absolute left-0 top-full z-30 mt-1 w-48 rounded-lg border border-border bg-white p-2 shadow-lg"
                  style={{ borderColor: "#e3e3e3", borderRadius: "8px" }}
                >
                  {columns.map((col) => (
                    <label
                      key={col.id}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                      style={{ fontFamily: "Poppins" }}
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setVisibleColumns((previous) => [
                              ...previous,
                              col.id,
                            ]);
                          } else {
                            setVisibleColumns((previous) =>
                              previous.filter((item) => item !== col.id)
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
                type="button"
                onClick={() => {
                  setShowExportMenu((value) => !value);
                  setShowColumnMenu(false);
                }}
                disabled={currentMembers.length === 0 || isLoading}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  fontFamily: "Poppins",
                  borderRadius: "8px",
                  borderColor: "#e3e3e3",
                }}
              >
                Export
                <ChevronDown className="h-4 w-4" />
              </button>

              {showExportMenu && (
                <div
                  className="absolute left-0 top-full z-30 mt-1 w-36 rounded-lg border border-border bg-white p-1 shadow-lg"
                  style={{ borderColor: "#e3e3e3", borderRadius: "8px" }}
                >
                  <button
                    type="button"
                    onClick={exportExcel}
                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted"
                    style={{ fontFamily: "Poppins" }}
                  >
                    Excel
                  </button>

                  <button
                    type="button"
                    onClick={exportPDF}
                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted"
                    style={{ fontFamily: "Poppins" }}
                  >
                    PDF
                  </button>

                  <button
                    type="button"
                    onClick={copyMembers}
                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted"
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
                      {visibleColumns.includes("Joined Date") && (
                        <TableCell className="px-6 text-[#5f5f5f]">
                          {member.joinedAt
                            ? new Date(member.joinedAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
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
                            onView={() => setSelectedMemberId(member.id)}
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
          <ViewMemberModal
            isOpen={!!selectedMemberId}
            memberId={selectedMemberId}
            onClose={() => setSelectedMemberId(null)}
          />
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
