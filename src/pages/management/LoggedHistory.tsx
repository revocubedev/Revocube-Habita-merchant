import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileSearch,
} from "lucide-react";
import Card, { CardContent } from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  useGetAuditLogs,
  extractAuditLogs,
  extractTotal,
  type AuditLog,
} from "@/api/api_controllers/userController";

const PER_PAGE_OPTIONS = [10, 25, 50];

const columns = [
  { id: "Email", label: "Email" },
  { id: "Date", label: "Date" },
  { id: "IP Address", label: "IP Address" },
  { id: "Action", label: "Action" },
  { id: "Status", label: "Status" },
  { id: "Time Taken", label: "Time Taken" },
];

const formatDate = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime())
    ? value
    : d.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const logDate = (log: AuditLog) => log.timestamp ?? log.createdAt;

const StatusBadge = ({ code }: { code?: number }) => {
  if (code === undefined) return <>—</>;
  const ok = code >= 200 && code < 400;
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      }`}
    >
      {code}
    </span>
  );
};

const LoggedHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([
    "Email",
    "Date",
    "IP Address",
    "Action",
    "Status",
  ]);

  const { data, isLoading, isError, error } = useGetAuditLogs({
    page: currentPage,
    perPage,
  });

  const logs = extractAuditLogs(data);
  const total = extractTotal(data);
  const totalPages =
    total !== null ? Math.max(1, Math.ceil(total / perPage)) : null;
  const hasNext =
    totalPages !== null ? currentPage < totalPages : logs.length === perPage;

  // Search filters the rows on the current page (by email, action or IP)
  const query = searchQuery.trim().toLowerCase();
  const filtered = query
    ? logs.filter((l) =>
        [l.email, l.action, l.ipAddress].some((v) =>
          (v ?? "").toLowerCase().includes(query)
        )
      )
    : logs;

  const pageNumbers = (() => {
    if (totalPages === null) return [currentPage];
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  const exportRows = () => [
    ["Email", "Date", "IP Address", "Action", "Status", "Time Taken (ms)"],
    ...filtered.map((l) => [
      l.email ?? "",
      formatDate(logDate(l)),
      l.ipAddress ?? "",
      l.action ?? "",
      l.statusCode ?? "",
      l.timeElapsed ?? "",
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
    a.download = "logged-history.csv";
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
  const colSpan = Math.max(shownColumns.length, 1);

  const pageBtn =
    "px-3 py-1.5 text-xs border border-border rounded bg-card hover:bg-muted disabled:opacity-50 disabled:hover:bg-card";
  const pageBtnStyle = {
    fontFamily: "Poppins",
    borderRadius: "6px",
    borderColor: "#e3e3e3",
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div
        className="flex items-center gap-2 text-sm"
        style={{ fontFamily: "Poppins" }}
      >
        <Link to="/users" className="text-muted-foreground hover:underline">
          Management
        </Link>
        <span className="text-muted-foreground">{">"}</span>
        <span className="font-medium" style={{ color: "#f30100" }}>
          Logged History
        </span>
      </div>

      <h1
        className="text-xl font-display font-semibold text-foreground"
        style={{ fontFamily: "Poppins", fontWeight: 600, color: "#393939" }}
      >
        Logged History
      </h1>

      <Card
        className="bg-card border border-border"
        style={{
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <CardContent className="p-0">
          {/* Toolbar */}
          <div className="flex items-center gap-3 p-6">
            <div className="flex-1 max-w-[226px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search by email..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-brand-text/20 transition-colors"
                style={{ fontFamily: "Poppins", borderColor: "#e3e3e3" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative">
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
                        style={{ accentColor: "#f30100" }}
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowExportMenu(!showExportMenu);
                  setShowColumnMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg bg-card hover:bg-muted transition-colors"
                style={{
                  fontFamily: "Poppins",
                  borderRadius: "8px",
                  borderColor: "#f30100",
                  color: "#4c4c4c",
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

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                {shownColumns.map((col) => (
                  <TableHead key={col.id} className="text-sm font-medium">
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={colSpan}
                    className="text-center text-sm text-muted-foreground py-12"
                  >
                    Loading logs...
                  </TableCell>
                </TableRow>
              )}

              {isError && (
                <TableRow>
                  <TableCell
                    colSpan={colSpan}
                    className="text-center text-sm py-12"
                    style={{ color: "#f30100" }}
                  >
                    {(error as Error)?.message || "Failed to load logs"}
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={colSpan} className="py-16">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <FileSearch className="w-12 h-12" />
                      <span
                        className="text-sm"
                        style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
                      >
                        {query
                          ? "No logs match your search"
                          : "No data available in this table"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {filtered.map((log) => (
                <TableRow key={log.id}>
                  {visibleColumns.includes("Email") && (
                    <TableCell className="font-medium">
                      {log.email ?? "—"}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Date") && (
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDate(logDate(log))}
                    </TableCell>
                  )}
                  {visibleColumns.includes("IP Address") && (
                    <TableCell className="text-muted-foreground">
                      {log.ipAddress ?? "—"}
                    </TableCell>
                  )}
                  {visibleColumns.includes("Action") && (
                    <TableCell>{log.action ?? "—"}</TableCell>
                  )}
                  {visibleColumns.includes("Status") && (
                    <TableCell>
                      <StatusBadge code={log.statusCode} />
                    </TableCell>
                  )}
                  {visibleColumns.includes("Time Taken") && (
                    <TableCell className="text-muted-foreground">
                      {log.timeElapsed !== undefined
                        ? `${log.timeElapsed} ms`
                        : "—"}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 text-sm text-muted-foreground"
          style={{ fontFamily: "Poppins" }}
        >
          Show
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 text-sm border border-border rounded bg-card"
            style={{ borderColor: "#e3e3e3", borderRadius: "6px" }}
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          entries per page
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
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {pageNumbers.map((n) => (
            <button
              key={n}
              onClick={() => setCurrentPage(n)}
              className="px-3 py-1.5 text-xs border border-border rounded bg-card hover:bg-muted"
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
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
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
    </div>
  );
};

export default LoggedHistory;
