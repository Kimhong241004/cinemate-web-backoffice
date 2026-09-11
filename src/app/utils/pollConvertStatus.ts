import { movieService } from '../../api/services/movieService';
import { isTerminalConvertStatus } from './videoStatus';

export const CONVERT_POLL_INTERVAL_MS = 4000;
export const CONVERT_POLL_TIMEOUT_MS = 10 * 60 * 1000; // give up watching after 10 min; the movies list will still catch up on its own

// Attaching an upload starts HLS transcoding server-side — it isn't done the moment
// the attach call returns, so poll the standalone upload-status endpoint for
// convert_status until it reaches a terminal state (or we hit the timeout, at which
// point we stop watching and let the caller's own periodic refetch catch the result).
export const pollConvertStatus = async (
  uploadGlobalId: string,
  onUpdate: (convertStatus: string) => void
): Promise<void> => {
  const start = Date.now();
  while (Date.now() - start < CONVERT_POLL_TIMEOUT_MS) {
    try {
      const res = await movieService.getUploadStatus(uploadGlobalId);
      if (res.convert_status) {
        onUpdate(res.convert_status);
        if (isTerminalConvertStatus(res.convert_status)) return;
      }
    } catch {
      // transient poll failure — keep trying until the timeout
    }
    await new Promise((resolve) => setTimeout(resolve, CONVERT_POLL_INTERVAL_MS));
  }
};
