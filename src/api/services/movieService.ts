import { apiClient } from '../clients/apiClient';

export interface GenreFromApi {
  id: number;
  global_id: string;
  name: string;
  slug: string;
  status?: number;
  created_at?: string;
  updated_at?: string;
}

export interface GetGenresResponse {
  total: number;
  skip: number;
  take: number;
  data: GenreFromApi[];
}

export interface MovieAuthor {
  id?: number;
  global_id: string;
  name: string;
  profile_url: string | null;
}

export interface MovieSource {
  global_id: string;
  movie_url: string | null;
  convert_status: string;
  created_at: string;
}

export interface MovieEpisode {
  global_id: string;
  season_id: number;
  episode_number: number;
  title: string;
  duration: number | null;
  release_date: string;
  isLocked: boolean;
  movie_url: string | null;
  convert_status: string;
  status?: number;
  created_at?: string;
}

export interface MovieSeason {
  global_id: string;
  movie_id?: number;
  season_number: number;
  total_episodes?: number;
  status?: number;
  created_at?: string;
  episodes: MovieEpisode[];
}

export interface MovieFromApi {
  id: number;
  global_id: string;
  content_type: 'movie' | 'series';
  title: string;
  total_episodes?: number;
  description: string;
  release_date: string;
  base_price: number;
  price_per_episode?: number;
  language: string;
  country: string;
  video_quality: 'hd' | 'full_hd' | 'four_k' | string;
  movie_type: string;
  keywords: string;
  duration: number | null;
  trailer_url: string | null;
  poster_url: string | null;
  cover_url: string | null;
  movie_status: 'draft' | 'published' | 'unpublished';
  is_highlight: boolean;
  total_revenue: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_saves: number;
  total_shares: number;
  status: number;
  created_at: string;
  updated_at: string;
  movie_authors: MovieAuthor[];
  genres: GenreFromApi[];
  sources?: MovieSource[];
  seasons?: MovieSeason[];
}

export interface GetMoviesResponse {
  total: number;
  skip: number;
  take: number;
  data: MovieFromApi[];
}

export interface GetMoviesParams {
  skip?: number;
  take?: number;
  search?: string;
  status?: number;
  movie_status?: 'draft' | 'published' | 'unpublished';
  content_type?: 'movie' | 'series';
  genre?: string;
}

export interface CreateMovieData {
  content_type: 'movie' | 'series';
  title: string;
  description: string;
  release_date: string;
  base_price: number;
  price_per_episode?: number;
  language: string;
  country: string;
  video_quality: string;
  movie_type: string;
  keywords: string;
  duration?: number;
  movie_status: 'draft' | 'published' | 'unpublished';
  status: number;
  author_ids: string[];
  genre_ids: string[];
  actor_ids?: string[];
  /** upload_global_id of a completed full-movie video upload (content_type: movie) */
  upload_id?: string;
  /** upload_global_id of a completed trailer upload (movie or series) */
  trailer_upload_id?: string;
  seasons?: {
    season_number: number;
    episodes: {
      episode_number: number;
      title: string;
      duration?: number;
      release_date?: string;
      is_free?: boolean;
      /** upload_global_id of a completed episode video upload */
      upload_id?: string;
    }[];
  }[];
}

export interface UpdateMovieData extends Partial<CreateMovieData> {
  is_highlight?: boolean;
}

export interface UploadMovieMediaData {
  poster_file?: File;
  cover_file?: File;
  slider_file?: File;
}

export type UploadTarget = 'trailer' | 'movie';

export interface InitUploadData {
  file_size: number;
  file_name?: string;
  mime_type?: string;
  chunk_size?: number;
}

export interface UploadPartUrl {
  part_number: number;
  url: string;
}

export interface UploadSession {
  upload_global_id: string;
  upload_id: string;
  object_key: string;
  target: UploadTarget;
  chunk_size: number;
  total_parts: number;
  expires_in: number;
  parts: UploadPartUrl[];
}

export interface CompleteUploadPart {
  part_number: number;
  etag: string;
}

export interface UploadStatus {
  upload_global_id: string;
  target: UploadTarget;
  upload_status: 'pending' | 'uploading' | 'completed' | 'aborted';
  total_parts: number;
  uploaded_parts: number;
  progress: number;
  convert_status?: string;
  ref_id?: number;
}

export interface LockEpisodesData {
  isLocked: boolean;
  /** Locks/unlocks every episode within this season */
  seasonId?: string;
  /** Locks/unlocks these specific episodes */
  episode_id?: string[];
}

export interface LockEpisodesResponse {
  message: string;
}

export const movieService = {
  getMovies: (params?: GetMoviesParams) => {
    const query: Record<string, string> = {};
    if (params?.skip !== undefined) query.skip = String(params.skip);
    if (params?.take !== undefined) query.take = String(params.take);
    if (params?.search) query.search = params.search;
    if (params?.status !== undefined) query.status = String(params.status);
    if (params?.movie_status) query.movie_status = params.movie_status;
    if (params?.content_type) query.content_type = params.content_type;
    if (params?.genre) query.genre = params.genre;
    return apiClient<GetMoviesResponse>('/v1/movies', { params: query });
  },

  getMovie: (globalId: string) => {
    return apiClient<MovieFromApi>(`/v1/movies/${globalId}`);
  },

  createMovie: (data: CreateMovieData) => {
    return apiClient<MovieFromApi>('/v1/movies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateMovie: (globalId: string, data: UpdateMovieData) => {
    return apiClient<MovieFromApi>(`/v1/movies/${globalId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteMovie: (globalId: string) => {
    return apiClient<void>(`/v1/movies/${globalId}`, { method: 'DELETE' });
  },

  uploadMedia: (globalId: string, data: UploadMovieMediaData) => {
    const form = new FormData();
    if (data.poster_file) form.append('poster_file', data.poster_file);
    if (data.cover_file) form.append('cover_file', data.cover_file);
    if (data.slider_file) form.append('slider_file', data.slider_file);
    return apiClient<MovieFromApi>(`/v1/movies/${globalId}/media`, {
      method: 'POST',
      body: form,
    });
  },

  initUpload: (target: UploadTarget, data: InitUploadData) => {
    return apiClient<UploadSession>(`/v1/movies/uploads/${target}/init`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  completeUpload: (uploadGlobalId: string, parts: CompleteUploadPart[]) => {
    return apiClient<void>(`/v1/movies/uploads/${uploadGlobalId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ parts }),
    });
  },

  getUploadStatus: (uploadGlobalId: string) => {
    return apiClient<UploadStatus>(`/v1/movies/uploads/${uploadGlobalId}/status`);
  },

  abortUpload: (uploadGlobalId: string) => {
    return apiClient<void>(`/v1/movies/uploads/${uploadGlobalId}`, { method: 'DELETE' });
  },

  lockEpisodes: (data: LockEpisodesData) => {
    return apiClient<LockEpisodesResponse>('/v1/movies/episodes/lock', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Chunks `file` per the init session, PUTs each part to storage, completes the
  // upload, and returns the upload_global_id for use as upload_id/trailer_upload_id.
  // onProgress reports 0-100 based on parts completed (uploading phase only —
  // it does not track server-side conversion, which happens after completeUpload).
  //
  // `resume` lets a caller continue an interrupted upload (e.g. after a page reload)
  // instead of re-initializing: pass back the original `session` (still holding the
  // presigned part URLs, valid until session.expires_in) plus whichever parts already
  // finished, and only the remaining parts get PUT. onSessionReady/onPartComplete exist
  // so a caller can persist enough state to build that `resume` object later.
  uploadFileInChunks: async (
    target: UploadTarget,
    file: File,
    options: UploadFileInChunksOptions = {}
  ): Promise<string> => {
    const { onProgress, onSessionReady, onPartComplete, resume } = options;

    const session = resume?.session ?? await movieService.initUpload(target, {
      file_size: file.size,
      file_name: file.name,
      mime_type: file.type || 'video/mp4',
    });
    onSessionReady?.(session);

    const parts: CompleteUploadPart[] = [...(resume?.completedParts ?? [])];
    const alreadyDone = new Set(parts.map((p) => p.part_number));
    onProgress?.(Math.round((parts.length / session.total_parts) * 100));

    for (const part of session.parts) {
      if (alreadyDone.has(part.part_number)) continue;
      const start = (part.part_number - 1) * session.chunk_size;
      const chunk = file.slice(start, start + session.chunk_size);
      const res = await fetch(part.url, { method: 'PUT', body: chunk });
      if (!res.ok) {
        throw new Error(`Failed to upload part ${part.part_number} of ${session.total_parts}`);
      }
      const etag = res.headers.get('ETag') ?? res.headers.get('etag');
      if (!etag) {
        throw new Error(`Storage did not return an ETag for part ${part.part_number} (check CORS Access-Control-Expose-Headers)`);
      }
      const completedPart = { part_number: part.part_number, etag };
      parts.push(completedPart);
      onPartComplete?.(completedPart);
      onProgress?.(Math.round((parts.length / session.total_parts) * 100));
    }

    await movieService.completeUpload(session.upload_global_id, parts);
    return session.upload_global_id;
  },

  getGenres: (params?: { skip?: number; take?: number }) => {
    const query: Record<string, string> = {};
    if (params?.skip !== undefined) query.skip = String(params.skip);
    if (params?.take !== undefined) query.take = String(params.take);
    return apiClient<GetGenresResponse>('/v1/genres', { params: query });
  },
};
