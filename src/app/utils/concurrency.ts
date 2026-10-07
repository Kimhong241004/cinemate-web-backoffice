// Runs `fn` over `items` with at most `limit` calls in flight at once, preserving
// input order in the returned results. Used to cap concurrent chunked video uploads
// (e.g. bulk episode uploads) so a large batch doesn't blow past the browser's
// connection limit or overwhelm the upload backend the way an unbounded Promise.all would.
export async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < items.length) {
      const current = nextIndex++;
      results[current] = await fn(items[current], current);
    }
  };

  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, worker));
  return results;
}
