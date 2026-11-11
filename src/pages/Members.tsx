
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import { CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import RowActionsMenu, { RowAction } from '@/components/ui/RowActionsMenu';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal, { Field, inputCls } from '@/components/ui/Modal';
import { type MemberInput, useCreateMember, useGetMembers } from '@/api/api_controllers/members';
import { useGetProperties } from '@/api/api_controllers/property';
import { useGetUnits } from '@/api/api_controllers/unitController';

const emptyMember: MemberInput = { firstName: '', lastName: '', email: '', phoneNumber: '', address: '', propertyId: '', unitId: '' };

const Members = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(['Member Name', 'Phone Number', 'Address', 'Property', 'Unit', 'Actions']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<MemberInput>(emptyMember);
  const [formError, setFormError] = useState('');
  const { data, isLoading, isError } = useGetMembers({
    page: currentPage,
    perPage: pageSize,
    search: searchQuery,
  });
  const { createMember, isLoading: isCreating } = useCreateMember();
  const { data: propertiesData } = useGetProperties({ page: 1, perPage: 100, enabled: createOpen });
  const { list: unitsList } = useGetUnits({ page: 1, perPage: 100 });
  const properties = propertiesData?.data ?? [];
  const units = useMemo(() => (unitsList?.items ?? []).filter((unit) => !form.propertyId || unit.propertyId === form.propertyId), [unitsList?.items, form.propertyId]);

  const currentMembers = data?.data ?? [];

  const columns = [
    { id: 'Member Name', label: 'Member Name' },
    { id: 'Phone Number', label: 'Phone Number' },
    { id: 'Address', label: 'Address' },
    { id: 'Property', label: 'Property' },
    { id: 'Unit', label: 'Unit' },
    { id: 'Actions', label: 'Actions' },
  ];

  const totalPages = Math.max(1, data?.meta?.totalPages ?? 1);

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

  useEffect(() => {
    if (!createOpen) return;
    setForm(emptyMember);
    setFormError('');
  }, [createOpen]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    try {
      await createMember(form);
      setCreateOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not create member.');
    }
  };

  return (
    <div className="space-y-5 px-1 pb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-display font-medium text-foreground" style={{ fontFamily: 'Poppins', fontWeight: 500, color: '#4c4c4c' }}>
          Members List
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('join-requests')}>
            Join Requests
          </Button>
          <Button onClick={() => setCreateOpen(true)} leftIcon={<img src="/assets/plus.svg" alt="" width={16} height={16} />}>
            Create Member
          </Button>
        </div>
      </div>

      <Card className="overflow-visible border-[#eaeaea] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]" style={{ borderRadius: '10px' }}>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 px-6 pt-6">
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              leftIcon={<img src="/assets/search.svg" alt="" width={18} height={18} />}
              className="h-11 w-[226px] border-[#eaeaea] bg-white text-sm placeholder:text-[#a1a1a1]"
            />

        {/* Column Visibility Dropdown */}
        <div className="relative column-menu-container">
          <button
            onClick={() => setShowColumnMenu(!showColumnMenu)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg bg-card hover:bg-muted transition-colors"
            style={{ fontFamily: 'Poppins', borderRadius: '8px', borderColor: '#e3e3e3' }}
          >
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
        <div className="relative export-menu-container">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg bg-card hover:bg-muted transition-colors"
            style={{ fontFamily: 'Poppins', borderRadius: '8px', borderColor: '#e3e3e3' }}
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
          <div className="mt-6 border-y border-[#eaeaea]">
            <Table className="min-w-[940px]">
            <TableHeader>
              <TableRow>
                {columns.filter(col => visibleColumns.includes(col.id)).map((col) => (
                  <TableHead key={col.id} className="h-11 px-6 text-sm font-semibold text-[#4c4c4c]">
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isLoading || isError || currentMembers.length === 0) && (
                <TableRow><TableCell colSpan={columns.length} className="py-12 text-center text-[#727272]">
                  {isLoading ? 'Loading members...' : isError ? 'Could not load members.' : 'No members found.'}
                </TableCell></TableRow>
              )}
              {!isLoading && currentMembers.map((member) => (
                <TableRow key={member.id} className="h-16 hover:bg-transparent">
                  {visibleColumns.includes('Member Name') && (
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                          {(member.firstName ?? member.name ?? '?').charAt(0).toUpperCase()}
                        </div>
                        {member.name ?? (`${member.firstName ?? ''} ${member.lastName ?? ''}`.trim() || '—')}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('Phone Number') && (
                    <TableCell className="px-6 text-[#5f5f5f]">{member.phoneNumber ?? member.phone ?? '—'}</TableCell>
                  )}
                  {visibleColumns.includes('Address') && (
                    <TableCell className="px-6 text-[#5f5f5f]">{member.address ?? '—'}</TableCell>
                  )}
                  {visibleColumns.includes('Property') && (
                    <TableCell className="px-6 text-[#5f5f5f]">{typeof member.property === 'object' ? member.property?.name ?? '—' : member.property ?? '—'}</TableCell>
                  )}
                  {visibleColumns.includes('Unit') && (
                    <TableCell className="px-6 text-[#5f5f5f]">{typeof member.unit === 'object' ? member.unit?.name ?? '—' : member.unit ?? '—'}</TableCell>
                  )}
                  {visibleColumns.includes('Actions') && (
                    <TableCell className="text-right">
                    <RowActionsMenu triggerIcon={<img src="/assets/ellipsis.svg" alt="Open member actions" width={18} height={18} />}>
                        {(close) => (
                          <>
                            <RowAction onClick={close}>
                              <img src="/assets/view.svg" alt="" width={16} height={16} />
                              View Details
                            </RowAction>
                            <RowAction onClick={close}>
                              <img src="/assets/edit.svg" alt="" width={16} height={16} />
                              Edit
                            </RowAction>
                            <RowAction danger onClick={close}>
                              <img src="/assets/delete.svg" alt="" width={16} height={16} />
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
          </div>
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

      <Modal isOpen={createOpen} onClose={() => !isCreating && setCreateOpen(false)} title="Create Member" presentation="drawer" bodyClassName="px-8 py-7">
        <form onSubmit={submit} className="space-y-5">
          <div><h3 className="text-base font-medium text-[#393939]">Member Details</h3><p className="mt-1 text-sm text-[#727272]">Enter the member’s contact and residence details.</p></div>
          {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="First Name"><input required className={inputCls} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Enter first name" /></Field>
            <Field label="Last Name"><input required className={inputCls} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Enter last name" /></Field>
          </div>
          <Field label="Email Address"><input required type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email address" /></Field>
          <Field label="Phone Number"><input required type="tel" className={inputCls} value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="Enter phone number" /></Field>
          <Field label="Address"><textarea required className={`${inputCls} min-h-24 resize-none`} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Enter address" /></Field>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Property (optional)"><select className={inputCls} value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value, unitId: '' })}><option value="">Select property</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.name ?? 'Unnamed property'}</option>)}</select></Field>
            <Field label="Unit (optional)"><select className={inputCls} value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })}><option value="">Select unit</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></Field>
          </div>
          <div className="flex justify-end gap-3 border-t border-[#eaeaea] pt-5">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={isCreating}>Cancel</Button>
            <Button type="submit" isLoading={isCreating}>Create Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Members;
