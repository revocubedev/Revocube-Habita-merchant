import { useState, useEffect } from 'react';
import { Search, MoreHorizontal, FileSpreadsheet, FileText, ChevronDown, Edit, Trash2, Eye, Download } from 'lucide-react';
import Card from '@/components/ui/Card';
import { CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { mockExpenses } from '@/lib/mockData';
import {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  type Expense as ApiExpense,
} from '@/api/expenses';

type ExpenseRow = {
  id: string;
  expense: string;
  title: string;
  property: string;
  unit: string;
  type: string;
  date: string;
  amount: string;
  hasReceipt: boolean;
};

type ExpenseFormState = {
  title: string;
  issueType: string;
  amount: string;
  date: string;
  notes: string;
  receipt: File | null;
};

const formatCurrency = (value: number | string): string => {
  if (typeof value === 'number') {
    return `₦${value.toLocaleString()}`;
  }

  if (!value) {
    return '₦0';
  }

  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));

  if (!Number.isFinite(parsed)) {
    return value;
  }

  return `₦${parsed.toLocaleString()}`;
};

const formatDate = (value?: string): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const normalizeExpense = (expense: ApiExpense): ExpenseRow => ({
  id: expense.id,
  expense: expense.expenseNumber || `#EXP-${expense.id}`,
  title: expense.title || 'Untitled expense',
  property: expense.property || '-',
  unit: expense.unit || '-',
  type: expense.issueType || expense.type || 'Unknown',
  date: formatDate(expense.date),
  amount: formatCurrency(expense.amount),
  hasReceipt: Boolean(expense.receipt),
});

const Expense = () => {
  const estateCode = import.meta.env.VITE_ESTATE_CODE || '';
  const [searchQuery, setSearchQuery] = useState('');
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showRowMenu, setShowRowMenu] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState(['Expense', 'Title', 'Property', 'Unit', 'Type', 'Date', 'Amount', 'Receipt', 'Actions']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expenses, setExpenses] = useState<ExpenseRow[]>(mockExpenses as ExpenseRow[]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState<ExpenseFormState>({
    title: '',
    issueType: '',
    amount: '',
    date: '',
    notes: '',
    receipt: null,
  });

  useEffect(() => {
    const loadExpenses = async () => {
      if (!estateCode) {
        setExpenses(mockExpenses as ExpenseRow[]);
        return;
      }

      setIsLoading(true);

      try {
        const response = await getAllExpenses(estateCode);

        const source = Array.isArray(response?.data)
          ? response.data
          : Array.isArray((response as any)?.data?.items)
            ? (response as any).data.items
            : [];

        const nextExpenses = source.length > 0
          ? source.map(normalizeExpense)
          : (mockExpenses as ExpenseRow[]);

        setExpenses(nextExpenses);
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
        setExpenses(mockExpenses as ExpenseRow[]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadExpenses();
  }, [estateCode]);

  const filteredExpenses = expenses.filter((expense: ExpenseRow) =>
    expense.expense.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { id: 'Expense', label: 'Expense' },
    { id: 'Title', label: 'Title' },
    { id: 'Property', label: 'Property' },
    { id: 'Unit', label: 'Unit' },
    { id: 'Type', label: 'Type' },
    { id: 'Date', label: 'Date' },
    { id: 'Amount', label: 'Amount' },
    { id: 'Receipt', label: 'Receipt' },
    { id: 'Actions', label: 'Actions' },
  ];

  const totalPages = Math.ceil(filteredExpenses.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentExpenses = filteredExpenses.slice(startIndex, endIndex);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.column-menu-container') && !target.closest('.export-menu-container') && !target.closest('.row-menu-container')) {
        setShowColumnMenu(false);
        setShowExportMenu(false);
        setShowRowMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (field: keyof ExpenseFormState, value: string | File | null) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openCreateModal = () => {
    setErrorMessage('');
    setForm({
      title: '',
      issueType: '',
      amount: '',
      date: '',
      notes: '',
      receipt: null,
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (expense: ExpenseRow) => {
    setSelectedExpenseId(expense.id);
    setErrorMessage('');
    setForm({
      title: expense.title,
      issueType: expense.type,
      amount: String(expense.amount).replace(/[^0-9.-]/g, ''),
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
      notes: '',
      receipt: null,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateExpense = async () => {
    if (!estateCode) {
      setErrorMessage('Estate code is missing');
      return;
    }

    if (!form.title.trim()) {
      setErrorMessage('Expense title is required');
      return;
    }

    if (!form.issueType.trim()) {
      setErrorMessage('Issue type is required');
      return;
    }

    if (!form.date) {
      setErrorMessage('Expense date is required');
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setErrorMessage('Amount must be greater than zero');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        title: form.title,
        issueType: form.issueType,
        amount: Number(form.amount),
        date: form.date,
        notes: form.notes || undefined,
        receipt: form.receipt || undefined,
      };

      const createdExpense = await createExpense(estateCode, payload);

      const nextExpense = normalizeExpense(createdExpense);

      setExpenses((prev) => [nextExpense, ...prev]);

      setForm({
        title: '',
        issueType: '',
        amount: '',
        date: '',
        notes: '',
        receipt: null,
      });

      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create expense:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not create expense'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateExpense = async () => {
    if (!selectedExpenseId || !estateCode) {
      setErrorMessage('Expense is missing');
      return;
    }

    if (!form.title.trim()) {
      setErrorMessage('Expense title is required');
      return;
    }

    if (!form.issueType.trim()) {
      setErrorMessage('Issue type is required');
      return;
    }

    if (!form.date) {
      setErrorMessage('Expense date is required');
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setErrorMessage('Amount must be greater than zero');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        title: form.title,
        issueType: form.issueType,
        amount: Number(form.amount),
        date: form.date,
        notes: form.notes || undefined,
        receipt: form.receipt || undefined,
      };

      const updatedExpense = await updateExpense(estateCode, selectedExpenseId, payload);

      const nextExpense = normalizeExpense(updatedExpense);

      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === selectedExpenseId ? nextExpense : expense
        )
      );

      setSelectedExpenseId(null);
      setForm({
        title: '',
        issueType: '',
        amount: '',
        date: '',
        notes: '',
        receipt: null,
      });

      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update expense:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not update expense'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!estateCode) {
      setErrorMessage('Estate code is missing');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this expense?');

    if (!confirmed) {
      return;
    }

    try {
      await deleteExpense(estateCode, id);
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
      setShowRowMenu(null);
    } catch (error) {
      console.error('Failed to delete expense:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not delete expense'
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm" style={{ fontFamily: 'Poppins' }}>
        <span className="text-muted-foreground">Finance</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-brand-text font-medium" style={{ color: '#f30100' }}>Expenses</span>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-display font-medium text-foreground" style={{ fontFamily: 'Poppins', fontWeight: 500, color: '#4c4c4c' }}>
          Expense List
        </h2>
        <button
          onClick={openCreateModal}
          className="text-sm text-white transition-colors flex items-center gap-2 px-4 py-2"
          style={{
            fontFamily: 'Poppins',
            borderRadius: '8px',
            backgroundColor: '#f30100',
            border: 'none'
          }}
        >
          + Create Expense
        </button>
      </div>

      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-lg" style={{ borderRadius: '12px' }}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium" style={{ fontFamily: 'Poppins', color: '#4c4c4c' }}>
                {isEditModalOpen ? 'Edit Expense' : 'Create Expense'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  setSelectedExpenseId(null);
                  setErrorMessage('');
                }}
                className="text-sm text-muted-foreground"
                style={{ fontFamily: 'Poppins' }}
              >
                Close
              </button>
            </div>

            {errorMessage && (
              <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm" style={{ fontFamily: 'Poppins', color: '#4c4c4c' }}>
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  style={{ fontFamily: 'Poppins', borderColor: '#e3e3e3' }}
                />
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-sm" style={{ fontFamily: 'Poppins', color: '#4c4c4c' }}>
                  Issue Type
                </label>
                <input
                  value={form.issueType}
                  onChange={(e) => handleInputChange('issueType', e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  style={{ fontFamily: 'Poppins', borderColor: '#e3e3e3' }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm" style={{ fontFamily: 'Poppins', color: '#4c4c4c' }}>
                  Amount
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  style={{ fontFamily: 'Poppins', borderColor: '#e3e3e3' }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm" style={{ fontFamily: 'Poppins', color: '#4c4c4c' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  style={{ fontFamily: 'Poppins', borderColor: '#e3e3e3' }}
                />
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-sm" style={{ fontFamily: 'Poppins', color: '#4c4c4c' }}>
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  style={{ fontFamily: 'Poppins', borderColor: '#e3e3e3' }}
                  rows={3}
                />
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-sm" style={{ fontFamily: 'Poppins', color: '#4c4c4c' }}>
                  Receipt
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    handleInputChange('receipt', file);
                  }}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  style={{ fontFamily: 'Poppins', borderColor: '#e3e3e3' }}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  setSelectedExpenseId(null);
                  setErrorMessage('');
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm"
                style={{ fontFamily: 'Poppins', borderColor: '#e3e3e3' }}
              >
                Cancel
              </button>
              <button
                onClick={isEditModalOpen ? handleUpdateExpense : handleCreateExpense}
                disabled={isSubmitting}
                className="rounded-lg px-4 py-2 text-sm text-white"
                style={{
                  fontFamily: 'Poppins',
                  backgroundColor: '#f30100',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? 'Saving...' : isEditModalOpen ? 'Update Expense' : 'Save Expense'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Card
        className="bg-card border border-border"
        style={{
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent className="p-4">
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

          {isLoading && (
            <div className="mb-3 text-sm text-muted-foreground">
              Loading expenses...
            </div>
          )}

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
              {currentExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  {visibleColumns.includes('Expense') && (
                    <TableCell className="font-medium">{expense.expense}</TableCell>
                  )}
                  {visibleColumns.includes('Title') && (
                    <TableCell className="text-muted-foreground">{expense.title}</TableCell>
                  )}
                  {visibleColumns.includes('Property') && (
                    <TableCell className="text-muted-foreground">{expense.property}</TableCell>
                  )}
                  {visibleColumns.includes('Unit') && (
                    <TableCell className="text-muted-foreground">{expense.unit}</TableCell>
                  )}
                  {visibleColumns.includes('Type') && (
                    <TableCell className="text-muted-foreground">{expense.type}</TableCell>
                  )}
                  {visibleColumns.includes('Date') && (
                    <TableCell className="text-muted-foreground">{expense.date}</TableCell>
                  )}
                  {visibleColumns.includes('Amount') && (
                    <TableCell className="text-muted-foreground">{expense.amount}</TableCell>
                  )}
                  {visibleColumns.includes('Receipt') && (
                    <TableCell className="text-muted-foreground">
                      {expense.hasReceipt ? (
                        <button className="text-brand-text hover:opacity-80" style={{ color: '#f30100' }}>
                          <Download className="w-4 h-4" />
                        </button>
                      ) : (
                        <span>-</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-right relative row-menu-container">
                    <button
                      onClick={() => setShowRowMenu(showRowMenu === expense.id ? null : expense.id)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {showRowMenu === expense.id && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-border rounded-lg shadow-lg p-1 z-10" style={{ borderColor: '#e3e3e3', borderRadius: '8px' }}>
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2"
                          onClick={() => {
                            openEditModal(expense);
                            setShowRowMenu(null);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2"
                          onClick={() => {
                            openEditModal(expense);
                            setShowRowMenu(null);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2 text-brand-text"
                          style={{ color: '#f30100' }}
                          onClick={() => {
                            handleDeleteExpense(expense.id);
                            setShowRowMenu(null);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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

export default Expense;