import LoadingState from '@/components/ui/LoadingState';
import Select from '@/components/ui/Select';
import { useState } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
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

import {
  useGetTypesByCategory,
  extractTypes,
  type TypeCategory,
  type TypeOption,
} from '@/api/api_controllers/types';
import TypeModal from './TypeModal';

interface TypesPanelProps {
  category: TypeCategory;
  label: string;
}

const pageBtn =
  'px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50';
const pageBtnStyle = {
  fontFamily: 'Poppins',
  borderRadius: '6px',
  borderColor: '#e3e3e3',
};

const TypesPanel = ({ category, label }: TypesPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingType, setEditingType] = useState<TypeOption | null>(null);
  const [deletingType, setDeletingType] = useState<TypeOption | null>(null);

  const { data, isLoading, isError, error } = useGetTypesByCategory(category);
  const types = extractTypes(data, true); // show inactive ones here too

  const query = searchQuery.trim().toLowerCase();
  const filtered = types.filter(
    (t) =>
      !query ||
      t.label.toLowerCase().includes(query) ||
      t.value.toLowerCase().includes(query)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const pageNumbers = (() => {
    const start = Math.max(1, Math.min(safePage - 2, totalPages - 4));
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2
          className="text-[16px] font-display font-medium text-foreground"
          style={{ fontFamily: 'Poppins', fontWeight: 500, color: '#4c4c4c' }}
        >
          {label} Types
        </h2>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="text-sm text-white transition-colors flex items-center gap-2 px-4 py-2"
          style={{
            fontFamily: 'Poppins',
            borderRadius: '8px',
            backgroundColor: '#f30100',
            border: 'none',
          }}
        >
          + Create {label} Type
        </button>
      </div>

      <Card
        className="bg-card border border-border"
        style={{
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 max-w-sm relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search types..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-background text-sm border border-border focus:outline-none focus:ring-2 focus:ring-brand-text/20 transition-colors"
                style={{ fontFamily: 'Poppins', borderColor: '#e3e3e3' }}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm font-medium">Title</TableHead>
                <TableHead className="text-sm font-medium">Value</TableHead>
                <TableHead className="text-sm font-medium">Status</TableHead>
                <TableHead className="text-right text-sm font-medium">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-sm text-muted-foreground py-8"
                  >
                    <LoadingState label="Loading types..." />
                  </TableCell>
                </TableRow>
              )}

              {isError && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-sm py-8"
                    style={{ color: '#f30100' }}
                  >
                    {(error as Error)?.message || 'Failed to load types'}
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-sm text-muted-foreground py-8"
                  >
                    {query
                      ? 'No types match your search.'
                      : `No ${label.toLowerCase()} types yet.`}
                  </TableCell>
                </TableRow>
              )}

              {rows.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.label}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.value}
                  </TableCell>
                  <TableCell>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={
                        t.isActive
                          ? { backgroundColor: '#E5F9EC', color: '#27964F' }
                          : { backgroundColor: '#F3F4F6', color: '#6B7280' }
                      }
                    >
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <RowActionsMenu>
                      {(close) => (
                        <>
                          <RowAction
                            onClick={() => {
                              close();
                              setEditingType(t);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </RowAction>
                          <RowAction
                            danger
                            onClick={() => {
                              close();
                              setDeletingType(t);
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-sm text-muted-foreground"
            style={{ fontFamily: 'Poppins' }}
          >
            Show
          </span>
          <Select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 text-sm border border-border rounded bg-card"
            style={pageBtnStyle}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </Select>
          <span
            className="text-sm text-muted-foreground"
            style={{ fontFamily: 'Poppins' }}
          >
            entries per page
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            className={pageBtn}
            style={pageBtnStyle}
            disabled={safePage === 1}
            onClick={() => setCurrentPage(safePage - 1)}
          >
            Previous
          </button>
          {pageNumbers.map((n) => (
            <button
              key={n}
              onClick={() => setCurrentPage(n)}
              className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted"
              style={
                n === safePage
                  ? {
                      ...pageBtnStyle,
                      backgroundColor: '#f30100',
                      borderColor: '#f30100',
                      color: 'white',
                    }
                  : pageBtnStyle
              }
            >
              {n}
            </button>
          ))}
          <button
            className={pageBtn}
            style={pageBtnStyle}
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage(safePage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {isCreateOpen && (
        <TypeModal
          isOpen
          onClose={() => setIsCreateOpen(false)}
          category={category}
          categoryLabel={label}
        />
      )}

      {editingType && (
        <TypeModal
          key={editingType.id}
          isOpen
          onClose={() => setEditingType(null)}
          category={category}
          categoryLabel={label}
          type={editingType}
        />
      )}

      {deletingType && (
        <DeleteModal
          key={deletingType.id}
          isOpen
          onClose={() => setDeletingType(null)}
          endpoint={`types/${deletingType.id}`} // confirm in Postman
          queryKey={['get_types_by_category']}
          entity={`${label} Type`}
          itemName={deletingType.label}
        />
      )}
    </div>
  );
};

export default TypesPanel;
