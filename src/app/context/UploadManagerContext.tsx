import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { movieService, UploadTarget } from '../../api/services/movieService';
import { pollConvertStatus } from '../utils/pollConvertStatus';

export interface BackgroundUpload {
  id: string;
  movieGlobalId: string;
  target: UploadTarget;
  fileName: string;
  progress: number; // 0-100, upload phase only
  status: 'uploading' | 'finalizing' | 'attaching' | 'converting' | 'completed' | 'error';
  convertStatus?: string;
  error?: string;
}

interface UploadManagerContextType {
  uploads: BackgroundUpload[];
  startBackgroundUpload: (movieGlobalId: string, target: UploadTarget, file: File) => void;
  getUploadsForMovie: (movieGlobalId: string) => BackgroundUpload[];
  dismissUpload: (id: string) => void;
}

const UploadManagerContext = createContext<UploadManagerContextType | undefined>(undefined);

export const UploadManagerProvider = ({ children }: { children: ReactNode }) => {
  const [uploads, setUploads] = useState<BackgroundUpload[]>([]);

  const updateUpload = useCallback((id: string, patch: Partial<BackgroundUpload>) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }, []);

  // Fires the chunked upload + attach-to-movie sequence without the caller awaiting it,
  // so it keeps running after the admin navigates away (this provider sits above the router).
  const startBackgroundUpload = useCallback((movieGlobalId: string, target: UploadTarget, file: File) => {
    const id = `${movieGlobalId}-${target}-${Date.now()}`;
    setUploads((prev) => [...prev, { id, movieGlobalId, target, fileName: file.name, progress: 0, status: 'uploading' }]);

    (async () => {
      try {
        const uploadGlobalId = await movieService.uploadFileInChunks(target, file, (pct) => {
          updateUpload(id, { progress: pct, status: pct >= 100 ? 'finalizing' : 'uploading' });
        });
        updateUpload(id, { status: 'attaching', progress: 100 });
        await movieService.updateMovie(movieGlobalId, target === 'trailer'
          ? { trailer_upload_id: uploadGlobalId }
          : { upload_id: uploadGlobalId });
        updateUpload(id, { status: 'converting' });
        await pollConvertStatus(uploadGlobalId, (convertStatus) => updateUpload(id, { convertStatus }));
        updateUpload(id, { status: 'completed' });
      } catch (err) {
        updateUpload(id, { status: 'error', error: err instanceof Error ? err.message : 'Upload failed' });
      }
    })();
  }, [updateUpload]);

  const getUploadsForMovie = useCallback(
    (movieGlobalId: string) => uploads.filter((u) => u.movieGlobalId === movieGlobalId),
    [uploads]
  );

  const dismissUpload = useCallback((id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  return (
    <UploadManagerContext.Provider value={{ uploads, startBackgroundUpload, getUploadsForMovie, dismissUpload }}>
      {children}
    </UploadManagerContext.Provider>
  );
};

export const useUploadManager = () => {
  const context = useContext(UploadManagerContext);
  if (context === undefined) {
    throw new Error('useUploadManager must be used within an UploadManagerProvider');
  }
  return context;
};
