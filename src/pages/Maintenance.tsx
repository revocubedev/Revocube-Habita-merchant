import LoadingState from '@/components/ui/LoadingState';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  RefreshCw,
  Eye,
  Download,
} from 'lucide-react';
import UpdateRepairStatusModal from '@/components/portal/UpdateRepairStatusModal';
import Swal from '@/lib/dialog';
import { toast } from 'sonner';

import Card from '@/components/ui/Card';
import { CardContent } from '@/components/ui/Card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import { RowAction } from '@/components/ui/RowActionsMenu';

import {
  extractRepair,
  extractRepairs,
  useApproveRepair,
  useCreateAdminRepair,
  useGetRepairById,
  useGetRepairMaintainers,
  useGetRepairs,
} from '@/api/api_controllers/repairsController';
import CreateRepairRequestModal from '@/components/portal/AddRepairRequestModal';
import { useGetMembers } from '@/api/api_controllers/members';
import { extractTypes, useGetIssueTypes } from '@/api/api_controllers/types';

const DEFAULT_COLUMNS = [
  'Property',
  'Unit',
  'Type',
  'Maintainer',
  'Request Date',
  'Attachment',
  'Status',
];

const COLUMNS = [
  { id: 'Property', label: 'Property' },
  { id: 'Unit', label: 'Unit' },
  { id: 'Type', label: 'Type' },
  { id: 'Maintainer', label: 'Maintainer' },
  { id: 'Request Date', label: 'Request Date' },
  { id: 'Attachment', label: 'Attachment' },
  { id: 'Status', label: 'Status' },
  { id: 'Actions', label: 'Actions' },
];

const STATUS_OPTIONS = [
  { label: 'All Request', value: 'All Request' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Pending', value: 'PENDING' },
];

const FONT = { fontFamily: 'Poppins' };
const BRAND = '#f30100';

const getMaintainerName = (
  maintainer?: {
    name?: string;
    firstName?: string;
    lastName?: string;
  } | null
) => {
  if (!maintainer) return 'Unassigned';

  return (
    maintainer.name ||
    [maintainer.firstName, maintainer.lastName].filter(Boolean).join(' ') ||
    'Unassigned'
  );
};

const formatDate = (date?: string | null) => {
  if (!date) return '—';

  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? '—'
    : parsedDate.toLocaleDateString('en-GB');
};

const getStatusBadgeStyle = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
      return { backgroundColor: '#E5F9EC', color: '#27964F' };
    case 'APPROVED':
      return { backgroundColor: '#EEF5FF', color: '#3984F7' };
    case 'PENDING':
      return { backgroundColor: '#FFF2D8', color: '#C7831B' };
    default:
      return { backgroundColor: '#f3f4f6', color: '#6b7280' };
  }
};

const Maintenance = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] =
    useState<string[]>(DEFAULT_COLUMNS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('All Request');
  const [selectedRepairId, setSelectedRepairId] = useState<string | null>(null);
  const [updatingRepair, setUpdatingRepair] = useState<{
    id: string;
    status: string;
    issueType?: string;
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const visibleColumnCount = visibleColumns.length + 1;
  const UPDATABLE_STATUSES = ['PENDING', 'APPROVED', 'COMPLETED'];

  const {
    data: repairsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetRepairs();

  const {
    data: repairDetailsResponse,
    isLoading: isLoadingDetails,
    isError: isDetailsError,
  } = useGetRepairById(selectedRepairId);

  // Fetch members
  const { data: membersResponse, isLoading: isLoadingMembers } =
    useGetMembers();

  // Fetch maintainers
  const { data: maintainersResponse, isLoading: isLoadingMaintainers } =
    useGetRepairMaintainers();

  // Normalize dropdown options
  const members = useMemo(
    () =>
      (membersResponse?.data ?? []).map((member) => ({
        id: member.id,
        name:
          member.name ||
          [member.firstName, member.lastName].filter(Boolean).join(' ') ||
          'Unnamed Member',
      })),
    [membersResponse]
  );

  const { data: issueTypesResponse, isLoading: isLoadingIssueTypes } =
    useGetIssueTypes();

  const issueTypes = useMemo(
    () => extractTypes(issueTypesResponse),
    [issueTypesResponse]
  );

  const maintainers = maintainersResponse ?? [];

  const isLoadingRepairOptions =
    isLoadingMembers ||
    isLoadingMaintainers ||
    isLoadingIssueTypes;

  const [showCreateModal, setShowCreateModal] = useState(false);

  const { callApi: createAdminRepair, isLoading: isCreating } =
    useCreateAdminRepair();

  const handleCreateRepair = async (formData: FormData) => {
    try {
      await createAdminRepair(formData);

      toast.success('Repair request created successfully.');

      setShowCreateModal(false);

      await refetch();
    } catch (createError) {
      console.error('CREATE REPAIR ERROR:', createError);

      const message =
        createError instanceof Error
          ? createError.message
          : 'Unable to create repair request.';

      toast.error(message);
    }
  };

  // The approval hook is tied to the selected ID. The table action opens the
  // details modal first, so the hook has the correct ID before approval runs.
  const { callApi: approveRepair, isLoading: isApproving } = useApproveRepair(
    selectedRepairId || ''
  );

  const repairs = extractRepairs(repairsResponse);
  const repairDetails = extractRepair(repairDetailsResponse);

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return repairs
      .filter((request) => {
        const searchableText = [
          request.property?.name || '',
          request.unit?.name || '',
          request.issueType || '',
          getMaintainerName(request.maintainer),
          request.notes || '',
          request.status || '',
        ]
          .join(' ')
          .toLowerCase();

        return searchableText.includes(query);
      })
      .filter((request) => {
        return (
          statusFilter === 'All Request' ||
          request.status?.toUpperCase() === statusFilter
        );
      });
  }, [repairs, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const currentRequests = filteredRequests.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        !target.closest('.column-menu-container') &&
        !target.closest('.export-menu-container') &&
        !target.closest('.filter-menu-container')
      ) {
        setShowColumnMenu(false);
        setShowExportMenu(false);
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedRepairId(null);
  };

  const openDetails = (id: string) => {
    setSelectedRepairId(id);
    setShowDetails(true);
  };

  const handleApprove = async () => {
    if (!selectedRepairId) return;

    const result = await Swal.fire({
      title: 'Approve Repair Request?',
      text: 'Are you sure you want to approve this repair request?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve',
      cancelButtonText: 'Cancel',
      confirmButtonColor: BRAND,
    });

    if (!result.isConfirmed) return;

    try {
      await approveRepair({});
      toast.success('Repair request approved successfully');
      await refetch();
      closeDetails();
    } catch (approveError) {
      console.error('APPROVE REPAIR ERROR:', approveError);
      toast.error('Unable to approve repair request. Please try again.');
    }
  };

  const toggleColumn = (columnId: string, checked: boolean) => {
    setVisibleColumns((current) =>
      checked
        ? [...current, columnId]
        : current.filter((column) => column !== columnId)
    );
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), Math.max(totalPages, 1)));
  };

  const pageNumbers = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => {
      const firstPage = Math.max(
        1,
        Math.min(safeCurrentPage - 2, totalPages - 4)
      );
      return firstPage + index;
    }
  );

  return (
    <div className="space-y-4">
      {/* Section heading */}
      <div className="flex items-center justify-between">
        <h2
          className="text-[16px] font-medium text-foreground"
          style={{ ...FONT, color: '#4c4c4c' }}
        >
          Maintenance Request
        </h2>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white"
          style={{ ...FONT, backgroundColor: BRAND }}
        >
          + Create Maintenance Request
        </button>
      </div>

      <Card
        className="border border-border bg-card"
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardContent className="p-4">
          {/* Toolbar */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name..."
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-text/20"
                style={{ ...FONT, borderColor: '#e3e3e3' }}
              />
            </div>

            {/* Column visibility */}
            <div className="column-menu-container relative">
              <button
                type="button"
                onClick={() => setShowColumnMenu((visible) => !visible)}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted"
                style={{ ...FONT, borderColor: '#e3e3e3' }}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Column Visibility
                <ChevronDown className="h-4 w-4" />
              </button>

              {showColumnMenu && (
                <div
                  className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-border bg-card p-2 shadow-lg"
                  style={{ borderColor: '#e3e3e3' }}
                >
                  {COLUMNS.filter(({ id }) => id !== 'Actions').map(
                    (column) => (
                      <label
                        key={column.id}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                        style={FONT}
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns.includes(column.id)}
                          onChange={(event) =>
                            toggleColumn(column.id, event.target.checked)
                          }
                          className="rounded border-gray-300"
                          style={{ accentColor: BRAND }}
                        />
                        {column.label}
                      </label>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Status filter */}
            <div className="filter-menu-container relative">
              <button
                type="button"
                onClick={() => setShowFilterMenu((visible) => !visible)}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
                style={{ ...FONT, borderColor: '#e3e3e3' }}
              >
                {
                  STATUS_OPTIONS.find(({ value }) => value === statusFilter)
                    ?.label
                }
                <ChevronDown className="h-4 w-4" />
              </button>

              {showFilterMenu && (
                <div
                  className="absolute left-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-card p-1 shadow-lg"
                  style={{ borderColor: '#e3e3e3' }}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(option.value);
                        setShowFilterMenu(false);
                      }}
                      className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted"
                      style={FONT}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export menu */}
            <div className="export-menu-container relative">
              <button
                type="button"
                onClick={() => setShowExportMenu((visible) => !visible)}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
                style={{ ...FONT, borderColor: '#e3e3e3' }}
              >
                <FileText className="h-4 w-4" />
                Export
                <ChevronDown className="h-4 w-4" />
              </button>

              {showExportMenu && (
                <div
                  className="absolute left-0 top-full z-10 mt-1 w-32 rounded-lg border border-border bg-card p-1 shadow-lg"
                  style={{ borderColor: '#e3e3e3' }}
                >
                  {['Excel', 'PDF', 'Copy'].map((format) => (
                    <button
                      key={format}
                      type="button"
                      className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted"
                      style={FONT}
                      onClick={() =>
                        toast.info(`${format} export is not connected yet.`)
                      }
                    >
                      {format}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Requests table */}
          <Table>
            <TableHeader>
              <TableRow>
                {COLUMNS.filter(
                  ({ id }) => id === 'Actions' || visibleColumns.includes(id)
                ).map((column) => (
                  <TableHead key={column.id}>{column.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumnCount}
                    className="py-8 text-center"
                  >
                    <LoadingState label="Loading repair requests..." />
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumnCount}
                    className="py-8 text-center"
                  >
                    <p className="text-red-500">
                      {error instanceof Error
                        ? error.message
                        : 'Failed to load repair requests.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="mt-2 text-sm underline"
                    >
                      Try again
                    </button>
                  </TableCell>
                </TableRow>
              ) : currentRequests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumnCount}
                    className="py-8 text-center"
                  >
                    No repair requests found.
                  </TableCell>
                </TableRow>
              ) : (
                currentRequests.map((request) => (
                  <TableRow key={request.id}>
                    {visibleColumns.includes('Property') && (
                      <TableCell>{request.property?.name || '—'}</TableCell>
                    )}

                    {visibleColumns.includes('Unit') && (
                      <TableCell>{request.unit?.name || '—'}</TableCell>
                    )}

                    {visibleColumns.includes('Type') && (
                      <TableCell>{request.issueType || '—'}</TableCell>
                    )}

                    {visibleColumns.includes('Maintainer') && (
                      <TableCell>
                        {getMaintainerName(request.maintainer)}
                      </TableCell>
                    )}

                    {visibleColumns.includes('Request Date') && (
                      <TableCell>{formatDate(request.requestDate)}</TableCell>
                    )}

                    {visibleColumns.includes('Attachment') && (
                      <TableCell>
                        {request.issueDocument ? (
                          <a
                            href={request.issueDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#f30100] hover:underline"
                            aria-label="Download attachment"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                    )}

                    {visibleColumns.includes('Status') && (
                      <TableCell>
                        <span
                          className="rounded-full px-2 py-1 text-xs font-medium"
                          style={{
                            ...FONT,
                            ...getStatusBadgeStyle(request.status),
                          }}
                        >
                          {request.status?.replace(/_/g, ' ') || 'Unknown'}
                        </span>
                      </TableCell>
                    )}

                    <TableCell className="text-left">
                      <RowActionsMenu>
                        {(close) => (
                          <>
                            <RowAction
                              onClick={() => {
                                openDetails(request.id);
                                close();
                              }}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </RowAction>

                            {UPDATABLE_STATUSES.includes(
                              request.status?.toUpperCase()
                            ) && (
                              <RowAction
                                onClick={() => {
                                  close();
                                  setUpdatingRepair({
                                    id: request.id,
                                    status: request.status,
                                    issueType: request.issueType,
                                  });
                                }}
                              >
                                <RefreshCw className="h-4 w-4" />
                                Update status
                              </RowAction>
                            )}
                          </>
                        )}
                      </RowActionsMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground" style={FONT}>
            Show
          </span>
          <Select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="rounded border border-border bg-card px-2 py-1 text-sm"
            style={{ ...FONT, borderColor: '#e3e3e3' }}
          >
            {[10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
          <span className="text-sm text-muted-foreground" style={FONT}>
            entries per page
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => goToPage(1)}
            disabled={safeCurrentPage === 1}
            className="rounded border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
          >
            First
          </button>
          <button
            type="button"
            onClick={() => goToPage(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className="rounded border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
          >
            Previous
          </button>

          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className="rounded border border-border px-3 py-1.5 text-sm"
              style={{
                borderColor: '#e3e3e3',
                backgroundColor: safeCurrentPage === page ? BRAND : 'white',
                color: safeCurrentPage === page ? 'white' : 'inherit',
              }}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => goToPage(safeCurrentPage + 1)}
            disabled={safeCurrentPage >= totalPages}
            className="rounded border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
          >
            Next
          </button>
          <button
            type="button"
            onClick={() => goToPage(totalPages)}
            disabled={safeCurrentPage >= totalPages}
            className="rounded border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
          >
            Last
          </button>
        </div>
      </div>

      {/* Repair details modal */}
      {showDetails && (
        <Modal
          isOpen
          onClose={closeDetails}
          title="Repair Request Details"
          size="md"
        >
          {isLoadingDetails ? (
            <p className="py-8 text-center">
              <LoadingState label="Loading repair details..." />
            </p>
          ) : isDetailsError ? (
            <p className="py-8 text-center text-red-500">
              Failed to load repair request details.
            </p>
          ) : repairDetails ? (
            <div className="space-y-4 text-sm" style={FONT}>
              <div>
                <p className="text-gray-500">Issue Type</p>
                <p className="font-medium">{repairDetails.issueType || '—'}</p>
              </div>

              <div>
                <p className="text-gray-500">Maintainer</p>
                <p className="font-medium">
                  {getMaintainerName(repairDetails.maintainer)}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Maintainer Email</p>
                <p className="font-medium">
                  {repairDetails.maintainer?.email || '—'}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Phone Number</p>
                <p className="font-medium">
                  {repairDetails.maintainer?.phoneNumber || '—'}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Request Date</p>
                <p className="font-medium">
                  {formatDate(repairDetails.requestDate)}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Notes</p>
                <p className="font-medium">
                  {repairDetails.notes || 'No notes'}
                </p>
              </div>

              <div>
                <p className="mb-1 text-gray-500">Status</p>
                <span
                  className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                  style={getStatusBadgeStyle(repairDetails.status)}
                >
                  {repairDetails.status?.replace(/_/g, ' ') || 'Unknown'}
                </span>
              </div>

              {repairDetails.issueDocument && (
                <div>
                  <p className="mb-1 text-gray-500">Attachment</p>
                  {/* <a
                      href={repairDetails.issueDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#f30100] underline"
                    ></a> */}
                  <img src={repairDetails.issueDocument} alt="Issue Document" />
                </div>
              )}

              {repairDetails.status === 'PENDING' && (
                <button
                  type="button"
                  disabled={isApproving}
                  onClick={handleApprove}
                  className="w-full rounded-lg py-3 text-white disabled:opacity-50"
                  style={{ backgroundColor: BRAND }}
                >
                  {isApproving ? 'Approving...' : 'Approve Request'}
                </button>
              )}
            </div>
          ) : (
            <p className="py-8 text-center text-red-500">
              Unable to load repair request details.
            </p>
          )}
        </Modal>
      )}

      {showCreateModal && (
        <CreateRepairRequestModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRepair}
          isSubmitting={isCreating}
          members={members}
          maintainers={maintainers}
          issueTypes={issueTypes}
          isLoadingOptions={isLoadingRepairOptions}
        />
      )}
      {updatingRepair && (
        <UpdateRepairStatusModal
          key={updatingRepair.id}
          isOpen
          onClose={() => setUpdatingRepair(null)}
          repair={updatingRepair}
        />
      )}
    </div>
  );
};

export default Maintenance;
