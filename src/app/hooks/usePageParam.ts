import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

// Keeps the current page number in the `page` URL query param instead of plain
// component state, so a browser refresh (or navigating away and back) lands on
// the same page instead of resetting to page 1. Page 1 is left out of the URL.
export function usePageParam(paramName = 'page') {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get(paramName)) || 1);

  const setPage = useCallback((next: number) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (next <= 1) params.delete(paramName);
      else params.set(paramName, String(next));
      return params;
    }, { replace: true });
  }, [paramName, setSearchParams]);

  return [page, setPage] as const;
}
