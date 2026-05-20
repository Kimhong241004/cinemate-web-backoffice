import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  /** Optional summary line e.g. "Showing 1 to 10 of 130 entries" */
  summary?: React.ReactNode;
}

const Pagination = ({ currentPage, totalPages, onPageChange, disabled = false, summary }: PaginationProps) => {
  if (totalPages <= 0) return null;

  const btnBase = 'min-w-[36px] h-9 px-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center';
  const btnIdle = `${btnBase} bg-[#18181b] border border-[#27272a] text-white hover:bg-[#27272a]`;
  const btnActive = `${btnBase} bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white shadow-md shadow-[#ef4444]/20`;
  const btnNav = 'h-9 px-2.5 rounded-lg bg-[#18181b] border border-[#27272a] text-[#71717a] hover:bg-[#27272a] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center';

  // Build page list with ellipsis
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const go = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage || disabled) return;
    onPageChange(page);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {summary && (
        <p className="text-[#71717a] text-sm text-center sm:text-left">{summary}</p>
      )}

      <div className="flex items-center gap-1.5 ml-auto">
        {/* First */}
        <button onClick={() => go(1)} disabled={currentPage === 1 || disabled} className={btnNav} title="First page">
          <ChevronsLeft className="w-4 h-4" />
        </button>
        {/* Prev */}
        <button onClick={() => go(currentPage - 1)} disabled={currentPage === 1 || disabled} className={btnNav} title="Previous page">
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {pages.map((p, idx) =>
          p === '...'
            ? <span key={`e-${idx}`} className="min-w-[36px] h-9 flex items-center justify-center text-[#71717a] text-sm select-none">…</span>
            : <button key={p} onClick={() => go(p)} disabled={disabled} className={currentPage === p ? btnActive : btnIdle}>{p}</button>
        )}

        {/* Next */}
        <button onClick={() => go(currentPage + 1)} disabled={currentPage === totalPages || disabled} className={btnNav} title="Next page">
          <ChevronRight className="w-4 h-4" />
        </button>
        {/* Last */}
        <button onClick={() => go(totalPages)} disabled={currentPage === totalPages || disabled} className={btnNav} title="Last page">
          <ChevronsRight className="w-4 h-4" />
        </button>

        {/* Jump to page */}
        {totalPages > 7 && (
          <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-[#27272a]">
            <span className="text-[#71717a] text-xs whitespace-nowrap">Go to</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              defaultValue={currentPage}
              key={currentPage}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const v = Number((e.target as HTMLInputElement).value);
                  if (v >= 1 && v <= totalPages) go(v);
                }
              }}
              className="w-14 h-9 px-2 rounded-lg bg-[#18181b] border border-[#27272a] text-white text-sm text-center focus:outline-none focus:border-[#f97316] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
