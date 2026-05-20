import { apiClient } from '../clients/apiClient';

export interface UploadResponse {
  file_name: string;
  public_url: string;
  file_type: string;
  size: number;
}

export type UploadFolder =
  | 'images'
  | 'avatars'
  | 'logos'
  | 'covers'
  | 'posters'
  | 'thumbnails'
  | 'tv-channels'
  | 'radio'
  | 'authors'
  | 'admins'
  | string;

export const uploadService = {
  upload: (file: File, folder: UploadFolder): Promise<UploadResponse> => {
    const form = new FormData();
    form.append('files', file);
    form.append('folder', folder);
    return apiClient<UploadResponse>('/v1/uploads', { method: 'POST', body: form });
  },
};
