
import { useState, useEffect } from 'react';
import { Search, FileSpreadsheet, ChevronDown, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';
import { CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import RowActionsMenu, { RowAction } from '@/components/ui/RowActionsMenu';
import Modal from '@/components/ui/Modal';
import {
  useGetAdminStaff,
  useGetAdminStaffById,
  useUpdateStaffCodeStatus,
  type StaffCodeStatus,
} from '@/api/api_controllers/staffController';

const showDate = (value?: string | null) => value ? new Date(value).toLocaleDateString() : '—';

const StaffVerification = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(['Code', 'Visitor', 'Check In', 'Check Out', 'Status', 'Actions']);
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [staffCode, setStaffCode] = useState('');
  const [staffStatus, setStaffStatus] = useState<StaffCodeStatus>('CHECKED_IN');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const { staff, meta, isLoading: staffLoading, isError: staffError } = useGetAdminStaff();
  const { staff: selectedStaff, isLoading: detailsLoading, isError: detailsError } =
    useGetAdminStaffById(selectedStaffId);
  const { updateStatus, isLoading: updatingStatus } = useUpdateStaffCodeStatus(staffCode);

  const submitStaffStatus = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!staffCode.trim()) return;
    try {
      await updateStatus(staffStatus);
    } catch {
      // The API manager displays the error.
    }
  };

  const filteredStaff = staff.filter((person) =>
    person.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.staffCode?.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter((person) => {
    if (statusFilter === 'All') return true;
    return person.status === (statusFilter === 'Checked In' ? 'CHECKED_IN' : 'CHECKED_OUT');
  });

  const columns = [
    { id: 'Code', label: 'Code' },
    { id: 'Visitor', label: 'Staff' },
    { id: 'Check In', label: 'Check In' },
    { id: 'Check Out', label: 'Check Out' },
    { id: 'Status', label: 'Status' },
    { id: 'Actions', label: 'Actions' },
  ];

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentStaff = filteredStaff.slice(startIndex, endIndex);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.column-menu-container') && !target.closest('.export-menu-container')) {
        setShowColumnMenu(false);
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'CHECKED_IN':
        return { backgroundColor: '#E5F9EC', color: '#27964F' };
      case 'CHECKED_OUT':
        return { backgroundColor: '#F3F4F6', color: '#6B7280' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#6b7280' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ fontFamily: 'Poppins' }}>
        <span className="text-muted-foreground">Visitors</span>
        <span className="text-muted-foreground">›</span>
        <span className="text-brand-text font-medium" style={{ color: '#f30100' }}>Staff Verification</span>
      </div>

      {/* Section Header */}
      <h2 className="text-[16px] font-display font-medium text-foreground" style={{ fontFamily: 'Poppins', fontWeight: 500, color: '#4c4c4c' }}>
        Staff verification
      </h2>
      {meta && meta.totalItems > staff.length && (
        <p className="text-sm text-muted-foreground">
          Showing {staff.length} of {meta.totalItems} staff records. More records may require API pagination.
        </p>
      )}

      <form onSubmit={submitStaffStatus} className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <label className="text-sm text-foreground">
          Staff code
          <input
            className="mt-1 block rounded-lg border border-border bg-card px-3 py-2"
            value={staffCode}
            onChange={(event) => setStaffCode(event.target.value)}
            placeholder="Enter staff code"
            required
          />
        </label>
        <label className="text-sm text-foreground">
          Status
          <select
            className="mt-1 block rounded-lg border border-border bg-card px-3 py-2"
            value={staffStatus}
            onChange={(event) => setStaffStatus(event.target.value as StaffCodeStatus)}
          >
            <option value="CHECKED_IN">Check in</option>
            <option value="CHECKED_OUT">Check out</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={updatingStatus || !staffCode.trim()}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {updatingStatus ? 'Updating...' : 'Update status'}
        </button>
      </form>

      {/* Data Table with Toolbar */}
      <Card 
        className="bg-card border border-border"
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent className="p-4">
          {/* Table Toolbar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 max-w-sm relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search by name..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-background text-sm border border-border focus:outline-none focus:ring-2 focus:ring-brand-text/20 transition-colors"
                style={{ fontFamily: 'Poppins', borderColor: '#e3e3e3' }}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Column Visibility Dropdown */}
            <div className="relative column-menu-container">
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg bg-card hover:bg-muted transition-colors"
                style={{ fontFamily: 'Poppins', borderRadius: '8px', borderColor: '#e3e3e3' }}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Column Visibility
                <ChevronDown className="w-4 h-4" />
              </button>
              {showColumnMenu && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg p-2 z-10" style={{ borderColor: '#e3e3e3', borderRadius: '8px' }}>
                  {columns.filter(col => col.id !== 'Actions').map((col) => (
                    <label key={col.id} className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-muted rounded" style={{ fontFamily: 'Poppins' }}>
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setVisibleColumns([...visibleColumns, col.id]);
                          } else {
                            setVisibleColumns(visibleColumns.filter((c) => c !== col.id));
                          }
                        }}
                        className="rounded border-gray-300"
                        style={{ accentColor: '#f30100' }}
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setStatusFilter(statusFilter === 'All' ? 'Checked In' : statusFilter === 'Checked In' ? 'Checked Out' : 'All');
                  setCurrentPage(1);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg bg-card hover:bg-muted transition-colors"
                style={{ fontFamily: 'Poppins', borderRadius: '8px', borderColor: '#e3e3e3' }}
              >
                {statusFilter}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Export Dropdown */}
            <div className="relative export-menu-container">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg bg-card hover:bg-muted transition-colors"
                style={{ fontFamily: 'Poppins', borderRadius: '8px', borderColor: '#f30100' }}
              >
                Export
                <ChevronDown className="w-4 h-4" />
              </button>
              {showExportMenu && (
                <div className="absolute top-full left-0 mt-1 w-32 bg-card border border-border rounded-lg shadow-lg p-1 z-10" style={{ borderColor: '#e3e3e3', borderRadius: '8px' }}>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded" style={{ fontFamily: 'Poppins' }}>
                    Excel
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded" style={{ fontFamily: 'Poppins' }}>
                    PDF
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded" style={{ fontFamily: 'Poppins' }}>
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
                {columns.filter(col => visibleColumns.includes(col.id) || col.id === 'Actions').map((col) => (
                  <TableHead key={col.id} className="text-sm font-medium">
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentStaff.map((person) => (
                <TableRow key={person.id}>
                  {visibleColumns.includes('Code') && (
                    <TableCell className="font-medium">{person.staffCode}</TableCell>
                  )}
                  {visibleColumns.includes('Visitor') && (
                    <TableCell className="text-muted-foreground">{person.fullName}</TableCell>
                  )}
                  {visibleColumns.includes('Check In') && (
                    <TableCell className="text-muted-foreground">{showDate(person.checkInDate)}</TableCell>
                  )}
                  {visibleColumns.includes('Check Out') && (
                    <TableCell className="text-muted-foreground">{showDate(person.checkOutDate)}</TableCell>
                  )}
                  {visibleColumns.includes('Status') && (
                    <TableCell>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          fontFamily: 'Poppins',
                          ...getStatusBadgeStyle(person.status ?? '')
                        }}
                      >
                        {person.status?.replace('_', ' ') ?? '—'}
                      </span>
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <RowActionsMenu>
                      {(close) => (
                        <RowAction onClick={() => { setSelectedStaffId(person.id); close(); }}>
                          <Eye className="w-4 h-4" />
                          View details
                        </RowAction>
                      )}
                    </RowActionsMenu>
                  </TableCell>
                </TableRow>
              ))}
              {(staffLoading || staffError || filteredStaff.length === 0) && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                    {staffLoading ? 'Loading staff...' : staffError ? 'Could not load staff.' : 'No staff found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground" style={{ fontFamily: 'Poppins' }}>
            Show
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 text-sm border border-border rounded bg-card"
            style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-muted-foreground" style={{ fontFamily: 'Poppins' }}>
            entries per page
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50" 
            style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}
          >
            First
          </button>
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50" 
            style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}
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
                  fontFamily: 'Poppins', 
                  borderRadius: '6px', 
                  borderColor: '#e3e3e3',
                  backgroundColor: currentPage === pageNum ? '#f30100' : 'white',
                  color: currentPage === pageNum ? 'white' : 'inherit'
                }}
              >
                {pageNum}
              </button>
            );
          })}
          <button 
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50" 
            style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}
          >
            Next
          </button>
          <button 
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50" 
            style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}
          >
            Last
          </button>
        </div>
      </div>
      <Modal
        isOpen={!!selectedStaffId}
        onClose={() => setSelectedStaffId(null)}
        title="Staff details"
      >
        {detailsLoading && <p>Loading staff details...</p>}
        {detailsError && <p className="text-destructive">Could not load staff details.</p>}
        {selectedStaff && !detailsLoading && (
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-muted-foreground">Name</dt><dd>{selectedStaff.fullName}</dd></div>
            <div><dt className="text-muted-foreground">Code</dt><dd>{selectedStaff.staffCode}</dd></div>
            <div><dt className="text-muted-foreground">Status</dt><dd>{selectedStaff.status ?? '—'}</dd></div>
            <div><dt className="text-muted-foreground">Email</dt><dd>{selectedStaff.email ?? '—'}</dd></div>
            <div><dt className="text-muted-foreground">Phone</dt><dd>{selectedStaff.phoneNumber ?? '—'}</dd></div>
            <div><dt className="text-muted-foreground">Check in</dt><dd>{showDate(selectedStaff.checkInDate)}</dd></div>
            <div><dt className="text-muted-foreground">Check out</dt><dd>{showDate(selectedStaff.checkOutDate)}</dd></div>
            <div><dt className="text-muted-foreground">Check in time</dt><dd>{selectedStaff.checkInTime ? new Date(selectedStaff.checkInTime).toLocaleTimeString() : '—'}</dd></div>
            <div><dt className="text-muted-foreground">Check out time</dt><dd>{selectedStaff.checkOutTime ? new Date(selectedStaff.checkOutTime).toLocaleTimeString() : '—'}</dd></div>
            <div><dt className="text-muted-foreground">Description</dt><dd>{selectedStaff.description ?? '—'}</dd></div>
            <div><dt className="text-muted-foreground">Visitors</dt><dd>{selectedStaff.numberOfVisitors ?? '—'}</dd></div>
            <div><dt className="text-muted-foreground">Allowed days</dt><dd>{selectedStaff.allowedDays?.join(', ') ?? '—'}</dd></div>
          </dl>
        )}
      </Modal>
    </div>
  );
};

export default StaffVerification;
