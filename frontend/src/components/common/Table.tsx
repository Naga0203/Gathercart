import React from 'react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  containerClassName?: string;
}

export const Table: React.FC<TableProps> = ({
  children,
  className = '',
  containerClassName = '',
  ...props
}) => {
  return (
    <div
      className={`w-full overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs ${containerClassName}`}
    >
      <table className={`w-full text-left border-collapse text-xs sm:text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <thead
      className={`bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tbody className={`divide-y divide-slate-100 dark:divide-slate-800/80 ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  isInteractive?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  isInteractive = false,
  className = '',
  ...props
}) => {
  return (
    <tr
      className={`transition-colors ${
        isInteractive ? 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <th className={`px-4 py-3 text-left font-semibold ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <td className={`px-4 py-3.5 text-slate-700 dark:text-slate-300 ${className}`} {...props}>
      {children}
    </td>
  );
};

