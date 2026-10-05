import { useEffect, useRef, useState } from 'react';
import { useUploadManager, BackgroundUpload } from '../context/UploadManagerContext';
import { MovieFormFiles } from '../../types/movie';

// Still moving bytes or attaching to the movie. Conversion is left to the Movies list,
// since it can take far longer than the admin should wait on the form.
const isInFlight = (upload?: BackgroundUpload) =>
  !upload || upload.status === 'uploading' || upload.status === 'finalizing' || upload.status === 'attaching';

// How long a finished upload's 100% bar stays visible before the form navigates away.
export const UPLOAD_COMPLETE_HOLD_MS = 1500;
export const holdUploadComplete = () => new Promise((resolve) => setTimeout(resolve, UPLOAD_COMPLETE_HOLD_MS));

// Starts the trailer/full-video background uploads for a just-saved movie and follows
// them so the form can show their progress. The uploads themselves live in the upload
// manager, so they keep going if the admin leaves the page before they finish.
export const useTrackedVideoUploads = (onSettled: (failed: BackgroundUpload[]) => void) => {
  const { uploads, startBackgroundUpload } = useUploadManager();
  const [trackedIds, setTrackedIds] = useState<{ trailer?: string; video?: string }>({});
  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;

  const trailer = trackedIds.trailer ? uploads.find((u) => u.id === trackedIds.trailer) : undefined;
  const video = trackedIds.video ? uploads.find((u) => u.id === trackedIds.video) : undefined;
  const isTracking = Boolean(trackedIds.trailer || trackedIds.video);
  const stillUploading = (Boolean(trackedIds.trailer) && isInFlight(trailer))
    || (Boolean(trackedIds.video) && isInFlight(video));

  useEffect(() => {
    if (!isTracking || stillUploading) return;
    const failed = [trailer, video].filter((u): u is BackgroundUpload => u?.status === 'error');
    // Hold the finished 100% bar on screen briefly before the page navigates away;
    // cleared on unmount so leaving early doesn't trigger a second navigation.
    const timer = setTimeout(() => {
      onSettledRef.current(failed);
      setTrackedIds({});
    }, failed.length > 0 ? 0 : UPLOAD_COMPLETE_HOLD_MS);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTracking, stillUploading]);

  /** Returns false when there was nothing to upload, so the caller can finish right away. */
  const startVideoUploads = (movieGlobalId: string, files: MovieFormFiles) => {
    const next: { trailer?: string; video?: string } = {};
    if (files.trailer) next.trailer = startBackgroundUpload(movieGlobalId, 'trailer', files.trailer);
    if (files.video) next.video = startBackgroundUpload(movieGlobalId, 'movie', files.video);
    setTrackedIds(next);
    return Boolean(next.trailer || next.video);
  };

  return { videoUploads: { trailer, video }, isUploadingVideos: isTracking, startVideoUploads };
};
