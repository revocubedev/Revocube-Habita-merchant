import { useState, useEffect } from 'react';
import { Search, FileSpreadsheet, ChevronDown, Edit, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import { CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import RowActionsMenu, { RowAction } from '@/components/ui/RowActionsMenu';
import {
  useGetMaintainers,
  useDeleteMaintainer,
  type Maintainer,
} from '@/api/api_controllers/maintainerController';
import MaintainerFormModal from '@/components/maintainers/MaintainerFormModal';

const formatDate = (v?: string) => {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const DeleteMaintainerButton = ({ id, onClose }: { id: string; onClose: () => void }) => {
  const { deleteMaintainer, isLoading } = useDeleteMaintainer(id);
  return (
    <RowAction
      danger
      disabled={isLoading}
      onClick={async () => {
        if (!window.confirm('Delete this maintainer?')) return;
        onClose();
        try { await deleteMaintainer(); } catch { /* toast shown */ }
      }}
    >
      <Trash2 className="w-4 h-4" />
      {isLoading ? 'Deleting...' : 'Delete'}
    </RowAction>
  );
};

const Maintainers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(['Maintainer', 'Email Address', 'User', 'Creation Date', 'Type', 'Actions']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Maintainer | null>(null);

  const { data, isLoading, isError, error } = useGetMaintainers({ page: currentPage, perPage: pageSize });
  const maintainers: Maintainer[] = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta;

  const q = searchQuery.toLowerCase();
  const currentMaintainers = maintainers.filter((m) =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
    m.email?.toLowerCase().includes(q) ||
    m.phoneNumber?.includes(q)
  );

  const columns = [
    { id: 'Maintainer', label: 'Maintainer' },
    { id: 'Email Address', label: 'Email Address' },
    { id: 'User', label: 'Phone Number' },
    { id: 'Creation Date', label: 'Creation Date' },
    { id: 'Type', label: 'Type' },
    { id: 'Actions', label: 'Actions' },
  ];

  const totalPages = Math.max(1, meta?.totalPages ?? 1);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.column-menu-container')) {
        setShowColumnMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-display font-medium text-foreground" style={{ fontFamily: 'Poppins', fontWeight: 500, color: '#4c4c4c' }}>
          Maintainers List
        </h2>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="text-sm text-white transition-colors flex items-center gap-2 px-4 py-2"
          style={{ 
            fontFamily: 'Poppins', 
            borderRadius: '8px', 
            backgroundColor: '#f30100',
            border: 'none'
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
            placeholder="Search by name..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-brand-text/20 transition-colors"
            style={{ fontFamily: 'Poppins', borderColor: '#e3e3e3' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              {columns.map((col) => (
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
      </div>

      {/* Data Table */}
      <Card 
        className="bg-card border border-border"
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.filter(col => visibleColumns.includes(col.id)).map((col) => (
                  <TableHead key={col.id} className="text-sm font-medium">
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isLoading || isError || currentMaintainers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} className="text-center text-muted-foreground py-8">
                    {isLoading ? 'Loading maintainers...' : isError ? (error as Error)?.message : 'No maintainers found'}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && currentMaintainers.map((maintainer) => (
                <TableRow key={maintainer.id}>
                  {visibleColumns.includes('Maintainer') && (
                    <TableCell className="font-medium">
                      {maintainer.firstName} {maintainer.lastName}
                    </TableCell>
                  )}
                  {visibleColumns.includes('Email Address') && (
                    <TableCell className="text-muted-foreground">{maintainer.email}</TableCell>
                  )}
                  {visibleColumns.includes('User') && (
                    <TableCell className="text-muted-foreground">{maintainer.phoneNumber}</TableCell>
                  )}
                  {visibleColumns.includes('Creation Date') && (
                    <TableCell className="text-muted-foreground">{formatDate(maintainer.createdAt)}</TableCell>
                  )}
                  {visibleColumns.includes('Type') && (
                    <TableCell className="text-muted-foreground">{maintainer.maintainerType}</TableCell>
                  )}
                  {visibleColumns.includes('Actions') && (
                    <TableCell className="text-right">
                      <RowActionsMenu label={`Actions for ${maintainer.firstName} ${maintainer.lastName}`}>
                        {(close) => (
                          <>
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
                            <DeleteMaintainerButton id={maintainer.id} onClose={close} />
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
            <option value={15}>15</option>
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

      <MaintainerFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} maintainer={editing} />
    </div>
  );
};

export default Maintainers;
