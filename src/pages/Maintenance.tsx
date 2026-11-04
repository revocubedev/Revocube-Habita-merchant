
import { useState, useEffect } from 'react';
import { Search, FileSpreadsheet, FileText, ChevronDown, Edit, Trash2, Eye, Download } from 'lucide-react';
import Card from '@/components/ui/Card';
import { CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import RowActionsMenu, { RowAction } from '@/components/ui/RowActionsMenu';
import { mockMaintenanceRequests } from '@/lib/mockData';

const Maintenance = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(['Property', 'Unit', 'Type', 'Maintainer', 'Request Date', 'Attachment', 'Status']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('All Request');

  const filteredRequests = mockMaintenanceRequests.filter((request) =>
    request.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.maintainer.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter((request) => {
    if (statusFilter === 'All Request') return true;
    return request.status === statusFilter;
  });

  const columns = [
    { id: 'Property', label: 'Property' },
    { id: 'Unit', label: 'Unit' },
    { id: 'Type', label: 'Type' },
    { id: 'Maintainer', label: 'Maintainer' },
    { id: 'Request Date', label: 'Request Date' },
    { id: 'Attachment', label: 'Attachment' },
    { id: 'Status', label: 'Status' },
    { id: 'Actions', label: 'Actions' },
  ];

  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.column-menu-container') && !target.closest('.export-menu-container') && !target.closest('.filter-menu-container')) {
        setShowColumnMenu(false);
        setShowExportMenu(false);
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Completed':
        return { backgroundColor: '#E5F9EC', color: '#27964F' };
      case 'In Progress':
        return { backgroundColor: '#EEF5FF', color: '#3984F7' };
      case 'Pending':
        return { backgroundColor: '#FFF2D8', color: '#C7831B' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#6b7280' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ fontFamily: 'Poppins' }}>
        <span className="text-muted-foreground">Maintenance</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-brand-text font-medium" style={{ color: '#f30100' }}>All Requests</span>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-display font-medium text-foreground" style={{ fontFamily: 'Poppins', fontWeight: 500, color: '#4c4c4c' }}>
          Maintenance Request
        </h2>
        <button
          className="text-sm text-white transition-colors flex items-center gap-2 px-4 py-2"
          style={{ 
            fontFamily: 'Poppins', 
            borderRadius: '8px', 
            backgroundColor: '#f30100',
            border: 'none'
          }}
        >
          + Create Maintenance Request
        </button>
      </div>

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

            {/* Request Filter Dropdown */}
            <div className="relative filter-menu-container">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg bg-card hover:bg-muted transition-colors"
                style={{ fontFamily: 'Poppins', borderRadius: '8px', borderColor: '#e3e3e3' }}
              >
                {statusFilter}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showFilterMenu && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-card border border-border rounded-lg shadow-lg p-1 z-10" style={{ borderColor: '#e3e3e3', borderRadius: '8px' }}>
                  <button 
                    onClick={() => { setStatusFilter('All Request'); setShowFilterMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded" 
                    style={{ fontFamily: 'Poppins' }}
                  >
                    All Request
                  </button>
                  <button 
                    onClick={() => { setStatusFilter('Completed'); setShowFilterMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded" 
                    style={{ fontFamily: 'Poppins' }}
                  >
                    Completed
                  </button>
                  <button 
                    onClick={() => { setStatusFilter('In Progress'); setShowFilterMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded" 
                    style={{ fontFamily: 'Poppins' }}
                  >
                    In Progress
                  </button>
                  <button 
                    onClick={() => { setStatusFilter('Pending'); setShowFilterMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded" 
                    style={{ fontFamily: 'Poppins' }}
                  >
                    Pending
                  </button>
                </div>
              )}
            </div>

            {/* Export Dropdown */}
            <div className="relative export-menu-container">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg bg-card hover:bg-muted transition-colors"
                style={{ fontFamily: 'Poppins', borderRadius: '8px', borderColor: '#e3e3e3' }}
              >
                <FileText className="w-4 h-4" />
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
              {currentRequests.map((request) => (
                <TableRow key={request.id}>
                  {visibleColumns.includes('Property') && (
                    <TableCell className="font-medium">{request.property}</TableCell>
                  )}
                  {visibleColumns.includes('Unit') && (
                    <TableCell className="text-muted-foreground">{request.unit}</TableCell>
                  )}
                  {visibleColumns.includes('Type') && (
                    <TableCell className="text-muted-foreground">{request.type}</TableCell>
                  )}
                  {visibleColumns.includes('Maintainer') && (
                    <TableCell className="text-muted-foreground">{request.maintainer}</TableCell>
                  )}
                  {visibleColumns.includes('Request Date') && (
                    <TableCell className="text-muted-foreground">{request.requestDate}</TableCell>
                  )}
                  {visibleColumns.includes('Attachment') && (
                    <TableCell className="text-muted-foreground">
                      {request.hasAttachment && (
                        <button className="text-brand-text hover:opacity-80" style={{ color: '#f30100' }}>
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.includes('Status') && (
                    <TableCell>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          fontFamily: 'Poppins',
                          ...getStatusBadgeStyle(request.status)
                        }}
                      >
                        {request.status}
                      </span>
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <RowActionsMenu>
                      {(close) => (
                        <>
                          <RowAction onClick={() => { close(); }}>
                            <Eye className="w-4 h-4" />
                            View
                          </RowAction>
                          <RowAction onClick={() => { close(); }}>
                            <Edit className="w-4 h-4" />
                            Edit
                          </RowAction>
                          <RowAction danger onClick={() => { close(); }}>
                            <Trash2 className="w-4 h-4" />
                            Delete
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
    </div>
  );
};

export default Maintenance;