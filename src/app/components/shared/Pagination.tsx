import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  /** How many page numbers to show on each side of the current page. Default 1. */
  siblingCount?: number;
  /** Optional summary line e.g. "Showing 1 to 10 of 130 entries" */
  summary?: React.ReactNode;
}

const DOTS = '...' as const;

const range = (start: number, end: number) => {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
};

// Always shows page 1, page totalPages, and a window of `siblingCount` pages
// around currentPage — the rest collapses into a single non-clickable "...".
const buildPageList = (totalPages: number, currentPage: number, siblingCount: number): (number | typeof DOTS)[] => {
  const totalSlots = siblingCount * 2 + 5;
  if (totalPages <= totalSlots) return range(1, totalPages);

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    return [...range(1, 3 + siblingCount * 2), DOTS, totalPages];
  }
  if (showLeftDots && !showRightDots) {
    return [1, DOTS, ...range(totalPages - (3 + siblingCount * 2) + 1, totalPages)];
  }
  return [1, DOTS, ...range(leftSibling, rightSibling), DOTS, totalPages];
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  siblingCount = 1,
  summary,
}: PaginationProps) => {
  if (totalPages <= 0) return null;

  const go = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage || disabled) return;
    onPageChange(page);
  };

  const pages = buildPageList(totalPages, currentPage, siblingCount);

  const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]';
  const circleBase = `w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors ${focusRing}`;
  const btnNav = `${circleBase} bg-[#18181b] border border-[#27272a] text-[#71717a] hover:bg-[#27272a] hover:text-white disabled:opacity-[0.35] disabled:pointer-events-none disabled:hover:bg-[#18181b] disabled:hover:text-[#71717a]`;
  const btnIdle = `${circleBase} bg-transparent text-white hover:bg-[#27272a]`;
  const btnActive = `${circleBase} bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white font-medium shadow-md shadow-[#6C5CE7]/20`;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {summary && (
        <p className="text-[#71717a] text-sm text-center sm:text-left">{summary}</p>
      )}

      <nav aria-label="Pagination" className="flex items-center gap-0.5 ml-auto">
        {/* First */}
        <button onClick={() => go(1)} disabled={currentPage === 1 || disabled} className={btnNav} aria-label="First page">
          <ChevronsLeft className="w-4 h-4" />
        </button>
        {/* Prev */}
        <button onClick={() => go(currentPage - 1)} disabled={currentPage === 1 || disabled} className={btnNav} aria-label="Previous page">
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {pages.map((p, idx) =>
          p === DOTS ? (
            <span
              key={`dots-${idx}`}
              aria-hidden="true"
              className="w-9 h-9 flex items-center justify-center text-[#71717a] text-sm select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => go(p)}
              disabled={disabled}
              aria-current={p === currentPage ? 'page' : undefined}
              aria-label={p === currentPage ? `Page ${p}, current page` : `Page ${p}`}
              className={p === currentPage ? btnActive : btnIdle}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button onClick={() => go(currentPage + 1)} disabled={currentPage === totalPages || disabled} className={btnNav} aria-label="Next page">
          <ChevronRight className="w-4 h-4" />
        </button>
        {/* Last */}
        <button onClick={() => go(totalPages)} disabled={currentPage === totalPages || disabled} className={btnNav} aria-label="Last page">
          <ChevronsRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
