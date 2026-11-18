import { useState } from 'react';
import {
  FileSpreadsheet,
  Filter,
  FileText,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  Plus,
  Search,
} from 'lucide-react';

import Button from '@/components/ui/Button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import RowActionsMenu, { RowAction } from '@/components/ui/RowActionsMenu';
import DeleteModal from '@/components/ui/DeleteModal';

import { ReceivingAccountsModal } from '@/components/finance/ReceivingAccountModals';
import InvoiceFormDrawer from '@/components/finance/InvoiceFormDrawer';
import InvoiceDetails from '@/components/finance/InvoiceDetails';

import {
  INVOICE_QUERY_KEY,
  useGetInvoices,
  useGetInvoice,
} from '@/api/api_controllers/invoiceController';
import { useGetPropertyOptions } from '@/api/api_controllers/unitController';
import {
  INVOICE_TYPES,
  Invoice,
  invoiceLabel,
  invoiceMoney,
  invoiceDate,
} from '@/lib/invoices';

const COLUMNS = [
  'Invoice',
  'Invoice Type',
  'Property',
  'Unit',
  'Due Date',
  'Amount',
  'Status',
] as const;

export type ColumnType = (typeof COLUMNS)[number];

interface EditInvoiceProps {
  id: string;
  onClose: () => void;
  onSaved: (invoice: Invoice) => void;
}

function EditInvoice({ id, onClose, onSaved }: EditInvoiceProps) {
  const { invoice, isLoading, isError, error, refetch } = useGetInvoice(id);

  if (invoice) {
    return (
      <InvoiceFormDrawer
        invoice={invoice}
        onClose={onClose}
        onSaved={onSaved}
      />
    );
  }

  return (
    <div
      className="border border-border p-4 bg-card rounded-lg flex gap-3 items-center text-sm"
      role="status"
    >
      <span>
        {isLoading
          ? 'Loading invoice for editing…'
          : isError
          ? error?.message
          : 'Invoice unavailable.'}
      </span>
      {isError && (
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      )}
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
    </div>
  );
}

const Invoices = () => {
  // Dropdown / Modal Visibility State
  const [columnMenu, setColumnMenu] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // Active Item Management
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Invoice | null>(null);

  // Filters & Table Controls State
  const [visibleColumns, setVisibleColumns] = useState<string[]>([...COLUMNS]);
  const [propertyFilter, setPropertyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Queries
  const query = useGetInvoices(currentPage, pageSize, typeFilter, propertyFilter);
  const { properties } = useGetPropertyOptions();

  const totalPages = Math.max(1, query.meta?.totalPages || 1);

  // Local filtering across invoice number, properties, and units
  const invoices = query.invoices.filter((invoice) => {
    const searchTarget = [
      invoice.invoiceNumber,
      ...invoice.properties.map((p) => p.name),
      ...invoice.units.map((u) => u.name),
    ];
    return searchTarget.some((val) =>
      val?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSaved = (invoice: Invoice) => {
    setCreateOpen(false);
    setEditId(null);
    setCurrentPage(1);
    setViewId(invoice.id);
  };

  const getRowCells = (invoice: Invoice) => [
    invoice.invoiceNumber,
    invoiceLabel(invoice.type),
    invoice.propertyScope === 'ENTIRE_ESTATE'
      ? 'Entire Estate'
      : invoice.properties.map((p) => p.name).join(', ') || '—',
    invoice.unitScope === 'ALL_UNITS'
      ? 'All'
      : invoice.units.map((u) => u.name).join(', ') || '—',
    invoiceDate(invoice.dueDate),
    invoiceMoney(invoice.amount),
    invoiceLabel(invoice.status),
  ];

  const handleExportData = async (copyToClipboard = false) => {
    const rows = [COLUMNS, ...invoices.map(getRowCells)];

    if (copyToClipboard) {
      try {
        const text = rows.map((row) => row.join('\t')).join('\n');
        await navigator.clipboard.writeText(text);
      } catch {
        return;
      }
    } else {
      const csvContent = rows
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
        .join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'invoices-current-page.csv';
      link.click();
      URL.revokeObjectURL(url);
    }

    setExportOpen(false);
  };

  const toggleColumnVisibility = (column: string) => {
    setVisibleColumns((prev) =>
      prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]
    );
  };

  const handleResetFilters = () => {
    setPropertyFilter('');
    setTypeFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 min-w-0">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Finance /</span>
        <span className="text-brand-text font-medium">Invoices</span>
      </div>

      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-medium">Invoice List</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="border-brand-text text-brand-text"
            onClick={() => setAccountsOpen(true)}
          >
            Receiving Accounts
          </Button>
          <Button
            className="bg-brand-text text-primary-foreground hover:bg-brand-text/90"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setCreateOpen(true)}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Conditional Edit Drawer */}
      {editId && (
        <EditInvoice
          id={editId}
          onClose={() => setEditId(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Main Table Container */}
      <div className="border border-border rounded-lg bg-card p-4 space-y-4">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search Box */}
          <div className="relative flex-1 min-w-44 max-w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              aria-label="Search current invoice page"
              className="w-full border border-border bg-card rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-text"
              placeholder="Search current page"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Column Visibility Selector */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => {
                setColumnMenu((prev) => !prev);
                setExportOpen(false);
              }}
              leftIcon={<FileSpreadsheet className="w-4 h-4" />}
              rightIcon={<ChevronDown className="w-4 h-4" />}
            >
              Column Visibility
            </Button>

            {columnMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg p-2 z-20">
                {COLUMNS.map((column) => (
                  <label
                    key={column}
                    className="flex items-center gap-2 text-sm p-2 hover:bg-muted/50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="accent-brand-text"
                      checked={visibleColumns.includes(column)}
                      onChange={() => toggleColumnVisibility(column)}
                    />
                    {column}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setFilterOpen((prev) => !prev)}
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Filter
          </Button>

          {/* Export Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => {
                setExportOpen((prev) => !prev);
                setColumnMenu(false);
              }}
              leftIcon={<FileText className="w-4 h-4" />}
              rightIcon={<ChevronDown className="w-4 h-4" />}
            >
              Export
            </Button>

            {exportOpen && (
              <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-1 z-20 min-w-36">
                <Button
                  className="w-full justify-start"
                  variant="ghost"
                  onClick={() => handleExportData(false)}
                >
                  CSV
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="ghost"
                  onClick={() => handleExportData(true)}
                >
                  Copy
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Section */}
        {filterOpen && (
          <div className="flex flex-wrap items-end gap-3 border-y border-border py-4">
            <label className="text-sm space-y-1">
              <span className="block font-medium">Property</span>
              <select
                className="border border-border rounded-lg bg-card p-2 max-w-60 focus:outline-none"
                value={propertyFilter}
                onChange={(e) => {
                  setPropertyFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All properties</option>
                {properties.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm space-y-1">
              <span className="block font-medium">Invoice Type</span>
              <select
                className="border border-border rounded-lg bg-card p-2 focus:outline-none"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All types</option>
                {[
                  ...new Set([
                    ...INVOICE_TYPES,
                    ...query.invoices.map((inv) => inv.type),
                  ]),
                ].map((type) => (
                  <option key={type} value={type}>
                    {invoiceLabel(type)}
                  </option>
                ))}
              </select>
            </label>

            <Button variant="outline" onClick={handleResetFilters}>
              Reset all
            </Button>
          </div>
        )}

        {/* Table Content */}
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.filter((col) => visibleColumns.includes(col)).map((col) => (
                <TableHead key={col}>{col}</TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {query.isLoading ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 1}>
                  Loading invoices…
                </TableCell>
              </TableRow>
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 1}>
                  <div className="flex items-center flex-wrap gap-3">
                    <span className="text-danger">
                      {query.error?.message || 'Could not load invoices.'}
                    </span>
                    <Button variant="outline" onClick={() => query.refetch()}>
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : !invoices.length ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 1}>
                  <p className="text-muted-foreground">
                    {search
                      ? 'No invoices match this search on the current page.'
                      : 'No invoices found.'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => {
                const rowData = getRowCells(invoice);

                return (
                  <TableRow key={invoice.id}>
                    {rowData.map(
                      (cell, index) =>
                        visibleColumns.includes(COLUMNS[index]) && (
                          <TableCell key={COLUMNS[index]}>
                            <span
                              className={
                                COLUMNS[index] === 'Status'
                                  ? 'text-brand-text text-xs font-medium'
                                  : 'block max-w-60 break-words'
                              }
                            >
                              {cell}
                            </span>
                          </TableCell>
                        )
                    )}

                    <TableCell>
                      <RowActionsMenu>
                        {(close) => (
                          <>
                            <RowAction
                              onClick={() => {
                                close();
                                setViewId(invoice.id);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </RowAction>

                            <RowAction
                              onClick={() => {
                                close();
                                setEditId(invoice.id);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </RowAction>

                            <RowAction
                              danger
                              onClick={() => {
                                close();
                                setDeleting(invoice);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </RowAction>
                          </>
                        )}
                      </RowActionsMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap justify-between items-center gap-3 text-sm">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-muted-foreground">Show</span>
          <select
            aria-label="Entries per page"
            className="border border-border rounded-lg bg-card p-1"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[10, 25, 50].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <span className="text-muted-foreground">
            entries per page · {query.meta?.totalItems ?? 0} total
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1 || query.isFetching}
            onClick={() => setCurrentPage(1)}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1 || query.isFetching}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages || query.isFetching}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages || query.isFetching}
            onClick={() => setCurrentPage(totalPages)}
          >
            Last
          </Button>
        </div>
      </div>

      {/* Modal/Drawer Portals */}
      {createOpen && (
        <InvoiceFormDrawer
          onClose={() => setCreateOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {viewId && (
        <InvoiceDetails id={viewId} onClose={() => setViewId(null)} />
      )}

      {deleting && (
        <DeleteModal
          isOpen
          onClose={() => setDeleting(null)}
          endpoint={`invoices/${encodeURIComponent(deleting.id)}`}
          queryKey={[INVOICE_QUERY_KEY]}
          entity="Invoice"
          itemName={deleting.invoiceNumber}
          onSuccess={() => setCurrentPage(1)}
        />
      )}

      <ReceivingAccountsModal
        isOpen={accountsOpen}
        onClose={() => setAccountsOpen(false)}
      />
    </div>
  );
};

export default Invoices;