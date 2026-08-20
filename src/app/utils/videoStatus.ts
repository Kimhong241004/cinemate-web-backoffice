export interface VideoStatusDisplay {
  dot: string;
  label: string;
  terminal: boolean;
}

// The API doesn't document an enum for convert_status, so match case-insensitively
// against every synonym we've seen rather than relying on one guessed string per state.
const KNOWN_CONVERT_STATUSES: Record<string, VideoStatusDisplay> = {
  completed:   { dot: 'bg-[#22c55e]', label: 'Completed',  terminal: true },
  success:     { dot: 'bg-[#22c55e]', label: 'Completed',  terminal: true },
  done:        { dot: 'bg-[#22c55e]', label: 'Completed',  terminal: true },
  ready:       { dot: 'bg-[#22c55e]', label: 'Completed',  terminal: true },
  failed:      { dot: 'bg-[#ef4444]', label: 'Failed',     terminal: true },
  error:       { dot: 'bg-[#ef4444]', label: 'Failed',     terminal: true },
  processing:  { dot: 'bg-[#eab308]', label: 'Processing', terminal: false },
  converting:  { dot: 'bg-[#eab308]', label: 'Processing', terminal: false },
  in_progress: { dot: 'bg-[#eab308]', label: 'Processing', terminal: false },
  pending:     { dot: 'bg-[#71717a]', label: 'Pending',    terminal: false },
  queued:      { dot: 'bg-[#71717a]', label: 'Pending',    terminal: false },
};

// A source existing at all means the upload/conversion pipeline has started, so
// callers should never silently render nothing for it — unrecognized status strings
// fall back to the raw API value (title-cased) instead of being hidden.
export const getVideoStatusDisplay = (convertStatus?: string | null): VideoStatusDisplay | null => {
  if (!convertStatus) return null;
  const known = KNOWN_CONVERT_STATUSES[convertStatus.toLowerCase()];
  if (known) return known;
  return { dot: 'bg-[#71717a]', label: convertStatus.charAt(0).toUpperCase() + convertStatus.slice(1), terminal: false };
};

// Unknown statuses are treated as non-terminal so pollers keep waiting rather than
// stopping early on a synonym we haven't seen yet — the poll timeout is the backstop.
export const isTerminalConvertStatus = (convertStatus?: string | null): boolean =>
  getVideoStatusDisplay(convertStatus)?.terminal ?? false;
