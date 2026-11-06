import { cn } from '@/lib/utils';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

const Table = ({ children, className }: TableProps) => {
  return (
    // Horizontal scroll only: rows are never cut off vertically, extra rows go to pagination.
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full text-sm', className)}>
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children, className }: TableProps) => {
  return (
    <thead className={cn('border-b border-border', className)}>
      {children}
    </thead>
  );
};

const TableBody = ({ children, className }: TableProps) => {
  return (
    <tbody className={cn('[&_tr:last-child]:border-0', className)}>
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className }: TableProps) => {
  return (
    <tr className={cn('border-b border-border hover:bg-muted/50 transition-colors', className)}>
      {children}
    </tr>
  );
};

const TableHead = ({ children, className }: TableProps) => {
  return (
    <th className={cn('h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0', className)}>
      {children}
    </th>
  );
};

const TableCell = ({ children, className, colSpan, style }: TableProps & { colSpan?: number; style?: React.CSSProperties }) => {
  return (
    <td colSpan={colSpan} style={style} className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}>
      {children}
    </td>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
