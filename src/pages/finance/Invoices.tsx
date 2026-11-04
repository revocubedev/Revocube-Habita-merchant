
import { useState, useEffect } from 'react';
import { FileSpreadsheet, Filter, FileText, ChevronDown, Edit, Trash2, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';
import { CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import RowActionsMenu, { RowAction } from '@/components/ui/RowActionsMenu';
import { mockInvoices } from '@/lib/mockData';

const Invoices = () => {
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(['Invoice', 'Invoice Type', 'Property', 'Unit']);
  const [propertyFilter, setPropertyFilter] = useState('All');
  const [unitFilter, setUnitFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredInvoices = mockInvoices.filter((invoice) => {
    if (propertyFilter !== 'All' && invoice.property !== propertyFilter) return false;
    if (unitFilter !== 'All' && invoice.unit !== unitFilter) return false;
    if (statusFilter !== 'All' && invoice.status !== statusFilter) return false;
    return true;
  });

  const columns = [
    { id: 'Invoice', label: 'Invoice' },
    { id: 'Invoice Type', label: 'Invoice Type' },
    { id: 'Property', label: 'Property' },
    { id: 'Unit', label: 'Unit' },
    { id: 'Due Date', label: 'Due Date' },
    { id: 'Amount', label: 'Amount' },
    { id: 'Status', label: 'Status' },
    { id: 'Actions', label: 'Actions' },
  ];

  const totalPages = Math.ceil(filteredInvoices.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  const properties = [...new Set(mockInvoices.map(i => i.property))];
  const units = [...new Set(mockInvoices.map(i => i.unit))];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.column-menu-container') && !target.closest('.export-menu-container') && !target.closest('.filter-panel-container')) {
        setShowColumnMenu(false);
        setShowExportMenu(false);
        setShowFilterPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ fontFamily: 'Poppins' }}>
        <span className="text-muted-foreground">Finance</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-brand-text font-medium" style={{ color: '#f30100' }}>Invoices</span>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-display font-medium text-foreground" style={{ fontFamily: 'Poppins', fontWeight: 500, color: '#4c4c4c' }}>
          Invoice List
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
          + Create Invoice
        </button>
      </div>

      {/* Data Table with Toolbar */}
      <div className="flex gap-4">
        <Card 
          className="bg-card border border-border flex-1"
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <CardContent className="p-4">
            {/* Table Toolbar */}
            <div className="flex items-center gap-3 mb-4">
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

              {/* Filter Button */}
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg bg-card hover:bg-muted transition-colors"
                style={{ fontFamily: 'Poppins', borderRadius: '8px', borderColor: '#e3e3e3' }}
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>

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
                {currentInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    {visibleColumns.includes('Invoice') && (
                      <TableCell className="font-medium">{invoice.invoice}</TableCell>
                    )}
                    {visibleColumns.includes('Invoice Type') && (
                      <TableCell className="text-muted-foreground">{invoice.invoiceType}</TableCell>
                    )}
                    {visibleColumns.includes('Property') && (
                      <TableCell className="text-muted-foreground">{invoice.property}</TableCell>
                    )}
                    {visibleColumns.includes('Unit') && (
                      <TableCell className="text-muted-foreground">{invoice.unit}</TableCell>
                    )}
                    {visibleColumns.includes('Due Date') && (
                      <TableCell className="text-muted-foreground">{invoice.dueDate}</TableCell>
                    )}
                    {visibleColumns.includes('Amount') && (
                      <TableCell className="text-muted-foreground">{invoice.amount}</TableCell>
                    )}
                    {visibleColumns.includes('Status') && (
                      <TableCell>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            fontFamily: 'Poppins',
                            backgroundColor: invoice.status === 'Paid' ? '#E5F9EC' : invoice.status === 'Open' ? '#EEF5FF' : '#FFF2D8',
                            color: invoice.status === 'Paid' ? '#27964F' : invoice.status === 'Open' ? '#3984F7' : '#C7831B'
                          }}
                        >
                          {invoice.status}
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

        {/* Filter Side Panel */}
        {showFilterPanel && (
          <Card 
            className="bg-card border border-border w-64 filter-panel-container"
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium" style={{ fontFamily: 'Poppins' }}>Filter</h3>
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ fontFamily: 'Poppins' }}>Property</label>
                  <select
                    value={propertyFilter}
                    onChange={(e) => setPropertyFilter(e.target.value)}
                    className="w-full px-2 py-2 text-sm border border-border rounded bg-background"
                    style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}
                  >
                    <option value="All">All</option>
                    {properties.map(prop => (
                      <option key={prop} value={prop}>{prop}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ fontFamily: 'Poppins' }}>Unit</label>
                  <select
                    value={unitFilter}
                    onChange={(e) => setUnitFilter(e.target.value)}
                    className="w-full px-2 py-2 text-sm border border-border rounded bg-background"
                    style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}
                  >
                    <option value="All">All</option>
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ fontFamily: 'Poppins' }}>Payment Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-2 py-2 text-sm border border-border rounded bg-background"
                    style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}
                  >
                    <option value="All">All</option>
                    <option value="Paid">Paid</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setPropertyFilter('All');
                    setUnitFilter('All');
                    setStatusFilter('All');
                  }}
                  className="w-full text-sm py-2 border border-border rounded hover:bg-muted transition-colors"
                  style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}
                >
                  Reset all
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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

export default Invoices;