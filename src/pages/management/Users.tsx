
import { useState } from 'react';
import { Search, FileSpreadsheet, FileText, ChevronDown, Edit, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import RowActionsMenu, { RowAction } from '@/components/ui/RowActionsMenu';
import { mockUsers } from '@/lib/mockData';

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(['User', 'Email', 'Phone Number']);

  const filteredUsers = mockUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { id: 'User', label: 'User' },
    { id: 'Email', label: 'Email' },
    { id: 'Phone Number', label: 'Phone Number' },
    { id: 'Assign Role', label: 'Assign Role' },
    { id: 'Action', label: 'Action' },
  ];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-display font-medium text-foreground" style={{ fontFamily: 'Poppins', fontWeight: 500, color: '#4c4c4c' }}>
          Users List
        </h2>
        <Button 
          className="text-sm text-white transition-colors"
          style={{ 
            fontFamily: 'Poppins', 
            borderRadius: '8px', 
            backgroundColor: '#f30100',
            border: 'none'
          }}
        >
          + Create Role
        </Button>
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
        <div className="relative">
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

        {/* Export Dropdown */}
        <div className="relative">
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
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  {visibleColumns.includes('User') && (
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                          {user.name.charAt(0)}
                        </div>
                        {user.name}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('Email') && (
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  )}
                  {visibleColumns.includes('Phone Number') && (
                    <TableCell className="text-muted-foreground">+234 803 4567</TableCell>
                  )}
                  {visibleColumns.includes('Assign Role') && (
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {user.role}
                      </span>
                    </TableCell>
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
        <span className="text-sm text-muted-foreground" style={{ fontFamily: 'Poppins' }}>
          Showing 1-10 of {filteredUsers.length}
        </span>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50" style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}>
            Previous
          </button>
          <button className="px-3 py-1.5 text-sm border border-border rounded bg-card" style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3', backgroundColor: '#f30100', color: 'white' }}>
            1
          </button>
          <button className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted" style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}>
            2
          </button>
          <button className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted" style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}>
            Next
          </button>
          <button className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted" style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}>
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

export default Users;