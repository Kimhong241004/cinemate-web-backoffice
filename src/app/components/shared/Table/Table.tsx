import type { ReactNode, MouseEvent } from 'react';

export const TableContainer = ({ children }: { children: ReactNode }) => (
  <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-x-auto">
    <table className="w-full">{children}</table>
  </div>
);

export const TableHead = ({ children }: { children: ReactNode }) => (
  <thead>
    <tr className="border-b border-[#27272a] bg-[#0a0a0a]">{children}</tr>
  </thead>
);

const ALIGN_CLASS = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

export const Th = ({
  children,
  align = 'left',
}: {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
}) => (
  <th
    className={`px-4 py-4 ${ALIGN_CLASS[align]} text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap`}
  >
    {children}
  </th>
);

export const TableBody = ({ children }: { children: ReactNode }) => (
  <tbody className="divide-y divide-[#27272a]">{children}</tbody>
);

export const TableRow = ({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <tr
    onClick={onClick}
    className={`hover:bg-[rgba(255,255,255,0.03)] transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </tr>
);

export const Td = ({
  children,
  align = 'left',
  className = '',
  onClick,
}: {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  onClick?: (e: MouseEvent) => void;
}) => (
  <td
    onClick={onClick}
    className={`px-4 py-3.5 text-white text-sm whitespace-nowrap ${ALIGN_CLASS[align]} ${className}`}
  >
    {children}
  </td>
);

export const TableMessageRow = ({ colSpan, children }: { colSpan: number; children: ReactNode }) => (
  <tr>
    <td colSpan={colSpan} className="px-4 py-12 text-center">
      <p className="text-[#71717a] text-sm">{children}</p>
    </td>
  </tr>
);
