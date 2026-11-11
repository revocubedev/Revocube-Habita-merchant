import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Search,
  FileSpreadsheet,
  ChevronDown,
  Eye,
  RefreshCw,
} from "lucide-react";
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
import { useGetGuests } from "@/api/api_controllers/guests";
import {
  combine,
  formatDate,
  prettyStatus,
  getStatusBadgeStyle,
} from "@/lib/guestUtils";
import UpdateGuestStatusModal from "@/components/portal/UpdateGuestStatusModal";
import ViewGuestModal from "@/components/portal/ViewGuestModal";

interface Guest {
  id: string;
  code: string;
  visitor: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
}

const toGuest = (g: any): Guest => ({
  id: String(g.id),
  code: g.guestCode ?? "—",
  visitor: g.fullName ?? "—",
  checkIn: combine(g.checkInDate, g.checkInTime),
  checkOut: combine(g.checkOutDate, g.checkOutTime),
  status: g.status ?? "",
});

const extractGuests = (payload: any): any[] =>
  Array.isArray(payload?.data) ? payload.data : [];

const columns = [
  { id: "Code", label: "Code" },
  { id: "Visitor", label: "Visitor" },
  { id: "Check In", label: "Check In" },
  { id: "Check Out", label: "Check Out" },
  { id: "Status", label: "Status" },
];

const GuestVerification = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map((c) => c.id)
  );
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewingGuest, setViewingGuest] = useState<Guest | null>(null);
  const [updatingGuest, setUpdatingGuest] = useState<Guest | null>(null);

  const {
    guests: data,
    isLoading,
    isError,
  } = useGetGuests({
    page: currentPage,
    perPage: pageSize,
    enabled: true,
  });

  const guests: Guest[] = extractGuests(data).map(toGuest);
  const total: number | null = data?.meta?.totalItems ?? null;
  const totalPages: number | null =
    data?.meta?.totalPages ??
    (total !== null ? Math.max(1, Math.ceil(total / pageSize)) : null);
  const hasNext =
    totalPages !== null ? currentPage < totalPages : guests.length === pageSize;

  const statuses = ["All", ...Array.from(new Set(guests.map((g) => g.status)))];

  // Search and status filter apply to the rows on the current page
  const query = searchQuery.trim().toLowerCase();
  const filtered = guests
    .filter(
      (g) =>
        !query ||
        g.visitor.toLowerCase().includes(query) ||
        g.code.toLowerCase().includes(query)
    )
    .filter((g) => statusFilter === "All" || g.status === statusFilter);

  const pageNumbers = (() => {
    if (totalPages === null) return [currentPage];
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

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

  const exportRows = () => [
    ["Code", "Visitor", "Check In", "Check Out", "Status"],
    ...filtered.map((g) => [
      g.code,
      g.visitor,
      formatDate(g.checkIn),
      formatDate(g.checkOut),
      prettyStatus(g.status),
    ]),
  ];

  const exportCsv = () => {
    const csv = exportRows()
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "guests.csv";
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const copyRows = async () => {
    await navigator.clipboard.writeText(
      exportRows()
        .map((r) => r.join("\t"))
        .join("\n")
    );
    toast.success("Copied to clipboard");
    setShowExportMenu(false);
  };

  const shownColumns = columns.filter((c) => visibleColumns.includes(c.id));
  const colSpan = shownColumns.length + 1; // + actions column

  const pageBtn =
    "px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50";
  const pageBtnStyle = {
    fontFamily: "Poppins",
    borderRadius: "6px",
    borderColor: "#e3e3e3",
  };

  return (
    <div className="space-y-4">
      <div
        className="flex items-center gap-2 text-sm"
        style={{ fontFamily: "Poppins" }}
      >
        <span className="text-muted-foreground">Visitors</span>
        <span className="text-muted-foreground">›</span>
        <span
          className="text-brand-text font-medium"
          style={{ color: "#f30100" }}
        >
          Guests Verification
        </span>
      </div>

      <h2
        className="text-[16px] font-display font-medium text-foreground"
        style={{ fontFamily: "Poppins", fontWeight: 500, color: "#4c4c4c" }}
      >
        Visitor List
      </h2>

      <Card
        className="bg-card border border-border"
        style={{
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 max-w-sm relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search by name or code..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-background text-sm border border-border focus:outline-none focus:ring-2 focus:ring-brand-text/20 transition-colors"
                style={{ fontFamily: "Poppins", borderColor: "#e3e3e3" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative column-menu-container">
              <button
                onClick={() => {
                  setShowColumnMenu(!showColumnMenu);
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg bg-card hover:bg-muted transition-colors"
                style={{
                  fontFamily: "Poppins",
                  borderRadius: "8px",
                  borderColor: "#e3e3e3",
                }}
              >
                <FileSpreadsheet className="w-4 h-4" />
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
                        onChange={(e) =>
                          setVisibleColumns(
                            e.target.checked
                              ? [...visibleColumns, col.id]
                              : visibleColumns.filter((c) => c !== col.id)
                          )
                        }
                        className="rounded border-gray-300"
                        style={{ accentColor: "#f30100" }}
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-border rounded-lg bg-card hover:bg-muted transition-colors"
                style={{
                  fontFamily: "Poppins",
                  borderRadius: "8px",
                  borderColor: "#e3e3e3",
                }}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All" : prettyStatus(s)}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative export-menu-container">
              <button
                onClick={() => {
                  setShowExportMenu(!showExportMenu);
                  setShowColumnMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg bg-card hover:bg-muted transition-colors"
                style={{
                  fontFamily: "Poppins",
                  borderRadius: "8px",
                  borderColor: "#f30100",
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
                    onClick={exportCsv}
                    disabled={filtered.length === 0}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded disabled:opacity-50"
                    style={{ fontFamily: "Poppins" }}
                  >
                    CSV
                  </button>
                  <button
                    onClick={copyRows}
                    disabled={filtered.length === 0}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded disabled:opacity-50"
                    style={{ fontFamily: "Poppins" }}
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                {shownColumns.map((col) => (
                  <TableHead key={col.id} className="text-sm font-medium">
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="text-right text-sm font-medium">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={colSpan}
                    className="text-center text-sm text-muted-foreground py-8"
                  >
                    Loading guests...
                  </TableCell>
                </TableRow>
              )}

              {isError && (
                <TableRow>
                  <TableCell
                    colSpan={colSpan}
                    className="text-center text-sm py-8"
                    style={{ color: "#f30100" }}
                  >
                    Failed to load guests
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={colSpan}
                    className="text-center text-sm text-muted-foreground py-8"
                  >
                    {query || statusFilter !== "All"
                      ? "No guests match your filters."
                      : "No guests yet."}
                  </TableCell>
                </TableRow>
              )}

              {filtered.map((guest) => (
                <TableRow key={guest.id}>
                  {visibleColumns.includes("Code") && (
                    <TableCell className="font-medium">{guest.code}</TableCell>
                  )}
                  {visibleColumns.includes("Visitor") && (
                    <TableCell className="text-muted-foreground">
                      {guest.visitor}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Check In") && (
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDate(guest.checkIn)}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Check Out") && (
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDate(guest.checkOut)}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Status") && (
                    <TableCell>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          fontFamily: "Poppins",
                          ...getStatusBadgeStyle(guest.status),
                        }}
                      >
                        {guest.status ? prettyStatus(guest.status) : "—"}
                      </span>
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <RowActionsMenu>
                      {(close) => (
                        <>
                          <RowAction
                            onClick={() => {
                              close();
                              setViewingGuest(guest);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            View details
                          </RowAction>
                          <RowAction
                            onClick={() => {
                              close();
                              setUpdatingGuest(guest);
                            }}
                          >
                            <RefreshCw className="w-4 h-4" />
                            Update status
                          </RowAction>
                        </>
                      )}
                    </RowActionsMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
            className={pageBtn}
            style={pageBtnStyle}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            First
          </button>
          <button
            className={pageBtn}
            style={pageBtnStyle}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          {pageNumbers.map((n) => (
            <button
              key={n}
              onClick={() => setCurrentPage(n)}
              className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted"
              style={
                n === currentPage
                  ? {
                      ...pageBtnStyle,
                      backgroundColor: "#f30100",
                      borderColor: "#f30100",
                      color: "white",
                    }
                  : pageBtnStyle
              }
            >
              {n}
            </button>
          ))}
          <button
            className={pageBtn}
            style={pageBtnStyle}
            disabled={!hasNext}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
          {totalPages !== null && (
            <button
              className={pageBtn}
              style={pageBtnStyle}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              Last
            </button>
          )}
        </div>
      </div>

      {viewingGuest && (
        <ViewGuestModal
          key={viewingGuest.id}
          isOpen
          onClose={() => setViewingGuest(null)}
          guestId={viewingGuest.id}
        />
      )}

      {updatingGuest && (
        <UpdateGuestStatusModal
          key={updatingGuest.id}
          isOpen
          onClose={() => setUpdatingGuest(null)}
          guest={{
            code: updatingGuest.code,
            visitor: updatingGuest.visitor,
            status: updatingGuest.status,
          }}
        />
      )}
    </div>
  );
};

export default GuestVerification;
