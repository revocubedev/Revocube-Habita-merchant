import { useState, useEffect } from "react";
import {
  Search,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  Ban,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import RowActionsMenu, { RowAction } from "@/components/ui/RowActionsMenu";
import DeleteModal from "@/components/ui/DeleteModal";
import UserModal, { type UserRecord } from "@/components/portal/UserModal";
import {
  // USERS_ENDPOINT,
  useGetUsers,
  extractUsers,
  extractTotal,
} from "@/api/api_controllers/userController";
import ViewUserModal from "@/components/portal/ViewUserModal";
import SuspendUserModal from "@/components/portal/SuspendUserModal";

const PER_PAGE = 10;

const displayName = (u: UserRecord) =>
  [u.firstName, u.lastName].filter(Boolean).join(" ") || u.name || "—";

const displayRole = (u: UserRecord) =>
  typeof u.role === "string" ? u.role : u.role?.name ?? "—";

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserRecord | null>(null);
  const [suspendingUser, setSuspendingUser] = useState<UserRecord | null>(null);
  const [visibleColumns, setVisibleColumns] = useState([
    
    "User",
    "Email",
    "Phone Number",
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);

  // Wait for typing to pause, then search from page 1
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data, isLoading, isError, error } = useGetUsers({
    page: currentPage,
    perPage: PER_PAGE,
    search: debouncedSearch,
  });

  const users: UserRecord[] = extractUsers(data);
  const total = extractTotal(data);
  const totalPages =
    total !== null ? Math.max(1, Math.ceil(total / PER_PAGE)) : null;
  const hasNext =
    totalPages !== null ? currentPage < totalPages : users.length === PER_PAGE;

  const rangeStart = users.length === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1;
  const rangeEnd = (currentPage - 1) * PER_PAGE + users.length;

  // Up to 5 page buttons centred on the current page
  const pageNumbers = (() => {
    if (totalPages === null) return [currentPage];
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  const columns = [
    { id: "User", label: "User" },
    { id: "Email", label: "Email" },
    { id: "Phone Number", label: "Phone Number" },
    { id: "Assign Role", label: "Assign Role" },
    { id: "Actions", label: "Actions" },
  ];

  const pageBtn =
    "px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50";
  const pageBtnStyle = {
    fontFamily: "Poppins",
    borderRadius: "6px",
    borderColor: "#e3e3e3",
  };
  const colSpan = visibleColumns.length + 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2
          className="text-[16px] font-display font-medium text-foreground"
          style={{ fontFamily: "Poppins", fontWeight: 500, color: "#4c4c4c" }}
        >
          Users List
        </h2>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="text-sm text-white transition-colors"
          style={{
            fontFamily: "Poppins",
            borderRadius: "8px",
            backgroundColor: "#f30100",
            border: "none",
          }}
        >
          + Create User
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-sm relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by name..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-brand-text/20 transition-colors"
            style={{ fontFamily: "Poppins", borderColor: "#e3e3e3" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowColumnMenu(!showColumnMenu)}
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
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg bg-card hover:bg-muted transition-colors"
            style={{
              fontFamily: "Poppins",
              borderRadius: "8px",
              borderColor: "#e3e3e3",
            }}
          >
            <FileText className="w-4 h-4" />
            Export
            <ChevronDown className="w-4 h-4" />
          </button>
          {showExportMenu && (
            <div
              className="absolute top-full left-0 mt-1 w-32 bg-card border border-border rounded-lg shadow-lg p-1 z-10"
              style={{ borderColor: "#e3e3e3", borderRadius: "8px" }}
            >
              {["Excel", "PDF", "Copy"].map((label) => (
                <button
                  key={label}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded"
                  style={{ fontFamily: "Poppins" }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Card
        className="bg-card border border-border"
        style={{
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {columns
                  .filter((col) => visibleColumns.includes(col.id))
                  .map((col) => (
                    <TableHead key={col.id} className="text-sm font-medium">
                      {col.label}
                    </TableHead>
                  ))}
                <TableHead className="text-right text-sm font-medium">
                  Action
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
                    Loading users...
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
                    {(error as Error)?.message || "Failed to load users"}
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={colSpan}
                    className="text-center text-sm text-muted-foreground py-8"
                  >
                    {debouncedSearch
                      ? "No users match your search."
                      : "No users yet."}
                  </TableCell>
                </TableRow>
              )}

              {users.map((user) => {
                const name = displayName(user);
                return (
                  <TableRow key={user.id}>
                    {visibleColumns.includes("User") && (
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                            {name.charAt(0)}
                          </div>
                          {name}
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.includes("Email") && (
                      <TableCell className="text-muted-foreground">
                        {user.email ?? "—"}
                      </TableCell>
                    )}
                    {visibleColumns.includes("Phone Number") && (
                      <TableCell className="text-muted-foreground">
                        {user.phoneNumber ?? "—"}
                      </TableCell>
                    )}
                    {visibleColumns.includes("Assign Role") && (
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {displayRole(user)}
                        </span>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <RowActionsMenu>
                        {(close) => (
                          <>
                            {/* View User */}
                            <RowAction
                              onClick={() => {
                                close();
                                setViewingUser(user);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </RowAction>

                            {/* Edit User */}
                            <RowAction
                              onClick={() => {
                                close();
                                setEditingUser(user);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </RowAction>

                            {/* Suspend User */}
                            <RowAction
                              danger
                              onClick={() => {
                                close();
                                setSuspendingUser(user);
                              }}
                            >
                              <Ban className="w-4 h-4" />
                              Suspend
                            </RowAction>
                          </>
                        )}
                      </RowActionsMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <span
          className="text-sm text-muted-foreground"
          style={{ fontFamily: "Poppins" }}
        >
          {total !== null
            ? `Showing ${rangeStart}-${rangeEnd} of ${total}`
            : `Showing ${rangeStart}-${rangeEnd}`}
        </span>
        <div className="flex items-center gap-1">
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

      {isCreateOpen && (
        <UserModal isOpen onClose={() => setIsCreateOpen(false)} />
      )}

      {editingUser && (
        <UserModal
          key={editingUser.id}
          isOpen
          onClose={() => setEditingUser(null)}
          user={editingUser}
        />
      )}

      {suspendingUser && (
        <SuspendUserModal
          key={suspendingUser.id}
          isOpen
          onClose={() => setSuspendingUser(null)}
          user={{ id: suspendingUser.id, name: displayName(suspendingUser) }}
        />
      )}
      {viewingUser && (
        <ViewUserModal
          key={viewingUser.id}
          isOpen
          onClose={() => setViewingUser(null)}
          userId={viewingUser.id}
        />
      )}
    </div>
  );
};

export default Users;
