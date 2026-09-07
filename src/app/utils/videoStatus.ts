export interface VideoStatusDisplay {
  dot: string;
  /** Full pill background+text classes, written out statically so Tailwind's build-time
   * scanner can see them — never derive this by concatenating `dot` with other strings. */
  badgeCls: string;
  label: string;
  terminal: boolean;
}

// The API doesn't document an enum for convert_status, so match case-insensitively
// against every synonym we've seen rather than relying on one guessed string per state.
const KNOWN_CONVERT_STATUSES: Record<string, VideoStatusDisplay> = {
  completed:   { dot: 'bg-[#22c55e]', badgeCls: 'bg-[#22c55e]/20 text-[#22c55e]', label: 'Completed',  terminal: true },
  success:     { dot: 'bg-[#22c55e]', badgeCls: 'bg-[#22c55e]/20 text-[#22c55e]', label: 'Completed',  terminal: true },
  done:        { dot: 'bg-[#22c55e]', badgeCls: 'bg-[#22c55e]/20 text-[#22c55e]', label: 'Completed',  terminal: true },
  ready:       { dot: 'bg-[#22c55e]', badgeCls: 'bg-[#22c55e]/20 text-[#22c55e]', label: 'Completed',  terminal: true },
  failed:      { dot: 'bg-[#ef4444]', badgeCls: 'bg-[#ef4444]/20 text-[#ef4444]', label: 'Failed',     terminal: true },
  error:       { dot: 'bg-[#ef4444]', badgeCls: 'bg-[#ef4444]/20 text-[#ef4444]', label: 'Failed',     terminal: true },
  processing:  { dot: 'bg-[#eab308]', badgeCls: 'bg-[#eab308]/20 text-[#eab308]', label: 'Processing', terminal: false },
  converting:  { dot: 'bg-[#eab308]', badgeCls: 'bg-[#eab308]/20 text-[#eab308]', label: 'Processing', terminal: false },
  in_progress: { dot: 'bg-[#eab308]', badgeCls: 'bg-[#eab308]/20 text-[#eab308]', label: 'Processing', terminal: false },
  pending:     { dot: 'bg-[#71717a]', badgeCls: 'bg-[#71717a]/20 text-[#71717a]', label: 'Pending',    terminal: false },
  queued:      { dot: 'bg-[#71717a]', badgeCls: 'bg-[#71717a]/20 text-[#71717a]', label: 'Pending',    terminal: false },
};

// A source existing at all means the upload/conversion pipeline has started, so
// callers should never silently render nothing for it — unrecognized status strings
// fall back to the raw API value (title-cased) instead of being hidden.
export const getVideoStatusDisplay = (convertStatus?: string | null): VideoStatusDisplay | null => {
  if (!convertStatus) return null;
  const known = KNOWN_CONVERT_STATUSES[convertStatus.toLowerCase()];
  if (known) return known;
  return { dot: 'bg-[#71717a]', badgeCls: 'bg-[#71717a]/20 text-[#71717a]', label: convertStatus.charAt(0).toUpperCase() + convertStatus.slice(1), terminal: false };
};

// Unknown statuses are treated as non-terminal so pollers keep waiting rather than
// stopping early on a synonym we haven't seen yet — the poll timeout is the backstop.
export const isTerminalConvertStatus = (convertStatus?: string | null): boolean =>
  getVideoStatusDisplay(convertStatus)?.terminal ?? false;

// Distinct from convert_status: this tracks whether the raw file has finished
// transferring to storage (GET /movies/uploads/{id}/status), not transcoding.
const KNOWN_UPLOAD_STATUSES: Record<string, VideoStatusDisplay> = {
  completed:  { dot: 'bg-[#22c55e]', badgeCls: 'bg-[#22c55e]/20 text-[#22c55e]', label: 'Completed', terminal: true },
  uploading:  { dot: 'bg-[#3b82f6]', badgeCls: 'bg-[#3b82f6]/20 text-[#3b82f6]', label: 'Uploading', terminal: false },
  pending:    { dot: 'bg-[#71717a]', badgeCls: 'bg-[#71717a]/20 text-[#71717a]', label: 'Pending',   terminal: false },
  aborted:    { dot: 'bg-[#ef4444]', badgeCls: 'bg-[#ef4444]/20 text-[#ef4444]', label: 'Aborted',   terminal: true },
};

export const getUploadStatusDisplay = (uploadStatus?: string | null): VideoStatusDisplay | null => {
  if (!uploadStatus) return null;
  const known = KNOWN_UPLOAD_STATUSES[uploadStatus.toLowerCase()];
  if (known) return known;
  return { dot: 'bg-[#71717a]', badgeCls: 'bg-[#71717a]/20 text-[#71717a]', label: uploadStatus.charAt(0).toUpperCase() + uploadStatus.slice(1), terminal: false };
};
