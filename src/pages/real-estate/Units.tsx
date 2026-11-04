
import { useState, useEffect } from 'react';
import { Search, FileSpreadsheet, FileText, ChevronDown, Edit, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import { CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import RowActionsMenu, { RowAction } from '@/components/ui/RowActionsMenu';
import { mockUnits } from '@/lib/mockData';

const Units = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(['Unit', 'Rent Type', 'Rent', 'Rent Duration']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredUnits = mockUnits.filter((unit) =>
    unit.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.member.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { id: 'Unit', label: 'Unit' },
    { id: 'Rent Type', label: 'Rent Type' },
    { id: 'Rent', label: 'Rent' },
    { id: 'Rent Duration', label: 'Rent Duration' },
    { id: 'Property', label: 'Property' },
    { id: 'Member', label: 'Member' },
    { id: 'Actions', label: 'Actions' },
  ];

  const totalPages = Math.ceil(filteredUnits.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentUnits = filteredUnits.slice(startIndex, endIndex);

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

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ fontFamily: 'Poppins' }}>
        <span className="text-muted-foreground">Real Estate</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-brand-text font-medium" style={{ color: '#f30100' }}>Units</span>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-display font-medium text-foreground" style={{ fontFamily: 'Poppins', fontWeight: 500, color: '#4c4c4c' }}>
          Unit List
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
          + Create Unit
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
              {currentUnits.map((unit) => (
                <TableRow key={unit.id}>
                  {visibleColumns.includes('Unit') && (
                    <TableCell className="font-medium">{unit.unit}</TableCell>
                  )}
                  {visibleColumns.includes('Rent Type') && (
                    <TableCell className="text-muted-foreground">{unit.rentType}</TableCell>
                  )}
                  {visibleColumns.includes('Rent') && (
                    <TableCell className="text-muted-foreground">{unit.rent}</TableCell>
                  )}
                  {visibleColumns.includes('Rent Duration') && (
                    <TableCell className="text-muted-foreground">{unit.rentDuration}</TableCell>
                  )}
                  {visibleColumns.includes('Property') && (
                    <TableCell className="text-muted-foreground">{unit.property}</TableCell>
                  )}
                  {visibleColumns.includes('Member') && (
                    <TableCell className="text-muted-foreground">{unit.member}</TableCell>
                  )}
                  <TableCell className="text-right">
                    <RowActionsMenu>
                      {(close) => (
                        <>
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

export default Units;