import React, { ReactNode } from 'react';

interface Column {
  key: string;
  label: string;
  className?: string;
}

interface DataTableProps {
  columns: Column[];
  children?: ReactNode; // rows
}

export function DataTable({ columns, children }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">{children}</tbody>
      </table>
    </div>
  );
}
