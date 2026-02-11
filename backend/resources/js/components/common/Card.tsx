import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  headerRight?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Card({ title, children, headerRight, footer, className = '' }: CardProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`}>
      {(title || headerRight) && (
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}

      <div className="p-6">{children}</div>

      {footer && <div className="border-t border-slate-200 px-6 py-4">{footer}</div>}
    </div>
  );
}
