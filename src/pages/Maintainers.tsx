import { useState, useEffect } from "react";
import {
  Search,
  FileSpreadsheet,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
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

import {
  useGetMaintainers,
  useDeleteMaintainer,
  type Maintainer,
} from "@/api/api_controllers/maintainerController";

import MaintainerFormModal from "@/components/maintainers/MaintainerFormModal";
import DeleteModal from "@/components/ui/DeleteModal";
import MaintainerViewModal from "@/components/portal/Maintainer";

const formatDate = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const Maintainers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState([
    "Maintainer",
    "Email Address",
    "User",
    "Creation Date",
    "Type",
    "Actions",
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [viewing, setViewing] = useState<Maintainer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Maintainer | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Maintainer | null>(null);

  // Dedicated delete hook
  const { deleteMaintainer, isLoading: isDeleting } = useDeleteMaintainer(
    deleteTarget?.id
  );

  const { data, isLoading, isError, error } = useGetMaintainers({
    page: currentPage,
    perPage: pageSize,
  });

  const maintainers: Maintainer[] = Array.isArray(data?.data) ? data.data : [];

  const meta = data?.meta;

  const columns = [
    { id: "Maintainer", label: "Maintainer" },
    { id: "Email Address", label: "Email Address" },
    { id: "User", label: "Phone Number" },
    { id: "Creation Date", label: "Creation Date" },
    { id: "Type", label: "Type" },
    { id: "Actions", label: "Actions" },
  ];

  const filteredMaintainers = maintainers.filter((maintainer) => {
    const query = searchQuery.toLowerCase();

    return (
      `${maintainer.firstName} ${maintainer.lastName}`
        .toLowerCase()
        .includes(query) ||
      maintainer.email?.toLowerCase().includes(query) ||
      maintainer.phoneNumber?.includes(query)
    );
  });

  const totalPages = Math.max(1, meta?.totalPages ?? 1);

  const visibleColumnCount = columns.filter((column) =>
    visibleColumns.includes(column.id)
  ).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest(".column-menu-container")) {
        setShowColumnMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMaintainer();
      setDeleteTarget(null);
    } catch {
      // useApiManager handles the error toast.
      // Keep the modal open if deletion fails.
    }
  };

  const toggleColumn = (columnId: string, checked: boolean) => {
    setVisibleColumns((previous) =>
      checked
        ? [...previous, columnId]
        : previous.filter((column) => column !== columnId)
    );
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2
          className="text-[16px] font-display font-medium text-foreground"
          style={{
            fontFamily: "Poppins",
            fontWeight: 500,
            color: "#4c4c4c",
          }}
        >
          Maintainers List
        </h2>

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="text-sm text-white transition-colors flex items-center gap-2 px-4 py-2"
          style={{
            fontFamily: "Poppins",
            borderRadius: "8px",
            backgroundColor: "#f30100",
            border: "none",
          }}
        >
          + Create Maintainer
        </button>
      </div>

      {/* Table Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-sm relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            placeholder="Search by name..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-brand-text/20 transition-colors"
            style={{
              fontFamily: "Poppins",
              borderColor: "#e3e3e3",
            }}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        {/* Column Visibility */}
        <div className="relative column-menu-container">
          <button
            type="button"
            onClick={() => setShowColumnMenu((previous) => !previous)}
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
              style={{
                borderColor: "#e3e3e3",
                borderRadius: "8px",
              }}
            >
              {columns.map((column) => (
                <label
                  key={column.id}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-muted rounded"
                  style={{ fontFamily: "Poppins" }}
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(column.id)}
                    onChange={(event) =>
                      toggleColumn(column.id, event.target.checked)
                    }
                    className="rounded border-gray-300"
                    style={{ accentColor: "#f30100" }}
                  />
                  {column.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
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
                  .filter((column) => visibleColumns.includes(column.id))
                  .map((column) => (
                    <TableHead key={column.id} className="text-sm font-medium">
                      {column.label}
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {(isLoading || isError || filteredMaintainers.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={Math.max(visibleColumnCount, 1)}
                    className="text-center text-muted-foreground py-8"
                  >
                    {isLoading
                      ? "Loading maintainers..."
                      : isError
                      ? (error as Error)?.message ||
                        "Failed to load maintainers"
                      : "No maintainers found"}
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                !isError &&
                filteredMaintainers.map((maintainer) => (
                  <TableRow key={maintainer.id}>
                    {visibleColumns.includes("Maintainer") && (
                      <TableCell className="font-medium">
                        {maintainer.firstName} {maintainer.lastName}
                      </TableCell>
                    )}

                    {visibleColumns.includes("Email Address") && (
                      <TableCell className="text-muted-foreground">
                        {maintainer.email}
                      </TableCell>
                    )}

                    {visibleColumns.includes("User") && (
                      <TableCell className="text-muted-foreground">
                        {maintainer.phoneNumber}
                      </TableCell>
                    )}

                    {visibleColumns.includes("Creation Date") && (
                      <TableCell className="text-muted-foreground">
                        {formatDate(maintainer.createdAt)}
                      </TableCell>
                    )}

                    {visibleColumns.includes("Type") && (
                      <TableCell className="text-muted-foreground">
                        {maintainer.maintainerTypeNew?.value || "-"}
                      </TableCell>
                    )}

                    {visibleColumns.includes("Actions") && (
                      <TableCell className="text-left">
                        <RowActionsMenu
                          label={`Actions for ${maintainer.firstName} ${maintainer.lastName}`}
                        >
                          {(close) => (
                            <>
                              <RowAction
                                onClick={() => {
                                  setViewing(maintainer);
                                  close();
                                }}
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </RowAction>

                              <RowAction
                                onClick={() => {
                                  setEditing(maintainer);
                                  setModalOpen(true);
                                  close();
                                }}
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </RowAction>

                              <RowAction
                                danger
                                onClick={() => {
                                  setDeleteTarget(maintainer);
                                  close();
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </RowAction>
                            </>
                          )}
                        </RowActionsMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
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
            onChange={(event) => {
              setPageSize(Number(event.target.value));
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
            <option value={15}>15</option>
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
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50"
          >
            First
          </button>

          <button
            type="button"
            onClick={() =>
              setCurrentPage((previous) => Math.max(1, previous - 1))
            }
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
            const startPage = Math.min(
              Math.max(1, currentPage - 2),
              Math.max(1, totalPages - 4)
            );

            const pageNumber = startPage + index;

            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setCurrentPage(pageNumber)}
                className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted"
                style={{
                  fontFamily: "Poppins",
                  borderRadius: "6px",
                  borderColor: "#e3e3e3",
                  backgroundColor:
                    currentPage === pageNumber ? "#f30100" : "white",
                  color: currentPage === pageNumber ? "white" : "inherit",
                }}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() =>
              setCurrentPage((previous) => Math.min(totalPages, previous + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50"
          >
            Next
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50"
          >
            Last
          </button>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <MaintainerFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        maintainer={editing}
      />

      {/* View Modal */}
      <MaintainerViewModal
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
        maintainer={viewing}
      />

      {/* Delete Modal - mounted outside RowActionsMenu */}
      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
          }
        }}
        endpoint={`maintainers/${deleteTarget?.id ?? ""}`}
        queryKey={["get_maintainers"]}
        itemName={
          deleteTarget
            ? `${deleteTarget.firstName} ${deleteTarget.lastName}`
            : undefined
        }
        entity="Maintainer"
        successMessage="Maintainer deleted successfully"
        isCode
        onSuccess={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Maintainers;
